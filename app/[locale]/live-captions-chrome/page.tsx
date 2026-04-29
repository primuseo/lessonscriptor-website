import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'
import RelatedPosts from '@/components/RelatedPosts'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const path = '/live-captions-chrome'
  const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']
  const t = await getTranslations({ locale, namespace: 'liveCaptions' })
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDesc'),
      url: `https://lessonscriptor.com/${locale}${path}`,
    },
    alternates: {
      canonical: `https://lessonscriptor.com/${locale}${path}`,
      languages: {
        'x-default': `https://lessonscriptor.com/en${path}`,
        ...Object.fromEntries(locales.map(l => [l, `https://lessonscriptor.com/${l}${path}`]))
      }
    }
  }
}

export default async function LiveCaptionsChromeP({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('liveCaptions')
  const base = `/${locale}`

  const schemaSoftwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'LessonScriptor',
    'description': 'Live AI captions for any video in Chrome — editable, exportable, multilingual',
    'applicationCategory': 'UtilityApplication',
    'operatingSystem': 'Chrome',
    'url': 'https://lessonscriptor.com',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'EUR'
    }
  }

  const schemaHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to add live captions in Chrome',
    'image': 'https://lessonscriptor.com/og-image.png',
    'step': t.raw('steps.items').map((step: string, idx: number) => ({
      '@type': 'HowToStep',
      'position': idx + 1,
      'text': step
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

  const comparisonRows = t.raw('vsChrome.rows')
  const useCases = t.raw('useCases.items')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaHowTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />

      <div className="w-full">
        {/* Hero */}
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-terra-800 mb-4">
            {t('h1')}
          </h1>
          <p className="text-xl text-terra-800/60 mb-8">
            {t('subtitle')}
          </p>

          {/* AIO Answer Box */}
          <div className="bg-cream-100 border-l-4 border-accent-500 p-6 rounded-lg mb-4">
            <p className="text-terra-800 text-lg leading-relaxed">
              {t('answer')}
            </p>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="px-4 py-16 bg-cream-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-terra-800 mb-8 text-center">
              {t('vsChrome.title')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-cream-100 border-b-2 border-cream-200">
                    {comparisonRows[0].map((header: string, idx: number) => (
                      <th key={idx} className="px-6 py-4 text-left font-bold text-terra-800 border-r border-cream-200 last:border-r-0">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.slice(1).map((row: string[], rowIdx: number) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-cream-100'}>
                      {row.map((cell: string, cellIdx: number) => (
                        <td
                          key={cellIdx}
                          className={`px-6 py-4 border-b border-cream-200 border-r border-cream-200 last:border-r-0 ${
                            cellIdx === 0 ? 'font-semibold text-terra-800' : 'text-terra-800/60'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Step-by-step how-to */}
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-terra-800 mb-10">
            {t('steps.title')}
          </h2>
          <ol className="space-y-6">
            {t.raw('steps.items').map((step: string, idx: number) => (
              <li key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-terra-800 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
                <p className="text-terra-800/70 text-lg leading-relaxed pt-1">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* Use cases */}
        <section className="px-4 py-16 bg-cream-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-terra-800 mb-10 text-center">
              {t('useCases.title')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {useCases.map((item: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-6 shadow-sm border border-cream-200">
                  <h3 className="text-lg font-bold text-terra-800 mb-2">{item.title}</h3>
                  <p className="text-terra-800/60 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4">
          <FAQSection
            title={t('faq') as any}
            items={t.raw('faq.items')}
          />
        </section>

        {/* Related Posts */}
        <RelatedPosts
          slugs={['chrome-live-captions-vs-lessonscriptor', 'chrome-live-captions-headphones', 'live-captions-other-languages-chrome', 'live-captions-zoom-recordings-chrome', 'chrome-live-captions-not-working', 'best-chrome-extensions-live-captions']}
          locale={locale}
          heading={t('relatedHeading')}
          readMore={t('readMore')}
        />

        {/* CTA */}
        <CTASection />
      </div>
    </>
  )
}
