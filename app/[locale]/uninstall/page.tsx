import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import UninstallForm from '@/components/UninstallForm'

const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'uninstall' })
  const path = '/uninstall'
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    robots: { index: false, follow: false },
    alternates: {
      canonical: `https://lessonscriptor.com/${locale}${path}`,
      languages: {
        'x-default': `https://lessonscriptor.com/en${path}`,
        ...Object.fromEntries(locales.map(l => [l, `https://lessonscriptor.com/${l}${path}`]))
      }
    }
  }
}

export function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

export default function UninstallPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-xl mx-auto px-6 py-20">
        <Suspense fallback={null}>
          <UninstallForm />
        </Suspense>
      </div>
    </div>
  )
}
