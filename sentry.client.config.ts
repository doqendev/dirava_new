import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Only enable in production
  enabled: process.env.NODE_ENV === 'production',

  // Performance monitoring sample rate (10% of transactions)
  tracesSampleRate: 0.1,

  // Session replay DISABLED by default - enabled only with analytics consent
  replaysSessionSampleRate: 0,
  replaysOnErrorSampleRate: 0,

  // Don't send PII
  sendDefaultPii: false,

  // Filter out noisy errors
  ignoreErrors: [
    'ResizeObserver loop',
    'Non-Error promise rejection',
    'Network request failed',
    'Load failed',
    'cancelled',
  ],

  integrations: (integrations) => {
    // Only add replay integration if analytics consent is given
    if (hasAnalyticsConsent()) {
      return [...integrations, Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      })]
    }
    return integrations
  },
})

/**
 * Check if the user has given analytics consent via the cookie consent store.
 * Reads from localStorage (Zustand persist middleware).
 */
function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem('mizoke-cookie-consent')
    if (!stored) return false
    const parsed = JSON.parse(stored)
    return parsed?.state?.consentGiven === true && parsed?.state?.preferences?.analytics === true
  } catch {
    return false
  }
}

// Listen for consent changes and dynamically enable replay
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'mizoke-cookie-consent') {
      if (hasAnalyticsConsent()) {
        const client = Sentry.getClient()
        if (client && !client.getIntegrationByName('Replay')) {
          client.addIntegration(Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true,
          }))
        }
      }
    }
  })
}
