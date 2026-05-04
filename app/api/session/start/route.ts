import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/auth';
import { handlePreflight, jsonResponse } from '@/lib/cors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

const STALE_AFTER_MINUTES = 5;

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit('session', { requests: 60, window: '60 s' }, ip);
  if (!rl.success) {
    return jsonResponse({ error: 'Too many session requests.' }, 429, request);
  }

  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const { email } = auth;
  const sql = getDb();

  try {
    await sql`
      UPDATE users
      SET active_sessions = 0
      WHERE active_sessions > 0
        AND last_active_at < NOW() - (${STALE_AFTER_MINUTES} * INTERVAL '1 minute')
    `;

    await sql`
      UPDATE users
      SET active_sessions = active_sessions + 1,
          last_active_at = NOW()
      WHERE email = ${email}
    `;

    return jsonResponse({ ok: true }, 200, request);
  } catch (err) {
    console.error('[Session] start error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500, request);
  }
}
