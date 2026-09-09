import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'
import RelatedPosts from '@/components/RelatedPosts'
import { getPathname } from '@/navigation'

const LOCALES = ['en', 'fr', 'es', 'pt', 'de', 'zh'] as const
const CANONICAL_PATH = '/transcribe-video-to-text'
const BASE = 'https://lessonscriptor.com'

function localizedUrl(locale: string) {
  return `${BASE}/${locale}${getPathname({ locale, href: CANONICAL_PATH })}`
}

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'transcribeVideo' })
  const url = localizedUrl(locale)
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDesc'),
      url,
    },
    alternates: {
      canonical: url,
      languages: {
        'x-default': localizedUrl('en'),
        ...Object.fromEntries(LOCALES.map(l => [l, localizedUrl(l)]))
      }
    }
  }
}

export default async function TranscribeVideoToTextPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('transcribeVideo')
  const pageUrl = localizedUrl(locale)

  const schemaWebPage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': t('metaTitle'),
    'description': t('metaDesc'),
    'url': pageUrl,
    'datePublished': '2024-09-01',
    'dateModified': '2025-05-01',
    'author': {
      '@type': 'Organization',
      'name': 'LessonScriptor',
      'url': 'https://lessonscriptor.com'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'LessonScriptor',
      'url': 'https://lessonscriptor.com'
    }
  }

  const schemaHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': t('howItWorks.title'),
    'description': t('subtitle'),
    'image': 'https://lessonscriptor.com/og-image.png',
    'step': t.raw('howItWorks.steps').map((step: any) => ({
      '@type': 'HowToStep',
      'name': step.title,
      'text': step.desc
    }))
  }

  const schemaFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': t.raw('faq.items').map((item: any) => ({
      '@type': 'Question',
      'name': item.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': item.a
      }
    }))
  }

  const useCases = t.raw('useCases.items')
  const howItWorksSteps = t.raw('howItWorks.steps')
  const whyRealtimeItems = t.raw('whyRealtime.items')
  const comparisonRows = t.raw('comparison.rows')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaWebPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaHowTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />

      <article aria-label={t('h1')} className="w-full">
        {/* Hero */}
        <section aria-label={t('heroAriaLabel')} className="px-4 py-14 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('h1')}
            </h1>
            <p className="text-xl text-foreground/60 mb-8">
              {t('subtitle')}
            </p>
          </div>

          {/* AIO Answer Box */}
          <div className="bg-muted border-l-4 border-accent p-6 rounded-lg mb-12" role="note" aria-label={t('answerAriaLabel')}>
            <p className="text-foreground text-lg leading-relaxed">
              {t('answer')}
            </p>
          </div>
        </section>

        {/* Use Cases Grid */}
        <section aria-label={t('useCases.title')} className="px-4 py-14 bg-muted">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-10 text-center">
              {t('useCases.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((item: any, idx: number) => (
                <div key={idx} className="bg-card p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3" aria-hidden="true">{item.icon}</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-foreground/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section aria-label={t('howItWorks.title')} className="px-4 py-14 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-foreground/50 text-lg mb-10">{t('howItWorks.subtitle')}</p>
          <ol className="space-y-8" aria-label={t('howItWorks.title')}>
            {howItWorksSteps.map((step: any, idx: number) => (
              <li key={idx} className="flex gap-6">
                <span className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg" aria-hidden="true">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">{step.title}</h3>
                  <p className="text-foreground/60 leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Why real-time */}
        <section aria-label={t('whyRealtime.title')} className="px-4 py-14 bg-muted">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">{t('whyRealtime.title')}</h2>
            <p className="text-foreground/60 text-lg mb-10">{t('whyRealtime.intro')}</p>
            <ul className="space-y-6" aria-label={t('whyRealtime.title')}>
              {whyRealtimeItems.map((item: any, idx: number) => (
                <li key={idx} className="flex gap-4">
                  <span className="flex-shrink-0 text-accent font-bold text-xl mt-0.5" aria-hidden="true">✓</span>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{item.title}</h3>
                    <p className="text-foreground/60 leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Comparison table */}
        <section aria-label={t('comparison.title')} className="px-4 py-14 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">{t('comparison.title')}</h2>
          <p className="text-foreground/60 text-lg mb-8">{t('comparison.intro')}</p>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm" aria-label={t('comparison.title')}>
              <thead className="bg-primary text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">{t('comparison.colTool')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('comparison.colMethod')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('comparison.colFree')}</th>
                  <th className="px-4 py-3 text-left font-semibold">{t('comparison.colRealtime')}</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row: any, idx: number) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-card' : 'bg-background'}>
                    <td className="px-4 py-3 font-semibold text-foreground">{row.tool}</td>
                    <td className="px-4 py-3 text-foreground/70">{row.method}</td>
                    <td className="px-4 py-3 text-foreground/70">{row.free}</td>
                    <td className="px-4 py-3 text-foreground/70">{row.realtime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-foreground/50 text-sm mt-4">{t('comparison.note')}</p>
        </section>

        {/* FAQ */}
        <section aria-label="FAQ" className="py-14 px-4 bg-muted">
          <FAQSection
            title={t('faq') as any}
            items={t.raw('faq.items')}
          />
        </section>

        {/* Related Posts */}
        <RelatedPosts
          slugs={['transcribe-youtube-video-to-text', 'how-to-download-youtube-transcript', 'how-to-transcribe-lecture-videos']}
          locale={locale}
          heading={t('relatedHeading')}
          readMore={t('readMore')}
        />

        {/* CTA */}
        <CTASection />
      </article>
    </>
  )
}
