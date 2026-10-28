import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-hosted build (Dockerfile sets this); Vercel builds are unaffected.
  ...(process.env.NEXT_OUTPUT_STANDALONE === '1' ? { output: 'standalone' } : {}),
  images: {
    unoptimized: false,
  },
  async redirects() {
    return [
      // 2026-10-28: zoom-meeting-transcription-free merged into zoom-google-meet-transcript-for-students
      { source: '/en/blog/zoom-meeting-transcription-free', destination: '/en/blog/zoom-google-meet-transcript-for-students', permanent: true },
      { source: '/fr/blog/transcription-reunion-zoom-gratuite', destination: '/fr/blog/transcription-zoom-google-meet-etudiants', permanent: true },
      { source: '/fr/blog/zoom-meeting-transcription-free', destination: '/fr/blog/transcription-zoom-google-meet-etudiants', permanent: true },
      { source: '/es/blog/transcripcion-reunion-zoom-gratis', destination: '/es/blog/transcripcion-zoom-google-meet-estudiantes', permanent: true },
      { source: '/es/blog/zoom-meeting-transcription-free', destination: '/es/blog/transcripcion-zoom-google-meet-estudiantes', permanent: true },
      { source: '/pt/blog/transcricao-reuniao-zoom-gratis', destination: '/pt/blog/transcricao-zoom-google-meet-estudantes', permanent: true },
      { source: '/pt/blog/zoom-meeting-transcription-free', destination: '/pt/blog/transcricao-zoom-google-meet-estudantes', permanent: true },
      { source: '/de/blog/zoom-meeting-transkription-kostenlos', destination: '/de/blog/zoom-google-meet-transkript-studenten', permanent: true },
      { source: '/de/blog/zoom-meeting-transcription-free', destination: '/de/blog/zoom-google-meet-transkript-studenten', permanent: true },
      { source: '/zh/blog/zoom-huiyi-zhuanlu-mianfei', destination: '/zh/blog/zoom-google-meet-zhuanlu-xuesheng', permanent: true },
      { source: '/zh/blog/zoom-meeting-transcription-free', destination: '/zh/blog/zoom-google-meet-zhuanlu-xuesheng', permanent: true },
      // ES slug said text-to-speech; corrected 2026-10-28
      { source: '/es/blog/mejores-extensiones-chrome-texto-a-voz', destination: '/es/blog/mejores-extensiones-chrome-voz-a-texto', permanent: true },
      { source: '/blog/zoom-meeting-transcription-free', destination: '/en/blog/zoom-google-meet-transcript-for-students', permanent: true },
    ]
  },
}

export default withNextIntl(nextConfig)
