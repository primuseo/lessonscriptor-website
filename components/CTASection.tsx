import { useTranslations } from 'next-intl'

export default function CTASection() {
  const t = useTranslations('site')
  return (
    <section className="bg-primary py-24 px-4 text-center">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-5 leading-tight">
          {t('cta.title')}{' '}
          <em className="italic text-accent">{t('cta.titleEm')}</em>
        </h2>
        <p className="text-primary-foreground/60 text-lg mb-10 max-w-xl mx-auto">
          {t('cta.subtitle')}
        </p>
        <a
          href="https://chromewebstore.google.com/detail/lessonscriptor/apofgfejefeeepabfbaabdijnokbpcgp"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-8 py-4 bg-white text-foreground font-bold rounded-full hover:bg-muted transition-all text-lg shadow-lg hover:scale-[1.02]"
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
