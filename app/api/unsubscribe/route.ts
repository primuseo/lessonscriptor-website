import { NextRequest, NextResponse } from 'next/server'
import { getDb } from '@/lib/db'
import { verifyUnsubscribeToken } from '@/lib/unsubscribe-token'
import { resolveLocale, type Locale } from '@/lib/welcome-email'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

const MESSAGES: Record<Locale, { title: string; done: string; invalid: string }> = {
  en: {
    title: 'LessonScriptor',
    done: "You're unsubscribed. You won't get any more emails from us at this address.",
    invalid: 'This unsubscribe link is invalid or has expired.',
  },
  fr: {
    title: 'LessonScriptor',
    done: "Vous êtes désinscrit. Vous ne recevrez plus d'e-mails de notre part à cette adresse.",
    invalid: 'Ce lien de désinscription est invalide ou a expiré.',
  },
  es: {
    title: 'LessonScriptor',
    done: 'Te has dado de baja. No recibirás más correos nuestros en esta dirección.',
    invalid: 'Este enlace para darse de baja no es válido o ha caducado.',
  },
  de: {
    title: 'LessonScriptor',
    done: 'Du bist abgemeldet. Du erhältst an dieser Adresse keine E-Mails mehr von uns.',
    invalid: 'Dieser Abmeldelink ist ungültig oder abgelaufen.',
  },
  pt: {
    title: 'LessonScriptor',
    done: 'Você foi removido da lista. Não enviaremos mais e-mails para este endereço.',
    invalid: 'Este link de cancelamento é inválido ou expirou.',
  },
  zh: {
    title: 'LessonScriptor',
    done: '已为你取消订阅，我们不会再向该地址发送邮件。',
    invalid: '此退订链接无效或已过期。',
  },
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email || !token || !emailRegex.test(email) || !verifyUnsubscribeToken(email, token)) {
    return page(locale, MESSAGES[locale].invalid, 400)
  }

  const sql = getDb()
  await sql`
    INSERT INTO users (email, unsubscribed)
    VALUES (${email}, true)
    ON CONFLICT (email) DO UPDATE SET unsubscribed = true
  `

  return page(locale, MESSAGES[locale].done, 200)
}
