import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import FAQSection from '@/components/FAQSection'
import { getLocalizedSlug } from '@/content/blog/_slug-map'
import CTASection from '@/components/CTASection'
import PricingPacks from '@/components/PricingPacks'
import {
  MicrophoneIcon,
  PencilSquareIcon,
  ArrowDownTrayIcon,
  LanguageIcon,
  ShieldCheckIcon,
  ClockIcon,
  AcademicCapIcon,
  SparklesIcon,
  ComputerDesktopIcon,
  HandRaisedIcon,
  BoltIcon,
  GlobeAltIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const site = await getTranslations('site')
  const home = await getTranslations('home')
  const url = `https://lessonscriptor.com/${locale}`
  return {
    title: `${site('name')} — ${home('meta.title')}`,
    description: site('description'),
    openGraph: {
      title: `${site('name')} — ${home('meta.ogTitle')}`,
      description: site('description'),
      type: 'website',
      url,
    },
  }
}

export default async function HomePage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('home')
  const site = await getTranslations('site')

  const paymentLinkUrls = [
    process.env.STRIPE_PACK_STARTER_LINK_URL || '',
    process.env.STRIPE_PACK_STUDENT_LINK_URL || '',
    process.env.STRIPE_PACK_HEAVY_LINK_URL || '',
  ]

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site('name'),
    url: 'https://lessonscriptor.com',
    description: site('description'),
  }

  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site('name'),
    url: 'https://lessonscriptor.com',
    logo: 'https://lessonscriptor.com/icons/icon-512.png',
    sameAs: ['https://github.com/pierregseo/live-transcription-extension'],
    foundingDate: '2026',
    founder: [
      { '@type': 'Person', name: 'Victoria' },
      { '@type': 'Person', name: 'Pierre' },
    ],
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: site('name'),
    description: site('description'),
    url: 'https://lessonscriptor.com',
    applicationCategory: 'BrowserApplication',
    operatingSystem: 'Chrome, Chromium, Brave, Edge, Arc',
    browserRequirements: 'Requires Chrome or a Chromium-based browser',
    inLanguage: ['en', 'fr', 'es', 'zh', 'hi', 'ar', 'bn', 'pt', 'ru', 'ur', 'de', 'it'],
    featureList: [
      'Live lecture transcription via microphone (free) or AI tab capture (paid)',
      '14 transcription languages including English, French, Spanish, Arabic, Hindi',
      'Rich note editing with highlights, bold, and bullet points',
      'Export to .txt, .md, clipboard, or Google Drive',
      'Per-line timestamps and session history',
      'Privacy-first: fully local processing in free mode',
    ],
    offers: [
      { '@type': 'Offer', name: 'Free — Browser Speech Recognition', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/PreOrder' },
      { '@type': 'Offer', name: 'AI Mode — 5 Hours', price: '5.00', priceCurrency: 'USD', availability: 'https://schema.org/PreOrder' },
      { '@type': 'Offer', name: 'AI Mode — 15 Hours', price: '12.00', priceCurrency: 'USD', availability: 'https://schema.org/PreOrder' },
      { '@type': 'Offer', name: 'AI Mode — 30 Hours', price: '21.00', priceCurrency: 'USD', availability: 'https://schema.org/PreOrder' },
    ],
    creator: { '@type': 'Organization', name: 'LessonScriptor', url: 'https://lessonscriptor.com' },
  }

  const faqData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: t.raw('faq.items').map((item: { q: string; a: string }) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  }

  const howToData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t('quickstart.schemaName'),
    description: t('quickstart.subtitle'),
    totalTime: 'PT1M',
    step: t.raw('quickstart.steps').map((s: { n: string; title: string; desc: string }, i: number) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.desc,
    })),
  }

  const problemIcons = [HandRaisedIcon, SparklesIcon, GlobeAltIcon, BoltIcon]
  const featureIcons = [MicrophoneIcon, PencilSquareIcon, ArrowDownTrayIcon, LanguageIcon, ShieldCheckIcon, ClockIcon]
  const whoIcons = [AcademicCapIcon, SparklesIcon, GlobeAltIcon, ComputerDesktopIcon]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToData) }} />

      {/* ── HERO ── */}
      <section className="bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-0">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="badge mb-7 justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-accent" />
              {t('hero.badge')}
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-semibold text-foreground leading-[1.1] tracking-tight mb-6">
              {t('hero.h1_line1')}<br />
              {t('hero.h1_line2')}{' '}
              <em className="italic text-accent">{t('hero.h1_em')}</em><br />
              {t('hero.h1_line3')}
            </h1>
            <p className="text-lg text-foreground/60 leading-relaxed mb-9 max-w-md mx-auto">
              {t('hero.subtitle')}
            </p>
            <a
              href="https://chromewebstore.google.com/detail/lessonscriptor/apofgfejefeeepabfbaabdijnokbpcgp"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-base py-4 px-8"
            >
              {site('installCTA')}
            </a>
            <p className="text-xs text-foreground/30 mt-4">{t('hero.waitlistNote')}</p>
          </div>

          {/* Full-width browser context screenshot */}
          <div className="relative mx-auto max-w-5xl pb-16">
            <div className="bg-card p-2 sm:p-3 rounded-2xl sm:rounded-3xl shadow-lg border border-border overflow-hidden">
              <Image
                src="/images/sidebar-context.png"
                alt="LessonScriptor side panel transcribing a YouTube lecture in real-time alongside the video"
                width={2928}
                height={1834}
                className="w-full h-auto rounded-xl sm:rounded-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="bg-primary dark:bg-card py-20 px-4 text-center">
        <div className="max-w-6xl mx-auto">
          {/* This eyebrow always sits on the bg-primary/dark:bg-card band, so it always
              needs the dark-surface-safe gold regardless of site theme. */}
          <p className="text-[11px] font-bold tracking-[2.5px] uppercase text-[#D4A017] mb-4">{t('problem.eyebrow')}</p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary-foreground dark:text-card-foreground leading-tight tracking-tight mb-5 max-w-2xl mx-auto">
            {t('problem.title_line1')}<br />
            {t('problem.title_line2')}{' '}
            <em className="italic text-accent">{t('problem.title_em')}</em>
          </h2>
          <p className="text-base text-primary-foreground/50 dark:text-card-foreground/50 leading-relaxed max-w-lg mx-auto mb-14">
            {t('problem.subtitle')}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {t.raw('problem.items').map((item: { title: string; desc: string }, i: number) => {
              const Icon = problemIcons[i]
              return (
                <div key={i} className="bg-white/[0.04] border border-white/[0.06] rounded-2xl p-6 text-left hover:bg-white/[0.07] transition-colors">
                  <Icon className="w-5 h-5 text-accent mb-3" />
                  <h4 className="text-[13px] font-semibold text-primary-foreground dark:text-card-foreground mb-2 leading-tight">{item.title}</h4>
                  <p className="text-xs text-white/45 leading-relaxed m-0">{item.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── ORIGIN STORY ── */}
      <section className="bg-card py-20 px-4 border-b border-border">
        <div className="max-w-2xl mx-auto">
          <p className="eyebrow">{t('origin.eyebrow')}</p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight mb-9">
            {t('origin.title_line1')}<br />
            <em className="italic text-accent">{t('origin.title_em')}</em>
          </h2>
          <div className="border-l-[3px] border-accent pl-7">
            <p className="text-lg text-foreground leading-relaxed mb-5 font-serif italic">
              {t('origin.lede')}
            </p>
            <p className="text-[15px] text-foreground/60 leading-relaxed mb-5">{t('origin.p1')}</p>
            <p className="text-[15px] text-foreground/60 leading-relaxed mb-5">{t('origin.p2')}</p>
            <p className="text-[15px] text-foreground leading-relaxed font-semibold">{t('origin.close')}</p>
          </div>
          <div className="mt-9 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-accent flex-shrink-0" />
            <span className="text-xs text-foreground/30 font-serif italic">{t('origin.sig')}</span>
          </div>
        </div>
      </section>

      {/* ── WHO IT'S FOR ── */}
      <section className="bg-background py-20 px-4 border-b border-border" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow">{t('who.eyebrow')}</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">{t('who.title')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto">
            {t.raw('who.items').map((item: { title: string; desc: string; tag: string }, i: number) => {
              const Icon = whoIcons[i]
              return (
                <div key={i} className="card p-8">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-2.5">{item.title}</h3>
                  <p className="text-[13px] text-foreground/60 leading-relaxed">{item.desc}</p>
                  <span className="inline-block mt-4 bg-accent/10 text-accent text-[10px] font-bold tracking-wider uppercase py-1 px-3 rounded-full">
                    {item.tag}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── EDITING SHOWCASE ── */}
      <section className="bg-card py-20 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow">{t('editing.eyebrow')}</p>
          <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight mb-4">
            {t('editing.title')}{' '}
            <em className="italic text-accent">{t('editing.titleEm')}</em>
          </h2>
          <p className="text-[15px] text-foreground/60 max-w-xl mx-auto mb-12 leading-relaxed">
            {t('editing.desc')}
          </p>
          <div className="bg-card p-4 rounded-3xl shadow-lg border border-border max-w-md mx-auto">
            <Image
              src="/images/editing-screenshot.png"
              alt="LessonScriptor editing toolbar with color highlighting and text formatting"
              width={480}
              height={340}
              className="w-full h-auto rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-muted py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow">{t('features.eyebrow')}</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">
              {t('features.title_line1')}<br />{t('features.title_line2')}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {t.raw('features.items').map((item: { title: string; desc: string; chips: string[] }, i: number) => {
              const Icon = featureIcons[i]
              return (
                <div key={i} className="bg-background/80 backdrop-blur-sm border border-border rounded-2xl p-7 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <Icon className="w-5 h-5 text-accent mb-3" />
                  <h4 className="text-sm font-bold text-foreground mb-2">{item.title}</h4>
                  <p className="text-[13px] text-foreground/60 leading-relaxed">{item.desc}</p>
                  <div className="flex flex-wrap gap-1 mt-4 pt-4 border-t border-border">
                    {item.chips.map((chip: string, j: number) => (
                      <span key={j} className="bg-muted border border-border text-accent text-[10px] font-semibold py-0.5 px-2.5 rounded-full">
                        {chip}
                      </span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── WORKS EVERYWHERE ── */}
      <section className="py-20 px-4" id="works-everywhere">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow">{t('worksEverywhere.eyebrow')}</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">
              {t('worksEverywhere.title_line1')}<br />{t('worksEverywhere.title_line2')}
            </h2>
            <p className="text-[15px] text-foreground/60 mt-4 max-w-xl mx-auto leading-relaxed">{t('worksEverywhere.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto mb-10">
            {t.raw('worksEverywhere.platforms').map((p: { title: string; desc: string }, i: number) => {
              const icons = [AcademicCapIcon, ComputerDesktopIcon, SpeakerWaveIcon]
              const Icon = icons[i]
              return (
                <div key={i} className="card p-8">
                  <Icon className="w-6 h-6 text-accent mb-3" />
                  <h4 className="text-base font-semibold text-foreground mb-2.5 font-serif">{p.title}</h4>
                  <p className="text-sm text-foreground/60 leading-relaxed">{p.desc}</p>
                </div>
              )
            })}
          </div>
          <div className="bg-primary dark:bg-card rounded-2xl py-9 px-8 md:px-11 max-w-4xl mx-auto">
            {/* This eyebrow always sits on the bg-primary/dark:bg-card band, so it always
                needs the dark-surface-safe gold regardless of site theme. */}
            <p className="text-[10px] font-bold tracking-[2.5px] uppercase text-[#D4A017] mb-4">
              {t('worksEverywhere.explainerEyebrow')}
            </p>
            <p className="text-sm leading-relaxed text-primary-foreground/70 dark:text-card-foreground/70 mb-3">
              <strong className="text-primary-foreground dark:text-card-foreground font-bold">Free mode</strong> {t('worksEverywhere.explainerFree').replace('Free mode ', '')}
            </p>
            <p className="text-sm leading-relaxed text-primary-foreground/70 dark:text-card-foreground/70">
              <strong className="text-primary-foreground dark:text-card-foreground font-bold">AI mode</strong> {t('worksEverywhere.explainerAI').replace('AI mode ', '')}
            </p>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="bg-background py-20 px-4 border-b border-border" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow">{t('pricing.eyebrow')}</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">
              {t('pricing.title_line1')}<br />{t('pricing.title_line2')}
            </h2>
            <p className="text-[15px] text-foreground/60 mt-4 max-w-xl mx-auto leading-relaxed">{t('pricing.subtitle')}</p>
          </div>

          {/* Why pay banner */}
          <div className="max-w-4xl mx-auto -mt-4 mb-11 bg-muted border border-border rounded-2xl py-4 px-6 flex items-start gap-3.5">
            <svg className="flex-shrink-0 mt-0.5 stroke-accent" width="18" height="18" viewBox="0 0 24 24" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-[13px] text-foreground/60 leading-relaxed">
              <strong className="text-foreground">{t('pricing.whyPay')}</strong>{' '}
              {t('pricing.whyPayDesc').replace(`${t('pricing.whyPay')} `, '')}
            </p>
          </div>

          <div className="grid md:grid-cols-[1fr_1.6fr] gap-5 max-w-4xl mx-auto items-start">
            {/* Free plan */}
            <div className="bg-card border border-border rounded-2xl p-9 shadow-sm">
              <p className="text-[11px] font-extrabold tracking-[2.5px] uppercase text-accent mb-3">{t('pricing.freeLabel')}</p>
              <div className="inline-flex items-center gap-1.5 border border-border rounded-full py-1 px-2.5 text-[10px] font-semibold bg-background text-foreground/60 mb-4">
                <MicrophoneIcon className="w-3 h-3" />
                {t('pricing.freeEngine')}
              </div>
              <div className="font-serif text-5xl font-bold text-foreground leading-none mb-1.5 tracking-tight">
                {t('pricing.freePrice')} <span className="text-[15px] font-normal text-foreground/40 font-sans">{t('pricing.freePriceSuffix')}</span>
              </div>
              <p className="text-[13px] text-foreground/60 leading-relaxed mb-6 pb-6 border-b border-border">
                {t('pricing.freeDesc')}
              </p>
              <ul className="flex flex-col gap-2.5 mb-6 list-none p-0">
                {t.raw('pricing.freeFeatures').map((f: string, i: number) => (
                  <li key={i} className="text-[13px] text-foreground/70 flex items-start gap-2.5 leading-snug">
                    <span className="text-accent font-bold flex-shrink-0">✓</span> {f}
                  </li>
                ))}
                {t.raw('pricing.freeMuted').map((f: string, i: number) => (
                  <li key={`m${i}`} className="text-[13px] text-foreground/30 flex items-start gap-2.5 leading-snug">
                    <span className="text-border font-bold flex-shrink-0">–</span> {f}
                  </li>
                ))}
              </ul>
              <div className="text-[11px] text-foreground/40 leading-snug mb-6 py-3 px-3.5 bg-muted border border-border rounded-xl">
                <strong>Note:</strong> {t('pricing.freeCaveat')}
              </div>
              <a
                href="https://chromewebstore.google.com/detail/lessonscriptor/apofgfejefeeepabfbaabdijnokbpcgp"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-muted border border-border text-accent text-[13px] font-bold py-3 rounded-full no-underline hover:bg-border transition-colors"
              >
                {t('pricing.installFreeBtn')}
              </a>
            </div>

            {/* Premium plan */}
            <div className="bg-primary dark:bg-card rounded-2xl p-9 shadow-lg">
              {/* Label, badge and callout below always sit on the bg-primary/dark:bg-card
                  band, so they always need the dark-surface-safe gold regardless of site theme. */}
              <p className="text-[11px] font-extrabold tracking-[2.5px] uppercase text-[#D4A017] mb-3">{t('pricing.premiumLabel')}</p>
              <div className="inline-flex items-center gap-1.5 border border-accent/20 rounded-full py-1 px-2.5 text-[10px] font-semibold bg-accent/10 text-[#D4A017] mb-4">
                <SparklesIcon className="w-3 h-3" />
                {t('pricing.premiumEngine')}
              </div>

              <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl py-2.5 px-3.5 mb-4 text-xs text-[#D4A017] font-semibold">
                {t('pricing.noSubCallout')}
              </div>

              <div className="bg-white/[0.04] border-l-[3px] border-accent rounded-r-xl py-3.5 px-4 mb-4">
                <p className="text-xs text-primary-foreground/50 dark:text-card-foreground/50 leading-relaxed">{t('pricing.costCallout')}</p>
              </div>

              <div className="flex items-start gap-2.5 bg-white/[0.04] border border-accent/[0.12] rounded-xl py-3 px-4 mb-5">
                <SpeakerWaveIcon className="w-[18px] h-[18px] text-primary-foreground dark:text-card-foreground flex-shrink-0 mt-px" />
                <p className="text-xs text-primary-foreground/60 dark:text-card-foreground/60 leading-snug">
                  <strong className="text-primary-foreground dark:text-card-foreground">{t('pricing.headphonesCallout').split('.')[0]}.</strong>{' '}
                  {t('pricing.headphonesCallout').split('.').slice(1).join('.').trim()}
                </p>
              </div>

              {/* Packs grid with currency selector */}
              <PricingPacks
                packs={t.raw('pricing.packs')}
                currencyDisclaimer={t('pricing.currencyDisclaimer')}
                paymentProcessor={t('pricing.paymentProcessor')}
                paymentLinkUrls={paymentLinkUrls}
                locale={locale}
              />

              <ul className="flex flex-col gap-2 mb-6 pt-5 border-t border-white/[0.06] list-none p-0">
                {t.raw('pricing.premiumFeatures').map((f: string, i: number) => (
                  <li key={i} className="text-xs text-primary-foreground/55 dark:text-card-foreground/55 flex items-start gap-2 leading-snug">
                    {/* Always on the bg-primary/dark:bg-card band, so always the dark-surface-safe gold. */}
                    <span className="text-[#D4A017] font-bold flex-shrink-0">✓</span> {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://chromewebstore.google.com/detail/lessonscriptor/apofgfejefeeepabfbaabdijnokbpcgp"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-center bg-accent text-accent-foreground text-[13px] font-extrabold py-3.5 rounded-full no-underline hover:bg-accent-hover transition-colors"
              >
                {t('pricing.getAIBtn')}
              </a>
            </div>
          </div>
          <p className="text-center mt-7 text-xs text-foreground/30 max-w-lg mx-auto leading-relaxed">
            {t('pricing.footnote')}
          </p>
        </div>
      </section>

      {/* ── QUICKSTART ── */}
      <section className="bg-primary dark:bg-card py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] font-bold tracking-[2.5px] uppercase text-accent mb-4">{t('quickstart.eyebrow')}</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-primary-foreground dark:text-card-foreground tracking-tight leading-tight">
              {t('quickstart.title_line1')}<br />{t('quickstart.title_line2')}
            </h2>
            <p className="text-[15px] text-primary-foreground/50 dark:text-card-foreground/50 mt-4">{t('quickstart.subtitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 max-w-3xl mx-auto relative">
            <div className="hidden md:block absolute top-7 left-[calc(16.66%+16px)] right-[calc(16.66%+16px)] h-px bg-white/[0.08]" />
            {t.raw('quickstart.steps').map((step: { n: string; title: string; desc: string; tag: string }, i: number) => (
              <div key={i} className="text-center px-6 relative">
                <div className="w-14 h-14 rounded-full bg-white/[0.04] border-[1.5px] border-white/[0.08] flex items-center justify-center mx-auto mb-6 font-serif text-xl font-semibold text-accent relative z-[1]">
                  {step.n}
                </div>
                <h4 className="text-sm font-semibold text-primary-foreground dark:text-card-foreground mb-2.5">{step.title}</h4>
                <p className="text-xs text-primary-foreground/45 dark:text-card-foreground/45 leading-relaxed">{step.desc}</p>
                <span className="inline-block mt-3 bg-white/[0.04] border border-white/[0.08] text-primary-foreground/40 dark:text-card-foreground/40 text-[10px] py-1 px-2.5 rounded-full font-mono">
                  {step.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HELPFUL RESOURCES ── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="eyebrow">{t('resources.eyebrow')}</p>
            <h2 className="font-serif text-4xl md:text-5xl font-semibold text-foreground tracking-tight leading-tight">
              {t('resources.title_line1')}<br />{t('resources.title_line2')}
            </h2>
            <p className="text-[15px] text-foreground/50 mt-4 max-w-xl mx-auto">{t('resources.subtitle')}</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {t.raw('resources.posts').map((post: { slug: string; title: string; desc: string }, i: number) => {
              const base = `/${locale}`
              const localSlug = getLocalizedSlug(post.slug, locale)
              return (
                <Link
                  key={i}
                  href={`${base}/blog/${localSlug}`}
                  className="group block bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 no-underline hover:border-accent/30 hover:shadow-md transition-all"
                >
                  <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-accent-hover transition-colors leading-snug">
                    {post.title}
                  </h3>
                  <p className="text-xs text-foreground/50 leading-relaxed m-0">{post.desc}</p>
                </Link>
              )
            })}
          </div>
          <div className="text-center">
            <Link
              href={`${`/${locale}`}/blog`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover no-underline transition-colors"
            >
              {t('resources.browseAll')}
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQSection
        title={t('faq.title_line1')}
        items={t.raw('faq.items')}
      />

      {/* ── CONTACT ── */}
      <section className="bg-muted py-20 px-4 border-t border-border">
        <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_1.4fr] gap-14 items-start">
          <div>
            <p className="eyebrow">{t('contact.eyebrow')}</p>
            <h2 className="font-serif text-3xl font-semibold text-foreground tracking-tight leading-tight mb-4">
              {t('contact.title_line1')}<br />
              {t('contact.title_line2')}{' '}
              <em className="italic text-accent">{t('contact.title_em')}</em>
            </h2>
            <p className="text-sm text-foreground/60 leading-relaxed mb-9">{t('contact.subtitle')}</p>
            <div className="flex flex-col gap-5">
              {t.raw('contact.options').map((opt: { title: string; desc: string }, i: number) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                  <div>
                    <h4 className="text-[13px] font-bold text-foreground mb-1">{opt.title}</h4>
                    <p className="text-xs text-foreground/40 leading-snug m-0">{opt.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6 bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-sm items-center justify-center text-center">
            <p className="text-foreground/60 text-sm leading-relaxed">{t('contact.subtitle')}</p>
            <Link href={`/${locale}/contact`} className="btn-primary justify-center py-3.5 w-full">
              {t('contact.form.send')}
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER CTA ── */}
      <CTASection />
    </>
  )
}
