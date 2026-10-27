import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin()

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-hosted build (Dockerfile sets this); Vercel builds are unaffected.
  ...(process.env.NEXT_OUTPUT_STANDALONE === '1' ? { output: 'standalone' } : {}),
  images: {
    unoptimized: false,
  },
}

export default withNextIntl(nextConfig)
