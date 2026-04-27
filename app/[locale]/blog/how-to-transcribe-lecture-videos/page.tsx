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
              acceptedAnswer: { '@type': 'Answer', text: item.a },
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
              { '@type': 'ListItem', position: 1, name: 'Home', item: `https://lessonscriptor.com${base}` },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: `https://lessonscriptor.com${base}/blog` },
              { '@type': 'ListItem', position: 3, name: t('h1'), item: canonicalUrl },
            ],
          }),
        }}
      />

      <article className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <div className="badge mb-4">Learning</div>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-dark mb-4 leading-tight">
            {t('h1')}
          </h1>
          <div className="flex items-center gap-4 text-muted text-sm mb-8">
            <time dateTime="2026-04-01">April 2026</time>
            <span>·</span>
            <span>LessonScriptor Team</span>
          </div>
        </header>

        <div className="bg-cream-100 border-l-[3px] border-amber-600 p-6 rounded-r-lg mb-10">
          <p className="text-dark leading-relaxed">
            {t('intro')}
          </p>
        </div>

        <div className="prose-custom max-w-none mb-12">
          {sections.map((section: any, idx: number) => (
            <div key={idx} className="mb-12">
              <h2 className="font-serif text-2xl md:text-3xl font-bold text-dark mb-6">
                {section.h2}
              </h2>

              {section.steps ? (
                <ol className="list-decimal list-inside space-y-4 mb-6">
                  {section.steps.map((step: string, stepIdx: number) => (
                    <li key={stepIdx} className="text-muted leading-relaxed pl-4">
                      {step}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-muted leading-relaxed mb-6">
                  {section.body}
                </p>
              )}
            </div>
          ))}
        </div>
      </article>

      <FAQSection title="Frequently asked questions" items={faqItems} />
      <CTASection />
    </>
  )
}
