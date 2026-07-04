import { describe, it, expect, vi, beforeEach } from 'vitest'

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }))
vi.mock('resend', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Resend: vi.fn(function (this: any) { this.emails = { send: sendMock } }),
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
