import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb } from '@/lib/db';

function secondsForVariant(variantId: string): number | null {
  const map: Record<string, number> = {
    [process.env.LEMON_SQUEEZY_PACK_STARTER_ID || '']: 18000,  // 5 hours
    [process.env.LEMON_SQUEEZY_PACK_STUDENT_ID || '']: 54000,  // 15 hours
    [process.env.LEMON_SQUEEZY_PACK_HEAVY_ID || '']:  108000,  // 30 hours
  };
  return map[variantId] ?? null;
}

async function addCredits(
  sql: ReturnType<typeof getDb>,
  email: string,
  seconds: number,
  referenceId: string,
  licenseKey: string | null = null
) {
  if (licenseKey) {
    await sql`
      INSERT INTO users (email, credits_seconds_remaining, total_seconds_purchased, license_key)
      VALUES (${email}, ${seconds}, ${seconds}, ${licenseKey})
      ON CONFLICT (email) DO UPDATE
        SET credits_seconds_remaining = users.credits_seconds_remaining + ${seconds},
            total_seconds_purchased   = users.total_seconds_purchased   + ${seconds},
            license_key               = COALESCE(${licenseKey}, users.license_key),
            credits_last_updated      = NOW()
    `;
  } else {
    await sql`
      INSERT INTO users (email, credits_seconds_remaining, total_seconds_purchased)
      VALUES (${email}, ${seconds}, ${seconds})
      ON CONFLICT (email) DO UPDATE
        SET credits_seconds_remaining = users.credits_seconds_remaining + ${seconds},
            total_seconds_purchased   = users.total_seconds_purchased   + ${seconds},
            credits_last_updated      = NOW()
    `;
  }

  await sql`
    INSERT INTO credit_transactions (user_email, type, seconds, reference_id)
    VALUES (${email}, 'purchase', ${seconds}, ${referenceId})
  `;
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature header' }, { status: 400 });
  }

  // Read raw body for HMAC verification
  const rawBody = await request.text();

  const expected = crypto
    .createHmac('sha256', process.env.LEMON_SQUEEZY_SIGNING_SECRET || '')
    .update(rawBody)
    .digest('hex');

  let isValid: boolean;
  try {
    isValid = crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    isValid = false;
  }

  if (!isValid) {
    console.warn('[Webhook] Invalid signature — rejected');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const eventName = event.meta?.event_name;
  const attrs = event.data?.attributes ?? {};
  const rawEmail = attrs.user_email;
  const orderId = String(event.data?.id ?? '');
  const variantId = String(
    attrs.first_order_item?.variant_id ?? attrs.variant_id ?? ''
  );

  if (!rawEmail) {
    console.warn('[Webhook] No user_email in payload for:', eventName);
    return NextResponse.json({ received: true });
  }

  const email = String(rawEmail).trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email) || email.length > 254) {
    console.warn('[Webhook] Invalid email format in payload:', email.slice(0, 40));
    return NextResponse.json({ received: true });
  }

  const sql = getDb();

  if (eventName === 'order_created') {
    const seconds = secondsForVariant(variantId);
    const licenseKey = attrs.license_key ?? null;

    if (!seconds) {
      console.warn(`[Webhook] order_created: unknown variant_id=${variantId}`);
      return NextResponse.json({ received: true });
    }

    const existing = await sql`
      SELECT id FROM credit_transactions WHERE reference_id = ${orderId} LIMIT 1
    `;
    if (existing.length > 0) {
      console.log(`[Webhook] Duplicate order ${orderId} — skipped`);
      return NextResponse.json({ received: true });
    }

    await addCredits(sql, email, seconds, orderId, licenseKey);
    console.log(`[Webhook] order_created: +${seconds}s for ${email} (order ${orderId}), key=${licenseKey ? 'yes' : 'no'}`);
  } else if (eventName === 'subscription_created' || eventName === 'subscription_payment_success') {
    const seconds = secondsForVariant(variantId) ?? 36000;
    const licenseKey = attrs.license_key ?? null;

    const existing = await sql`
      SELECT id FROM credit_transactions WHERE reference_id = ${orderId} LIMIT 1
    `;
    if (existing.length > 0) {
      return NextResponse.json({ received: true });
    }

    await addCredits(sql, email, seconds, orderId, licenseKey);
    console.log(`[Webhook] ${eventName}: +${seconds}s for ${email}`);
  } else if (eventName === 'license_key_created') {
    const licenseKey = attrs.key ?? null;
    if (!licenseKey) {
      console.warn('[Webhook] license_key_created: missing key in payload');
      return NextResponse.json({ received: true });
    }

    await sql`
      INSERT INTO users (email, license_key)
      VALUES (${email}, ${licenseKey})
      ON CONFLICT (email) DO UPDATE SET license_key = EXCLUDED.license_key
    `;
    console.log(`[Webhook] license_key_created: key linked for ${email}, key=${licenseKey.slice(0, 8)}…`);
  } else {
    console.log(`[Webhook] Unhandled event: ${eventName}`);
  }

  return NextResponse.json({ received: true });
}
