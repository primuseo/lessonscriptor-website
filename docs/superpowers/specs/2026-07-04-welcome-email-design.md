# Design — New-Buyer Thank-You Email (Phase 1)

**Date:** 2026-07-04
**Status:** Draft for review
**Product:** LessonScriptor (lessonscriptor.com)

## Goal

When someone buys LessonScriptor for the **first time** via Lemon Squeezy, automatically
send them a warm thank-you email that invites them to **reply** with feedback, bug reports,
or feature ideas. Replies land in a mailbox the owner reads (`marketing@primuseo.com`).

## Scope

**In scope (Phase 1):**
- Detect a first-time purchase from the existing Lemon Squeezy webhook.
- Send one localized thank-you email via Resend.
- Thread the customer's site language through checkout so the email matches their locale.

**Out of scope (Phase 2, separate spec):**
- Reading/parsing customer replies.
- LLM triage of replies into bug / feature / other.
- Auto-routing bugs to issue tracking.
- Any use of Resend Inbound (the `inbound-smtp` root MX is already in place for this,
  but is not wired to anything yet).
- **Delayed usage-feedback follow-up:** a second email sent a few days after purchase
  ("now that you've had a chance to use it…") to collect real feedback once the user
  has actually used the extension. Requires scheduled/delayed sending (e.g. a cron job,
  Resend scheduling, or a queued task), so deferred out of Phase 1. The Phase 1 welcome
  email intentionally sets this up by training the "just hit reply" habit.
- **Wrap `addCredits` in a single SQL transaction (tracking item):** the Phase 1
  hardening makes credit granting idempotent per `reference_id` via
  `INSERT … ON CONFLICT DO NOTHING RETURNING` followed by the `users` credit upsert.
  These are two separate statements, not one atomic transaction. If the database fails
  in the narrow window *between* them, the `reference_id` is recorded but credits are
  never added, and Lemon Squeezy's retry hits the conflict → credits are never granted
  (a rare lost-credit path). This is strictly safer and rarer than the pre-hardening
  behavior (which could double-credit and 500), so it ships as-is. Closing it fully
  needs a real SQL transaction wrapper (`sql.begin(...)` / a pooled `Client`), which the
  Neon HTTP driver doesn't cleanly support for conditional logic — hence Phase 2.

## Prerequisites (DONE)

- Resend domain `lessonscriptor.com` **validated** (DKIM + SPF on `send.` subdomain).
- `RESEND_API_KEY` already configured in Vercel (used by `app/api/contact/route.ts`).
- No one currently relies on inbound mail to `@lessonscriptor.com` (confirmed), so the
  `inbound-smtp` MX intercepting that mail is acceptable until Phase 2.

## End-to-end flow

```
Customer on /fr/ pricing → clicks Buy
  → LS checkout (URL tagged  checkout[custom][locale]=fr )
  → pays
  → LS POSTs webhook to  /api/webhook/lemon-squeezy  (event: order_created)
  → webhook verifies signature (existing), adds credits (existing)
  → NEW: if first purchase for this email → send thank-you via Resend
  → email delivered  From: hello@lessonscriptor.com  Reply-To: marketing@primuseo.com
  → customer replies → marketing@primuseo.com (Tutanota)  [Phase 2 triages]
```

## Components / changes

### 1. `components/PricingPacks.tsx` — thread locale into checkout

Currently a client component (`'use client'`) that renders checkout links from a static
`CHECKOUT_URLS` map. It does not know the customer's language.

**Change:** import `useLocale` from `next-intl`, read the active locale, and append
`&checkout[custom][locale]=<locale>` to each checkout `href`.

```tsx
import { useLocale } from 'next-intl'
// ...
const locale = useLocale()
// in the <a href>:
href={CHECKOUT_URLS[pack.basePrice]
  ? `${CHECKOUT_URLS[pack.basePrice]}&checkout[custom][locale]=${locale}`
  : '#'}
```

Lemon Squeezy echoes `custom_data` back in the webhook payload under
`event.meta.custom_data.locale`.

**Note:** older checkout links (e.g. in-extension, past emails) won't carry this tag →
the webhook must default to English when it's missing.

### 2. `app/api/webhook/lemon-squeezy/route.ts` — detect first purchase & trigger send

Inside the existing `order_created` branch, after the existing duplicate-order guard and
**before** `addCredits`, determine whether this is the customer's first purchase. After
`addCredits` succeeds, send the email if it is.

**First-purchase detection (robust):** check `credit_transactions` for any prior
`type = 'purchase'` row for this email — NOT the `users` table. Rationale: the `users` row
can be created by a `license_key_created` event that may arrive before `order_created`,
which would make a genuine first-timer look like a returning user.

```ts
// after dedup guard, before addCredits:
const priorPurchases = await sql`
  SELECT 1 FROM credit_transactions
  WHERE user_email = ${email} AND type = 'purchase'
  LIMIT 1
