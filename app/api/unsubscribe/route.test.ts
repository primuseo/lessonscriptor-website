import { describe, it, expect, vi, beforeEach } from 'vitest'

const { sqlMock, rateLimitMock } = vi.hoisted(() => ({
  sqlMock: vi.fn(),
  rateLimitMock: vi.fn(),
}))

vi.mock('@/lib/db', () => ({ getDb: () => sqlMock }))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: rateLimitMock,
  getClientIp: () => '1.2.3.4',
}))

import { GET } from './route'
import { signUnsubscribeToken } from '@/lib/unsubscribe-token'

function req(params: Record<string, string>) {
  const url = new URL('https://lessonscriptor.com/api/unsubscribe')
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v)
  return new Request(url) as unknown as Parameters<typeof GET>[0]
}

beforeEach(() => {
  sqlMock.mockReset().mockResolvedValue(undefined)
  rateLimitMock.mockReset().mockResolvedValue({ success: true, headers: {} })
  process.env.UNSUBSCRIBE_SECRET = 'test-secret'
})

describe('GET /api/unsubscribe', () => {
  it('records the opt-out for a validly signed link', async () => {
    const email = 'buyer@example.com'
    const token = signUnsubscribeToken(email)
    const res = await GET(req({ email, token, locale: 'fr' }))
    expect(res.status).toBe(200)
    expect(sqlMock).toHaveBeenCalledTimes(1)
    const values = sqlMock.mock.calls[0].flat()
    expect(values).toContain(email)
    const html = await res.text()
    expect(html).toContain('désinscrit')
  })

  it('rejects a tampered token', async () => {
    const email = 'buyer@example.com'
    const token = signUnsubscribeToken(email).replace(/.$/, 'z')
    const res = await GET(req({ email, token }))
    expect(res.status).toBe(400)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('rejects a token signed for a different email', async () => {
    const token = signUnsubscribeToken('someone-else@example.com')
    const res = await GET(req({ email: 'buyer@example.com', token }))
    expect(res.status).toBe(400)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('rejects missing params', async () => {
    const res = await GET(req({}))
    expect(res.status).toBe(400)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('enforces the IP rate limit before touching the DB', async () => {
    rateLimitMock.mockResolvedValueOnce({ success: false, headers: {} })
    const email = 'buyer@example.com'
    const token = signUnsubscribeToken(email)
    const res = await GET(req({ email, token }))
    expect(res.status).toBe(429)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('falls back to English copy for an unsupported locale', async () => {
    const email = 'buyer@example.com'
    const token = signUnsubscribeToken(email)
    const res = await GET(req({ email, token, locale: 'xx' }))
    const html = await res.text()
    expect(html).toContain("You're unsubscribed")
  })
})
