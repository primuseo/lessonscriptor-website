import { useTranslations } from 'next-intl'

export default function CTASection() {
  const t = useTranslations('site')
  return (
    <section className="bg-blue-600 py-20 px-4 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
        Stop writing. Start learning.
      </h2>
      <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
        Free mode is free forever. No sign-up, no credit card, no subscription.
      </p>
      <a
        href="https://chrome.google.com/webstore"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors text-lg shadow-lg"
      >
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
        </svg>
        {t('installCTA')}
      </a>
    </section>
  )
}
