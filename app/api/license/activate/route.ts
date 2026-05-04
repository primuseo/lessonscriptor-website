import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { handlePreflight, jsonResponse } from '@/lib/cors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

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

  let body: { license_key?: string };
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON' }, 400, request);
  }

  const { license_key } = body;

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
