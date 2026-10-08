import { describe, it, expect } from 'vitest'
import robots from '@/app/robots'
import { BLOCKED_BOTS } from '@/lib/blocked-bots'

type Rule = { userAgent?: string | string[]; allow?: string | string[]; disallow?: string | string[] }

const asList = (v?: string | string[]) => (v === undefined ? [] : Array.isArray(v) ? v : [v])

// Mirrors how a crawler reads robots.txt: use the group that names it, else '*'.
function groupFor(agent: string): Rule {
  const rules = (Array.isArray(robots().rules) ? robots().rules : [robots().rules]) as Rule[]
  const named = rules.find((r) => asList(r.userAgent).some((u) => u.toLowerCase() === agent.toLowerCase()))
  const fallback = rules.find((r) => asList(r.userAgent).includes('*'))
  return (named ?? fallback) as Rule
}

describe('robots.txt', () => {
  it('keeps the default open: "*" never disallows the whole site', () => {
    const star = groupFor('SomeBotThatDoesNotExistYet')
    expect(asList(star.disallow)).not.toContain('/')
    expect(asList(star.allow)).toContain('/')
  })

  it.each([
    'Googlebot',
    'Bingbot',
    'Applebot',
    'Applebot-Extended',
    'DuckDuckBot',
    'YandexBot',
    'Baiduspider',
    'Twitterbot',
    'LinkedInBot',
    'Slackbot',
    'Discordbot',
    'GPTBot',
    'ClaudeBot',
    'PerplexityBot',
    'AhrefsBot',
    'SemrushBot',
  ])('does not block %s from the site', (bot) => {
    expect(asList(groupFor(bot).disallow)).not.toContain('/')
  })

  it('blocks the listed scrapers from the whole site', () => {
    for (const bot of BLOCKED_BOTS) {
      expect(asList(groupFor(bot).disallow)).toContain('/')
    }
  })

  it('keeps crawlers out of /api/ only', () => {
    expect(asList(groupFor('Googlebot').disallow)).toEqual(['/api/'])
  })

  it('points to the sitemap', () => {
    expect(robots().sitemap).toBe('https://lessonscriptor.com/sitemap.xml')
  })
})
