import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const path = '/transcribe-video-to-text'
  const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']
  const t = await getTranslations({ locale, namespace: 'transcribeVideo' })
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

export default async function TranscribeVideoToTextPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('transcribeVideo')

  const schemaHowTo = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': 'How to Transcribe a Video to Text',
    'description': 'Convert any video to text in real-time with AI using LessonScriptor',
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

        {/* Use Cases Grid */}
        <section className="px-4 py-16 bg-cream-100">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-terra-800 mb-10 text-center">
              {t('useCases.title')}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {useCases.map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-3xl mb-3">{item.icon}</div>
                  <h3 className="text-lg font-bold text-terra-800 mb-2">{item.title}</h3>
                  <p className="text-terra-800/60 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-terra-800 mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-terra-800/50 text-lg mb-10">{t('howItWorks.subtitle')}</p>
          <ol className="space-y-8">
            {howItWorksSteps.map((step: any, idx: number) => (
              <li key={idx} className="flex gap-6">
                <span className="flex-shrink-0 w-10 h-10 bg-terra-800 text-white rounded-full flex items-center justify-center font-bold text-lg">
                  {step.n}
                </span>
                <div>
                  <h3 className="text-lg font-bold text-terra-800 mb-1">{step.title}</h3>
                  <p className="text-terra-800/60 leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-cream-100">
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
