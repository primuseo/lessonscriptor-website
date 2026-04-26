'use client'
import { useState } from 'react'

interface FAQItem {
  q: string
  a: string
}

export default function FAQSection({ title, items }: { title?: string; items: FAQItem[] }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="py-16 px-4 max-w-3xl mx-auto">
      {title && <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">{title}</h2>}
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
            >
              <span className="font-semibold text-gray-900 pr-4">{item.q}</span>
              <svg
                className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {open === i && (
              <div className="px-5 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
