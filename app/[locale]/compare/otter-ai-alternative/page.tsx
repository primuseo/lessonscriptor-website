import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const base = locale === 'en' ? '' : `/${locale}`
  return {
    title: 'Best Otter.ai Alternative for Students | LessonScriptor',
    description: 'Looking for an Otter.ai alternative that works in your browser, doesn\'t require a subscription, and is free for everyday use? That\'s LessonScriptor.',
    openGraph: {
      title: 'Best Otter.ai Alternative for Students | LessonScriptor',
      description: 'Free Otter.ai alternative for students. Works in Chrome on any video, no subscription required.',
      url: `https://lessonscriptor.com${base}/compare/otter-ai-alternative`,
    },
    alternates: {
      canonical: `https://lessonscriptor.com${base}/compare/otter-ai-alternative`,
    }
  }
}

export default async function OtterAiAlternativePage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('otterAlt')
  const base = locale === 'en' ? '' : `/${locale}`

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

  const comparisonRows = t.raw('comparison.rows')
  const headerRow = comparisonRows[0]
  const dataRows = comparisonRows.slice(1)

  return (
    <>
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

        {/* Comparison Table */}
        <section className="px-4 py-16 bg-cream-100">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-terra-800 mb-8 text-center">
              {t('comparison.title')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-cream-100 border-b-2 border-cream-200">
                    {headerRow.map((header: string, idx: number) => (
                      <th
                        key={idx}
                        className={`px-6 py-4 text-left font-bold text-terra-800 border-r border-cream-200 last:border-r-0 ${
                          idx === 0 ? 'min-w-[200px]' : ''
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dataRows.map((row: string[], rowIdx: number) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-cream-100'}>
                      {row.map((cell: string, cellIdx: number) => {
                        const isLessonscriptorWin = cellIdx === 3 && (
                          cell === 'Yes — click anywhere to edit' ||
                          cell === 'Unlimited free mode' ||
                          cell === 'No — pay as you go' ||
                          cell === 'Yes — any video in Chrome' ||
                          cell === 'Full editor — highlight, bold, headers' ||
                          cell === 'Markdown, clipboard' ||
                          cell === 'Yes — any video' ||
                          cell === '~€12 total' ||
                          cell === 'Local (free) or xAI API (premium)'
                        )

                        return (
                          <td
                            key={cellIdx}
                            className={`px-6 py-4 border-b border-cream-200 border-r border-cream-200 last:border-r-0 ${
                              cellIdx === 0 ? 'font-semibold text-terra-800' : 'text-terra-800/60'
                            } ${
                              isLessonscriptorWin ? 'bg-accent-500/10 font-semibold text-accent-500' : ''
                            }`}
                          >
                            {cell}
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-terra-800/60 mt-4 text-center">
              <span className="inline-block bg-accent-500/10 px-3 py-1 rounded text-accent-500 font-semibold">
                Green
              </span>
              {' '}= LessonScriptor advantage
            </p>
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
