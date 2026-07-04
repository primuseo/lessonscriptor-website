import { describe, it, expect } from 'vitest'
import { resolveLocale, buildWelcomeEmail } from '@/lib/welcome-email'

describe('resolveLocale', () => {
  it('keeps a supported locale', () => expect(resolveLocale('fr')).toBe('fr'))
  it('falls back to en for an unsupported string', () => expect(resolveLocale('xx')).toBe('en'))
  it('falls back to en for undefined', () => expect(resolveLocale(undefined)).toBe('en'))
})

describe('buildWelcomeEmail', () => {
  it('uses the customer name when provided', () => {
    const { text } = buildWelcomeEmail('en', 'Stephen')
    expect(text).toContain('Hi Stephen,')
  })
  it('uses the anonymous greeting when name is missing', () => {
    const { text } = buildWelcomeEmail('en', null)
    expect(text).toContain('Hi there,')
  })
  it('returns a localized subject for fr', () => {
    const { subject } = buildWelcomeEmail('fr', 'Marie')
    expect(subject).toContain('Bienvenue')
  })
  it('falls back to the English template for an unknown locale', () => {
    const { subject } = buildWelcomeEmail('xx', 'x')
    expect(subject).toContain('Welcome to LessonScriptor')
  })
  it('escapes HTML-significant characters in the name', () => {
    const { html } = buildWelcomeEmail('en', '<b>x</b>')
    expect(html).not.toContain('<b>x</b>')
    expect(html).toContain('&lt;b&gt;x&lt;/b&gt;')
  })
})
