'use client'
import { useTranslations } from 'next-intl'

interface FAQItem {
  q: string
  a: string
}

export default function FAQSection({ title, items }: { title?: string; items: FAQItem[] }) {
  const t = useTranslations('site')
  return (
    <section className="py-24 px-4 max-w-3xl mx-auto" id="faq">
      {title && (
        <div className="text-center mb-14">
          <p className="eyebrow">{t('faqSection.eyebrow')}</p>
          <h2 className="font-serif text-4xl md:text-5xl font-bold text-terra-800 tracking-tight leading-tight">
            {t('faqSection.title')}{' '}
            <em className="italic text-accent-500">{t('faqSection.titleEm')}</em>
          </h2>
        </div>
      )}
      <div className="border-t border-cream-200">
        {items.map((item, i) => (
          <details key={i} className="border-b border-cream-200 group">
            <summary className="py-5 px-1 text-[15px] font-semibold text-terra-800 cursor-pointer list-none flex items-center justify-between gap-4 select-none hover:text-accent-500 transition-colors duration-200">
              {item.q}
              <svg
                className="w-4 h-4 text-terra-800/30 flex-shrink-0 transition-transform duration-200 group-open:rotate-180"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <p className="px-1 pb-5 text-sm text-terra-800/60 leading-relaxed max-w-2xl">
              {item.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
