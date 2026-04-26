'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'fr', label: 'FR' },
  { code: 'es', label: 'ES' },
  { code: 'pt', label: 'PT' },
  { code: 'de', label: 'DE' },
]

export default function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const ts = useTranslations('site')
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const base = locale === 'en' ? '' : `/${locale}`

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href={`${base}/`} className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-600">Lessonscriptor</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-600">
            <Link href={`${base}/transcribe-youtube-video`} className="hover:text-blue-600 transition-colors">{t('youtube')}</Link>
            <Link href={`${base}/live-captions-chrome`} className="hover:text-blue-600 transition-colors">{t('liveCaptions')}</Link>
            <Link href={`${base}/transcribe-video-to-text`} className="hover:text-blue-600 transition-colors">{t('transcribeVideo')}</Link>
            <Link href={`${base}/compare/otter-ai-alternative`} className="hover:text-blue-600 transition-colors">{t('compare')}</Link>
            <Link href={`${base}/blog/how-to-transcribe-lecture-videos`} className="hover:text-blue-600 transition-colors">{t('blog')}</Link>
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-3">
            {/* Locale switcher */}
            <div className="flex items-center gap-1">
              {LOCALES.map(l => (
                <Link
                  key={l.code}
                  href={pathname.replace(/^\/(en|fr|es|pt|de)/, l.code === 'en' ? '' : `/${l.code}`) || '/'}
                  className={`text-xs px-2 py-1 rounded font-medium transition-colors ${
                    locale === l.code ? 'bg-blue-100 text-blue-700' : 'text-gray-400 hover:text-gray-700'
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
              className="btn-primary text-sm px-4 py-2"
            >
              {ts('installCTA').split(' — ')[0]}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-gray-600">
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
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 space-y-3">
          <Link href={`${base}/transcribe-youtube-video`} className="block text-sm text-gray-700 hover:text-blue-600 py-2">{t('youtube')}</Link>
          <Link href={`${base}/live-captions-chrome`} className="block text-sm text-gray-700 hover:text-blue-600 py-2">{t('liveCaptions')}</Link>
          <Link href={`${base}/transcribe-video-to-text`} className="block text-sm text-gray-700 hover:text-blue-600 py-2">{t('transcribeVideo')}</Link>
          <Link href={`${base}/compare/otter-ai-alternative`} className="block text-sm text-gray-700 hover:text-blue-600 py-2">{t('compare')}</Link>
          <Link href={`${base}/blog/how-to-transcribe-lecture-videos`} className="block text-sm text-gray-700 hover:text-blue-600 py-2">{t('blog')}</Link>
          <div className="flex gap-2 pt-2">
            {LOCALES.map(l => (
              <Link key={l.code} href={l.code === 'en' ? '/' : `/${l.code}`}
                className={`text-xs px-2 py-1 rounded font-medium ${locale === l.code ? 'bg-blue-100 text-blue-700' : 'text-gray-400'}`}>
                {l.label}
              </Link>
            ))}
          </div>
          <a href="https://chrome.google.com/webstore" target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center text-sm mt-2">
            {ts('installCTA').split(' — ')[0]}
          </a>
        </div>
      )}
    </nav>
  )
}
