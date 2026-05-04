import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'
import { Link } from '@/navigation'
import { SaveIcon, TrashIcon, ExportIcon, ClockIcon, SyncIcon } from '@/components/ExtensionIcons'

const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'onboarding' })
  const path = '/onboarding'
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

type TroubleItem = { q: string; a: string }

export default async function OnboardingPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('onboarding')

  const quickstartSteps: string[] = t.raw('quickstartSteps') as string[]
  const troubleshootingItems: TroubleItem[] = t.raw('troubleshootingItems') as TroubleItem[]

  return (
    <div className="min-h-screen bg-cream-50">
      <div className="max-w-3xl mx-auto px-6 py-20">

        {/* Header */}
        <header className="mb-16">
          <p className="eyebrow text-accent-500 font-semibold text-xs tracking-widest uppercase mb-4">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-terra-800 mb-4">
            {t('h1')}
          </h1>
          <p className="text-lg text-terra-800/60 max-w-xl">
            {t('subtitle')}
          </p>
        </header>

        {/* Quickstart */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-terra-800 mb-6">{t('quickstartHeading')}</h2>
          <ol className="space-y-3">
            {quickstartSteps.map((step, i) => (
              <li key={i} className="flex gap-4 items-start">
                <span className="shrink-0 w-7 h-7 rounded-full bg-accent-500/10 text-accent-600 text-sm font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <p className="text-terra-800 leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <hr className="border-cream-200 mb-16" />

        {/* Modes section */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-terra-800 mb-8">{t('modesHeading')}</h2>

          {/* Tab Audio */}
          <div className="card p-6 mb-6">
            <h3 className="font-semibold text-terra-800 text-lg mb-3">{t('tabAudioHeading')}</h3>
            <div className="text-terra-800/70 leading-relaxed space-y-3 whitespace-pre-line text-sm">
              {t('tabAudioBody')}
            </div>
            <p className="mt-4 text-sm bg-accent-500/8 border border-accent-500/20 rounded-lg px-4 py-3 text-terra-800/70 italic">
              {t('tabAudioNote')}
            </p>
          </div>

          {/* Mic Mode */}
          <div className="card p-6">
            <h3 className="font-semibold text-terra-800 text-lg mb-3">{t('micModeHeading')}</h3>
            <p className="text-terra-800/70 leading-relaxed text-sm">{t('micModeBody')}</p>
          </div>
        </section>

        <hr className="border-cream-200 mb-16" />

        {/* Editing & saving */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-terra-800 mb-8">{t('editingHeading')}</h2>

          <div className="space-y-5">
            <p className="text-terra-800/70 leading-relaxed text-sm">{t('titleBody')}</p>

            <div className="flex items-start gap-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center mt-0.5">
                <SaveIcon className="w-4 h-4 text-terra-800/50" />
              </span>
              <p className="text-terra-800/70 leading-relaxed text-sm">{t('saveBody')}</p>
            </div>

            <div className="flex items-start gap-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center mt-0.5">
                <ClockIcon className="w-4 h-4 text-terra-800/50" />
              </span>
              <p className="text-terra-800/70 leading-relaxed text-sm">{t('historyBody')}</p>
            </div>

            <div>
              <div className="flex items-start gap-3 mb-3">
                <span className="shrink-0 w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center mt-0.5">
                  <ExportIcon className="w-4 h-4 text-terra-800/50" />
                </span>
                <div>
                  <h3 className="font-semibold text-terra-800 mb-1">{t('exportHeading')}</h3>
                  <p className="text-terra-800/70 text-sm mb-2">{t('exportSubtitle')}</p>
                  <ul className="space-y-1.5">
                    {(t.raw('exportOptions') as { label: string; desc: string }[]).map((opt, i) => (
                      <li key={i} className="text-terra-800/70 text-sm leading-relaxed">
                        <strong className="text-terra-800 font-semibold">{opt.label}</strong>
                        {' \u2014 '}{opt.desc}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="shrink-0 w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center mt-0.5">
                <TrashIcon className="w-4 h-4 text-terra-800/50" />
              </span>
              <p className="text-terra-800/70 leading-relaxed text-sm">{t('deleteBody')}</p>
            </div>
          </div>
        </section>

        <hr className="border-cream-200 mb-16" />

        {/* Sync */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-terra-800 mb-4">{t('syncHeading')}</h2>
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-8 h-8 rounded-lg bg-cream-100 flex items-center justify-center mt-0.5">
              <SyncIcon className="w-4 h-4 text-terra-800/50" />
            </span>
            <p className="text-terra-800/70 leading-relaxed text-sm">{t('syncBody')}</p>
          </div>
        </section>

        <hr className="border-cream-200 mb-16" />

        {/* Settings */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-terra-800 mb-8">{t('settingsHeading')}</h2>
          <div className="space-y-6">
            {[
              { heading: t('settingsLangHeading'), body: t('settingsLangBody') },
              { heading: t('settingsAudioHeading'), body: t('settingsAudioBody') },
              { heading: t('settingsDictHeading'), body: t('settingsDictBody') },
              { heading: t('settingsDisplayHeading'), body: t('settingsDisplayBody') },
              { heading: t('settingsStorageHeading'), body: t('settingsStorageBody') },
              { heading: t('settingsLicenseHeading'), body: t('settingsLicenseBody') },
            ].map(({ heading, body }) => (
              <div key={heading} className="border-l-2 border-accent-500/30 pl-4">
                <h3 className="font-semibold text-terra-800 mb-1">{heading}</h3>
                <p className="text-terra-800/70 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="border-cream-200 mb-16" />

        {/* Troubleshooting */}
        <section className="mb-16">
          <h2 className="font-serif text-2xl font-bold text-terra-800 mb-8">{t('troubleshootingHeading')}</h2>
          <div className="space-y-4">
            {troubleshootingItems.map((item, i) => (
              <details key={i} className="group border border-cream-200 rounded-xl overflow-hidden">
                <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-terra-800 text-sm list-none">
                  {item.q}
                  <span className="text-accent-500 group-open:rotate-180 transition-transform shrink-0 ml-4">▼</span>
                </summary>
                <div className="px-5 pb-5 text-terra-800/70 text-sm leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        <hr className="border-cream-200 mb-16" />

        {/* Support */}
        <section className="text-center">
          <h2 className="font-serif text-2xl font-bold text-terra-800 mb-3">{t('supportHeading')}</h2>
          <p className="text-terra-800/60 mb-6">{t('supportBody')}</p>
          <Link
            href="/contact"
            className="btn-primary inline-block px-8 py-3 rounded-full font-bold"
          >
            Contact us
          </Link>
        </section>

      </div>
    </div>
  )
}
