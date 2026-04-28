import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import type { Metadata } from 'next'

export async function generateMetadata({ params: { locale } }: { params: { locale: string } }): Promise<Metadata> {
  const path = '/privacy'
  const locales = ['en', 'fr', 'es', 'pt', 'de', 'zh']
  const t = await getTranslations({ locale, namespace: 'privacy' })
  return {
    title: t('h1'),
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
  return ['en', 'fr', 'es', 'pt', 'de', 'zh'].map(locale => ({ locale }))
}

export default async function PrivacyPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('privacy')

  return (
    <article className="max-w-3xl mx-auto px-4 py-16">
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-terra-800 mb-4">
          {t('h1')}
        </h1>
        <p className="text-terra-800/60 italic">
          {t('lastUpdated')}: April 29, 2026
        </p>
      </header>

      <div className="prose prose-lg max-w-none space-y-8 text-light-txt leading-relaxed">

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('whoWeAre')}</h2>
          <p>
            {t('whoWeAreBody')} <a href="mailto:contact@lessonscriptor.com" className="text-accent-500 hover:underline">contact@lessonscriptor.com</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('whatWeCollect')}</h2>
          <p><strong>{t('whatWeCollectBody1')}</strong></p>
          <p><strong>Microphone Mode:</strong> {t('whatWeCollectMic')}</p>
          <p><strong>Tab Audio Mode:</strong> {t('whatWeCollectTab')}</p>
          <p>{t('whatWeCollectNoTracking')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('localStorage')}</h2>
          <p>{t('localStorageBody')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('paymentsTitle')}</h2>
          <p>{t('paymentsBody1')}</p>
          <p>
            {t('paymentsBody2')} <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer" className="text-accent-500 hover:underline">LemonSqueezy</a>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('thirdParty')}</h2>
          <p><strong>Groq:</strong> {t('thirdPartyGroq')} <a href="https://groq.com/privacy-policy/" target="_blank" rel="noopener noreferrer" className="text-accent-500 hover:underline">Groq</a>.</p>
          <p><strong>LemonSqueezy:</strong> {t('thirdPartyLemon')}</p>
          <p><strong>Google Search Console:</strong> {t('thirdPartyGSC')}</p>
          <p>{t('thirdPartyNoShare')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('gdprRights')}</h2>
          <p>{t('gdprIntro')}</p>
          <ul className="list-disc list-inside space-y-2 ml-2">
            <li>{t('gdprRight1')}</li>
            <li>{t('gdprRight2')}</li>
            <li>{t('gdprRight3')}</li>
            <li>{t('gdprRight4')}</li>
            <li>{t('gdprRight5')}</li>
          </ul>
          <p className="mt-4">{t('gdprNote')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('dataRetention')}</h2>
          <p>{t('dataRetentionBody')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('changes')}</h2>
          <p>{t('changesBody')}</p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-terra-800 mb-4">{t('contactTitle')}</h2>
          <p>{t('contactBody')}</p>
          <p className="mt-4 font-semibold">
            LessonScriptor<br />
            Email: <a href="mailto:contact@lessonscriptor.com" className="text-accent-500 hover:underline">contact@lessonscriptor.com</a>
          </p>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-cream-200 text-sm text-terra-800/60 italic">
        <p>{t('englishNote')}</p>
      </div>
    </article>
  )
}
