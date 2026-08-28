import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { sendWelcomeEmail } from '@/lib/welcome-email'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// Temporary: verifies the real welcome-email send path against production
// credentials. Remove this route once the test is confirmed.
function isAuthorized(secret: string | null): boolean {
  const expected = process.env.DEBUG_TEST_SECRET
  if (!expected || !secret) return false
  const a = Buffer.from(secret)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = await checkRateLimit('debug-test-welcome', { requests: 5, window: '60 s' }, ip)
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  if (!isAuthorized(searchParams.get('secret'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const to = searchParams.get('to')
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!to || !emailRegex.test(to)) {
    return NextResponse.json({ error: 'Missing or invalid ?to=' }, { status: 400 })
  }

  try {
    await sendWelcomeEmail({
      email: to,
      name: searchParams.get('name') ?? 'Dev Test',
      locale: searchParams.get('locale') ?? 'en',
    })
    return NextResponse.json({ sent: true, to })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
