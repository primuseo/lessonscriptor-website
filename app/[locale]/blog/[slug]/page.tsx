import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, unstable_setRequestLocale } from 'next-intl/server'
import { getPost } from '@/lib/blog'
import { BLOG_SLUGS } from '@/content/blog/_registry'
import { getCanonicalSlug, getLocalizedSlug } from '@/content/blog/_slug-map'
import BlogSectionRenderer from '@/components/blog/BlogSectionRenderer'
import TldrSection from '@/components/blog/TldrSection'
import SummarySection from '@/components/blog/SummarySection'
import { Paragraphs } from '@/components/blog/InlineMarkdown'
import CTASection from '@/components/CTASection'

const LOCALES = ['en', 'fr', 'es', 'pt', 'de', 'zh']

export function generateStaticParams() {
  return BLOG_SLUGS.flatMap((slug) =>
    LOCALES.map((locale) => ({ locale, slug: getLocalizedSlug(slug, locale) }))
  )
}

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string }
}): Promise<Metadata> {
  const canonical = getCanonicalSlug(slug, locale) || slug
  const post = getPost(canonical, locale)
  if (!post) return {}
  const base = `https://lessonscriptor.com/${locale}`
  return {
    title: post.meta.title,
    description: post.meta.description,
    keywords: post.meta.keywords,
    openGraph: {
      title: post.meta.title,
      description: post.meta.description,
      type: 'article',
      url: `${base}/blog/${slug}`,
      ...(post.hero_image && {
        images: [{ url: post.hero_image.url, width: post.hero_image.width, height: post.hero_image.height }],
      }),
    },
    alternates: {
      languages: Object.fromEntries(
        LOCALES.map((l) => {
          const localSlug = getLocalizedSlug(canonical, l)
          return [l, `https://lessonscriptor.com/${l}/blog/${localSlug}`]
        })
      ),
    },
  }
}

function FAQBlock({ faq }: { faq: NonNullable<ReturnType<typeof getPost>>['faq'] }) {
  if (!faq) return null
  const questions = faq.questions || faq.items?.map((i) => ({
    question: (i as Record<string, string>).q || (i as Record<string, string>).question,
    answer: (i as Record<string, string>).a || (i as Record<string, string>).answer,
  }))
  if (!questions || questions.length === 0) return null
  const heading = faq.heading || faq.headline || faq.section_title || 'FAQ'

  return (
    <section className="mb-12">
      <h2 className="text-xl font-bold text-terra-800 mt-10 mb-6">{heading}</h2>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <details key={i} className="group bg-white rounded-xl border border-cream-200 p-4">
            <summary className="cursor-pointer font-semibold text-terra-800 text-sm list-none flex items-center justify-between">
              {q.question}
              <span className="text-accent-500 transition-transform group-open:rotate-45 text-lg ml-2">+</span>
            </summary>
            <p className="mt-3 text-sm text-terra-800/70 leading-relaxed">{q.answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

function StatsBar({ stats }: { stats: Array<Record<string, unknown>> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <div key={i} className="bg-white rounded-xl border border-cream-200 p-4 text-center">
          <div className="text-2xl font-bold text-accent-500">
            {(s.stat || s.number) as string}
          </div>
          <div className="text-xs text-terra-800/60 mt-1">
            {(s.label || s.claim) as string}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function BlogPostPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string }
}) {
  unstable_setRequestLocale(locale)
  const t = await getTranslations('blog')
  const canonical = getCanonicalSlug(slug, locale) || slug
  const post = getPost(canonical, locale)
  if (!post) notFound()

  const schemas = post.schemas || []
  const baseUrl = `https://lessonscriptor.com/${locale}`

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema).replace(
              /"url":"\/([^"]*?)"/g,
              `"url":"${baseUrl}/$1"`
            ),
          }}
        />
      ))}

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-semibold bg-accent-500/10 text-accent-600 px-3 py-1 rounded-full">
              {post.category_tag}
            </span>
            <span className="text-xs text-terra-800/40">
              {post.reading_time_min} min read
            </span>
            {post.published_at && (
              <time className="text-xs text-terra-800/40" dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString(locale, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </time>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-terra-800 leading-tight mb-4">
            {post.h1}
          </h1>
          {post.author && (
            <p className="text-sm text-terra-800/50">
              {t('byAuthor', { author: post.author.name })}
            </p>
          )}
        </div>

        {/* Intro */}
        {post.intro && (
          <div className="text-lg text-terra-800/70 leading-relaxed mb-8 border-l-4 border-accent-500/30 pl-4">
            <Paragraphs text={post.intro} />
          </div>
        )}

        {/* Stats */}
        {post.stats && post.stats.length > 0 && <StatsBar stats={post.stats} />}

        {/* TL;DR */}
        {post.tldr && <TldrSection data={post.tldr as never} />}

        {/* Sections */}
        {post.sections.map((section, i) => (
          <BlogSectionRenderer key={i} section={section} />
        ))}

        {/* Summary */}
        {post.summary && <SummarySection data={post.summary as never} />}

        {/* FAQ */}
        <FAQBlock faq={post.faq} />
      </article>

      <CTASection />
    </>
  )
}
