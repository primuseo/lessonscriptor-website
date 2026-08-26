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

import { POST } from './route'

function req(body?: unknown) {
  return new Request('https://lessonscriptor.com/api/trial/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]
}

beforeEach(() => {
  sqlMock.mockReset().mockResolvedValue(undefined)
  rateLimitMock.mockReset().mockResolvedValue({ success: true, headers: {} })
})

describe('POST /api/trial/start', () => {
  it('grants a trial and passes the device id through to the insert', async () => {
    const res = await POST(req({ device_id: 'device-abc' }))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.credits_seconds_remaining).toBe(1800)

    // The tagged-template call's raw values include our device id.
    const values = sqlMock.mock.calls[0]
    expect(values.flat()).toContain('device-abc')
  })

  it('rejects a repeat trial from the same device id (unique_violation from the DB)', async () => {
    const dbError = Object.assign(new Error('duplicate key value violates unique constraint'), {
      code: '23505',
    })
    sqlMock.mockRejectedValueOnce(dbError)

    const res = await POST(req({ device_id: 'device-abc' }))
    expect(res.status).toBe(403)
    const data = await res.json()
    expect(data.error).toMatch(/already used/i)
  })

  it('still grants a trial when no device id is sent (legacy extension clients)', async () => {
    const res = await POST(req({}))
    expect(res.status).toBe(200)
  })

  it('still grants a trial when the body is missing entirely', async () => {
    const res = await POST(req())
    expect(res.status).toBe(200)
  })

  it('does not treat a unique_violation as a trial-already-used case when no device id was sent', async () => {
    const dbError = Object.assign(new Error('duplicate key value violates unique constraint'), {
      code: '23505',
    })
    sqlMock.mockRejectedValueOnce(dbError)

    const res = await POST(req({}))
    expect(res.status).toBe(500)
  })

  it('still enforces the IP rate limit before touching the DB', async () => {
    rateLimitMock.mockResolvedValueOnce({ success: false, headers: {} })
    const res = await POST(req({ device_id: 'device-abc' }))
    expect(res.status).toBe(429)
    expect(sqlMock).not.toHaveBeenCalled()
  })
})
