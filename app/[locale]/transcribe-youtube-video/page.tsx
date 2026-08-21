import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const path = '/transcribe-youtube-video'
  const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']
  const t = await getTranslations({ locale, namespace: 'youtube' })
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

export default async function TranscribeYouTubePage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('youtube')
  const base = `/${locale}`

  const schemaHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Transcribe a YouTube Video with LessonScriptor',
    'image': 'https://lessonscriptor.com/og-image.png',
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Install LessonScriptor from the Chrome Web Store',
        'text': 'Install LessonScriptor from the Chrome Web Store (free, one click, no sign-up).',
        'image': 'https://lessonscriptor.com/step-1.png'
      },
      {
        '@type': 'HowToStep',
        'name': 'Open any YouTube video in Chrome',
        'text': 'Go to YouTube, Coursera, Zoom recordings — any page with a video.',
        'image': 'https://lessonscriptor.com/step-2.png'
      },
      {
        '@type': 'HowToStep',
        'name': 'Click the LessonScriptor icon in your Chrome toolbar',
        'text': 'Click the LessonScriptor icon in your Chrome toolbar to open the side panel.',
        'image': 'https://lessonscriptor.com/step-3.png'
      },
      {
        '@type': 'HowToStep',
        'name': 'Hit play on the video',
        'text': 'LessonScriptor opens in the side panel and starts transcribing automatically.',
        'image': 'https://lessonscriptor.com/step-4.png'
      },
      {
        '@type': 'HowToStep',
        'name': 'Edit as you watch',
        'text': 'Edit as you watch: click to add notes, highlight important passages, delete tangents.',
        'image': 'https://lessonscriptor.com/step-5.png'
      },
      {
        '@type': 'HowToStep',
        'name': 'Export to Markdown when done',
        'text': 'Export to Markdown when done — your formatted notes are ready.',
        'image': 'https://lessonscriptor.com/step-6.png'
      }
    ]
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

  const youtubeMethodsData = t.raw('methods.items')
  const useCases = t.raw('useCases.items')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaHowTo) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />

      <div className="w-full">
        {/* Hero */}
        <section className="px-4 py-14 max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {t('h1')}
            </h1>
            <p className="text-xl text-foreground/60 mb-8">
              {t('subtitle')}
            </p>
          </div>

          {/* AIO Answer Box */}
          <div className="bg-muted border-l-4 border-accent p-6 rounded-lg mb-12">
            <p className="text-foreground text-lg leading-relaxed">
              {t('answer')}
            </p>
          </div>
        </section>

        {/* Methods Comparison Table */}
        <section className="px-4 py-14 bg-muted">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-8 text-center">
              {t('methods.title')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-muted border-b-2 border-border">
                    <th className="px-6 py-4 text-left font-bold text-foreground">Method</th>
                    <th className="px-6 py-4 text-left font-bold text-foreground">Pros</th>
                    <th className="px-6 py-4 text-left font-bold text-foreground">Cons</th>
                    <th className="px-6 py-4 text-left font-bold text-foreground">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {youtubeMethodsData.map((row: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-muted'}>
                      <td className="px-6 py-4 font-semibold text-foreground border-b border-border">{row.method}</td>
                      <td className="px-6 py-4 text-foreground/60 border-b border-border">{row.pros}</td>
                      <td className="px-6 py-4 text-foreground/60 border-b border-border">{row.cons}</td>
                      <td className="px-6 py-4 text-foreground/60 border-b border-border font-semibold">{row.verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-4 py-14 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-10 text-center">
            {t('useCases.title')}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {useCases.map((item: any, idx: number) => (
              <div key={idx} className="bg-white border border-border p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-lg font-bold text-foreground mb-2">{item.title}</h3>
                <p className="text-foreground/60 leading-relaxed text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps Section */}
        <section className="px-4 py-14 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-10">
            {t('steps.title')}
          </h2>
          <ol className="space-y-6">
            {t.raw('steps.items').map((step: string, idx: number) => (
              <li key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <p className="text-foreground/60 text-lg leading-relaxed pt-1">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="bg-muted py-14 px-4">
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
