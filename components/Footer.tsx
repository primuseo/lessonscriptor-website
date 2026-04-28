import { useTranslations } from 'next-intl'
import NextLink from 'next/link'
import { Link } from '@/navigation'

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer')
  const s = useTranslations('site')
  const base = `/${locale}`

  return (
    <footer className="bg-terra-950 text-cream-200/40 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="font-serif text-lg font-bold text-cream-100 mb-2">
              Lesson<span className="text-accent-500">Scriptor</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">{t('tagline')}</p>
            <a
              href="https://chrome.google.com/webstore"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs bg-accent-500 text-white px-4 py-2 rounded-full hover:bg-accent-600 transition-colors"
            >
              {s('footerInstall')}
            </a>
          </div>

          {/* Product */}
          <div>
            <div className="text-cream-100 font-semibold text-sm mb-4">{t('product')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/transcribe-youtube-video" className="hover:text-cream-100 transition-colors">YouTube</Link></li>
              <li><Link href="/live-captions-chrome" className="hover:text-cream-100 transition-colors">Live Captions</Link></li>
              <li><Link href="/transcribe-video-to-text" className="hover:text-cream-100 transition-colors">Video to Text</Link></li>
              <li><Link href="/compare/otter-ai-alternative" className="hover:text-cream-100 transition-colors">vs Otter.ai</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="text-cream-100 font-semibold text-sm mb-4">{t('resources')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-cream-100 transition-colors">{t('blog')}</Link></li>
              <li><NextLink href={`${base}/blog/how-to-transcribe-lecture-videos`} className="hover:text-cream-100 transition-colors">How to Transcribe Lectures</NextLink></li>
              <li><NextLink href={`${base}/blog/how-to-take-notes-with-adhd`} className="hover:text-cream-100 transition-colors">Note-taking for ADHD</NextLink></li>
              <li><NextLink href={`${base}/blog/best-chrome-extensions-live-captions`} className="hover:text-cream-100 transition-colors">Best Chrome Live Captions</NextLink></li>
              <li><Link href="/contact" className="hover:text-cream-100 transition-colors">{t('support')}</Link></li>
              <li><Link href="/privacy" className="hover:text-cream-100 transition-colors">{t('privacy')}</Link></li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <div className="text-cream-100 font-semibold text-sm mb-4">{t('languages')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" locale="en" className="hover:text-cream-100 transition-colors">English</Link></li>
              <li><Link href="/" locale="fr" className="hover:text-cream-100 transition-colors">Français</Link></li>
              <li><Link href="/" locale="es" className="hover:text-cream-100 transition-colors">Español</Link></li>
              <li><Link href="/" locale="pt" className="hover:text-cream-100 transition-colors">Português</Link></li>
              <li><Link href="/" locale="de" className="hover:text-cream-100 transition-colors">Deutsch</Link></li>
              <li><Link href="/" locale="zh" className="hover:text-cream-100 transition-colors">中文</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream-200/10 pt-8 text-xs flex flex-col md:flex-row justify-between gap-4">
          <p>{t('copyright')}</p>
          <p>{s('footerPrivacy')}</p>
        </div>
      </div>
    </footer>
  )
}
