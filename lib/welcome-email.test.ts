import { describe, it, expect, beforeEach } from 'vitest'
import { resolveLocale, buildWelcomeEmail, buildUnsubscribeUrl } from '@/lib/welcome-email'

beforeEach(() => {
  process.env.UNSUBSCRIBE_SECRET = 'test-secret'
})

describe('resolveLocale', () => {
  it('keeps a supported locale', () => expect(resolveLocale('fr')).toBe('fr'))
  it('falls back to en for an unsupported string', () => expect(resolveLocale('xx')).toBe('en'))
  it('falls back to en for undefined', () => expect(resolveLocale(undefined)).toBe('en'))
})

describe('buildWelcomeEmail', () => {
  it('uses the customer name when provided', () => {
    const { text } = buildWelcomeEmail('en', 'Stephen', 'stephen@example.com')
    expect(text).toContain('Hi Stephen,')
  })
  it('uses the anonymous greeting when name is missing', () => {
    const { text } = buildWelcomeEmail('en', null, 'buyer@example.com')
    expect(text).toContain('Hi there,')
  })
  it('returns a localized subject for fr', () => {
    const { subject } = buildWelcomeEmail('fr', 'Marie', 'marie@example.com')
    expect(subject).toContain('Bienvenue')
  })
  it('falls back to the English template for an unknown locale', () => {
    const { subject } = buildWelcomeEmail('xx', 'x', 'x@example.com')
    expect(subject).toContain('Welcome to LessonScriptor')
  })
  it('escapes HTML-significant characters in the name', () => {
    const { html } = buildWelcomeEmail('en', '<b>x</b>', 'buyer@example.com')
    expect(html).not.toContain('<b>x</b>')
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;')
  })
  it('includes a working unsubscribe link in both html and text', () => {
    const { html, text } = buildWelcomeEmail('en', 'Stephen', 'buyer@example.com')
    const url = buildUnsubscribeUrl('buyer@example.com', 'en')
    expect(text).toContain(url)
    expect(html).toContain(`href="${url.replace(/&/g, '&amp;')}"`)
  })
})

describe('buildUnsubscribeUrl', () => {
  it('produces a stable, verifiable link for the same email', () => {
    const url = buildUnsubscribeUrl('buyer@example.com', 'fr')
    expect(url).toMatch(/^https:\/\/lessonscriptor\.com\/api\/unsubscribe\?/)
    expect(url).toContain('email=buyer%40example.com')
    expect(url).toContain('locale=fr')
  })
})

describe('buildWelcomeEmail with a license key', () => {
  it('includes the license key in both text and html when provided', () => {
    const { text, html } = buildWelcomeEmail('en', 'Stephen', 'buyer@example.com', 'abc-123-key')
    expect(text).toContain('abc-123-key')
    expect(html).toContain('abc-123-key')
  })

  it('omits any key content when licenseKey is null', () => {
    const { text } = buildWelcomeEmail('en', 'Stephen', 'buyer@example.com', null)
    expect(text).not.toMatch(/license key/i)
  })

  it('omits any key content when licenseKey is not passed at all', () => {
    const { text } = buildWelcomeEmail('en', 'Stephen', 'buyer@example.com')
    expect(text).not.toMatch(/license key/i)
  })

  it('localizes the key line for fr', () => {
    const { text } = buildWelcomeEmail('fr', 'Marie', 'marie@example.com', 'xyz-789')
    expect(text).toContain('Votre clé de licence')
    expect(text).toContain('xyz-789')
  })
})
