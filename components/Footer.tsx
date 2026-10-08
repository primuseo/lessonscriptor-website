import { useTranslations } from 'next-intl'
import NextLink from 'next/link'
import { Link } from '@/navigation'

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer')
  const s = useTranslations('site')
  const updates = useTranslations('whatsNew')
  const base = `/${locale}`

  return (
    <footer className="bg-primary dark:bg-card text-primary-foreground/40 dark:text-card-foreground/40 py-14 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-serif text-lg font-semibold text-primary-foreground dark:text-card-foreground mb-2">
              Lesson<span className="text-accent">Scriptor</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">{t('tagline')}</p>
            <a
              href="https://chromewebstore.google.com/detail/lessonscriptor/apofgfejefeeepabfbaabdijnokbpcgp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs bg-accent text-accent-foreground px-4 py-2 rounded-full hover:bg-accent-hover transition-colors"
            >
              {s('footerInstall')}
            </a>
          </div>

          {/* Product */}
          <div>
            <div className="text-primary-foreground dark:text-card-foreground font-semibold text-sm mb-4">{t('product')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/transcribe-youtube-video" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">YouTube</Link></li>
              <li><Link href="/live-captions-chrome" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Live Captions</Link></li>
              <li><Link href="/transcribe-video-to-text" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Video to Text</Link></li>
              <li><Link href="/compare/otter-ai-alternative" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">vs Otter.ai</Link></li>
              <li><Link href="/for-adhd-students" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">For ADHD Students</Link></li>
              <li><Link href="/for-teachers" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">For Teachers</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="text-primary-foreground dark:text-card-foreground font-semibold text-sm mb-4">{t('resources')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">{t('blog')}</Link></li>
              <li><Link href="/whats-new" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">{updates('h1')}</Link></li>
              <li><NextLink href={`${base}/blog/how-to-transcribe-lecture-videos`} className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">How to Transcribe Lectures</NextLink></li>
              <li><NextLink href={`${base}/blog/how-to-take-notes-with-adhd`} className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Note-taking for ADHD</NextLink></li>
              <li><NextLink href={`${base}/blog/best-chrome-extensions-live-captions`} className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Best Chrome Live Captions</NextLink></li>
              <li><Link href="/onboarding" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">{t('guide')}</Link></li>
              <li><Link href="/contact" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">{t('support')}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">{t('privacy')}</Link></li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <div className="text-primary-foreground dark:text-card-foreground font-semibold text-sm mb-4">{t('languages')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" locale="en" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">English</Link></li>
              <li><Link href="/" locale="fr" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Français</Link></li>
              <li><Link href="/" locale="es" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Español</Link></li>
              <li><Link href="/" locale="pt" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Português</Link></li>
              <li><Link href="/" locale="de" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">Deutsch</Link></li>
              <li><Link href="/" locale="zh" className="hover:text-primary-foreground dark:hover:text-card-foreground transition-colors">中文</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 dark:border-card-foreground/10 pt-8 text-xs flex flex-col md:flex-row justify-between gap-4">
          <p>{t('copyright')}</p>
          <p>{s('footerPrivacy')}</p>
        </div>
      </div>
    </footer>
  )
}
