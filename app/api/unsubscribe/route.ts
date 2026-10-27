import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'
import { resolveLocale, type Locale } from '@/lib/welcome-email'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const MESSAGES: Record<Locale, { title: string; done: string; invalid: string; confirm: string; button: string }> = {
  en: {
    title: 'LessonScriptor',
    done: "You're unsubscribed. You won't get any more emails from us at this address.",
    invalid: 'This unsubscribe link is invalid or has expired.',
    confirm: 'Unsubscribe {email} from LessonScriptor emails?',
    button: 'Confirm unsubscribe',
  },
  fr: {
    title: 'LessonScriptor',
    done: "Vous êtes désinscrit. Vous ne recevrez plus d'e-mails de notre part à cette adresse.",
    invalid: 'Ce lien de désinscription est invalide ou a expiré.',
    confirm: 'Désinscrire {email} des e-mails de LessonScriptor ?',
    button: 'Confirmer la désinscription',
  },
  es: {
    title: 'LessonScriptor',
    done: 'Te has dado de baja. No recibirás más correos nuestros en esta dirección.',
    invalid: 'Este enlace para darse de baja no es válido o ha caducado.',
    confirm: '¿Dar de baja {email} de los correos de LessonScriptor?',
    button: 'Confirmar la baja',
  },
  de: {
    title: 'LessonScriptor',
    done: 'Du bist abgemeldet. Du erhältst an dieser Adresse keine E-Mails mehr von uns.',
    invalid: 'Dieser Abmeldelink ist ungültig oder abgelaufen.',
    confirm: '{email} von den E-Mails von LessonScriptor abmelden?',
    button: 'Abmeldung bestätigen',
  },
  pt: {
    title: 'LessonScriptor',
    done: 'Você foi removido da lista. Não enviaremos mais e-mails para este endereço.',
    invalid: 'Este link de cancelamento é inválido ou expirou.',
    confirm: 'Remover {email} dos e-mails da LessonScriptor?',
    button: 'Confirmar cancelamento',
  },
  zh: {
    title: 'LessonScriptor',
    done: '已为你取消订阅，我们不会再向该地址发送邮件。',
    invalid: '此退订链接无效或已过期。',
    confirm: '要将 {email} 从 LessonScriptor 邮件中退订吗？',
    button: '确认退订',
  },
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
// Shape of a token from signUnsubscribeToken (hex HMAC-SHA256), whatever secret signed it.
const TOKEN_SHAPE = /^[0-9a-f]{64}$/

const HTML_ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c])
}

function page(locale: Locale, body: string, status: number): NextResponse {
  const t = MESSAGES[locale]
  const html = `<!doctype html>
<html lang="${locale}"><head><meta charset="utf-8"><title>${t.title}</title>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>body{font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.5rem;color:#1a1714;line-height:1.6}</style>
</head><body><p>${body}</p></body></html>`
  return new NextResponse(html, { status, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = await checkRateLimit('unsubscribe', { requests: 20, window: '60 s' }, ip)
  if (!rl.success) {
    return page('en', MESSAGES.en.invalid, 429)
  }

  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')?.trim().toLowerCase() ?? ''
  const token = searchParams.get('token') ?? ''
  const locale = resolveLocale(searchParams.get('locale'))

  if (!email || !token || !EMAIL_REGEX.test(email)) {
    return page(locale, MESSAGES[locale].invalid, 400)
  }

  if (!verifyUnsubscribeToken(email, token)) {
    // Emails sent before the 2026-10 move off Vercel were signed with an
    // UNSUBSCRIBE_SECRET that could not be recovered. Honour those links with an
    // explicit confirmation instead of a dead end. (Worst case, someone
    // unsubscribes an address they know, which only stops emails.)
    if (!TOKEN_SHAPE.test(token)) {
      return page(locale, MESSAGES[locale].invalid, 400)
    }
    const t = MESSAGES[locale]
    const safeEmail = escapeHtml(email)
    return page(
      locale,
      `${t.confirm.replace('{email}', `<strong>${safeEmail}</strong>`)}</p>
<form method="post" action="/api/unsubscribe">
<input type="hidden" name="email" value="${safeEmail}">
<input type="hidden" name="locale" value="${locale}">
<button type="submit" style="font:inherit;padding:.6rem 1.2rem;border-radius:.5rem;border:0;background:#1a1714;color:#fff;cursor:pointer">${t.button}</button>
</form><p>`,
      200,
    )
  }

  return unsubscribe(email, locale)
}

// Submitted by the confirmation form above.
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = await checkRateLimit('unsubscribe', { requests: 20, window: '60 s' }, ip)
  if (!rl.success) {
    return page('en', MESSAGES.en.invalid, 429)
  }

  const form = await request.formData().catch(() => null)
  const email = String(form?.get('email') ?? '').trim().toLowerCase()
  const locale = resolveLocale(String(form?.get('locale') ?? ''))
  if (!EMAIL_REGEX.test(email)) {
    return page(locale, MESSAGES[locale].invalid, 400)
  }

  return unsubscribe(email, locale)
}

async function unsubscribe(email: string, locale: Locale): Promise<NextResponse> {
  const sql = getDb()
  await sql`
    INSERT INTO users (email, unsubscribed)
    VALUES (${email}, true)
    ON CONFLICT (email) DO UPDATE SET unsubscribed = true
  `

  return page(locale, MESSAGES[locale].done, 200)
}
