import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { handlePreflight, jsonResponse } from '@/lib/cors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// The extension sends the key it held before (its trial key) when a paid key is
// activated. Link the paid row to that trial so trial → paid conversion is measurable.
// First link wins; only a trial key can be the source, only a buyer can be the target.
// Best effort: a failure here must never block the activation itself.
async function recordTrialConversion(
  sql: ReturnType<typeof getDb>,
  key: string,
  previousKey: unknown
) {
  if (typeof previousKey !== 'string') return;
  const prev = previousKey.trim();
  if (!prev || prev === key || prev.length > 128 || !/^[\w\-]+$/.test(prev)) return;

  try {
    await sql`
      UPDATE users AS paid
      SET converted_from_trial_email = trial.email,
          converted_from_trial_at = NOW()
      FROM users AS trial
      WHERE paid.license_key = ${key}
        AND trial.license_key = ${prev}
        AND trial.is_trial
        AND NOT coalesce(paid.is_trial, false)
        AND paid.total_seconds_purchased > 0
        AND paid.converted_from_trial_email IS NULL
    `;
  } catch (err) {
    console.error('[License] Trial conversion link failed:', err);
  }
}

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit('license', { requests: 5, window: '60 s' }, ip);
  if (!rl.success) {
    return jsonResponse(
      { error: 'Too many activation attempts. Please wait a minute.' },
      429,
      request
    );
  }

  let body: { license_key?: string; previous_license_key?: unknown };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request);
  }

  const { license_key, previous_license_key } = body;

  if (!license_key || typeof license_key !== 'string') {
    return jsonResponse({ error: 'license_key is required' }, 400, request);
  }

  const key = license_key.trim();
  if (!key) {
    return jsonResponse({ error: 'license_key cannot be empty' }, 400, request);
  }

  if (key.length > 128 || !/^[\w\-]+$/.test(key)) {
    return jsonResponse({ error: 'Invalid license_key format' }, 400, request);
  }

  const sql = getDb();

  try {
    const rows = await sql`
      SELECT credits_seconds_remaining, total_seconds_purchased, is_unlimited
      FROM users WHERE license_key = ${key} LIMIT 1
    `;

    if (rows.length === 0) {
      return jsonResponse({ error: 'license_not_found' }, 404, request);
    }

    const credits = parseFloat(rows[0].credits_seconds_remaining);
    const unlimited = rows[0].is_unlimited === true;

    await recordTrialConversion(sql, key, previous_license_key);

    return jsonResponse({
      ok: true,
      credits_seconds_remaining: unlimited ? null : Math.max(0, credits),
      total_seconds_purchased: parseFloat(rows[0].total_seconds_purchased) || 0,
      is_unlimited: unlimited,
    }, 200, request);
  } catch (err) {
    console.error('[License] DB error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500, request);
  }
}
