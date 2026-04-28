import { createNavigation } from 'next-intl/navigation'
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'fr', 'es', 'pt', 'de', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/transcribe-youtube-video': {
      en: '/transcribe-youtube-video',
      fr: '/transcrire-video-youtube',
      es: '/transcribir-video-youtube',
      pt: '/transcrever-video-youtube',
      de: '/youtube-video-transkribieren',
      zh: '/transcribe-youtube-video',
    },
    '/live-captions-chrome': {
      en: '/live-captions-chrome',
      fr: '/sous-titres-en-direct-chrome',
      es: '/subtitulos-en-directo-chrome',
      pt: '/legendas-ao-vivo-chrome',
      de: '/live-untertitel-chrome',
      zh: '/live-captions-chrome',
    },
    '/transcribe-video-to-text': {
      en: '/transcribe-video-to-text',
      fr: '/transcrire-video-en-texte',
      es: '/transcribir-video-a-texto',
      pt: '/transcrever-video-para-texto',
      de: '/video-in-text-transkribieren',
      zh: '/transcribe-video-to-text',
    },
    '/compare/otter-ai-alternative': {
      en: '/compare/otter-ai-alternative',
      fr: '/comparer/alternative-otter-ai',
      es: '/comparar/alternativa-otter-ai',
      pt: '/comparar/alternativa-otter-ai',
      de: '/vergleich/otter-ai-alternative',
      zh: '/compare/otter-ai-alternative',
    },
    '/for-adhd-students': '/for-adhd-students',
    '/blog': '/blog',
    '/blog/[slug]': '/blog/[slug]',
    '/contact': '/contact',
    '/privacy': '/privacy',
    '/terms': '/terms',
  },
})

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)
