import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';
import { requireAuth, isAuthError } from '@/lib/auth';
import { handlePreflight, jsonResponse } from '@/lib/cors';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function OPTIONS(request: NextRequest) {
  return handlePreflight(request);
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request);
  const rl = await checkRateLimit('status', { requests: 30, window: '60 s' }, ip);
  if (!rl.success) {
    return jsonResponse({ error: 'Too many status requests.' }, 429, request);
  }

  const auth = await requireAuth(request);
  if (isAuthError(auth)) return auth;

  const { email } = auth;
  const sql = getDb();

  try {
    const [rows, txRows] = await Promise.all([
      sql`
        SELECT credits_seconds_remaining, active_sessions, total_seconds_purchased,
               total_seconds_transcribed, is_unlimited
        FROM users WHERE email = ${email}
      `,
      sql`
        SELECT seconds, created_at FROM credit_transactions
        WHERE user_email = ${email} AND type = 'purchase'
        ORDER BY created_at DESC LIMIT 10
      `,
    ]);

    if (rows.length === 0) {
      return jsonResponse({
        credits_seconds_remaining: 0,
        credits_minutes_remaining: 0,
        active_sessions: 0,
        in_grace_period: false,
        debt_seconds: 0,
        is_unlimited: false,
        total_seconds_purchased: 0,
        total_seconds_transcribed: 0,
      }, 200, request);
    }

    const unlimited = rows[0].is_unlimited === true;
    const credits = parseFloat(rows[0].credits_seconds_remaining);
    const totalPurchased = parseFloat(rows[0].total_seconds_purchased) || 0;
    const totalTranscribed = parseFloat(rows[0].total_seconds_transcribed) || 0;
    const inGracePeriod = !unlimited && credits < 0;

    return jsonResponse({
      credits_seconds_remaining: unlimited ? Infinity : Math.max(0, credits),
      credits_minutes_remaining: unlimited ? Infinity : Math.max(0, Math.floor(credits / 60)),
      total_seconds_purchased: totalPurchased,
      total_seconds_transcribed: totalTranscribed,
      active_sessions: rows[0].active_sessions,
      in_grace_period: inGracePeriod,
      debt_seconds: inGracePeriod ? Math.abs(credits) : 0,
      is_unlimited: unlimited,
      purchase_history: txRows.map((r) => ({
        seconds: parseFloat(r.seconds),
        purchased_at: r.created_at,
      })),
    }, 200, request);
  } catch (err) {
    console.error('[Status] DB error:', err);
    return jsonResponse({ error: 'Internal server error' }, 500, request);
  }
}
