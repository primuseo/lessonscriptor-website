import { describe, it, expect, vi, beforeEach } from 'vitest'

const { sqlMock, constructEventMock, sendWelcomeEmailMock } = vi.hoisted(() => ({
  sqlMock: vi.fn(),
  constructEventMock: vi.fn(),
  sendWelcomeEmailMock: vi.fn(),
}))

vi.mock('@/lib/db', () => ({ getDb: () => sqlMock }))
vi.mock('@/lib/welcome-email', () => ({ sendWelcomeEmail: sendWelcomeEmailMock }))
vi.mock('stripe', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  default: vi.fn(function (this: any) {
    this.webhooks = { constructEvent: constructEventMock }
  }),
}))

import { POST } from './route'

function req(body: string, signature: string | null = 'valid-sig') {
  const headers: Record<string, string> = {}
  if (signature) headers['stripe-signature'] = signature
  return new Request('https://lessonscriptor.com/api/webhook/stripe', {
    method: 'POST',
    headers,
    body,
  }) as unknown as Parameters<typeof POST>[0]
}

function checkoutSessionCompletedEvent(overrides: Record<string, unknown> = {}) {
  return {
    type: 'checkout.session.completed',
    data: {
      object: {
        id: 'cs_test_123',
        payment_link: 'plink_starter',
        customer_details: { email: 'buyer@example.com', name: 'Stephen' },
        client_reference_id: 'en',
        ...overrides,
      },
    },
  }
}

beforeEach(() => {
  sqlMock.mockReset()
  constructEventMock.mockReset()
  sendWelcomeEmailMock.mockReset().mockResolvedValue(undefined)
  process.env.STRIPE_SECRET_KEY = 'sk_test_x'
  process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test'
  process.env.STRIPE_PACK_STARTER_LINK_ID = 'plink_starter'
  process.env.STRIPE_PACK_STUDENT_LINK_ID = 'plink_student'
  process.env.STRIPE_PACK_HEAVY_LINK_ID = 'plink_heavy'
})

describe('POST /api/webhook/stripe', () => {
  it('rejects a request with no stripe-signature header', async () => {
    const res = await POST(req('{}', null))
    expect(res.status).toBe(400)
    expect(constructEventMock).not.toHaveBeenCalled()
  })

  it('rejects a request with an invalid signature', async () => {
    constructEventMock.mockImplementation(() => { throw new Error('bad signature') })
    const res = await POST(req('{}'))
    expect(res.status).toBe(401)
  })

  it('grants credits, generates a license key on first purchase, and emails it', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent())
    sqlMock
      .mockResolvedValueOnce([]) // priorPurchases: none found
      .mockResolvedValueOnce([]) // existing user license_key lookup: none found
      .mockResolvedValueOnce([{ id: 1 }]) // credit_transactions insert succeeds
      .mockResolvedValueOnce([]) // users upsert

    const res = await POST(req('{}'))
    expect(res.status).toBe(200)

    expect(sendWelcomeEmailMock).toHaveBeenCalledTimes(1)
    const arg = sendWelcomeEmailMock.mock.calls[0][0]
    expect(arg.email).toBe('buyer@example.com')
    expect(arg.locale).toBe('en')
    expect(typeof arg.licenseKey).toBe('string')
    expect(arg.licenseKey.length).toBeGreaterThan(0)
  })

  it('grants the Student tier its 54000 seconds, not the Starter or Heavy amount', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent({ payment_link: 'plink_student' }))
    sqlMock
      .mockResolvedValueOnce([]) // priorPurchases: none found
      .mockResolvedValueOnce([]) // existing user license_key lookup: none found
      .mockResolvedValueOnce([{ id: 1 }]) // credit_transactions insert succeeds
      .mockResolvedValueOnce([]) // users upsert

    const res = await POST(req('{}'))
    expect(res.status).toBe(200)

    // sql call order: 0=priorPurchases, 1=existingUser lookup, 2=credit_transactions
    // insert (inside addCredits), 3=users upsert. The credit_transactions insert's raw
    // interpolated values include the seconds argument.
    const insertCallValues = sqlMock.mock.calls[2].flat()
    expect(insertCallValues).toContain(54000)
    expect(insertCallValues).not.toContain(18000)
    expect(insertCallValues).not.toContain(108000)
  })

  it('grants the Heavy tier its 108000 seconds, not the Starter or Student amount', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent({ payment_link: 'plink_heavy' }))
    sqlMock
      .mockResolvedValueOnce([]) // priorPurchases: none found
      .mockResolvedValueOnce([]) // existing user license_key lookup: none found
      .mockResolvedValueOnce([{ id: 1 }]) // credit_transactions insert succeeds
      .mockResolvedValueOnce([]) // users upsert

    const res = await POST(req('{}'))
    expect(res.status).toBe(200)

    const insertCallValues = sqlMock.mock.calls[2].flat()
    expect(insertCallValues).toContain(108000)
    expect(insertCallValues).not.toContain(18000)
    expect(insertCallValues).not.toContain(54000)
  })

  it('does not re-email on a second purchase, but reuses the existing key', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent({ id: 'cs_test_456' }))
    sqlMock
      .mockResolvedValueOnce([{ exists: 1 }]) // priorPurchases: found
      .mockResolvedValueOnce([{ license_key: 'existing-key' }]) // existing user lookup
      .mockResolvedValueOnce([{ id: 2 }]) // credit_transactions insert succeeds
      .mockResolvedValueOnce([]) // users upsert

    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    expect(sendWelcomeEmailMock).not.toHaveBeenCalled()
  })

  it('is idempotent on a duplicate session id', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent())
    sqlMock
      .mockResolvedValueOnce([]) // priorPurchases
      .mockResolvedValueOnce([]) // existing user lookup
      .mockResolvedValueOnce([]) // credit_transactions insert returns nothing: ON CONFLICT DO NOTHING fired

    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    expect(sendWelcomeEmailMock).not.toHaveBeenCalled()
  })

  it('ignores unknown payment_link ids without touching the database', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent({ payment_link: 'plink_unknown' }))
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('ignores event types other than checkout.session.completed', async () => {
    constructEventMock.mockReturnValue({ type: 'payment_intent.succeeded', data: { object: {} } })
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    expect(sqlMock).not.toHaveBeenCalled()
  })

  it('ignores a session with no customer email', async () => {
    constructEventMock.mockReturnValue(checkoutSessionCompletedEvent({ customer_details: null }))
    const res = await POST(req('{}'))
    expect(res.status).toBe(200)
    expect(sqlMock).not.toHaveBeenCalled()
  })
})
