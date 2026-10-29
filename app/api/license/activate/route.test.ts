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

const PAID_ROW = { credits_seconds_remaining: '3600', total_seconds_purchased: '3600', is_unlimited: false }

function req(body: unknown) {
  return new Request('https://lessonscriptor.com/api/license/activate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: 'chrome-extension://abc' },
    body: JSON.stringify(body),
  }) as unknown as Parameters<typeof POST>[0]
}

// sqlMock is called as a tagged template: (strings, ...values).
const queries = () => sqlMock.mock.calls.map(([strings, ...values]) => ({ text: strings.join('?'), values }))

beforeEach(() => {
  sqlMock.mockReset()
  rateLimitMock.mockReset().mockResolvedValue({ success: true, headers: {} })
})

describe('POST /api/license/activate', () => {
  it('activates without touching conversion when no previous key is sent', async () => {
    sqlMock.mockResolvedValueOnce([PAID_ROW])
    const res = await POST(req({ license_key: 'paid-key' }))
    expect(res.status).toBe(200)
    expect(sqlMock).toHaveBeenCalledTimes(1)
  })

  it('links the paid row to the trial key it replaced', async () => {
    sqlMock.mockResolvedValueOnce([PAID_ROW]).mockResolvedValueOnce([])
    const res = await POST(req({ license_key: 'paid-key', previous_license_key: 'trial-key' }))
    expect(res.status).toBe(200)

    const update = queries()[1]
    expect(update.text).toContain('UPDATE users AS paid')
    expect(update.text).toContain('trial.is_trial')
    expect(update.text).toContain('paid.converted_from_trial_email IS NULL')
    expect(update.values).toEqual(['paid-key', 'trial-key'])
  })

  it('ignores a previous key equal to the activated key or malformed', async () => {
    for (const previous_license_key of ['paid-key', '', 'bad key!', 42, 'x'.repeat(129)]) {
      sqlMock.mockReset().mockResolvedValueOnce([PAID_ROW])
      const res = await POST(req({ license_key: 'paid-key', previous_license_key }))
      expect(res.status).toBe(200)
      expect(sqlMock).toHaveBeenCalledTimes(1)
    }
  })

  it('still activates when the conversion link fails', async () => {
    sqlMock.mockResolvedValueOnce([PAID_ROW]).mockRejectedValueOnce(new Error('column missing'))
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await POST(req({ license_key: 'paid-key', previous_license_key: 'trial-key' }))
    expect(res.status).toBe(200)
    expect((await res.json()).ok).toBe(true)
    errSpy.mockRestore()
  })

  it('does not link when the key is unknown', async () => {
    sqlMock.mockResolvedValueOnce([])
    const res = await POST(req({ license_key: 'nope', previous_license_key: 'trial-key' }))
    expect(res.status).toBe(404)
    expect(sqlMock).toHaveBeenCalledTimes(1)
  })
})
