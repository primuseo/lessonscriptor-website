import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer')
  const base = locale === 'en' ? '' : `/${locale}`

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
              Install Free
            </a>
          </div>

          {/* Product */}
          <div>
            <div className="text-cream-100 font-semibold text-sm mb-4">{t('product')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href={`${base}/transcribe-youtube-video`} className="hover:text-cream-100 transition-colors">YouTube</Link></li>
              <li><Link href={`${base}/live-captions-chrome`} className="hover:text-cream-100 transition-colors">Live Captions</Link></li>
              <li><Link href={`${base}/transcribe-video-to-text`} className="hover:text-cream-100 transition-colors">Video to Text</Link></li>
              <li><Link href={`${base}/compare/otter-ai-alternative`} className="hover:text-cream-100 transition-colors">vs Otter.ai</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <div className="text-cream-100 font-semibold text-sm mb-4">{t('resources')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href={`${base}/blog/how-to-transcribe-lecture-videos`} className="hover:text-cream-100 transition-colors">Blog</Link></li>
              <li>
                <a href="https://github.com/primuseo/chrome-video-live-transcription" target="_blank" rel="noopener noreferrer" className="hover:text-cream-100 transition-colors">
                  {t('github')}
                </a>
              </li>
              <li><Link href={`${base}/contact`} className="hover:text-cream-100 transition-colors">{t('support')}</Link></li>
              <li><Link href={`${base}/privacy`} className="hover:text-cream-100 transition-colors">{t('privacy')}</Link></li>
              <li><Link href={`${base}/terms`} className="hover:text-cream-100 transition-colors">{t('terms')}</Link></li>
            </ul>
          </div>

          {/* Languages */}
          <div>
            <div className="text-cream-100 font-semibold text-sm mb-4">{t('languages')}</div>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-cream-100 transition-colors">English</Link></li>
              <li><Link href="/fr" className="hover:text-cream-100 transition-colors">Français</Link></li>
              <li><Link href="/es" className="hover:text-cream-100 transition-colors">Español</Link></li>
              <li><Link href="/pt" className="hover:text-cream-100 transition-colors">Português</Link></li>
              <li><Link href="/de" className="hover:text-cream-100 transition-colors">Deutsch</Link></li>
              <li><Link href="/zh" className="hover:text-cream-100 transition-colors">中文</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-cream-200/10 pt-8 text-xs flex flex-col md:flex-row justify-between gap-4">
          <p>{t('copyright')}</p>
          <p>No tracking · No cookies</p>
        </div>
      </div>
    </footer>
  )
}
