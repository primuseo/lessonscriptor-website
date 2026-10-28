import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './navigation'

const intlMiddleware = createMiddleware(routing)

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const first = pathname.split('/')[1]

  // Unprefixed deep links (/blog/x) permanently resolve to English, whose
  // slugs they carry. A 308 lets Google consolidate onto /en/...; next-intl's
  // own redirect is a 307 that keeps the unprefixed URL indexed. The root
  // stays with next-intl so Accept-Language detection still works there.
  if (pathname !== '/' && !(routing.locales as readonly string[]).includes(first)) {
    const url = request.nextUrl.clone()
    url.pathname = `/en${pathname}`
    return NextResponse.redirect(url, 308)
  }

  return intlMiddleware(request)
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
