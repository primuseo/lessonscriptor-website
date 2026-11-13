import { describe, it, expect } from 'vitest'
import { takeDailySlot } from './daily-cap'

describe('takeDailySlot', () => {
  it('allows the limit, refuses the next one, and resets on the next UTC day', () => {
    const day = Date.UTC(2026, 10, 13, 10)
    for (let i = 0; i < 300; i++) expect(takeDailySlot('a@x.com', day)).toBe(true)
    expect(takeDailySlot('a@x.com', day)).toBe(false)
    expect(takeDailySlot('b@x.com', day)).toBe(true)
    expect(takeDailySlot('a@x.com', Date.UTC(2026, 10, 14, 0, 1))).toBe(true)
  })

  it('honours a custom limit', () => {
    const now = Date.UTC(2026, 10, 15)
    expect(takeDailySlot('c@x.com', now, 1)).toBe(true)
    expect(takeDailySlot('c@x.com', now, 1)).toBe(false)
  })
})
