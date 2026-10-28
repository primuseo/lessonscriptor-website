import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './navigation'
import { SLUG_MAP } from './content/blog/_slug-map'

const intlMiddleware = createMiddleware(routing)
const LOCALES = routing.locales as readonly string[]

// Content paths whose unprefixed form carries English slugs. These get a
// permanent redirect to /en so Google consolidates onto it; next-intl's own
// redirect is a 307 that keeps the unprefixed URL indexed. Utility pages
// (onboarding, thank-you, ...) and the root keep next-intl's Accept-Language
// detection.
const ENGLISH_CONTENT_ROOTS = new Set([
  'blog',
  'transcribe-video-to-text',
  'live-captions-chrome',
  'transcribe-youtube-video',
  'compare',
  'for-adhd-students',
  'for-teachers',
  'lecture-transcription',
])

function permanent(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone()
  url.pathname = pathname
  return NextResponse.redirect(url, 308)
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const parts = pathname.split('/').filter(Boolean)
  const first = parts[0]

  if (first && !LOCALES.includes(first) && ENGLISH_CONTENT_ROOTS.has(first)) {
    return permanent(request, `/en${pathname}`)
  }

  // /fr/blog/<english-slug> rendered the post through a fallback; send it to
  // the localized slug its canonical already names.
  if (first && first !== 'en' && LOCALES.includes(first) && parts[1] === 'blog' && parts[2] && parts.length === 3) {
    const localized = SLUG_MAP[parts[2]]?.[first]
    if (localized && localized !== parts[2]) {
      return permanent(request, `/${first}/blog/${localized}`)
    }
  }

  const response = intlMiddleware(request)

  // next-intl maps /fr/live-captions-chrome to /fr/sous-titres-en-direct-chrome
  // with a 307. That mapping is permanent, so say so.
  if (response.status === 307 && first && LOCALES.includes(first) && parts.length > 1) {
    if (response.headers.get('location')) {
      return new NextResponse(null, { status: 308, headers: response.headers })
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
