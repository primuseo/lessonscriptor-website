'use client'
import { useTranslations, useMessages } from 'next-intl'
import { useParams } from 'next/navigation'
import FAQSection from '@/components/FAQSection'
import CTASection from '@/components/CTASection'

export default function BlogLectureTranscribePage() {
  const t = useTranslations('blog.lecture')
  const messages = useMessages() as any
  const params = useParams()
  const locale = params.locale as string

  const sections = messages?.blog?.lecture?.sections || []
  const faqItems = messages?.blog?.lecture?.faq?.items || []

  const base = locale === 'en' ? '' : `/${locale}`
  const canonicalUrl = `https://lessonscriptor.com${base}/blog/how-to-transcribe-lecture-videos`

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'HowTo',
            name: t('h1'),
            description: t('intro'),
            step: sections[2]?.steps?.map((step: string, idx: number) => ({
              '@type': 'HowToStep',
              position: idx + 1,
              name: `Step ${idx + 1}`,
              text: step,
            })) || [],
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item: any) => ({
              '@type': 'Question',
              name: item.q,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.a,
              },
            })),
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `https://lessonscriptor.com${base}`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: `https://lessonscriptor.com${base}/blog`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: t('h1'),
                item: canonicalUrl,
              },
            ],
          }),
        }}
      />

      <article className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-10">
          <div className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold mb-4">
            Learning
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {t('h1')}
          </h1>
          <div className="flex items-center gap-4 text-gray-600 text-sm mb-8">
            <time dateTime="2026-04-01">April 2026</time>
            <span>•</span>
            <span>Lessonscriptor Team</span>
          </div>
        </header>

        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg mb-10">
          <p className="text-gray-800 leading-relaxed">
            {t('intro')}
          </p>
        </div>

        <div className="prose prose-lg max-w-none mb-12">
          {sections.map((section: any, idx: number) => (
            <div key={idx} className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
                {section.h2}
              </h2>

              {section.steps ? (
                <ol className="list-decimal list-inside space-y-4 mb-6">
                  {section.steps.map((step: string, stepIdx: number) => (
                    <li key={stepIdx} className="text-gray-700 leading-relaxed pl-4">
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-gray-700 leading-relaxed mb-6">
                  {section.body}
                </p>
              )}
            </div>
          ))}
        </div>
      </article>

      <FAQSection title={t('faq.title')} items={faqItems} />
      <CTASection />
    </>
  )
}
