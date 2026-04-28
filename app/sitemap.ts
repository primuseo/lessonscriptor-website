import { MetadataRoute } from 'next'
import { BLOG_SLUGS } from '@/content/blog/_registry'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lessonscriptor.com'
  const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']
  const pages = [
    '/',
    '/transcribe-youtube-video',
    '/live-captions-chrome',
    '/transcribe-video-to-text',
    '/compare/otter-ai-alternative',
    '/blog',
    ...BLOG_SLUGS.map((slug) => `/blog/${slug}`),
    '/contact',
    '/privacy',
    '/terms',
  ]

  const sitemap: MetadataRoute.Sitemap = []

  locales.forEach((locale) => {
    pages.forEach((page) => {
      // Determine base priority based on page type
      let basePriority: number
      if (page === '/') {
        basePriority = 1.0
      } else if (
        page.includes('youtube') ||
        page.includes('captions') ||
        page.includes('transcribe-video') ||
        page.includes('otter')
      ) {
        basePriority = 0.9
      } else if (page.includes('blog')) {
        basePriority = 0.8
      } else {
        basePriority = 0.7
      }

      // Reduce priority for non-English locales
      const priority = locale === 'en' ? basePriority : basePriority - 0.1

      // Build the URL
      let url = baseUrl
      if (locale !== 'en') {
        url += `/${locale}`
      }
      if (page !== '/') {
        url += page
      }

      sitemap.push({
        url,
        lastModified: new Date().toISOString().split('T')[0],
        changeFrequency: page === '/' ? 'weekly' : 'monthly',
        priority,
      })
    })
  })

  return sitemap
}
