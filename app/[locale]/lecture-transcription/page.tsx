import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'
import RelatedPosts from '@/components/RelatedPosts'
import { localizedAlternates, localizedUrl } from '@/lib/seo'

const HREF = '/lecture-transcription'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'lectureTranscription' })
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDesc'),
      url: localizedUrl(HREF, locale),
    },
    alternates: localizedAlternates(HREF, locale),
  }
}

export default async function LectureTranscriptionPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('lectureTranscription')

  const schemaSoftwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'LessonScriptor',
    description: t('metaDesc'),
    applicationCategory: 'EducationalApplication',
    operatingSystem: 'Chrome',
    url: localizedUrl(HREF, locale),
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  }

  const schemaHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t('steps.title'),
    step: t.raw('steps.items').map((step: string, idx: number) => ({
      '@type': 'HowToStep',
      position: idx + 1,
      text: step,
    })),
  }

  const schemaFAQ = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.raw('faq.items').map((item: { q: string; a: string }) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const comparisonRows: string[][] = t.raw('compare.rows')
  const platforms: { title: string; description: string }[] = t.raw('platforms.items')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaHowTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />

      <div className="w-full">
        <section className="px-4 py-14 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">{t('h1')}</h1>
          <p className="text-xl text-foreground/60 mb-8">{t('subtitle')}</p>
          <div className="bg-muted border-l-4 border-accent p-6 rounded-lg mb-4">
            <p className="text-foreground text-lg leading-relaxed">{t('answer')}</p>
          </div>
        </section>

        <section className="px-4 py-14 bg-muted">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4 text-center">{t('compare.title')}</h2>
            <p className="text-foreground/60 text-lg mb-8 text-center">{t('compare.subtitle')}</p>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-card rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-muted border-b-2 border-border">
                    {comparisonRows[0].map((header, idx) => (
                      <th key={idx} className="px-6 py-4 text-left font-bold text-foreground border-r border-border last:border-r-0">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {comparisonRows.slice(1).map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-card' : 'bg-muted'}>
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`px-6 py-4 border-b border-border border-r border-border last:border-r-0 ${
                            cellIdx === 0 ? 'font-semibold text-foreground' : 'text-foreground/60'
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

        <section className="px-4 py-14 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-10">{t('steps.title')}</h2>
          <ol className="space-y-6">
            {t.raw('steps.items').map((step: string, idx: number) => (
              <li key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {idx + 1}
                </span>
                <p className="text-foreground/70 text-lg leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-4 py-14 bg-muted">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-10 text-center">{t('platforms.title')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {platforms.map((item, idx) => (
                <div key={idx} className="bg-card rounded-lg p-6 shadow-sm border border-border">
                  <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-foreground/60 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-14 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-4">{t('recordingRules.title')}</h2>
          <p className="text-foreground/70 text-lg leading-relaxed">{t('recordingRules.body')}</p>
        </section>

        <section className="py-14 px-4">
          <FAQSection title="FAQ" items={t.raw('faq.items')} />
        </section>

        <RelatedPosts
          slugs={['how-to-transcribe-lecture-videos', 'ai-note-taker-for-lectures', 'cornell-notes-template', 'note-taking-methods', 'how-to-focus-online-lectures-adhd', 'zoom-google-meet-transcript-for-students']}
          locale={locale}
          heading={t('relatedHeading')}
          readMore={t('readMore')}
        />

        <CTASection />
      </div>
    </>
  )
}
