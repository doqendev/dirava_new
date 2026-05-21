/**
 * Marketing click-ID capture.
 *
 * On page load, reads ad-network click IDs (fbclid, gclid, ttclid, etc.) from
 * the URL and persists them to localStorage with a 30-day TTL. These are
 * later forwarded with tracking events and written as Shopify cart attributes
 * so the eventual purchase can be attributed back to the click.
 */

const KEY = 'mizoke-click-ids'
const TTL_MS = 30 * 24 * 60 * 60 * 1000

// Ad-platform click-ID query params we care about, in order of usefulness.
const CLICK_ID_PARAMS = [
  'fbclid', // Meta / Facebook
  'gclid',  // Google Ads (auto-tagged clicks)
  'gbraid', // Google Ads (iOS 14+)
  'wbraid', // Google Ads (web)
  'ttclid', // TikTok
  'msclkid', // Microsoft Ads / Bing
  'li_fat_id', // LinkedIn
  'twclid', // X (Twitter) Ads
  'irclickid', // Impact partner tracking
  'rdt_cid', // Reddit
  'epik', // Pinterest
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const

interface StoredClickIds {
  ids: Record<string, string>
  capturedAt: number
}

function readStore(): StoredClickIds | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredClickIds
    if (!parsed?.capturedAt || Date.now() - parsed.capturedAt > TTL_MS) {
      window.localStorage.removeItem(KEY)
      return null
    }
    return parsed
  } catch {
    return null
  }
}

/**
 * Capture click IDs from the current URL and merge into the stored set.
 * Safe to call every page load; no-op if no click IDs are present.
 */
export function captureClickIds(): void {
  if (typeof window === 'undefined') return
  let params: URLSearchParams
  try {
    params = new URLSearchParams(window.location.search)
  } catch {
    return
  }

  const captured: Record<string, string> = {}
  for (const key of CLICK_ID_PARAMS) {
    const value = params.get(key)
    if (value) captured[key] = value
  }
  if (Object.keys(captured).length === 0) return

  try {
    const existing = readStore()
    const merged = { ...(existing?.ids || {}), ...captured }
    const payload: StoredClickIds = { ids: merged, capturedAt: Date.now() }
    window.localStorage.setItem(KEY, JSON.stringify(payload))
  } catch {
    // Quota / disabled storage — safe to ignore
  }
}

/** Get the currently stored click IDs (may be empty object). */
export function getClickIds(): Record<string, string> {
  return readStore()?.ids ?? {}
}

/** Clear the stored click IDs (e.g. on logout or opt-out). */
export function clearClickIds(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    /* noop */
  }
}
