'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { captureClickIds } from '@/lib/tracking/clickIds'
import { ensureMetaAttribution } from '@/lib/tracking/metaAttribution'
import { trackPageView } from '@/lib/tracking/trackClear'
import { useCookieConsentStore } from '@/stores/cookieConsentStore'

/**
 * Mounts tracking on every route change. Gated by marketing-consent preference.
 * Click IDs are captured first (synchronously, before any fetch) so the
 * PageView event and any downstream AddToCart events include the
 * attribution signal.
 */
export function TrackingProvider(): null {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const consentGiven = useCookieConsentStore((s) => s.consentGiven)
  const marketingEnabled = useCookieConsentStore((s) => s.preferences.marketing)

  useEffect(() => {
    if (!consentGiven || !marketingEnabled) return
    captureClickIds()
    ensureMetaAttribution()
    trackPageView()
    // searchParams is included so navigation to URLs with new click IDs
    // (e.g. ?fbclid=…) re-captures before firing PageView.
  }, [pathname, searchParams, consentGiven, marketingEnabled])

  return null
}
