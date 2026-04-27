import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const base = locale === 'en' ? '' : `/${locale}`
  return {
    title: 'Live Captions for Any Video in Chrome | LessonScriptor',
    description: 'Add real-time, editable captions to any video you watch in Chrome. Free, private, and works on every platform — not just YouTube.',
    openGraph: {
      title: 'Live Captions for Any Video in Chrome | LessonScriptor',
      description: 'Add real-time, editable captions to any video you watch in Chrome. Free and works on all platforms.',
      url: `https://lessonscriptor.com${base}/live-captions-chrome`,
    },
    alternates: {
      canonical: `https://lessonscriptor.com${base}/live-captions-chrome`,
    }
  }
}

export default async function LiveCaptionsChromeP

({

 params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('liveCaptions')
  const base = locale === 'en' ? '' : `/${locale}`

  const schemaSoftwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'LessonScriptor',
    'description': 'Live AI captions for any video in Chrome',
    'applicationCategory': 'UtilityApplication',
    'operatingSystem': 'Chrome',
    'url': 'https://lessonscriptor.com',
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'EUR'
    }
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />

      <div className="w-full">
        {/* Hero */}
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-terra-800 mb-4">
              {t('h1')}
            </h1>
            <p className="text-xl text-terra-800/60 mb-8">
              {t('subtitle')}
            </p>
          </div>

          {/* AIO Answer Box */}
          <div className="bg-cream-100 border-l-4 border-accent-500 p-6 rounded-lg mb-12">
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
                          } ${cellIdx === row.length - 1 && cell === 'Yes — click anywhere to edit' ? 'bg-accent-500/10' : ''}`}
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

        {/* FAQ */}
        <section className="py-16 px-4">
          <FAQSection
            title={t('faq') as any}
            items={t.raw('faq.items')}
          />
        </section>

        {/* CTA */}
        <CTASection />
      </div>
    </>
  )
}
