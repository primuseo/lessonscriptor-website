'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useState } from 'react'

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
  { code: 'de', label: 'DE' },
  { code: 'zh', label: '中文' },
]

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const ts = useTranslations('site')
  const [open, setOpen] = useState(false)

  const base = locale === 'en' ? '' : `/${locale}`

  function switchLocaleHref(targetLocale: string) {
    if (targetLocale === 'en') return '/'
    return `/${targetLocale}`
  }

  return (
    <nav className="sticky top-0 z-50 bg-cream-50/92 backdrop-blur-xl border-b border-cream-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`${base}/`} className="flex items-center gap-1.5 no-underline">
            <span className="font-serif text-lg font-bold text-terra-800 tracking-tight">
              Lesson<span className="text-accent-500">Scriptor</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium">
            <Link href={`${base}/transcribe-youtube-video`} className="text-terra-800/60 no-underline hover:text-terra-800 transition-colors">{t('youtube')}</Link>
            <Link href={`${base}/live-captions-chrome`} className="text-terra-800/60 no-underline hover:text-terra-800 transition-colors">{t('liveCaptions')}</Link>
            <Link href={`${base}/compare/otter-ai-alternative`} className="text-terra-800/60 no-underline hover:text-terra-800 transition-colors">{t('compare')}</Link>
            <Link href={`${base}/blog`} className="text-terra-800/60 no-underline hover:text-terra-800 transition-colors">{t('blog')}</Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Locale switcher */}
            <div className="flex items-center gap-1">
              {LOCALES.map(l => (
                <Link
                  key={l.code}
                  href={switchLocaleHref(l.code)}
                  className={`text-[10px] px-1.5 py-0.5 rounded font-semibold transition-colors ${
                    locale === l.code ? 'bg-accent-500/10 text-accent-600' : 'text-terra-800/30 hover:text-terra-800/60'
                  }`}
                >
                  {l.label}
                </Link>
              ))}
            </div>
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-[13px] py-2 px-5"
            >
              {ts('installCTA').split(' — ')[0]}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-terra-800/60">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-cream-200 bg-cream-50 px-4 py-4 space-y-3">
          <Link href={`${base}/transcribe-youtube-video`} className="block text-sm text-terra-800/60 hover:text-terra-800 py-2">{t('youtube')}</Link>
          <Link href={`${base}/live-captions-chrome`} className="block text-sm text-terra-800/60 hover:text-terra-800 py-2">{t('liveCaptions')}</Link>
          <Link href={`${base}/compare/otter-ai-alternative`} className="block text-sm text-terra-800/60 hover:text-terra-800 py-2">{t('compare')}</Link>
          <Link href={`${base}/blog`} className="block text-sm text-terra-800/60 hover:text-terra-800 py-2">{t('blog')}</Link>
          <div className="flex gap-2 pt-2">
            {LOCALES.map(l => (
              <Link key={l.code} href={switchLocaleHref(l.code)}
                className={`text-xs px-2 py-1 rounded font-medium ${locale === l.code ? 'bg-accent-500/10 text-accent-600' : 'text-terra-800/30'}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center text-sm mt-2">
            {ts('installCTA').split(' — ')[0]}
          </a>
        </div>
      )}
    </nav>
  )
}
