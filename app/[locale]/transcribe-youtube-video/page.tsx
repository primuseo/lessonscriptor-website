import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const base = `/${locale}`
  return {
    title: 'Transcribe Any YouTube Video in Real-Time | LessonScriptor',
    description: 'Get a live, editable transcript of any YouTube video directly in Chrome — without copying, pasting, or switching tabs. Free mode included.',
    openGraph: {
      title: 'Transcribe Any YouTube Video in Real-Time | LessonScriptor',
      description: 'Get a live, editable transcript of any YouTube video directly in Chrome — without copying, pasting, or switching tabs.',
      url: `https://lessonscriptor.com${base}/transcribe-youtube-video`,
    },
    alternates: {
      canonical: `https://lessonscriptor.com${base}/transcribe-youtube-video`,
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaHowTo) }} />
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

        {/* Methods Comparison Table */}
        <section className="px-4 py-16 bg-cream-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-terra-800 mb-8 text-center">
              {t('methods.title')}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse bg-white rounded-lg shadow-sm">
                <thead>
                  <tr className="bg-cream-100 border-b-2 border-cream-200">
                    <th className="px-6 py-4 text-left font-bold text-terra-800">Method</th>
                    <th className="px-6 py-4 text-left font-bold text-terra-800">Pros</th>
                    <th className="px-6 py-4 text-left font-bold text-terra-800">Cons</th>
                    <th className="px-6 py-4 text-left font-bold text-terra-800">Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {youtubeMethodsData.map((row: any, idx: number) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-cream-100'}>
                      <td className="px-6 py-4 font-semibold text-terra-800 border-b border-cream-200">{row.method}</td>
                      <td className="px-6 py-4 text-terra-800/60 border-b border-cream-200">{row.pros}</td>
                      <td className="px-6 py-4 text-terra-800/60 border-b border-cream-200">{row.cons}</td>
                      <td className="px-6 py-4 text-terra-800/60 border-b border-cream-200 font-semibold">{row.verdict}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-terra-800 mb-10">
            {t('steps.title')}
          </h2>
          <ol className="space-y-6">
            {t.raw('steps.items').map((step: string, idx: number) => (
              <li key={idx} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-terra-800 text-white rounded-full flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <p className="text-terra-800/60 text-lg leading-relaxed pt-1">
                  {step}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="bg-cream-100 py-16 px-4">
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
