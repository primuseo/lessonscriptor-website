import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/navigation'
import CopyButton from '@/components/CopyButton'

const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'thankYou' })
  const path = '/thank-you'
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    alternates: {
      canonical: `https://lessonscriptor.com/${locale}${path}`,
      languages: {
        'x-default': `https://lessonscriptor.com/en${path}`,
        ...Object.fromEntries(locales.map(l => [l, `https://lessonscriptor.com/${l}${path}`]))
      }
    }
  }
}

export async function generateStaticParams() {
  return locales.map(locale => ({ locale }))
}

interface Props {
  params: { locale: string }
  searchParams: { license_key?: string }
}

export default async function ThankYouPage({ params: { locale }, searchParams }: Props) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('thankYou')

  const licenseKey = searchParams.license_key ?? null
  const steps: { n: string; title: string; desc: string }[] = t.raw('steps') as { n: string; title: string; desc: string }[]

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Header */}
        <div className="text-center mb-12">
          <p className="eyebrow text-accent font-semibold text-xs tracking-widest uppercase mb-4">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
            {t('h1')}
          </h1>
          <p className="text-lg text-foreground/60">
            {t('subtitle')}
          </p>
        </div>

        {/* License key box */}
        <div className="card p-6 mb-10">
          <p className="text-sm font-semibold text-foreground/60 mb-3">{t('licenseLabel')}</p>
          {licenseKey ? (
            <div className="flex items-center gap-3">
              <code className="flex-1 bg-muted border border-border rounded-lg px-4 py-3 text-foreground font-mono text-sm break-all">
                {licenseKey}
              </code>
              <CopyButton text={licenseKey} label={t('copyButton')} copiedLabel={t('copiedButton')} />
            </div>
          ) : (
            <p className="text-foreground/60 italic text-sm">{t('noKey')}</p>
          )}
        </div>

        {/* Steps */}
        <div className="mb-12">
          <h2 className="font-serif text-2xl font-bold text-foreground mb-6">{t('stepsHeading')}</h2>
          <ol className="space-y-5">
            {steps.map((step) => (
              <li key={step.n} className="flex gap-4">
                <span className="shrink-0 w-8 h-8 rounded-full bg-accent text-white text-sm font-bold flex items-center justify-center">
                  {step.n}
                </span>
                <div>
                  <p className="font-semibold text-foreground mb-1">{step.title}</p>
                  <p className="text-foreground/60 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* CTA to onboarding */}
        <div className="border-t border-border pt-10 text-center">
          <p className="text-foreground/60 mb-4">{t('onboardingDesc')}</p>
          <Link
            href="/onboarding"
            className="btn-primary inline-block px-8 py-3 rounded-full font-bold"
          >
            {t('onboardingCTA')} →
          </Link>
        </div>

      </div>
    </div>
  )
}
