import { Metadata } from 'next'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import { getAllPostsMeta } from '@/lib/blog'
import { BLOG_CATEGORIES } from '@/content/blog/_registry'
import CategoryFilter from '@/components/blog/CategoryFilter'
import CTASection from '@/components/CTASection'

const LOCALES = ['en', 'fr', 'es', 'pt', 'de', 'zh']

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string }
}): Promise<Metadata> {
  const t = await getTranslations('blog.hub')
  const base = locale === 'en' ? 'https://lessonscriptor.com' : `https://lessonscriptor.com/${locale}`
  return {
    title: t('metaTitle'),
    description: t('metaDesc'),
    openGraph: {
      title: t('metaTitle'),
      description: t('metaDesc'),
      type: 'website',
      url: `${base}/blog`,
    },
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => [
          l,
          l === 'en' ? 'https://lessonscriptor.com/blog' : `https://lessonscriptor.com/${l}/blog`,
        ])
      ),
    },
  }
}

export default async function BlogHubPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('blog.hub')
  const posts = getAllPostsMeta(locale)

  const categories = Array.from(new Set(posts.map((p) => p.category_tag))).filter((c) =>
    (BLOG_CATEGORIES as readonly string[]).includes(c)
  )

  return (
    <>
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <p className="eyebrow text-accent-500 font-semibold text-xs tracking-widest uppercase mb-3">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-terra-800 mb-4">
            {t('title')}
          </h1>
          <p className="text-terra-800/50 text-lg max-w-2xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        <CategoryFilter
          posts={posts}
          categories={categories}
          locale={locale}
          allLabel={t('all')}
          readMore={t('readMore')}
          minRead={t('minRead')}
        />
      </section>

      <CTASection />
    </>
  )
}
