import { getClickIds } from './clickIds'

const META_COOKIE_MAX_AGE_SECONDS = 90 * 24 * 60 * 60

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

export function readTrackingCookie(name: string): string | null {
  if (!canUseBrowserStorage()) return null
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`))
  return match ? decodeURIComponent(match[1]!) : null
}

function setTrackingCookie(name: string, value: string): void {
  if (!canUseBrowserStorage()) return
  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = [
    `${name}=${encodeURIComponent(value)}`,
    `Max-Age=${META_COOKIE_MAX_AGE_SECONDS}`,
    'Path=/',
    'SameSite=Lax',
    secure,
  ].filter(Boolean).join('; ')
}

function makeRandomId(): string {
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    const values = new Uint32Array(2)
    crypto.getRandomValues(values)
    return `${values[0] ?? 0}${values[1] ?? 0}`
  }

  return Math.floor(Math.random() * 1e16).toString()
}

export function makeFbp(now = Date.now(), randomId = makeRandomId()): string {
  return `fb.1.${now}.${randomId}`
}

export function makeFbc(fbclid: string, now = Date.now()): string {
  return `fb.1.${now}.${fbclid}`
}

function getFbclidFromCurrentUrl(): string | null {
  if (typeof window === 'undefined') return null

  try {
    return new URLSearchParams(window.location.search).get('fbclid')
  } catch {
    return null
  }
}

export function getMetaAttributionCookies(): {
  fbp: string | null
  fbc: string | null
} {
  return {
    fbp: readTrackingCookie('_fbp'),
    fbc: readTrackingCookie('_fbc'),
  }
}

/**
 * Create Meta first-party attribution cookies after marketing consent.
 *
 * Callers are responsible for consent gating; this helper intentionally
 * performs no writes before it is invoked from the consented tracking path.
 */
export function ensureMetaAttribution(): void {
  if (!canUseBrowserStorage()) return

  const clickIds = getClickIds()
  const fbclid = getFbclidFromCurrentUrl() || clickIds['fbclid']

  if (!readTrackingCookie('_fbp')) {
    setTrackingCookie('_fbp', makeFbp())
  }

  if (fbclid && !readTrackingCookie('_fbc')) {
    setTrackingCookie('_fbc', makeFbc(fbclid))
  }
}
