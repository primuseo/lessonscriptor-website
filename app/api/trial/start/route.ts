import { NextRequest } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { handlePreflight, jsonResponse } from '@/lib/cors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const TRIAL_SECONDS = 1800; // 30 minutes

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit('trial', { requests: 3, window: '24 h' }, ip);
  if (!rl.success) {
    return jsonResponse(
      { error: 'Too many trial requests from this network. Please buy a credit pack to continue.' },
      429,
      request
    );
  }

  const sql = getDb();
  const licenseKey = crypto.randomUUID();
  const email = `trial-${crypto.randomUUID()}@trial.lessonscriptor.internal`;

  try {
    await sql`
      INSERT INTO users (email, credits_seconds_remaining, total_seconds_purchased, license_key, is_trial)
      VALUES (${email}, ${TRIAL_SECONDS}, 0, ${licenseKey}, true)
    `;
  } catch (err) {
    console.error('[Trial] DB error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500, request);
  }

  return jsonResponse({
    ok: true,
    license_key: licenseKey,
    credits_seconds_remaining: TRIAL_SECONDS,
  }, 200, request);
}
