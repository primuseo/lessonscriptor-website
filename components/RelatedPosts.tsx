import Link from 'next/link'
import { getPost } from '@/lib/blog'
import { getLocalizedSlug } from '@/content/blog/_slug-map'

export default function RelatedPosts({
  slugs,
  locale,
  heading,
  readMore,
}: {
  slugs: string[]
  locale: string
  heading: string
  readMore: string
}) {
  const posts = slugs
    .map(slug => ({ slug, post: getPost(slug, locale) }))
    .filter(({ post }) => post !== null)

  if (posts.length === 0) return null

  return (
    <section className="px-4 py-16 bg-cream-100">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-terra-800 mb-8 text-center">{heading}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {posts.map(({ slug, post }) => {
            const href = `/${locale}/blog/${getLocalizedSlug(slug, locale)}`
            const intro = typeof post!.intro === 'string'
              ? post!.intro
              : (post!.intro as any).text || (post!.intro as any).paragraph_1 || ''

            return (
              <Link
                key={slug}
                href={href}
                className="group block bg-white rounded-xl border border-cream-200 p-6 hover:border-accent-500/30 hover:shadow-md transition-all no-underline"
              >
                <span className="text-[10px] font-semibold bg-accent-500/10 text-accent-600 px-2 py-0.5 rounded-full mb-3 inline-block">
                  {post!.category_tag}
                </span>
                <h3 className="text-base font-bold text-terra-800 group-hover:text-accent-600 transition-colors mb-2">
                  {post!.h1}
                </h3>
                <p className="text-sm text-terra-800/50 line-clamp-3 mb-4">
                  {intro.slice(0, 180)}{intro.length > 180 ? '…' : ''}
                </p>
                <span className="text-xs font-semibold text-accent-500 group-hover:text-accent-600 transition-colors">
                  {readMore} →
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
