# New-Buyer Welcome Email — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** When someone buys LessonScriptor for the first time via Lemon Squeezy, automatically send a localized "welcome / hit reply" email through Resend.

**Architecture:** Extend the existing `order_created` branch of the Lemon Squeezy webhook. Detect first-time buyers via the `credit_transactions` table, then call a new isolated `lib/welcome-email.ts` module that renders a locale-specific email and sends it through Resend. The customer's locale is threaded from the pricing page into the checkout via `checkout[custom][locale]`.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Neon (`@neondatabase/serverless`), Resend, next-intl, Vitest (added by this plan).

## Global Constraints

- Supported locales (exact list): `en`, `fr`, `es`, `de`, `pt`, `zh`. English is the fallback.
- Resend send fields: `from`, `to`, `replyTo` (camelCase), `subject`, `html`, `text`. Mirror `app/api/contact/route.ts`.
- Path alias: `@/*` → repo root (from `tsconfig.json`).
- API routes live outside `app/[locale]/` — do not move the webhook.
- Do NOT change `localePrefix: 'always'` or `middleware.ts`.
- First-purchase detection uses `credit_transactions` (`type = 'purchase'`), NOT the `users` table (a `license_key_created` event can create the user row before `order_created`).
- Email send failures must be caught and logged; the webhook must still return `{ received: true }` (never trigger a Lemon Squeezy retry over an email error).
- Sender identity in copy: **Pierre & Victoria** (two founders).
- New env vars (set in Vercel dashboard, per repo convention): `WELCOME_FROM_EMAIL`, `WELCOME_REPLY_TO`. `RESEND_API_KEY` already exists.
- Branch: `feat/welcome-email` (already created; spec already committed there).

---

### Task 1: Vitest setup + pure email-rendering module

**Files:**
- Modify: `package.json` (add `vitest` devDependency + `test` script)
- Create: `vitest.config.ts`
- Create: `lib/welcome-email.ts` (pure parts: `SUPPORTED_LOCALES`, `resolveLocale`, `TEMPLATES`, `buildWelcomeEmail`)
- Test: `lib/welcome-email.test.ts`

**Interfaces:**
- Produces:
  - `SUPPORTED_LOCALES: readonly ['en','fr','es','de','pt','zh']`
  - `type Locale`
  - `resolveLocale(raw: unknown): Locale`
  - `buildWelcomeEmail(rawLocale: unknown, name: string | null): { subject: string; html: string; text: string }`

- [ ] **Step 1: Install Vitest**

Run:
```bash
cd /Users/pierre.girardot/Documents/Code/lessonscriptor-website
npm install -D vitest
```
Expected: `vitest` added to `devDependencies`.

- [ ] **Step 2: Add the `test` script**

In `package.json`, add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, './') } },
  test: { environment: 'node' },
})
```

- [ ] **Step 4: Write the failing test**

Create `lib/welcome-email.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { resolveLocale, buildWelcomeEmail } from '@/lib/welcome-email'

describe('resolveLocale', () => {
  it('keeps a supported locale', () => expect(resolveLocale('fr')).toBe('fr'))
  it('falls back to en for an unsupported string', () => expect(resolveLocale('xx')).toBe('en'))
  it('falls back to en for undefined', () => expect(resolveLocale(undefined)).toBe('en'))
})

