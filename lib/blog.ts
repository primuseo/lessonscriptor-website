import fs from 'fs'
import path from 'path'
import { BLOG_SLUGS, type BlogSlug } from '@/content/blog/_registry'

export interface BlogPostMeta {
  slug: string
  h1: string
  category_tag: string
  reading_time_min: number
  published_at: string
  updated_at?: string
  meta: {
    title: string
    description: string
    keywords?: string[]
  }
  intro: string
  hero_image?: {
    url: string
    alt?: string
    alt_text?: string
    width?: number
    height?: number
  }
}

export interface BlogPost extends BlogPostMeta {
  author?: {
    name: string
    bio?: string
    title?: string
    image?: string
  }
  tldr?: Record<string, unknown>
  stats?: Array<Record<string, unknown>>
  sections: Array<Record<string, unknown>>
  faq?: {
    heading?: string
    headline?: string
    section_title?: string
    questions?: Array<{ question: string; answer: string }>
    items?: Array<{ q: string; a: string }>
  }
  summary?: Record<string, unknown>
  cta?: Record<string, unknown>
  schemas?: Array<Record<string, unknown>>
}

const CONTENT_DIR = path.join(process.cwd(), 'content', 'blog')

export function getPost(slug: string, locale: string): BlogPost | null {
  const filePath = path.join(CONTENT_DIR, slug, `${locale}.json`)
  if (!fs.existsSync(filePath)) {
    if (locale !== 'en') return getPost(slug, 'en')
    return null
  }
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  return normalizePost(raw, slug)
}

export function getAllPostsMeta(locale: string): BlogPostMeta[] {
  const results: BlogPostMeta[] = []
  for (const slug of BLOG_SLUGS) {
    const post = getPost(slug, locale)
    if (!post) continue
    results.push({
      slug: post.slug,
      h1: post.h1,
      category_tag: post.category_tag,
      reading_time_min: post.reading_time_min,
      published_at: post.published_at,
      updated_at: post.updated_at,
      meta: post.meta,
      intro: extractIntroText(post.intro),
      hero_image: post.hero_image,
    })
  }
  results.sort((a, b) => b.published_at.localeCompare(a.published_at))
  return results
}

function normalizePost(raw: Record<string, unknown>, slug: string): BlogPost {
  return {
    ...raw,
    slug: (raw.slug as string) || slug,
    intro: extractIntroText(raw.intro),
  } as BlogPost
}

function extractIntroText(intro: unknown): string {
  if (typeof intro === 'string') return intro
  if (intro && typeof intro === 'object') {
    const obj = intro as Record<string, unknown>
    if (typeof obj.text === 'string') return obj.text
    if (typeof obj.paragraph_1 === 'string') return obj.paragraph_1
  }
  return ''
}
