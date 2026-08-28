import { describe, it, expect, beforeEach } from 'vitest'
import { signUnsubscribeToken, verifyUnsubscribeToken } from '@/lib/unsubscribe-token'

beforeEach(() => {
  process.env.UNSUBSCRIBE_SECRET = 'test-secret'
})

describe('signUnsubscribeToken / verifyUnsubscribeToken', () => {
  it('verifies a token signed for the same email', () => {
    const token = signUnsubscribeToken('buyer@example.com')
    expect(verifyUnsubscribeToken('buyer@example.com', token)).toBe(true)
  })

  it('is case- and whitespace-insensitive on the email', () => {
    const token = signUnsubscribeToken('Buyer@Example.com')
    expect(verifyUnsubscribeToken('  buyer@example.com  ', token)).toBe(true)
  })

  it('rejects a token signed for a different email', () => {
    const token = signUnsubscribeToken('buyer@example.com')
    expect(verifyUnsubscribeToken('someone-else@example.com', token)).toBe(false)
  })

  it('rejects a tampered token', () => {
    const token = signUnsubscribeToken('buyer@example.com')
    const tampered = token.slice(0, -2) + (token.slice(-2) === '00' ? '11' : '00')
    expect(verifyUnsubscribeToken('buyer@example.com', tampered)).toBe(false)
  })

  it('rejects garbage input without throwing', () => {
    expect(verifyUnsubscribeToken('buyer@example.com', 'not-a-token')).toBe(false)
  })

  it('throws when UNSUBSCRIBE_SECRET is not set', () => {
    delete process.env.UNSUBSCRIBE_SECRET
    expect(() => signUnsubscribeToken('buyer@example.com')).toThrow()
  })
})
