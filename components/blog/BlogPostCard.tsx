import Link from 'next/link'
import type { BlogPostMeta } from '@/lib/blog'
import { getLocalizedSlug } from '@/content/blog/_slug-map'

export default function BlogPostCard({
  post,
  locale,
  readMore,
  minRead,
}: {
  post: BlogPostMeta
  locale: string
  readMore: string
  minRead: string
}) {
  const base = locale === 'en' ? '' : `/${locale}`
  const href = `${base}/blog/${getLocalizedSlug(post.slug, locale)}`

  return (
    <Link
      href={href}
      className="group block bg-white rounded-xl border border-cream-200 p-6 hover:border-accent-500/30 hover:shadow-md transition-all no-underline"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-semibold bg-accent-500/10 text-accent-600 px-2 py-0.5 rounded-full">
          {post.category_tag}
        </span>
        <span className="text-[10px] text-terra-800/40">
          {post.reading_time_min} {minRead}
        </span>
      </div>

      <h2 className="text-base font-bold text-terra-800 group-hover:text-accent-600 transition-colors mb-2 line-clamp-2">
        {post.h1}
      </h2>

      <p className="text-sm text-terra-800/50 line-clamp-3 mb-4">
        {post.intro.slice(0, 200)}
        {post.intro.length > 200 ? '...' : ''}
      </p>

      <span className="text-xs font-semibold text-accent-500 group-hover:text-accent-600 transition-colors">
        {readMore} →
      </span>
    </Link>
  )
}
