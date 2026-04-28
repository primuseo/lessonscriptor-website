export const BLOG_SLUGS = [
  'adhd-note-taking-template',
  'adhd-university-accommodation-tech',
  'adhd-youtube-transcription',
  'best-ai-note-taker-adhd',
  'best-apps-adhd-students-2026',
  'best-chrome-extensions-adhd-students',
  'how-to-focus-online-lectures-adhd',
  'how-to-take-notes-with-adhd',
  'how-to-transcribe-lecture-videos',
  'neurodivergent-study-tools',
] as const

export type BlogSlug = (typeof BLOG_SLUGS)[number]

export const BLOG_CATEGORIES = [
  'ADHD & Studying',
  'Learning & Neurodiversity',
  'Transcription & Tools',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]