describe('buildWelcomeEmail', () => {
  it('uses the customer name when provided', () => {
    const { text } = buildWelcomeEmail('en', 'Stephen')
    expect(text).toContain('Hi Stephen,')
  })
  it('uses the anonymous greeting when name is missing', () => {
    const { text } = buildWelcomeEmail('en', null)
    expect(text).toContain('Hi there,')
  })
  it('returns a localized subject for fr', () => {
    const { subject } = buildWelcomeEmail('fr', 'Marie')
    expect(subject).toContain('Bienvenue')
  })
  it('falls back to the English template for an unknown locale', () => {
    const { subject } = buildWelcomeEmail('xx', 'x')
    expect(subject).toContain('Welcome to LessonScriptor')
  })
  it('escapes HTML-significant characters in the name', () => {
    const { html } = buildWelcomeEmail('en', '<b>x</b>')
    expect(html).not.toContain('<b>x</b>')
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;')
  })
})
```

- [ ] **Step 5: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — cannot resolve `@/lib/welcome-email` (module not created yet).

- [ ] **Step 6: Implement `lib/welcome-email.ts` (pure parts)**

Create `lib/welcome-email.ts`:
```ts
export const SUPPORTED_LOCALES = ['en', 'fr', 'es', 'de', 'pt', 'zh'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export function resolveLocale(raw: unknown): Locale {
  return typeof raw === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(raw)
    ? (raw as Locale)
    : 'en'
}

interface Template {
  subject: string
  greetingNamed: string // contains {name}
  greetingAnon: string
  intro: string
  ready: string
  leadIn: string
  bullets: [string, string, string]
  replies: string
  closing: string
  signoff: string
}

const TEMPLATES: Record<Locale, Template> = {
  en: {
    subject: 'Welcome to LessonScriptor 🎓 — a quick hello from Pierre & Victoria',
    greetingNamed: 'Hi {name},',
    greetingAnon: 'Hi there,',
    intro: "Pierre and Victoria here — the two people behind LessonScriptor. Thank you so much for grabbing a Tab Audio credit pack. We're a tiny team, so every person who trusts us genuinely makes our week.",
    ready: "You're all set — your credits are ready whenever you are.",
    leadIn: "You've only just started, so we're not going to ask you for a review yet :) But we build this around what real users tell us, so keep this in the back of your mind:",
    bullets: [
      'Anything confusing or not working right? Just hit reply.',
      "Something that'd make it fit your workflow better? We want to hear it.",
      'Even a one-line first impression helps.',
    ],
    replies: 'Replies come straight to the two of us, and we answer every one personally.',
    closing: 'Thanks for being early — it matters.',
    signoff: 'Pierre & Victoria',
  },
  fr: {
    subject: 'Bienvenue sur LessonScriptor 🎓 — un petit mot de Pierre & Victoria',
    greetingNamed: 'Bonjour {name},',
    greetingAnon: 'Bonjour,',
    intro: "Ici Pierre et Victoria — les deux personnes derrière LessonScriptor. Un immense merci d'avoir pris un pack de crédits Tab Audio. Nous sommes une toute petite équipe, alors chaque personne qui nous fait confiance nous touche vraiment.",
    ready: 'Tout est prêt — vos crédits vous attendent dès que vous le souhaitez.',
    leadIn: "Vous venez tout juste de commencer, donc on ne va pas vous demander un avis complet tout de suite :) Mais nous construisons LessonScriptor à partir des retours de nos utilisateurs, alors gardez ceci en tête :",
    bullets: [
      "Quelque chose n'est pas clair ou ne fonctionne pas comme prévu ? Répondez simplement à cet e-mail.",
      "Une idée pour que l'outil s'adapte mieux à votre façon de travailler ? On veut l'entendre.",
      'Même une première impression en une ligne nous aide énormément.',
    ],
    replies: 'Vos réponses nous arrivent directement, à tous les deux, et nous répondons personnellement à chacune.',
    closing: "Merci d'être là dès le début — ça compte beaucoup pour nous.",
    signoff: 'Pierre & Victoria',
  },
  es: {
    subject: 'Bienvenido a LessonScriptor 🎓 — un saludo de Pierre y Victoria',
    greetingNamed: 'Hola {name}:',
    greetingAnon: 'Hola:',
    intro: 'Somos Pierre y Victoria, las dos personas detrás de LessonScriptor. Muchísimas gracias por conseguir un paquete de créditos de Tab Audio. Somos un equipo muy pequeño, así que cada persona que confía en nosotros nos alegra el día.',
    ready: 'Ya está todo listo: tus créditos están disponibles cuando quieras.',
    leadIn: 'Acabas de empezar, así que no vamos a pedirte una opinión completa todavía :) Pero construimos LessonScriptor a partir de lo que nos cuentan los usuarios reales, así que ten esto en mente:',
    bullets: [
      '¿Algo confuso o que no funciona como esperabas? Solo responde a este correo.',
      '¿Algo que lo haría encajar mejor en tu forma de trabajar? Queremos escucharlo.',
      'Incluso una primera impresión en una línea nos ayuda muchísimo.',
    ],
    replies: 'Tus respuestas nos llegan directamente a los dos, y respondemos personalmente a cada una.',
    closing: 'Gracias por estar desde el principio: significa mucho para nosotros.',
    signoff: 'Pierre y Victoria',
  },
  de: {
    subject: 'Willkommen bei LessonScriptor 🎓 — ein kurzer Gruß von Pierre & Victoria',
    greetingNamed: 'Hallo {name},',
    greetingAnon: 'Hallo,',
    intro: 'Hier sind Pierre und Victoria – die zwei Menschen hinter LessonScriptor. Vielen Dank, dass du dir ein Tab-Audio-Guthabenpaket geholt hast. Wir sind ein winziges Team, deshalb freut uns jede Person, die uns vertraut, ganz besonders.',
    ready: 'Alles ist startklar – dein Guthaben steht bereit, wann immer du möchtest.',
    leadIn: 'Du hast gerade erst angefangen, deshalb bitten wir dich noch nicht um eine Bewertung :) Aber wir entwickeln LessonScriptor auf Basis von echtem Nutzer-Feedback, also behalte das im Hinterkopf:',
    bullets: [
      'Etwas unklar oder funktioniert nicht wie erwartet? Antworte einfach auf diese E-Mail.',
      'Etwas, das es besser an deinen Workflow anpassen würde? Wir wollen es hören.',
      'Schon ein erster Eindruck in einem Satz hilft uns sehr.',
    ],
    replies: 'Deine Antworten kommen direkt bei uns beiden an, und wir beantworten jede einzelne persönlich.',
    closing: 'Danke, dass du von Anfang an dabei bist – das bedeutet uns viel.',
    signoff: 'Pierre & Victoria',
  },
  pt: {
    subject: 'Bem-vindo ao LessonScriptor 🎓 — um olá de Pierre e Victoria',
    greetingNamed: 'Olá {name},',
    greetingAnon: 'Olá,',
    intro: 'Aqui são Pierre e Victoria — as duas pessoas por trás do LessonScriptor. Muito obrigado por adquirir um pacote de créditos do Tab Audio. Somos uma equipe pequena, então cada pessoa que confia na gente alegra a nossa semana.',
    ready: 'Está tudo pronto — seus créditos estão disponíveis quando você quiser.',
    leadIn: 'Você acabou de começar, então não vamos pedir uma avaliação completa ainda :) Mas construímos o LessonScriptor com base no que os usuários reais nos contam, então guarde isto:',
    bullets: [
      'Algo confuso ou que não funciona como esperado? É só responder a este e-mail.',
      'Algo que o deixaria mais adequado ao seu fluxo de trabalho? Queremos ouvir.',
      'Até uma primeira impressão em uma linha já ajuda muito.',
    ],
    replies: 'Suas respostas chegam direto para nós dois, e respondemos pessoalmente a cada uma.',
    closing: 'Obrigado por estar aqui desde o início — isso significa muito.',
    signoff: 'Pierre e Victoria',
  },
  zh: {
    subject: '欢迎使用 LessonScriptor 🎓 — 来自 Pierre 和 Victoria 的问候',
    greetingNamed: '你好 {name}，',
    greetingAnon: '你好，',
    intro: '我们是 Pierre 和 Victoria——LessonScriptor 背后的两个人。非常感谢你购买 Tab Audio 额度包。我们是一个很小的团队，所以每一位信任我们的用户都让我们特别开心。',
    ready: '一切都已就绪——你的额度随时可以使用。',
    leadIn: '你才刚刚开始，所以我们现在不会请你写评价 :) 但我们是根据真实用户的反馈来打造 LessonScriptor 的，所以请记住：',
    bullets: [
      '有什么让你困惑，或运行得不如预期？直接回复这封邮件就好。',
      '有什么能让它更贴合你的工作流程？我们很想听。',
      '哪怕只是一句话的初步印象，也对我们帮助很大。',
    ],
    replies: '你的回复会直接发到我们两个人手中，我们会亲自回复每一封。',
    closing: '谢谢你在最早期就加入——这对我们意义重大。',
    signoff: 'Pierre 和 Victoria',
  },
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function buildWelcomeEmail(
  rawLocale: unknown,
  name: string | null
): { subject: string; html: string; text: string } {
  const locale = resolveLocale(rawLocale)
  const t = TEMPLATES[locale]
  const trimmed = name && name.trim() ? name.trim() : null
  const greeting = trimmed ? t.greetingNamed.replace('{name}', trimmed) : t.greetingAnon

  const text = [
    greeting,
    '',
    t.intro,
    '',
    t.ready,
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
  ].join('\n')

  const e = escapeHtml
  const html = `<div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1a1714">
<p>${e(greeting)}</p>
<p>${e(t.intro)}</p>
<p><strong>${e(t.ready)}</strong></p>
<p>${e(t.leadIn)}</p>
<ul>
<li>${e(t.bullets[0])}</li>
<li>${e(t.bullets[1])}</li>
<li>${e(t.bullets[2])}</li>
</ul>
<p>${e(t.replies)}</p>
<p>${e(t.closing)}</p>
<p>${e(t.signoff)}<br/>LessonScriptor</p>
</div>`

  return { subject: t.subject, html, text }
}
```

- [ ] **Step 7: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all `resolveLocale` and `buildWelcomeEmail` tests green.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vitest.config.ts lib/welcome-email.ts lib/welcome-email.test.ts
git commit -m "feat: add welcome-email module with localized templates + vitest

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: `sendWelcomeEmail` (Resend integration)

**Files:**
- Modify: `lib/welcome-email.ts` (append the send function)
- Test: `lib/welcome-email.send.test.ts`

**Interfaces:**
- Consumes: `buildWelcomeEmail` (Task 1)
- Produces: `sendWelcomeEmail(args: { email: string; name: string | null; locale: unknown }): Promise<void>`

- [ ] **Step 1: Write the failing test**

Create `lib/welcome-email.send.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from 'vitest'

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }))
vi.mock('resend', () => ({
  Resend: vi.fn(() => ({ emails: { send: sendMock } })),
}))

