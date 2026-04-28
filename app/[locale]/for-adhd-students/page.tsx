import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const path = '/for-adhd-students'
  const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']
  return {
    title: 'LessonScriptor for ADHD Students — Stop Splitting Attention Between Listening and Writing',
    description: 'LessonScriptor is the ADHD-friendly Chrome extension that auto-transcribes your lectures, freeing working memory for actual learning. No writing. No missed points.',
    openGraph: {
      title: 'LessonScriptor for ADHD Students — Stop Splitting Attention Between Listening and Writing',
      description: 'Auto-transcription for lectures, YouTube, and Coursera. Built for students with ADHD who struggle to listen and write at the same time.',
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

export default async function ForAdhdStudentsPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('adhdStudents')

  const schemaSoftwareApp = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    'name': 'LessonScriptor',
    'description': 'ADHD-friendly Chrome extension that auto-transcribes lectures, YouTube videos, and online courses — freeing working memory for actual learning.',
    'applicationCategory': 'EducationalApplication',
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

  const problemCards = t.raw('problems.items')
  const featureCards = t.raw('features.items')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaSoftwareApp) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFAQ) }} />

      <div className="w-full">

        {/* Hero */}
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <p className="eyebrow">{t('hero.eyebrow')}</p>
          <h1 className="text-4xl md:text-5xl font-bold text-terra-800 mb-4">
            {t('hero.h1')}
          </h1>
          <p className="text-xl text-terra-800/60 mb-8">
            {t('hero.subtitle')}
          </p>

          {/* AIO Answer Box */}
          <div className="bg-cream-100 border-l-4 border-accent-500 p-6 rounded-lg mb-8">
            <p className="text-terra-800 text-lg leading-relaxed">
              {t('hero.answer')}
            </p>
          </div>

          <a
            href="https://chrome.google.com/webstore"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
            </svg>
            {t('hero.cta')}
          </a>
        </section>

        {/* Problem section */}
        <section className="px-4 py-16 bg-cream-100">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-terra-800 mb-4 text-center">
              {t('problems.title')}
            </h2>
            <p className="text-terra-800/60 text-lg text-center mb-10 max-w-2xl mx-auto">
              {t('problems.subtitle')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {problemCards.map((card: any, idx: number) => (
                <div key={idx} className="bg-white rounded-lg p-6 shadow-sm border border-cream-200">
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <h3 className="text-lg font-bold text-terra-800 mb-2">{card.title}</h3>
                  <p className="text-terra-800/60 leading-relaxed text-sm">{card.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Lessonscriptor helps */}
        <section className="px-4 py-16 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-terra-800 mb-4 text-center">
            {t('features.title')}
          </h2>
          <p className="text-terra-800/60 text-lg text-center mb-10 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureCards.map((card: any, idx: number) => (
              <div key={idx} className="rounded-lg p-6 border border-cream-200 bg-white shadow-sm">
                <div className="text-3xl mb-3">{card.icon}</div>
                <h3 className="text-lg font-bold text-terra-800 mb-2">{card.title}</h3>
                <p className="text-terra-800/60 leading-relaxed text-sm">{card.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Quote / callout */}
        <section className="px-4 py-16 bg-terra-900">
          <div className="max-w-3xl mx-auto text-center">
            <blockquote className="font-serif text-2xl md:text-3xl text-cream-100 italic leading-relaxed mb-6">
              &ldquo;{t('quote.text')}&rdquo;
            </blockquote>
            <cite className="text-cream-200/60 text-sm not-italic">
              {t('quote.attribution')}
            </cite>
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
