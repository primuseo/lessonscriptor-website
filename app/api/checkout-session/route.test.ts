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

function req(sessionId?: string) {
  const url = sessionId
    ? `https://lessonscriptor.com/api/checkout-session?session_id=${encodeURIComponent(sessionId)}`
    : 'https://lessonscriptor.com/api/checkout-session'
  return new Request(url) as unknown as Parameters<typeof GET>[0]
}

beforeEach(() => {
  sqlMock.mockReset()
  rateLimitMock.mockReset().mockResolvedValue({ success: true, headers: {} })
})

describe('GET /api/checkout-session', () => {
  it('returns 400 when session_id is missing', async () => {
    const res = await GET(req())
    expect(res.status).toBe(400)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('returns 400 when session_id does not look like a Stripe Checkout Session id', async () => {
    // Lemon Squeezy's webhook writes short sequential numeric order ids into the same
    // shared `reference_id` column — reject anything that isn't a real `cs_...` id so
    // this endpoint can't be used to fetch a Lemon Squeezy buyer's license key.
    const res = await GET(req('8249342'))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Invalid session_id')
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('returns 429 when the client is rate limited', async () => {
    rateLimitMock.mockResolvedValueOnce({ success: false, headers: {} })
    const res = await GET(req('cs_test_123'))
    expect(res.status).toBe(429)
    const data = await res.json()
    expect(data.error).toBe('Too many requests')
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
