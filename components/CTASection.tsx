import { useTranslations } from 'next-intl'

export default function CTASection() {
  const t = useTranslations('site')
  return (
    <section className="bg-terra-900 py-24 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-cream-100 mb-5 leading-tight">
          Because love means you don&apos;t have to write everything down{' '}
          <em className="italic text-accent-500">by hand.</em>
        </h2>
        <p className="text-cream-200/60 text-lg mb-10 max-w-xl mx-auto">
          Free to install. Free to use. Built for learners who deserve better tools.
        </p>
        <a
          href="https://chrome.google.com/webstore"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-terra-800 font-bold rounded-full hover:bg-cream-100 transition-all text-lg shadow-lg hover:scale-[1.02]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
          </svg>
          {t('installCTA')}
        </a>
      </div>
    </section>
  )
}
