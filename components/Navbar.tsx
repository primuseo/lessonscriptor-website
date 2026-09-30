'use client'
import { useTranslations } from 'next-intl'
import { Link, useRouter } from '@/navigation'
import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'
import ThemeToggle from './ThemeToggle'

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
  const router = useRouter()

  return (
    <nav className="sticky top-0 z-50 bg-background backdrop-blur-xl border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 no-underline">
            <span className="font-serif text-lg font-semibold text-foreground tracking-tight">
              Lesson<span className="text-accent">Scriptor</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-4 text-[13px] font-medium">
            <Link href="/transcribe-video-to-text" className="whitespace-nowrap text-foreground/60 no-underline hover:text-foreground transition-colors">{t('transcribeVideo')}</Link>
            <Link href="/transcribe-youtube-video" className="whitespace-nowrap text-foreground/60 no-underline hover:text-foreground transition-colors">{t('youtube')}</Link>
            <Link href="/live-captions-chrome" className="whitespace-nowrap text-foreground/60 no-underline hover:text-foreground transition-colors">{t('liveCaptions')}</Link>
            <Link href="/for-adhd-students" className="whitespace-nowrap text-foreground/60 no-underline hover:text-foreground transition-colors">{t('forAdhd')}</Link>
            <Link href="/for-teachers" className="whitespace-nowrap text-foreground/60 no-underline hover:text-foreground transition-colors">{t('forTeachers')}</Link>
            <Link href="/blog" className="whitespace-nowrap text-foreground/60 no-underline hover:text-foreground transition-colors">{t('blog')}</Link>
            <Link href="/contact" className="whitespace-nowrap text-foreground/60 no-underline hover:text-foreground transition-colors">{t('contact')}</Link>
          </div>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Locale switcher */}
            <div className="relative flex items-center">
              <select
                aria-label="Language"
                value={locale}
                onChange={(e) => router.replace('/', { locale: e.target.value })}
                className="appearance-none bg-transparent border border-border rounded-full text-[12px] font-semibold text-foreground/60 py-1.5 pl-3 pr-7 cursor-pointer outline-none hover:text-foreground hover:border-foreground/30 transition-colors"
              >
                {LOCALES.map(l => (
                  <option key={l.code} value={l.code} className="bg-background text-foreground">
                    {l.label}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-2.5 w-3 h-3 text-foreground/40" strokeWidth={2} />
            </div>
            <ThemeToggle />
            <a
              href="https://chromewebstore.google.com/detail/lessonscriptor/apofgfejefeeepabfbaabdijnokbpcgp"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary whitespace-nowrap text-[13px] py-2 px-5"
            >
              {ts('installCTA').split(' — ')[0]}
            </a>
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 text-foreground/60">
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
        <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-3">
          <Link href="/transcribe-video-to-text" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('transcribeVideo')}</Link>
          <Link href="/transcribe-youtube-video" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('youtube')}</Link>
          <Link href="/live-captions-chrome" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('liveCaptions')}</Link>
          <Link href="/for-adhd-students" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('forAdhd')}</Link>
          <Link href="/for-teachers" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('forTeachers')}</Link>
          <Link href="/blog" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('blog')}</Link>
          <Link href="/contact" className="block text-sm text-foreground/60 hover:text-foreground py-2">{t('contact')}</Link>
          <div className="flex items-center gap-2 pt-2">
            {LOCALES.map(l => (
              <Link key={l.code} href="/" locale={l.code}
                className={`text-xs px-2 py-1 rounded font-medium ${locale === l.code ? 'bg-accent/10 text-accent' : 'text-foreground/30'}`}>
                {l.label}
              </Link>
            ))}
            <ThemeToggle />
          </div>
          <a href="https://chromewebstore.google.com/detail/lessonscriptor/apofgfejefeeepabfbaabdijnokbpcgp" target="_blank" rel="noopener noreferrer" className="btn-primary w-full justify-center text-sm mt-2">
            {ts('installCTA').split(' — ')[0]}
          </a>
        </div>
      )}
    </nav>
  )
}