import { sendWelcomeEmail } from '@/lib/welcome-email'

beforeEach(() => {
  sendMock.mockReset().mockResolvedValue({ error: null })
  process.env.RESEND_API_KEY = 'test-key'
  process.env.WELCOME_FROM_EMAIL = 'LessonScriptor <hello@lessonscriptor.com>'
  process.env.WELCOME_REPLY_TO = 'marketing@primuseo.com'
})

describe('sendWelcomeEmail', () => {
  it('sends once with the correct envelope', async () => {
    await sendWelcomeEmail({ email: 'buyer@example.com', name: 'Stephen', locale: 'en' })
    expect(sendMock).toHaveBeenCalledTimes(1)
    const arg = sendMock.mock.calls[0][0]
    expect(arg.to).toBe('buyer@example.com')
    expect(arg.from).toBe('LessonScriptor <hello@lessonscriptor.com>')
    expect(arg.replyTo).toBe('marketing@primuseo.com')
    expect(arg.subject).toContain('Welcome to LessonScriptor')
    expect(typeof arg.html).toBe('string')
    expect(typeof arg.text).toBe('string')
  })

  it('throws when required env vars are missing', async () => {
    delete process.env.RESEND_API_KEY
    await expect(
      sendWelcomeEmail({ email: 'a@b.com', name: null, locale: 'en' })
    ).rejects.toThrow()
    expect(sendMock).not.toHaveBeenCalled()
  })

  it('throws when Resend returns an error', async () => {
    sendMock.mockResolvedValueOnce({ error: { message: 'boom' } })
    await expect(
      sendWelcomeEmail({ email: 'a@b.com', name: 'X', locale: 'en' })
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test`
Expected: FAIL — `sendWelcomeEmail` is not exported.

- [ ] **Step 3: Implement `sendWelcomeEmail`**

Append to `lib/welcome-email.ts`:
```ts
import { Resend } from 'resend'

interface SendWelcomeArgs {
  email: string
  name: string | null
  locale: unknown
}

export async function sendWelcomeEmail({ email, name, locale }: SendWelcomeArgs): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.WELCOME_FROM_EMAIL
  const replyTo = process.env.WELCOME_REPLY_TO
  if (!apiKey || !from || !replyTo) {
    throw new Error(
      'welcome-email: RESEND_API_KEY, WELCOME_FROM_EMAIL and WELCOME_REPLY_TO must be set'
    )
  }

  const { subject, html, text } = buildWelcomeEmail(locale, name)
  const resend = new Resend(apiKey)
  const { error } = await resend.emails.send({ from, to: email, replyTo, subject, html, text })
  if (error) {
    throw new Error(`welcome-email Resend error: ${JSON.stringify(error)}`)
  }
}
```
(Place the `import { Resend } from 'resend'` line at the top of the file with the other imports.)

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test`
Expected: PASS — all send tests green, Task 1 tests still green.

- [ ] **Step 5: Commit**

```bash
git add lib/welcome-email.ts lib/welcome-email.send.test.ts
git commit -m "feat: send welcome email via Resend

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Wire the send into the Lemon Squeezy webhook

**Files:**
- Modify: `app/api/webhook/lemon-squeezy/route.ts` (import + `order_created` branch)

**Interfaces:**
- Consumes: `sendWelcomeEmail` (Task 2)
- Produces: no new exports (behavioral change to the webhook)

- [ ] **Step 1: Add the import**

At the top of `app/api/webhook/lemon-squeezy/route.ts`, alongside the existing imports:
```ts
import { sendWelcomeEmail } from '@/lib/welcome-email';
```

- [ ] **Step 2: Detect first purchase before adding credits**

In the `if (eventName === 'order_created') {` block, immediately AFTER the existing duplicate-order guard (the `if (existing.length > 0) { ... return ... }` block) and BEFORE the `await addCredits(...)` call, insert:
```ts
    const priorPurchases = await sql`
      SELECT 1 FROM credit_transactions
      WHERE user_email = ${email} AND type = 'purchase'
      LIMIT 1
    `;
    const isFirstPurchase = priorPurchases.length === 0;
```

- [ ] **Step 3: Send the welcome email after credits are granted**

In the same block, immediately AFTER `await addCredits(sql, email, seconds, orderId, licenseKey);` and its existing `console.log`, insert:
```ts
    if (isFirstPurchase) {
      try {
        await sendWelcomeEmail({
          email,
          name: attrs.user_name ?? null,
          locale: event.meta?.custom_data?.locale,
        });
        console.log(`[Webhook] welcome email sent to ${email}`);
      } catch (err) {
        console.error(`[Webhook] welcome email FAILED for ${email}:`, err);
        // Swallow: credits are already granted; never make Lemon Squeezy retry over an email error.
      }
    }
```

- [ ] **Step 4: Typecheck the change**

Run:
```bash
npx tsc --noEmit
```
Expected: no new type errors from `route.ts` (pre-existing errors elsewhere, if any, are unrelated).

- [ ] **Step 5: Commit**

```bash
git add app/api/webhook/lemon-squeezy/route.ts
git commit -m "feat: send welcome email to first-time buyers from LS webhook

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Thread locale into the checkout URLs

**Files:**
- Modify: `components/PricingPacks.tsx`

**Interfaces:**
- Consumes: `useLocale` from `next-intl`
- Produces: checkout `href`s carrying `&checkout[custom][locale]=<locale>`

- [ ] **Step 1: Import `useLocale`**

At the top of `components/PricingPacks.tsx`, below `import { useState } from 'react'`:
```tsx
import { useLocale } from 'next-intl'
```

- [ ] **Step 2: Read the active locale in the component**

Inside `export default function PricingPacks(...)`, just after `const { symbol, rate, decimals } = CURRENCIES[currency]`:
```tsx
  const locale = useLocale()
```

- [ ] **Step 3: Append the locale to each checkout link**

Replace the `href` on the `<a>` (currently `href={CHECKOUT_URLS[pack.basePrice] || '#'}`) with:
```tsx
            href={
              CHECKOUT_URLS[pack.basePrice]
                ? `${CHECKOUT_URLS[pack.basePrice]}&checkout[custom][locale]=${locale}`
                : '#'
            }
```

- [ ] **Step 4: Verify it builds and the URL is correct**

Run:
```bash
npm run build
```
Expected: build succeeds. Then in dev (`npm run dev`), open `/fr/` on the pricing page, hover/inspect a pack link, and confirm the href ends with `&checkout[custom][locale]=fr`. On `/en/` it should read `...=en`.

- [ ] **Step 5: Commit**

```bash
git add components/PricingPacks.tsx
git commit -m "feat: pass site locale into Lemon Squeezy checkout custom data

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: Configure env + end-to-end verification

**Files:** none (configuration + manual verification)

- [ ] **Step 1: Set the new env vars in Vercel**

In the Vercel dashboard for `lessonscriptor-website` → Settings → Environment Variables (Production + Preview):
```
WELCOME_FROM_EMAIL = LessonScriptor <hello@lessonscriptor.com>
WELCOME_REPLY_TO   = marketing@primuseo.com
```
Confirm `RESEND_API_KEY` already exists. Redeploy so the webhook picks them up.

- [ ] **Step 2: Confirm `hello@lessonscriptor.com` is a verified/allowed Resend sender**

In the Resend dashboard, verify the domain `lessonscriptor.com` is validated (already done) and that `hello@` is an acceptable from-address on it. If Resend requires an explicit sender, add it.

- [ ] **Step 3: Fire a Lemon Squeezy test webhook**

In the Lemon Squeezy dashboard → Settings → Webhooks → your endpoint, use "Send test" for `order_created` (or make a real test-mode purchase with `checkout[custom][locale]=fr`). Use an email address you control that has **no prior purchase**.
Expected:
- The customer inbox receives the welcome email (French copy if locale=fr), From `hello@lessonscriptor.com`, Reply-To `marketing@primuseo.com`.
- Vercel function logs show `[Webhook] welcome email sent to <email>`.

- [ ] **Step 4: Verify repeat-buyer suppression**

Fire a second `order_created` for the **same** email.
Expected: NO second welcome email; logs do not show a new "welcome email sent" line for that email (first-purchase check returns false because a `purchase` transaction now exists).

- [ ] **Step 5: Verify reply routing**

Reply to the received welcome email.
Expected: the reply lands in `marketing@primuseo.com` (Tutanota).

- [ ] **Step 6: Final commit / branch wrap-up**

If any config notes belong in the repo (e.g. an env example), add them, then the feature branch `feat/welcome-email` is ready for merge to `main`.

---

## Self-Review

- **Spec coverage:** locale threading (Task 4), first-purchase detection via `credit_transactions` (Task 3), localized send with English fallback (Tasks 1–2), from/reply identity (Task 5 env), non-blocking email failure (Task 3 try/catch), testing of pure logic + send contract (Tasks 1–2), end-to-end + repeat-buyer + reply routing (Task 5). All covered.
- **Phase 2 items** (reply reading, LLM triage, delayed follow-up) intentionally excluded.
- **Type consistency:** `resolveLocale` / `buildWelcomeEmail` / `sendWelcomeEmail` signatures match across tasks; `sendWelcomeEmail` accepts `locale: unknown` and defers validation to `resolveLocale`, so the webhook can pass `event.meta?.custom_data?.locale` raw.
- **No placeholders:** all six locale templates and all test bodies are written in full.
