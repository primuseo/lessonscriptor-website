import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const base = `/${locale}`
  return {
    title: 'Transcribe Video to Text Free — Live in Chrome | LessonScriptor',
    description: 'Convert any video to text in real-time with AI. No upload, no waiting, no subscription. Works directly in Chrome on any video platform.',
    openGraph: {
      title: 'Transcribe Video to Text Free — Live in Chrome | LessonScriptor',
      description: 'Convert any video to text in real-time with AI. No upload, no waiting, no subscription.',
      url: `https://lessonscriptor.com${base}/transcribe-video-to-text`,
    },
    alternates: {
      canonical: `https://lessonscriptor.com${base}/transcribe-video-to-text`,
    }
  }
}

export default async function TranscribeVideoToTextPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('transcribeVideo')
  const tHome = await getTranslations('home')
  const base = `/${locale}`

  const schemaHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Transcribe a Video to Text',
    'description': 'Convert any video to text in real-time with AI using LessonScriptor',
    'image': 'https://lessonscriptor.com/og-image.png',
    'step': [
      {
        '@type': 'HowToStep',
        'name': 'Install LessonScriptor',
        'text': 'Install LessonScriptor from the Chrome Web Store'
      },
      {
        '@type': 'HowToStep',
        'name': 'Open any video',
        'text': 'Open any video in Chrome'
      },
      {
        '@type': 'HowToStep',
        'name': 'Hit play',
        'text': 'Hit play and transcription starts automatically'
      },
      {
        '@type': 'HowToStep',
        'name': 'Export',
        'text': 'Export the transcript when done'
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

  const features = tHome.raw('features.items')

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

        {/* Features Grid */}
        <section className="px-4 py-16 bg-cream-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-terra-800 mb-12 text-center">
              {tHome('features.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature: any, idx: number) => (
                <div key={idx} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-terra-800 mb-2">{feature.title}</h3>
                  <p className="text-terra-800/60 leading-relaxed">{feature.desc}</p>
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

        {/* CTA */}
        <CTASection />
      </div>
    </>
  )
}
