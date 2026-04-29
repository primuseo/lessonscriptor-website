import { MetadataRoute } from 'next'
import { BLOG_SLUGS } from '@/content/blog/_registry'
import { getLocalizedSlug } from '@/content/blog/_slug-map'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://lessonscriptor.com'
  const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']
  const staticPages = [
    '/',
    '/transcribe-youtube-video',
    '/live-captions-chrome',
    '/transcribe-video-to-text',
    '/compare/otter-ai-alternative',
    '/blog',
    '/contact',
    '/privacy',
    '/terms',
  ]

  const adhdSlugs: Record<string, string> = {
    en: 'for-adhd-students',
    fr: 'etudiants-tdah',
    es: 'estudiantes-tdah',
    pt: 'estudantes-tdah',
    de: 'adhs-studenten',
    zh: 'for-adhd-students',
  }

  const sitemap: MetadataRoute.Sitemap = []
  const today = new Date().toISOString().split('T')[0]

  function getPriority(page: string, locale: string): number {
    let base: number
    if (page === '/') base = 1.0
    else if (page.includes('youtube') || page.includes('captions') || page.includes('transcribe-video') || page.includes('otter') || page.includes('adhd')) base = 0.9
    else if (page.includes('blog')) base = 0.8
    else base = 0.7
    return locale === 'en' ? base : base - 0.1
  }

  locales.forEach((locale) => {
    const prefix = `/${locale}`

    staticPages.forEach((page) => {
      sitemap.push({
        url: `${baseUrl}${prefix}${page === '/' ? '' : page}`,
        lastModified: today,
        changeFrequency: page === '/' ? 'weekly' : 'monthly',
        priority: getPriority(page, locale),
      })
    })

    sitemap.push({
      url: `${baseUrl}${prefix}/${adhdSlugs[locale]}`,
      lastModified: today,
      changeFrequency: 'monthly',
      priority: locale === 'en' ? 0.9 : 0.8,
    })

    BLOG_SLUGS.forEach((slug) => {
      const localSlug = getLocalizedSlug(slug, locale)
      sitemap.push({
        url: `${baseUrl}${prefix}/blog/${localSlug}`,
        lastModified: today,
        changeFrequency: 'monthly',
        priority: locale === 'en' ? 0.8 : 0.7,
      })
    })
  })

  return sitemap
}
