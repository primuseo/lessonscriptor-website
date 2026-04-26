import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import '../globals.css'

const locales = ['en', 'fr', 'es', 'pt', 'de']

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const messages = await getMessages()
  const site = (messages as any).site
  return {
    metadataBase: new URL('https://lessonscriptor.com'),
    title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
    description: site.description,
    openGraph: {
      type: 'website',
      locale: locale,
      url: 'https://lessonscriptor.com',
      siteName: site.name,
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${site.name} — ${site.tagline}`,
      description: site.description,
    },
    // Google Search Console verification — replace with your actual token
    verification: {
      google: 'REPLACE_WITH_GSC_VERIFICATION_TOKEN',
    },
    robots: { index: true, follow: true },
    alternates: {
      canonical: 'https://lessonscriptor.com',
      languages: {
        'en': 'https://lessonscriptor.com',
        'fr': 'https://lessonscriptor.com/fr',
        'es': 'https://lessonscriptor.com/es',
        'pt': 'https://lessonscriptor.com/pt',
        'de': 'https://lessonscriptor.com/de',
      }
    }
  }
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale)) notFound()
  const messages = await getMessages()

  return (
    <html lang={locale}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <Navbar locale={locale} />
          <main>{children}</main>
          <Footer locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
