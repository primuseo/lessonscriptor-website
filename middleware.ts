import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
  locales: ['en', 'fr', 'es', 'pt', 'de', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // English at /, others at /fr/, /es/, etc.
})

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
}
