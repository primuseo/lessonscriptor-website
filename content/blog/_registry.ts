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
  'otter-ai-alternative-for-students',
  'best-speech-to-text-chrome-extensions',
  // Live captions pillar cluster
  'chrome-live-captions-not-working',
  'best-chrome-extensions-live-captions',
  'chrome-live-captions-headphones',
  'live-captions-zoom-recordings-chrome',
  'live-captions-other-languages-chrome',
  'chrome-live-captions-vs-lessonscriptor',
  // YouTube transcript cluster
  'how-to-download-youtube-transcript',
] as const

export type BlogSlug = (typeof BLOG_SLUGS)[number]

export const BLOG_CATEGORIES = [
  'ADHD & Studying',
  'Learning & Neurodiversity',
  'Transcription & Tools',
] as const

export type BlogCategory = (typeof BLOG_CATEGORIES)[number]
