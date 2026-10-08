import { MetadataRoute } from 'next'
import { BLOCKED_BOTS } from '@/lib/blocked-bots'

// Default is OPEN. Organic search is this site's main traffic channel and the
// site is optimised for AI-answer citations, so every normal crawler (search
// engines, AI crawlers, link-preview bots, SEO-audit tools) is welcome.
//
// We only keep out:
//  - /api/, which no crawler has any use for, and
//  - the high-volume scrapers listed in lib/blocked-bots.ts.
//
// Do NOT switch '*' to `disallow: '/'` with an allowlist: that silently blocks
// Applebot (needed for Applebot-Extended to work), DuckDuckBot, Yandex, Baidu,
// social preview bots (Twitter/LinkedIn/Slack/Discord) and any crawler that
// does not exist yet. lib/robots.test.ts guards this.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: BLOCKED_BOTS,
        disallow: '/',
      },
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/'],
      },
    ],
    sitemap: 'https://lessonscriptor.com/sitemap.xml',
  }
}