`;
const isFirstPurchase = priorPurchases.length === 0;

// ... existing addCredits(...) ...

if (isFirstPurchase) {
  const rawLocale = event.meta?.custom_data?.locale;
  const locale = SUPPORTED_LOCALES.includes(rawLocale) ? rawLocale : 'en';
  try {
    await sendWelcomeEmail({ email, name: attrs.user_name ?? null, locale });
    console.log(`[Webhook] welcome email sent to ${email} (${locale})`);
  } catch (err) {
    console.error(`[Webhook] welcome email FAILED for ${email}:`, err);
    // swallow: credits already granted; never make LS retry over an email hiccup
  }
}
```

`SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'pt', 'zh']`.

**Idempotency:** the send sits past the existing `reference_id` dedup guard, so a given
order fires it at most once. First-purchase detection additionally ensures repeat buyers
never get it.

### 3. `lib/welcome-email.ts` (new) — templates + Resend send

Isolated module mirroring the Resend usage in `app/api/contact/route.ts`.

```ts
import { Resend } from 'resend'

interface WelcomeArgs { email: string; name: string | null; locale: string }

export async function sendWelcomeEmail({ email, name, locale }: WelcomeArgs): Promise<void> {
  const apiKey  = process.env.RESEND_API_KEY
  const from    = process.env.WELCOME_FROM_EMAIL   // e.g. "LessonScriptor <hello@lessonscriptor.com>"
  const replyTo = process.env.WELCOME_REPLY_TO     // marketing@primuseo.com
  if (!apiKey || !from || !replyTo) throw new Error('welcome-email env not configured')

  const t = TEMPLATES[locale] ?? TEMPLATES.en
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({
    from,
    to: email,
    replyTo,
    subject: t.subject,
    html: t.html(name),
    text: t.text(name),
  })
  if (error) throw new Error(`Resend error: ${JSON.stringify(error)}`)
}
```

`TEMPLATES` is a record keyed by locale (`en/fr/es/de/pt/zh`), each with `subject`,
`html(name)`, and `text(name)`. English is the fallback.

## Email content — English master (FINAL)

Sender identity: **Pierre & Victoria** (two founders — not singular). Voice: warm,
personal, reply-driven. Reframed for a brand-new user who hasn't used the product yet —
it deliberately does NOT ask for a retrospective review, and instead trains the
"just hit reply" habit for later.

**Subject:** `Welcome to LessonScriptor 🎓 — a quick hello from Pierre & Victoria`

**Body** (`{{name}}` → customer first name; fallback `there` when LS sends no name):

```
Hi {{name}},

Pierre and Victoria here — the two people behind LessonScriptor. Thank you so much
for grabbing a Tab Audio credit pack. We're a tiny team, so every person who trusts
us genuinely makes our week.

You're all set — your credits are ready whenever you are.

You've only just started, so we're not going to ask you for a review yet :) But we
build this around what real users tell us, so keep this in the back of your mind:

- Anything confusing or not working right? Just hit reply.
- Something that'd make it fit your workflow better? We want to hear it.
- Even a one-line first impression helps.

Replies come straight to the two of us, and we answer every one personally.

Thanks for being early — it matters.

Pierre & Victoria
LessonScriptor
```

**Constraints:** plain, personal, minimal HTML (light formatting only); no marketing
footer; reply-driven (no forms/links) so replies flow back to `WELCOME_REPLY_TO`.
Provide both `html` and `text` versions. The 5 other locales (`fr/es/de/pt/zh`) adapt
this master with locale-appropriate phrasing (natural, not literal translation);
English is the fallback.

## Configuration (Vercel env)

| Var | Example | Status |
|-----|---------|--------|
| `RESEND_API_KEY` | (secret) | exists |
| `WELCOME_FROM_EMAIL` | `LessonScriptor <hello@lessonscriptor.com>` | new |
| `WELCOME_REPLY_TO` | `marketing@primuseo.com` | new |

## Error handling & edge cases

- **Email send fails:** logged, swallowed; webhook still returns `{ received: true }`.
  Credits are already granted; we never let an email error trigger a Lemon Squeezy retry.
- **Missing/invalid locale:** default to English.
- **Repeat buyer:** no email (first-purchase check).
- **Duplicate webhook delivery:** existing `reference_id` guard prevents re-processing.
- **`from` address replies:** if a customer replies to `hello@lessonscriptor.com` instead
  of the Reply-To, that mail currently goes to Resend Inbound (unconfigured) and is dropped.
  Accepted for Phase 1 since Reply-To covers the overwhelming majority; revisited in Phase 2.

## Testing

- `lib/welcome-email.ts`: unit test locale selection + English fallback with a mocked
  Resend client; assert `from`/`to`/`replyTo`/`subject` are correct.
- Webhook: with a signature-valid `order_created` fixture —
  - brand-new email (no prior purchase) → `sendWelcomeEmail` called once;
  - email with a prior purchase → not called;
  - duplicate `order_id` → not called;
  - email send throws → webhook still returns 200 `{ received: true }`.

## Open decisions (resolved)

- Trigger: existing LS webhook (not n8n). ✅
- Recipient: first-time buyers only. ✅
- Sender/reply: from lessonscriptor.com, reply to marketing@primuseo.com. ✅
- Localization: via `checkout[custom][locale]`, English fallback. ✅
