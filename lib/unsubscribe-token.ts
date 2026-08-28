import crypto from 'crypto'

function getSecret(): string {
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret) throw new Error('unsubscribe-token: UNSUBSCRIBE_SECRET must be set')
  return secret
}

export function signUnsubscribeToken(email: string): string {
  return crypto.createHmac('sha256', getSecret()).update(email.trim().toLowerCase()).digest('hex')
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  let expected: Buffer
  let given: Buffer
  try {
    expected = Buffer.from(signUnsubscribeToken(email), 'hex')
    given = Buffer.from(token, 'hex')
  } catch {
    return false
  }
  return expected.length === given.length && crypto.timingSafeEqual(expected, given)
}
