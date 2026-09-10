# Stripe Managed Payments Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace Lemon Squeezy checkout + fulfillment with Stripe Managed Payments (Payment Links), while keeping the existing Neon schema, license-key-based extension auth, and one-time-credit-pack model unchanged.

**Architecture:** Three static Stripe Payment Links (one per pack, `managed_payments.enabled: true`, created in the Dashboard by Pierre) replace the single Lemon Squeezy storefront link. A new `checkout.session.completed` webhook mirrors the existing Lemon Squeezy webhook's idempotent credit-granting logic, but self-generates the license key (Stripe has no license-key concept) and emails it via an extended welcome email, since Stripe cannot hand the key back synchronously in the redirect the way Lemon Squeezy could. The thank-you page becomes best-effort: email is the reliable channel, the page does one fetch-by-session-id and degrades gracefully if the webhook hasn't landed yet.

**Tech Stack:** Next.js 14 App Router, `stripe` npm SDK (new dependency), `@neondatabase/serverless`, Resend, Vitest.

**Spec:** This plan's spec is the preceding conversation analysis — no separate spec doc exists. Key decisions made during scoping (carried forward as constraints below): Stripe Managed Payments via Payment Links (not dynamic Checkout Sessions); self-generated license keys; email is the primary key-delivery channel, thank-you page is best-effort only; privacy-policy copy is corrected to state reality rather than just swapping the vendor name; Lemon Squeezy's webhook route stays in place indefinitely for historical orders.

## Global Constraints

