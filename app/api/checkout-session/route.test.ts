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
