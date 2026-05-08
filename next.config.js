const { withSentryConfig } = require('@sentry/nextjs')
const createNextIntlPlugin = require('next-intl/plugin')

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const cspReportUri = process.env.CSP_REPORT_URI
const isDevelopment = process.env.NODE_ENV === 'development'

const enforcedCsp = [
  "default-src 'self'",
  [
    "script-src 'self' 'unsafe-inline'",
    isDevelopment ? "'unsafe-eval'" : '',
    'https://va.vercel-scripts.com',
    'https://cdn.vercel-insights.com',
    'https://challenges.cloudflare.com',
  ].filter(Boolean).join(' '),
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://cdn.shopify.com data: blob:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.shopify.com https://*.myshopify.com https://*.sentry.io https://va.vercel-scripts.com https://vitals.vercel-insights.com https://trackclear.io https://www.trackclear.io https://api.trackclear.io https://challenges.cloudflare.com wss://*.shopify.com",
  "frame-src https://challenges.cloudflare.com",
  "media-src 'self' blob:",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ')

const reportOnlyCsp = [
  "default-src 'self'",
  "script-src 'self' https://va.vercel-scripts.com https://cdn.vercel-insights.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https://cdn.shopify.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.shopify.com https://*.myshopify.com https://*.sentry.io https://va.vercel-scripts.com https://vitals.vercel-insights.com https://trackclear.io https://www.trackclear.io https://api.trackclear.io https://challenges.cloudflare.com wss://*.shopify.com",
  "frame-src https://challenges.cloudflare.com",
  "media-src 'self'",
  "worker-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  cspReportUri ? `report-uri ${cspReportUri}` : '',
].filter(Boolean).join('; ')

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
    qualities: [80, 85],
  },
  // Note: typedRoutes disabled due to dynamic route complexity
  // experimental: {
  //   typedRoutes: true,
  // },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'mizoke.com' }],
        destination: 'https://www.mizoke.com/:path*',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/icon.svg',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/meta.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=3600, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Content-Security-Policy', value: enforcedCsp },
          { key: 'Content-Security-Policy-Report-Only', value: reportOnlyCsp },
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
