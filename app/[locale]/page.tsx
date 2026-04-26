'use server'

import { getTranslations, getLocale } from 'next-intl/server'
import { Metadata } from 'next'
import Link from 'next/link'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('home')
  const site = await getTranslations('site')

  return {
    title: `${site('name')} — Live AI Transcription for Any Video in Chrome`,
    description: site('description'),
    openGraph: {
      title: `${site('name')} — Live AI Transcription for Any Video in Chrome`,
      description: site('description'),
      type: 'website',
      url: 'https://lessonscriptor.com',
    },
  }
}

export default async function HomePage() {
  const t = await getTranslations('home')
  const site = await getTranslations('site')
  const nav = await getTranslations('nav')
  const locale = await getLocale()
  const base = locale === 'en' ? '' : `/${locale}`

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: site('name'),
    description: site('description'),
    url: 'https://lessonscriptor.com',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Chrome',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      category: 'Free',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '240',
    },
  }

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t('faq.items').map((item: { q: string; a: string }) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />

      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-4 max-w-6xl mx-auto">
        <div className="text-center">
          {/* Badge */}
          <div className="inline-block mb-6">
            <span className="badge text-sm px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium">
              {t('hero.badge')}
            </span>
          </div>

          {/* H1 */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t('hero.h1')}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {t('hero.subtitle')}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors text-lg shadow-lg"
            >
              {t('hero.cta1')}
            </a>
            <button className="btn-secondary inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-colors text-lg">
              {t('hero.cta2')}
            </button>
          </div>

          {/* Social proof */}
          <p className="text-gray-500 text-sm font-medium">
            {t('hero.socialProof')}
          </p>
        </div>
      </section>

      {/* PAIN SECTION */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            {t('pain.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {t('pain.items').map((item: { icon: string; text: string }, i: number) => (
              <div key={i} className="card p-8 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <p className="text-lg text-gray-700 font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            {t('features.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {t('features.items').map(
              (item: { icon: string; title: string; desc: string }, i: number) => (
                <div key={i} className="card p-8 bg-white rounded-xl border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-20 px-4 bg-blue-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            {t('howItWorks.title')}
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {t('howItWorks.steps').map(
              (step: { n: string; title: string; desc: string }, i: number) => (
                <div key={i} className="relative">
                  <div className="card p-8 bg-white rounded-xl border border-gray-200 h-full">
                    <div className="w-12 h-12 bg-blue-600 text-white font-bold rounded-full flex items-center justify-center mb-4 text-xl">
                      {step.n}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{step.desc}</p>
                  </div>

                  {/* Connector line (only on md and up, not after last) */}
                  {i < 3 && (
                    <div className="hidden md:block absolute top-1/3 -right-3 w-6 h-0.5 bg-blue-300" />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* MODES SECTION */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            {t('modes.title')}
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Mode */}
            <div className="card p-10 bg-white border-2 border-gray-200 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">{t('modes.free.title')}</h3>
                <span className="badge px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full font-medium">
                  {t('modes.free.badge')}
                </span>
              </div>

              <div className="mb-6">
                <p className="text-4xl font-bold text-blue-600 mb-2">{t('modes.free.price')}</p>
                <p className="text-gray-600 text-sm">{t('modes.free.desc')}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {t('modes.free.items').map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3 text-gray-700">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a
                href="https://chrome.google.com/webstore"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full btn-primary inline-block text-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
              >
                {site('installCTA')}
              </a>
            </div>

            {/* Premium Mode */}
            <div className="card p-10 bg-gradient-to-br from-blue-50 to-white border-2 border-blue-300 rounded-2xl relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-100 rounded-full opacity-50" />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{t('modes.premium.title')}</h3>
                  <span className="badge px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full font-medium">
                    {t('modes.premium.badge')}
                  </span>
                </div>

                <div className="mb-6">
                  <p className="text-4xl font-bold text-blue-600 mb-2">{t('modes.premium.price')}</p>
                  <p className="text-gray-600 text-sm">{t('modes.premium.desc')}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {t('modes.premium.items').map((item: string, i: number) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <button className="w-full btn-secondary px-6 py-3 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-colors border-2 border-blue-300">
                  {t('site.learnMore')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-16">
            {t('useCases.title')}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {t('useCases.items').map(
              (item: { icon: string; title: string; desc: string }, i: number) => (
                <div key={i} className="card p-8 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.desc}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQSection title={t('faq.title')} items={t('faq.items')} />

      {/* CTA SECTION */}
      <CTASection />
    </>
  )
}
