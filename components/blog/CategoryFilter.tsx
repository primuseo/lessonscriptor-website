'use client'
import { useState } from 'react'
import BlogPostCard from './BlogPostCard'
import type { BlogPostMeta } from '@/lib/blog'

export default function CategoryFilter({
  posts,
  categories,
  locale,
  allLabel,
  readMore,
  minRead,
}: {
  posts: BlogPostMeta[]
  categories: string[]
  locale: string
  allLabel: string
  readMore: string
  minRead: string
}) {
  const [active, setActive] = useState<string | null>(null)
  const filtered = active ? posts.filter((p) => p.category_tag === active) : posts

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        <button
          onClick={() => setActive(null)}
          className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
            active === null
              ? 'bg-accent-500 text-white'
              : 'bg-cream-100 text-terra-800/50 hover:text-terra-800'
          }`}
        >
          {allLabel}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(active === cat ? null : cat)}
            className={`text-xs font-semibold px-4 py-2 rounded-full transition-colors ${
              active === cat
                ? 'bg-accent-500 text-white'
                : 'bg-cream-100 text-terra-800/50 hover:text-terra-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((post) => (
          <BlogPostCard
            key={post.slug}
            post={post}
            locale={locale}
            readMore={readMore}
            minRead={minRead}
          />
        ))}
      </div>
    </>
  )
}