- Do not delete or modify `app/api/webhook/lemon-squeezy/route.ts` — it keeps handling any Lemon Squeezy orders that trickle in after the switch.
- Do not modify `lib/auth.ts` — license-key validation is already a local DB lookup (`SELECT email FROM users WHERE license_key = ${key}`), not a call to the payment provider, so it needs no changes for this migration.
- `credit_transactions` and `users` schemas are unchanged — every new query targets existing columns only.
- All six locale files (`messages/en.json`, `fr.json`, `es.json`, `de.json`, `pt.json`, `zh.json`) must be updated together for any copy change — per this repo's CLAUDE.md, missing a locale causes fallbacks/errors.
- New env vars follow the existing `PROVIDER_PACK_TIER_SUFFIX` naming convention seen in `LEMON_SQUEEZY_PACK_STARTER_ID`.
- Do not pass an explicit `apiVersion` when constructing the `Stripe` client — omit it so the installed SDK's bundled default applies. Guessing a version string risks specifying one that doesn't exist for the installed package.
- Vitest test files colocate with source (`route.test.ts` next to `route.ts`, per `app/api/trial/start/`), using the `vi.mock('@/lib/db', () => ({ getDb: () => sqlMock }))` + `vi.hoisted` pattern already established in this repo.
- This repo has no React/page component test convention (no `*.test.tsx` files exist) — do not introduce one for this plan; page-level changes are verified manually instead.

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/welcome-email.ts` (modify) | Add optional license-key line to the welcome email — the new reliable key-delivery channel |
| `lib/welcome-email.test.ts` (modify) | Cover the new license-key rendering path |
| `package.json` (modify) | Add `stripe` dependency |
| `app/api/webhook/stripe/route.ts` (create) | Verify Stripe webhook signature, grant credits, self-generate license key, trigger welcome email |
| `app/api/webhook/stripe/route.test.ts` (create) | Cover signature checks, idempotency, first-vs-repeat-purchase email gating, unknown payment link |
| `app/api/checkout-session/route.ts` (create) | Same-origin lookup: session id → license key, for the thank-you page's best-effort fetch |
| `app/api/checkout-session/route.test.ts` (create) | Cover missing param, found, not-yet-found cases |
| `components/ThankYouLicenseKey.tsx` (create) | Client component: one fetch by session id, graceful "check your email" fallback |
| `app/[locale]/thank-you/page.tsx` (modify) | Switch from reading `?license_key=` to reading `?session_id=`, render the new client component |
| `components/PricingPacks.tsx` (modify) | Accept per-pack Stripe Payment Link URLs + locale, append `client_reference_id` |
| `app/[locale]/page.tsx` (modify) | Read the three Payment Link URL env vars, pass them + `locale` into `PricingPacks` |
| `app/[locale]/privacy/page.tsx` (modify) | Swap Lemon Squeezy references/links for Stripe |
| `messages/{en,fr,es,de,pt,zh}.json` (modify) | Swap vendor copy, correct the license-key/email privacy claim, update the thank-you fallback and FAQ mention |

---

### Task 1: Welcome email carries the license key

**Files:**
- Modify: `lib/welcome-email.ts:15-27` (Template interface), `:29-132` (TEMPLATES), `:144-200` (buildWelcomeEmail), `:202-224` (SendWelcomeArgs/sendWelcomeEmail)
- Test: `lib/welcome-email.test.ts`

**Interfaces:**
- Produces: `buildWelcomeEmail(rawLocale: unknown, name: string | null, email: string, licenseKey?: string | null): { subject: string; html: string; text: string }` — 4th param is new, defaults to `null`, fully backward compatible with existing 3-arg call sites.
- Produces: `sendWelcomeEmail({ email, name, locale, licenseKey }: SendWelcomeArgs): Promise<void>` — `licenseKey` is a new optional field on `SendWelcomeArgs`.

- [ ] **Step 1: Write the failing tests**

Append to `lib/welcome-email.test.ts`:

```ts
describe('buildWelcomeEmail with a license key', () => {
  it('includes the license key in both text and html when provided', () => {
    const { text, html } = buildWelcomeEmail('en', 'Stephen', 'buyer@example.com', 'abc-123-key')
    expect(text).toContain('abc-123-key')
    expect(html).toContain('abc-123-key')
  })

  it('omits any key content when licenseKey is null', () => {
    const { text } = buildWelcomeEmail('en', 'Stephen', 'buyer@example.com', null)
    expect(text).not.toMatch(/license key/i)
  })

  it('omits any key content when licenseKey is not passed at all', () => {
    const { text } = buildWelcomeEmail('en', 'Stephen', 'buyer@example.com')
    expect(text).not.toMatch(/license key/i)
  })

  it('localizes the key line for fr', () => {
    const { text } = buildWelcomeEmail('fr', 'Marie', 'marie@example.com', 'xyz-789')
    expect(text).toContain('Votre clé de licence')
    expect(text).toContain('xyz-789')
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run lib/welcome-email.test.ts`
Expected: FAIL — `buildWelcomeEmail` doesn't accept a 4th argument yet and never renders a key.

- [ ] **Step 3: Add `keyIntro` to the Template interface and all six TEMPLATES entries**

In `lib/welcome-email.ts`, add one field to the `Template` interface (after `ready`):

```ts
interface Template {
  subject: string
  greetingNamed: string // contains {name}
  greetingAnon: string
  intro: string
  ready: string
  keyIntro: string // contains {key}
  leadIn: string
  bullets: [string, string, string]
  replies: string
  closing: string
  signoff: string
  unsubscribe: string // contains {url}
}
```

Add a `keyIntro` entry to each of the six locales in `TEMPLATES` (insert right after each locale's `ready` line):

```ts
  en: {
    // ...existing fields unchanged...
    keyIntro: 'Your license key: {key} — paste it into the LessonScriptor extension to activate AI transcription.',
    // ...
  },
  fr: {
    // ...
    keyIntro: "Votre clé de licence : {key} — collez-la dans l'extension LessonScriptor pour activer la transcription IA.",
    // ...
  },
  es: {
    // ...
    keyIntro: 'Tu clave de licencia: {key}. Pégala en la extensión de LessonScriptor para activar la transcripción con IA.',
    // ...
  },
  de: {
    // ...
    keyIntro: 'Dein Lizenzschlüssel: {key} – füge ihn in die LessonScriptor-Erweiterung ein, um die KI-Transkription zu aktivieren.',
    // ...
  },
  pt: {
    // ...
    keyIntro: 'A sua chave de licença: {key} — cole-a na extensão do LessonScriptor para ativar a transcrição por IA.',
    // ...
  },
  zh: {
    // ...
    keyIntro: '你的许可证密钥：{key}——请粘贴到 LessonScriptor 扩展程序中以启用 AI 转录。',
    // ...
  },
```

- [ ] **Step 4: Thread `licenseKey` through `buildWelcomeEmail`**

Replace the `buildWelcomeEmail` function body:

```ts
export function buildWelcomeEmail(
  rawLocale: unknown,
  name: string | null,
  email: string,
  licenseKey: string | null = null
): { subject: string; html: string; text: string } {
  const locale = resolveLocale(rawLocale)
  const t = TEMPLATES[locale]
  const trimmed = name && name.trim() ? name.trim() : null
  const greeting = trimmed ? t.greetingNamed.replace('{name}', trimmed) : t.greetingAnon
  const unsubscribeUrl = buildUnsubscribeUrl(email, locale)
  const unsubscribeText = t.unsubscribe.replace('{url}', unsubscribeUrl)
  const keyText = licenseKey ? t.keyIntro.replace('{key}', licenseKey) : null

  const text = [
    greeting,
    '',
    t.intro,
    '',
    t.ready,
    ...(keyText ? ['', keyText] : []),
    '',
    t.leadIn,
    `- ${t.bullets[0]}`,
    `- ${t.bullets[1]}`,
    `- ${t.bullets[2]}`,
    '',
    t.replies,
    '',
    t.closing,
    '',
    t.signoff,
    'LessonScriptor',
    '',
    unsubscribeText,
  ].join('\n')

  const e = escapeHtml
  const unsubscribeHtml = e(t.unsubscribe).replace(
    '{url}',
    `<a href="${e(unsubscribeUrl)}">${e(unsubscribeUrl)}</a>`
  )
  const keyHtml = licenseKey
    ? e(t.keyIntro).replace('{key}', `<code style="background:#f0ece6;padding:2px 6px;border-radius:4px;">${e(licenseKey)}</code>`)
    : null

  const html = `<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1714">
<p>${e(greeting)}</p>
<p>${e(t.intro)}</p>
<p><strong>${e(t.ready)}</strong></p>
${keyHtml ? `<p>${keyHtml}</p>` : ''}
<p>${e(t.leadIn)}</p>
<ul>
<li>${e(t.bullets[0])}</li>
<li>${e(t.bullets[1])}</li>
<li>${e(t.bullets[2])}</li>
</ul>
<p>${e(t.replies)}</p>
<p>${e(t.closing)}</p>
<p>${e(t.signoff)}<br/>LessonScriptor</p>
<p style="margin-top:24px;padding-top:16px;border-top:1px solid #e5ded6;font-size:12px;color:#8a8078">${unsubscribeHtml}</p>
</div>`

  return { subject: t.subject, html, text }
}
```

- [ ] **Step 5: Thread `licenseKey` through `SendWelcomeArgs`/`sendWelcomeEmail`**

```ts
interface SendWelcomeArgs {
  email: string
  name: string | null
  locale: unknown
  licenseKey?: string | null
}

export async function sendWelcomeEmail({ email, name, locale, licenseKey = null }: SendWelcomeArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.WELCOME_FROM_EMAIL
  const replyTo = process.env.WELCOME_REPLY_TO
  if (!apiKey || !from || !replyTo || !process.env.UNSUBSCRIBE_SECRET) {
    throw new Error(
      'welcome-email: RESEND_API_KEY, WELCOME_FROM_EMAIL, WELCOME_REPLY_TO and UNSUBSCRIBE_SECRET must be set'
    )
  }

  const { subject, html, text } = buildWelcomeEmail(locale, name, email, licenseKey)
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({ from, to: email, replyTo, subject, html, text })
  if (error) {
    throw new Error(`welcome-email Resend error: ${JSON.stringify(error)}`)
  }
}
```

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run lib/welcome-email.test.ts lib/welcome-email.send.test.ts`
Expected: PASS — all existing tests plus the four new ones.

- [ ] **Step 7: Commit**

```bash
git add lib/welcome-email.ts lib/welcome-email.test.ts
git commit -m "feat(welcome-email): carry the license key so email becomes the reliable delivery channel"
```

---

### Task 2: Stripe webhook — fulfillment + license key generation

**Files:**
- Modify: `package.json` (add `stripe` dependency)
- Create: `app/api/webhook/stripe/route.ts`
- Test: `app/api/webhook/stripe/route.test.ts`

**Interfaces:**
- Consumes: `sendWelcomeEmail({ email, name, locale, licenseKey }: SendWelcomeArgs): Promise<void>` from Task 1.
- Produces: `POST` handler at `app/api/webhook/stripe/route.ts`, mapping Stripe Payment Link IDs (env vars `STRIPE_PACK_STARTER_LINK_ID`, `STRIPE_PACK_STUDENT_LINK_ID`, `STRIPE_PACK_HEAVY_LINK_ID`) to seconds (18000/54000/108000), writing to `credit_transactions`/`users` exactly like the Lemon Squeezy route does, keyed on `session.id` for idempotency.

- [ ] **Step 1: Add the `stripe` dependency**

Run: `npm install stripe`
Expected: `package.json` gains a `"stripe": "^<resolved-version>"` line under `dependencies`.

- [ ] **Step 2: Write the failing tests**

Create `app/api/webhook/stripe/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { sqlMock, constructEventMock, sendWelcomeEmailMock } = vi.hoisted(() => ({
  sqlMock: vi.fn(),
  constructEventMock: vi.fn(),
  sendWelcomeEmailMock: vi.fn(),
}))

vi.mock('@/lib/db', () => ({ getDb: () => sqlMock }))
vi.mock('@/lib/welcome-email', () => ({ sendWelcomeEmail: sendWelcomeEmailMock }))
vi.mock('stripe', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: vi.fn(function (this: any) {
    this.webhooks = { constructEvent: constructEventMock }
  }),
}))

import { POST } from './route'

function req(body: string, signature: string | null = 'valid-sig') {
  const headers: Record<string, string> = {}
  if (signature) headers['stripe-signature'] = signature
  return new Request('https://lessonscriptor.com/api/webhook/stripe', {
    method: 'POST',
    headers,
    body,
  }) as unknown as Parameters<typeof POST>[0]
}

function checkoutSessionCompletedEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        payment_link: 'plink_starter',
        customer_details: { email: 'buyer@example.com', name: 'Stephen' },
        client_reference_id: 'en',
        ...overrides,
      },
    },
  }
}

beforeEach(() => {
  sqlMock.mockReset()
  constructEventMock.mockReset()
  sendWelcomeEmailMock.mockReset().mockResolvedValue(undefined)
  process.env.STRIPE_SECRET_KEY = 'sk_test_x'
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  process.env.STRIPE_PACK_STARTER_LINK_ID = 'plink_starter'
  process.env.STRIPE_PACK_STUDENT_LINK_ID = 'plink_student'
  process.env.STRIPE_PACK_HEAVY_LINK_ID = 'plink_heavy'
})

describe('POST /api/webhook/stripe', () => {
  it('rejects a request with no stripe-signature header', async () => {
    const res = await POST(req('{}', null))
    expect(res.status).toBe(400)
    expect(constructEventMock).not.toHaveBeenCalled()
  })

  it('rejects a request with an invalid signature', async () => {
    constructEventMock.mockImplementation(() => { throw new Error('bad signature') })
    const res = await POST(req('{}'))
    expect(res.status).toBe(401)
  })

  it('grants credits, generates a license key on first purchase, and emails it', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent())
    sqlMock
      .mockResolvedValueOnce([]) // priorPurchases: none found
      .mockResolvedValueOnce([]) // existing user license_key lookup: none found
      .mockResolvedValueOnce([{ id: 1 }]) // credit_transactions insert succeeds
      .mockResolvedValueOnce([]) // users upsert

    const res = await POST(req('{}'))
    expect(res.status).toBe(200)

    expect(sendWelcomeEmailMock).toHaveBeenCalledTimes(1)
    const arg = sendWelcomeEmailMock.mock.calls[0][0]
    expect(arg.email).toBe('buyer@example.com')
    expect(arg.locale).toBe('en')
    expect(typeof arg.licenseKey).toBe('string')
    expect(arg.licenseKey.length).toBeGreaterThan(0)
  })

  it('does not re-email on a second purchase, but reuses the existing key', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent({ id: 'cs_test_456' }))
    sqlMock
      .mockResolvedValueOnce([{ exists: 1 }]) // priorPurchases: found
      .mockResolvedValueOnce([{ license_key: 'existing-key' }]) // existing user lookup
      .mockResolvedValueOnce([{ id: 2 }]) // credit_transactions insert succeeds
      .mockResolvedValueOnce([]) // users upsert

    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    expect(sendWelcomeEmailMock).not.toHaveBeenCalled()
  })

  it('is idempotent on a duplicate session id', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent())
    sqlMock
      .mockResolvedValueOnce([]) // priorPurchases
      .mockResolvedValueOnce([]) // existing user lookup
      .mockResolvedValueOnce([]) // credit_transactions insert returns nothing: ON CONFLICT DO NOTHING fired

    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    expect(sendWelcomeEmailMock).not.toHaveBeenCalled()
  })

  it('ignores unknown payment_link ids without touching the database', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent({ payment_link: 'plink_unknown' }))
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('ignores event types other than checkout.session.completed', async () => {
    constructEventMock.mockReturnValue({ type: 'payment_intent.succeeded', data: { object: {} } })
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('ignores a session with no customer email', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent({ customer_details: null }))
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    expect(sqlMock).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run app/api/webhook/stripe/route.test.ts`
Expected: FAIL — `./route` doesn't exist yet.

- [ ] **Step 4: Implement the route**

Create `app/api/webhook/stripe/route.ts`:

```ts
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
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npx vitest run app/api/webhook/stripe/route.test.ts`
Expected: PASS — all seven tests.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json app/api/webhook/stripe/
git commit -m "feat(payments): add Stripe Managed Payments webhook for checkout fulfillment"
```

---

### Task 3: Checkout-session lookup endpoint

**Files:**
- Create: `app/api/checkout-session/route.ts`
- Test: `app/api/checkout-session/route.test.ts`

**Interfaces:**
- Produces: `GET /api/checkout-session?session_id=<id>` → `{ licenseKey: string | null }`. Same-origin only, no CORS handling needed (unlike `/api/transcribe`, which the Chrome extension calls cross-origin).

- [ ] **Step 1: Write the failing tests**

Create `app/api/checkout-session/route.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { sqlMock } = vi.hoisted(() => ({ sqlMock: vi.fn() }))
vi.mock('@/lib/db', () => ({ getDb: () => sqlMock }))

import { GET } from './route'

function req(sessionId?: string) {
  const url = sessionId
    ? `https://lessonscriptor.com/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`
    : 'https://lessonscriptor.com/api/checkout-session'
  return new Request(url) as unknown as Parameters<typeof GET>[0]
}

beforeEach(() => {
  sqlMock.mockReset()
})

describe('GET /api/checkout-session', () => {
  it('returns 400 when session_id is missing', async () => {
    const res = await GET(req())
    expect(res.status).toBe(400)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('returns the license key once the webhook has recorded it', async () => {
    sqlMock.mockResolvedValueOnce([{ license_key: 'abc-123' }])
    const res = await GET(req('cs_test_123'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.licenseKey).toBe('abc-123')
  })

  it('returns null when the webhook has not landed yet', async () => {
    sqlMock.mockResolvedValueOnce([])
    const res = await GET(req('cs_test_999'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.licenseKey).toBeNull()
  })
})
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run app/api/checkout-session/route.test.ts`
Expected: FAIL — `./route` doesn't exist yet.

- [ ] **Step 3: Implement the route**

Create `app/api/checkout-session/route.ts`:

```ts
import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  const sessionId = new URL(request.url).searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
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
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run app/api/checkout-session/route.test.ts`
Expected: PASS — all three tests.

- [ ] **Step 5: Commit**

```bash
git add app/api/checkout-session/
git commit -m "feat(payments): add same-origin checkout-session -> license-key lookup"
```

---

### Task 4: Thank-you page becomes best-effort

**Files:**
- Create: `components/ThankYouLicenseKey.tsx`
- Modify: `app/[locale]/thank-you/page.tsx:28-37` (Props/searchParams), `:57-70` (license key box JSX)
- Modify: `messages/{en,fr,es,de,pt,zh}.json` (`thankYou.noKey`)

**Interfaces:**
- Consumes: `GET /api/checkout-session?session_id=<id>` from Task 3.
- Produces: `<ThankYouLicenseKey sessionId={string | null} copyButton={string} copiedButton={string} checkingLabel={string} noKeyYetLabel={string} />`.

- [ ] **Step 1: Create the client component**

Create `components/ThankYouLicenseKey.tsx`:

```tsx
'use client'
import { useEffect, useState } from 'react'
import CopyButton from '@/components/CopyButton'

interface Props {
  sessionId: string | null
  copyButton: string
  copiedButton: string
  checkingLabel: string
  noKeyYetLabel: string
}

export default function ThankYouLicenseKey({
  sessionId,
  copyButton,
  copiedButton,
  checkingLabel,
  noKeyYetLabel,
}: Props) {
  const [licenseKey, setLicenseKey] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      setChecked(true)
      return
    }
    fetch(`/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`)
      .then((res) => (res.ok ? res.json() : { licenseKey: null }))
      .then((data) => setLicenseKey(data.licenseKey ?? null))
      .catch(() => setLicenseKey(null))
      .finally(() => setChecked(true))
  }, [sessionId])

  if (!checked) {
    return <p className="text-foreground/60 italic text-sm">{checkingLabel}</p>
  }

  if (!licenseKey) {
    return <p className="text-foreground/60 italic text-sm">{noKeyYetLabel}</p>
  }

  return (
    <div className="flex items-center gap-3">
      <code className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-mono text-sm break-all">
        {licenseKey}
      </code>
      <CopyButton text={licenseKey} label={copyButton} copiedLabel={copiedButton} />
    </div>
  )
}
```

- [ ] **Step 2: Wire it into the thank-you page**

In `app/[locale]/thank-you/page.tsx`, replace the `Props` interface:

```ts
interface Props {
  params: { locale: string }
  searchParams: { session_id?: string }
}
```

Replace the license key box section (currently lines 57-70):

```tsx
        {/* License key box */}
        <div className="card p-6 mb-10">
          <p className="text-sm font-semibold text-foreground/60 mb-3">{t('licenseLabel')}</p>
          <ThankYouLicenseKey
            sessionId={searchParams.session_id ?? null}
            copyButton={t('copyButton')}
            copiedButton={t('copiedButton')}
            checkingLabel={t('checkingKey')}
            noKeyYetLabel={t('noKey')}
          />
        </div>
```

Add the import near the top, alongside the existing `CopyButton` import:

```ts
import ThankYouLicenseKey from '@/components/ThankYouLicenseKey'
```

Remove the now-unused `const licenseKey = searchParams.license_key ?? null` line.

- [ ] **Step 3: Update the locale copy**

In each of `messages/en.json`, `fr.json`, `es.json`, `de.json`, `pt.json`, `zh.json`, under the `thankYou` namespace: add a new `checkingKey` key (next to the existing `noKey` key) and update `noKey`'s text to reflect the new "check your email" meaning instead of naming Lemon Squeezy:

```json
"checkingKey": "Checking your order…",
"noKey": "Setting up your credits — check your email in a moment for your license key.",
```

fr:
```json
"checkingKey": "Vérification de votre commande…",
"noKey": "Configuration de vos crédits en cours — vérifiez votre e-mail dans un instant pour trouver votre clé de licence.",
```

es:
```json
"checkingKey": "Comprobando tu pedido…",
"noKey": "Estamos preparando tus créditos — revisa tu correo en un momento para encontrar tu clave de licencia.",
```

de:
```json
"checkingKey": "Ihre Bestellung wird geprüft …",
"noKey": "Ihr Guthaben wird eingerichtet — prüfen Sie in Kürze Ihre E-Mails auf Ihren Lizenzschlüssel.",
```

pt:
```json
"checkingKey": "A verificar a sua encomenda…",
"noKey": "A preparar os seus créditos — verifique o seu e-mail dentro de momentos para obter a sua chave de licença.",
```

zh:
```json
"checkingKey": "正在核实您的订单……",
"noKey": "正在为您准备额度——请稍后查看邮箱以获取您的许可证密钥。",
```

- [ ] **Step 4: Verify manually**

This repo has no page-component test convention. Verify by running `npm run dev`, then visiting `http://localhost:3000/en/thank-you?session_id=doesnt-exist` (should show the "setting up your credits" fallback after a brief "checking your order" flash) and `http://localhost:3000/en/thank-you` with no `session_id` (should show the fallback immediately, no network request fired).

- [ ] **Step 5: Commit**

```bash
git add components/ThankYouLicenseKey.tsx "app/[locale]/thank-you/page.tsx" messages/
git commit -m "feat(thank-you): fetch license key by session id instead of reading it from the URL"
```

---

### Task 5: Pricing packs link to Stripe Payment Links

**Files:**
- Modify: `components/PricingPacks.tsx:1-17` (Props interface), `:32-34` (remove `STORE_URL`), `:63-98` (map rendering)
- Modify: `app/[locale]/page.tsx:41-42` (HomePage signature — already destructures `locale`), `:434-439` (PricingPacks usage)
- Modify: `messages/{en,fr,es,de,pt,zh}.json` (`pricing.currencyDisclaimer`, `pricing.paymentProcessor`)

**Interfaces:**
- Produces: `<PricingPacks packs={Pack[]} currencyDisclaimer={string} paymentProcessor={string} paymentLinkUrls={string[]} locale={string} />` — `paymentLinkUrls` is new, parallel-indexed to `packs` (index 0 = Starter/5h, 1 = Student/15h, 2 = Heavy/30h, matching the existing `secondsForPaymentLink` ordering from Task 2).

- [ ] **Step 1: Update `PricingPacks.tsx`**

Replace the `Props` interface and remove the `STORE_URL` constant:

```ts
interface Props {
  packs: Pack[]
  currencyDisclaimer: string
  paymentProcessor: string
  paymentLinkUrls: string[]
  locale: string
}
```

Delete this block entirely (the single hardcoded storefront URL and its workaround comment):

```ts
// Individual per-pack checkout links were intermittently resolving to LemonSqueezy
// test mode. Sending buyers to the store front (all three packs, live mode) avoids it.
const STORE_URL = 'https://lesson-scriptor.lemonsqueezy.com/'
```

Update the function signature and the `<a>` in the map:

```tsx
export default function PricingPacks({ packs, currencyDisclaimer, paymentProcessor, paymentLinkUrls, locale }: Props) {
  const [currency, setCurrency] = useState('USD')
  const { symbol, rate, decimals } = CURRENCIES[currency]

  return (
    <div>
      {/* ...currency selector unchanged... */}

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {packs.map((pack, i) => (
          <a
            key={i}
            href={`${paymentLinkUrls[i]}?client_reference_id=${encodeURIComponent(locale)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-white/[0.04] border rounded-2xl p-4 text-center relative hover:border-accent/30 transition-colors block no-underline ${
              pack.badge ? 'border-accent' : 'border-white/[0.08]'
            }`}
          >
            {/* ...card contents unchanged... */}
          </a>
        ))}
      </div>

      {/* ...disclaimer/paymentProcessor footer unchanged... */}
    </div>
  )
}
```

(Each Stripe Payment Link now carries its own live checkout, restoring true per-pack checkout — the LS bug this used to work around doesn't apply to Stripe Payment Links.)

- [ ] **Step 2: Update `page.tsx` to supply the new props**

In `app/[locale]/page.tsx`, near the top of `HomePage` (after `unstable_setRequestLocale(locale)`), read the three Payment Link URLs:

```ts
const paymentLinkUrls = [
  process.env.STRIPE_PACK_STARTER_LINK_URL || '',
  process.env.STRIPE_PACK_STUDENT_LINK_URL || '',
  process.env.STRIPE_PACK_HEAVY_LINK_URL || '',
]
```

Update the `<PricingPacks>` call:

```tsx
              <PricingPacks
                packs={t.raw('pricing.packs')}
                currencyDisclaimer={t('pricing.currencyDisclaimer')}
                paymentProcessor={t('pricing.paymentProcessor')}
                paymentLinkUrls={paymentLinkUrls}
                locale={locale}
              />
```

- [ ] **Step 3: Update the locale copy**

In each of the six `messages/*.json` files, under `pricing`, replace `currencyDisclaimer` and `paymentProcessor`:

en:
```json
"currencyDisclaimer": "Prices shown are estimates. Final amount is converted at the live exchange rate by Stripe at checkout.",
"paymentProcessor": "Payments processed securely by Stripe.",
```
fr:
```json
"currencyDisclaimer": "Les prix affichés sont des estimations. Le montant final est converti au taux de change en vigueur par Stripe lors du paiement.",
"paymentProcessor": "Paiements traités de manière sécurisée par Stripe.",
```
es:
```json
"currencyDisclaimer": "Los precios mostrados son estimaciones. El importe final se convierte al tipo de cambio vigente por Stripe en el momento del pago.",
"paymentProcessor": "Pagos procesados de forma segura por Stripe.",
```
de:
```json
"currencyDisclaimer": "Angezeigte Preise sind Schätzungen. Der endgültige Betrag wird beim Bezahlen von Stripe zum aktuellen Wechselkurs umgerechnet.",
"paymentProcessor": "Zahlungen werden sicher über Stripe abgewickelt.",
```
pt:
```json
"currencyDisclaimer": "Os preços mostrados são estimativas. O valor final é convertido pela taxa de câmbio em tempo real pelo Stripe no checkout.",
"paymentProcessor": "Pagamentos processados com segurança pelo Stripe.",
```
zh:
```json
"currencyDisclaimer": "显示价格为估算值。最终金额由 Stripe 在结账时按实时汇率换算。",
"paymentProcessor": "付款由 Stripe 安全处理。",
```

- [ ] **Step 4: Verify manually**

Run `npm run dev`, set the three `STRIPE_PACK_*_LINK_URL` env vars in `.env.local` to real Stripe **test-mode** Payment Link URLs (created per the Manual Steps section below), and click through each of the three pack cards on `/en` — confirm each opens its own distinct Stripe test checkout (not a shared storefront), and that the URL includes `?client_reference_id=en`.

- [ ] **Step 5: Commit**

```bash
git add components/PricingPacks.tsx "app/[locale]/page.tsx" messages/
git commit -m "feat(pricing): link each pack to its own Stripe Payment Link"
```

---

### Task 6: Correct the privacy-policy copy

**Files:**
- Modify: `app/[locale]/privacy/page.tsx` (~lines 64-66, ~72)
- Modify: `messages/{en,fr,es,de,pt,zh}.json` (`privacy.paymentsBody1`, `privacy.paymentsBody2`, `privacy.thirdPartyLemon` → `privacy.thirdPartyStripe`, `tabAudioBody`)

**Interfaces:** None — copy-only, no new props or functions.

- [ ] **Step 1: Update `privacy/page.tsx`**

Replace:
```tsx
            {t('paymentsBody2')} <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">LemonSqueezy</a>.
```
with:
```tsx
            {t('paymentsBody2')} <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">Stripe</a>.
```

Replace:
```tsx
          <p><strong>LemonSqueezy:</strong> {t('thirdPartyLemon')}</p>
```
with:
```tsx
          <p><strong>Stripe:</strong> {t('thirdPartyStripe')}</p>
```

- [ ] **Step 2: Update the locale copy — accurate `paymentsBody1`/`paymentsBody2`, renamed `thirdPartyStripe`, and the `tabAudioBody` FAQ mention**

en:
```json
"paymentsBody1": "Tab Audio credits are purchased through Stripe, a third-party payment processor. Stripe handles your payment details — your card number and billing address are processed entirely by Stripe and never reach LessonScriptor's servers.",
"paymentsBody2": "Upon purchase, LessonScriptor generates a license key linked to the email address you provide at checkout, so we can apply your credits and help you if you contact support. Please review Stripe's privacy policy for details on how they handle your payment data.",
"thirdPartyStripe": "Stripe: Handles all payment processing for Tab Audio credit purchases. See the Payments section above.",
```
And in `tabAudioBody`, replace `"(purchased on LemonSqueezy — one-time payment, never expires)"` with `"(purchased via Stripe checkout — one-time payment, never expires)"` (leave the rest of that string untouched).

fr:
```json
"paymentsBody1": "Les crédits Audio d'onglet sont achetés via Stripe, un processeur de paiement tiers. Stripe gère vos informations de paiement — votre numéro de carte et votre adresse de facturation sont traités entièrement par Stripe et n'atteignent jamais les serveurs de LessonScriptor.",
"paymentsBody2": "Lors de l'achat, LessonScriptor génère une clé de licence associée à l'adresse e-mail que vous fournissez lors du paiement, afin de pouvoir appliquer vos crédits et vous aider si vous contactez le support. Veuillez consulter la politique de confidentialité de Stripe pour savoir comment vos données de paiement sont traitées.",
"thirdPartyStripe": "Stripe : gère tous les paiements pour les crédits Audio d'onglet. Voir la section Paiements ci-dessus.",
```
`tabAudioBody`: replace `"(achetée sur LemonSqueezy — paiement unique, sans expiration)"` with `"(achetée via Stripe — paiement unique, sans expiration)"`.

es:
```json
"paymentsBody1": "Los créditos de Audio de pestaña se compran a través de Stripe, un procesador de pagos externo. Stripe gestiona tus datos de pago — tu número de tarjeta y tu dirección de facturación son procesados íntegramente por Stripe y nunca llegan a los servidores de LessonScriptor.",
"paymentsBody2": "Al realizar una compra, LessonScriptor genera una clave de licencia vinculada a la dirección de correo que proporcionas al pagar, para poder aplicar tus créditos y ayudarte si contactas con soporte. Consulta la política de privacidad de Stripe para más detalles sobre cómo tratan tus datos de pago.",
"thirdPartyStripe": "Stripe: gestiona todos los pagos para los créditos de Audio de pestaña. Ver la sección Pagos arriba.",
```
`tabAudioBody`: replace `"(comprada en LemonSqueezy — pago único, nunca caduca)"` with `"(comprada a través de Stripe — pago único, nunca caduca)"`.

de:
```json
"paymentsBody1": "Tab-Audio-Credits werden über Stripe erworben, einen Drittanbieter für Zahlungsabwicklung. Stripe verarbeitet Ihre Zahlungsdaten — Ihre Kartennummer und Rechnungsadresse werden vollständig von Stripe verarbeitet und erreichen niemals die Server von LessonScriptor.",
"paymentsBody2": "Beim Kauf erstellt LessonScriptor einen Lizenzschlüssel, der mit der beim Bezahlen angegebenen E-Mail-Adresse verknüpft wird, damit wir Ihre Credits zuordnen und Ihnen bei Supportanfragen helfen können. Bitte beachten Sie die Datenschutzrichtlinie von Stripe für Details zur Verarbeitung Ihrer Zahlungsdaten.",
"thirdPartyStripe": "Stripe: Verwaltet alle Zahlungen für Tab-Audio-Credits. Siehe Abschnitt Zahlungen oben.",
```
`tabAudioBody`: replace `"(auf LemonSqueezy gekauft — Einmalzahlung, läuft nie ab)"` with `"(über Stripe gekauft — Einmalzahlung, läuft nie ab)"`.

pt:
```json
"paymentsBody1": "Os créditos de Áudio de Aba são adquiridos através da Stripe, um processador de pagamentos terceiro. A Stripe trata os seus dados de pagamento — o número do seu cartão e a morada de faturação são processados inteiramente pela Stripe e nunca chegam aos servidores do LessonScriptor.",
"paymentsBody2": "Ao efetuar a compra, o LessonScriptor gera uma chave de licença associada ao endereço de e-mail fornecido no checkout, para que possamos aplicar os seus créditos e ajudá-lo caso contacte o suporte. Consulte a política de privacidade da Stripe para mais detalhes sobre como tratam os seus dados de pagamento.",
"thirdPartyStripe": "Stripe: trata todos os pagamentos de créditos de Áudio de Aba. Ver a secção Pagamentos acima.",
```
`tabAudioBody`: replace `"(comprada no LemonSqueezy — pagamento único, sem expiração)"` with `"(comprada via Stripe — pagamento único, sem expiração)"`.

zh:
```json
"paymentsBody1": "标签页音频积分通过第三方支付处理商 Stripe 购买。Stripe 处理您的支付信息——您的卡号和账单地址完全由 Stripe 处理，永远不会到达 LessonScriptor 的服务器。",
"paymentsBody2": "购买后，LessonScriptor 会生成一个许可证密钥，并与您在结账时提供的电子邮件地址关联，以便我们发放您的额度，并在您联系支持时提供帮助。有关 Stripe 如何处理您的支付数据，请查阅 Stripe 的隐私政策。",
"thirdPartyStripe": "Stripe：处理所有标签页音频积分的支付。见上方付款部分。",
```
`tabAudioBody`: replace `"（在 LemonSqueezy 购买——一次性付款，永不过期）"` with `"（通过 Stripe 购买——一次性付款，永不过期）"`.

Rename the JSON key itself from `"thirdPartyLemon"` to `"thirdPartyStripe"` in all six files (matching the `page.tsx` change in Step 1).

- [ ] **Step 3: Commit**

```bash
git add "app/[locale]/privacy/page.tsx" messages/
git commit -m "fix(privacy): correct payment/license-key claims and swap vendor references to Stripe"
```

---

## Manual Steps (Pierre — not code, Stripe account access required)

These require your own Stripe Dashboard login and cannot be done by an agent. Do these on the **existing** Stripe account, in **test mode** first.

1. **Accept Managed Payments ToS**: Dashboard → Settings → search "Managed Payments" → accept the terms.
2. **Create 3 products/prices** (Starter/5h, Student/15h, Heavy/30h) — set the tax category to the digital-services/software category during setup, since Managed Payments' tax computation depends on it.
3. **Create 3 Payment Links**, one per price — on each, make sure **"Enable Managed Payments"** is selected. Note down, per link:
   - The **Payment Link URL** (`https://buy.stripe.com/...`) → becomes `STRIPE_PACK_{STARTER,STUDENT,HEAVY}_LINK_URL`
   - The **Payment Link ID** (`plink_...`, visible in the link's detail view or via the API) → becomes `STRIPE_PACK_{STARTER,STUDENT,HEAVY}_LINK_ID`
4. **Configure each Payment Link's after-payment redirect** to send buyers to the thank-you page with the session id, e.g.:
   ```
   https://lessonscriptor.com/{locale}/thank-you?session_id={CHECKOUT_SESSION_ID}
   ```
   Without this, buyers never reach `/thank-you` at all — they stay on Stripe's own hosted confirmation page — and even if they did, the page would have no `session_id` to look up. Since Payment Links are static, this needs one distinct redirect per locale (or `en` as the default) — pick the right locale-specific `thank-you` URL for each. Confirm the exact redirect-URL template placeholder syntax (e.g. whether `{CHECKOUT_SESSION_ID}` is the correct token) against Stripe's current Payment Links documentation before configuring it, since this plan was written without live access to that dashboard UI.
5. **Create a webhook endpoint** pointing at `https://lessonscriptor.com/api/webhook/stripe`, subscribed to `checkout.session.completed`. Copy its signing secret → `STRIPE_WEBHOOK_SECRET`.
6. **Grab your API secret key** (test mode first, then live once verified) → `STRIPE_SECRET_KEY`.

**Env vars to add** (Vercel dashboard, mirroring the existing `LEMON_SQUEEZY_PACK_*_ID` pattern):
```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PACK_STARTER_LINK_ID
STRIPE_PACK_STUDENT_LINK_ID
STRIPE_PACK_HEAVY_LINK_ID
STRIPE_PACK_STARTER_LINK_URL
STRIPE_PACK_STUDENT_LINK_URL
STRIPE_PACK_HEAVY_LINK_URL
```

**Local verification before touching production**:
1. Set all eight env vars above (test-mode values) in `.env.local`.
2. Run `npm run dev`.
3. In a second terminal, run `stripe listen --forward-to localhost:3000/api/webhook/stripe` (Stripe CLI) — it prints a `whsec_...` value; use that as your **local** `STRIPE_WEBHOOK_SECRET` instead of the Dashboard one, since the CLI signs events with its own secret while forwarding.
4. Visit `/en`, click a pack card, complete checkout with Stripe's test card `4242 4242 4242 4242`.
5. Confirm in the terminal running `stripe listen` that `checkout.session.completed` was forwarded and returned `200`.
6. Confirm credits landed: query the `users` table for the test email, or check the welcome email arrived (Resend test mode / your inbox) with a license key in it.
7. Visit the thank-you redirect URL manually with the real `session_id` from the completed session and confirm the key renders.
8. Only after all of the above passes, flip `STRIPE_SECRET_KEY`/`STRIPE_WEBHOOK_SECRET` to live values and repeat a single real low-value purchase before considering the migration done.

---

## Self-Review

**Spec coverage**: license-key delivery via email (Task 1) → webhook fulfillment + key generation (Task 2) → thank-you best-effort fetch (Tasks 3-4) → checkout entry points (Task 5) → accurate compliance copy (Task 6) → account/dashboard steps (Manual Steps). Every decision made during scoping (Payment Links over Checkout Sessions, self-generated keys, email-primary/page-best-effort, corrected privacy copy, keep the LS route alive) has a task or explicit constraint covering it.

**Placeholder scan**: every step has real code/copy, no TBD/TODO markers, no "similar to Task N" shortcuts — Task 2 and Task 3 each spell out their own full implementation rather than referencing each other.

**Type consistency**: `buildWelcomeEmail(rawLocale, name, email, licenseKey?)` (Task 1) matches its two call sites — `lib/welcome-email.ts`'s own `sendWelcomeEmail` and the test file. `sendWelcomeEmail({ email, name, locale, licenseKey })` (Task 1) matches the Task 2 webhook's call. `secondsForPaymentLink(paymentLinkId: string): number | null` and `addCredits(sql, email, seconds, referenceId, licenseKey: string)` (Task 2) are used consistently within that task only. `GET /api/checkout-session` → `{ licenseKey: string | null }` (Task 3) matches the shape `ThankYouLicenseKey.tsx` (Task 4) expects from `data.licenseKey ?? null`. `paymentLinkUrls: string[]` indexing (Task 5) is documented as parallel to `packs` and to Task 2's Starter/Student/Heavy env var ordering, confirmed against the actual `messages/en.json` `pricing.packs` array order (5h/15h/30h).
