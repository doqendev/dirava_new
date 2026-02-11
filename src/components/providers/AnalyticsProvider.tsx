'use client'

import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { useCookieConsentStore } from '@/stores/cookieConsentStore'

export function AnalyticsProvider() {
  const { consentGiven, preferences } = useCookieConsentStore()

  // Only render analytics if consent is given and analytics preference is enabled
  if (!consentGiven || !preferences.analytics) {
    return null
  }

  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  )
}
