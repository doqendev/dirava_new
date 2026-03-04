const { withSentryConfig } = require('@sentry/nextjs')
const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        pathname: '/s/files/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Note: typedRoutes disabled due to dynamic route complexity
  // experimental: {
  //   typedRoutes: true,
  // },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Content-Security-Policy-Report-Only',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://cdn.vercel-insights.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' https://cdn.shopify.com data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.shopify.com https://*.sentry.io https://va.vercel-scripts.com https://vitals.vercel-insights.com wss://*.shopify.com",
              "media-src 'self' blob:",
              "worker-src 'self' blob:",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; ')
          },
        ],
      },
    ]
  },
}

module.exports = withSentryConfig(withNextIntl(nextConfig), {
  // Suppresses source map upload logs during build
  silent: true,

  // Upload source maps for better stack traces
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Only upload source maps when auth token is available
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements
  disableLogger: true,

  // Skip source map upload if no auth token (e.g., local dev)
  skipEnvironmentCheck: true,
})
