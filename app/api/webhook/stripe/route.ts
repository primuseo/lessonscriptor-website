import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { sendWelcomeEmail } from '@/lib/welcome-email';

function secondsForPaymentLink(paymentLinkId: string): number | null {
  const map: Record<string, number> = {
    [process.env.STRIPE_PACK_STARTER_LINK_ID || '']: 18000,  // 5 hours
    [process.env.STRIPE_PACK_STUDENT_LINK_ID || '']: 54000,  // 15 hours
    [process.env.STRIPE_PACK_HEAVY_LINK_ID || '']:  108000,  // 30 hours
  };
  return map[paymentLinkId] ?? null;
}

async function addCredits(
  sql: ReturnType<typeof getDb>,
  email: string,
  seconds: number,
  referenceId: string,
  licenseKey: string
): Promise<boolean> {
  // Same idempotency gate as the Lemon Squeezy webhook: record the transaction FIRST,
  // ON CONFLICT DO NOTHING on a duplicate/concurrent delivery of the same session id.
  const inserted = await sql`
    INSERT INTO credit_transactions (user_email, type, seconds, reference_id)
    VALUES (${email}, 'purchase', ${seconds}, ${referenceId})
    ON CONFLICT (reference_id) WHERE reference_id IS NOT NULL DO NOTHING
    RETURNING id
  `;
  if (inserted.length === 0) {
    return false;
  }

  await sql`
    INSERT INTO users (email, credits_seconds_remaining, total_seconds_purchased, license_key)
    VALUES (${email}, ${seconds}, ${seconds}, ${licenseKey})
    ON CONFLICT (email) DO UPDATE
      SET credits_seconds_remaining = users.credits_seconds_remaining + ${seconds},
          total_seconds_purchased   = users.total_seconds_purchased   + ${seconds},
          license_key               = COALESCE(users.license_key, ${licenseKey}),
          credits_last_updated      = NOW()
  `;

  return true;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
  }

  const rawBody = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch (err) {
    console.warn('[Stripe Webhook] Invalid signature — rejected:', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  if (event.type !== 'checkout.session.completed') {
    console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    return NextResponse.json({ received: true });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const sessionId = session.id;
  const rawEmail = session.customer_details?.email;
  const paymentLinkId = typeof session.payment_link === 'string'
    ? session.payment_link
    : session.payment_link?.id;

  if (!rawEmail) {
    console.warn('[Stripe Webhook] No customer email in session:', sessionId);
    return NextResponse.json({ received: true });
  }

  const email = rawEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    console.warn('[Stripe Webhook] Invalid email format in session:', sessionId);
    return NextResponse.json({ received: true });
  }

  const seconds = paymentLinkId ? secondsForPaymentLink(paymentLinkId) : null;
  if (!seconds) {
    console.error(`[Stripe Webhook] UNKNOWN payment_link=${paymentLinkId} — credits NOT added for ${email} (session ${sessionId}). Check STRIPE_PACK_*_LINK_ID env vars.`);
    return NextResponse.json({ received: true });
  }

  const sql = getDb();

  const priorPurchases = await sql`
    SELECT 1 FROM credit_transactions
    WHERE user_email = ${email} AND type = 'purchase'
    LIMIT 1
  `;
  const isFirstPurchase = priorPurchases.length === 0;

  const existingUser = await sql`
    SELECT license_key FROM users WHERE email = ${email} LIMIT 1
  `;
  const licenseKey = existingUser[0]?.license_key ?? crypto.randomUUID();

  const applied = await addCredits(sql, email, seconds, sessionId, licenseKey);
  console.log(`[Stripe Webhook] checkout.session.completed: +${seconds}s for ${email} (session ${sessionId}), applied=${applied}`);

  if (applied && isFirstPurchase) {
    try {
      await sendWelcomeEmail({
        email,
        name: session.customer_details?.name ?? null,
        locale: session.client_reference_id,
        licenseKey,
      });
      console.log(`[Stripe Webhook] welcome email sent to ${email}`);
    } catch (err) {
      console.error(`[Stripe Webhook] welcome email FAILED for ${email}:`, err);
      // Swallow: credits are already granted; never make Stripe retry over an email error.
    }
  }

  return NextResponse.json({ received: true });
}
