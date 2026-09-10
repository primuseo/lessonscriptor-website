import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  // Stripe Checkout Session ids always start with `cs_`. `reference_id` is a shared
  // column also written by the Lemon Squeezy webhook using short sequential numeric
  // order ids, so without this check this endpoint would let anyone fetch a Lemon
  // Squeezy buyer's license key by guessing/incrementing a small numeric id.
  if (!/^cs_/.test(sessionId)) {
    return NextResponse.json({ error: 'Invalid session_id' }, { status: 400 });
  }

  const rl = await checkRateLimit('checkout-session', { requests: 20, window: '1 m' }, getClientIp(request));
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const sql = getDb();
  const rows = await sql`
    SELECT u.license_key
    FROM credit_transactions ct
    JOIN users u ON u.email = ct.user_email
    WHERE ct.reference_id = ${sessionId}
    LIMIT 1
  `;

  return NextResponse.json({ licenseKey: rows[0]?.license_key ?? null });
}
