import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

type Release = {
  version: string
  date: string
  headline: string
  bullets: string[]
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const path = '/whats-new'
  const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']
  const t = await getTranslations({ locale, namespace: 'whatsNew' })
  return {
    title: t('h1'),
    description: t('subtitle'),
    alternates: {
      canonical: `https://lessonscriptor.com/${locale}${path}`,
      languages: {
        'x-default': `https://lessonscriptor.com/en${path}`,
        ...Object.fromEntries(locales.map(l => [l, `https://lessonscriptor.com/${l}${path}`]))
      }
    }
  }
}

export async function generateStaticParams() {
  return ['en', 'fr', 'es', 'pt', 'de', 'zh'].map(locale => ({ locale }))
}

export default async function WhatsNewPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('whatsNew')
  const releases = t.raw('releases') as Release[]

  return (
    <article className="max-w-3xl mx-auto px-4 py-14">
      <header className="mb-12 text-center">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
          {t('h1')}
        </h1>
        <p className="text-foreground/60 text-lg max-w-xl mx-auto leading-relaxed">
          {t('subtitle')}
        </p>
      </header>

      <div className="space-y-6">
        {releases.map((release) => (
          <section key={release.version} className="card">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              <span className="badge">v{release.version}</span>
              <span className="text-foreground/50 text-sm">{release.date}</span>
            </div>
            <h2 className="font-serif text-xl md:text-2xl font-semibold text-foreground mb-3">
              {release.headline}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-light-txt leading-relaxed">
              {release.bullets.map((bullet, i) => (
                <li key={i}>{bullet}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-border text-sm text-foreground/60 italic text-center">
        <p>{t('earlierNote')}</p>
      </div>
    </article>
  )
}
