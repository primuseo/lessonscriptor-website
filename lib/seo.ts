import { getPathname } from '@/navigation'
import { getLocalizedSlug } from '@/content/blog/_slug-map'

export const SITE_URL = 'https://lessonscriptor.com'
export const LOCALES = ['en', 'fr', 'es', 'pt', 'de', 'zh'] as const

type Href = Parameters<typeof getPathname>[0]['href']

// getPathname already returns the locale-prefixed, localized path
// (e.g. /fr/sous-titres-en-direct-chrome), so never prepend the locale again.
export function localizedUrl(href: Href, locale: string) {
  return `${SITE_URL}${getPathname({ locale: locale as (typeof LOCALES)[number], href })}`
}

export function localizedAlternates(href: Href, locale: string) {
  return {
    canonical: localizedUrl(href, locale),
    languages: {
      'x-default': localizedUrl(href, 'en'),
      ...Object.fromEntries(LOCALES.map((l) => [l, localizedUrl(href, l)])),
    },
  }
}

// Blog JSON links use English canonical paths (/blog/<slug>, /live-captions-chrome).
// Resolve them to the reader's locale so a French post never links to /en/ pages.
export function localizeHref(url: string | undefined, locale: string): string | undefined {
  if (typeof url !== 'string' || !url.startsWith('/') || url.startsWith('//')) return url
  const [pathOnly, hash = ''] = url.split('#')
  const suffix = hash ? `#${hash}` : ''
  const parts = pathOnly.split('/').filter(Boolean)
  if (parts.length && (LOCALES as readonly string[]).includes(parts[0])) parts.shift()
  const path = '/' + parts.join('/')
  if (parts[0] === 'images' || parts[0] === 'downloads') return url
  if (parts[0] === 'blog' && parts[1]) {
    return `/${locale}/blog/${getLocalizedSlug(parts[1], locale)}${suffix}`
  }
  try {
    return getPathname({ locale: locale as (typeof LOCALES)[number], href: path as Href }) + suffix
  } catch {
    return `/${locale}${path === '/' ? '' : path}${suffix}`
  }
}
