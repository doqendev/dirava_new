/**
 * Track Clear ingest client.
 *
 * Fires events to the Track Clear API via our same-origin proxy at
 * /api/track. The proxy forwards to Track Clear with the X-TL-API-Key
 * header. Payload shape matches the Track Clear pixel contract so the
 * service's downstream destination fan-out (Meta, Klaviyo, GA4, etc.)
 * works without per-destination reshaping.
 *
 * All calls are fire-and-forget. Gated at call sites by cookie-marketing
 * consent. Failures never surface to the UI.
 */

import { getClickIds } from './clickIds'
import { readTrackingCookie } from './metaAttribution'
import { ensureTrackClearSessionId } from './trackClearSession'

const PROXY_PATH = '/api/track'

function canTrack(): boolean {
  return typeof window !== 'undefined'
}

function newEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

interface TrackClearPayload {
  eventName: string
  eventId: string
  timestamp: number
  url: string
  referrer: string
  trackclearSessionId: string | null
  checkoutToken: string | null
  cartToken: string | null
  fbp: string | null
  fbc: string | null
  fbclid: string | null
  gbraid: string | null
  wbraid: string | null
  ttclid: string | null
  rdtCid: string | null
  epik: string | null
  gclid: string | null
  gaClientId: string | null
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
  utmTerm: string | null
  consent: { analyticsAllowed: boolean; marketingAllowed: boolean }
  userData: Record<string, string | null>
  customData: Record<string, unknown>
}

interface TrackClearEventContext {
  checkoutToken?: string | null
  cartToken?: string | null
}

function buildPayload(
  eventName: string,
  customData: Record<string, unknown>,
  userData: Record<string, string | null> = {},
  context: TrackClearEventContext = {}
): TrackClearPayload {
  const clickIds = getClickIds()
  const utm = clickIds // URL params shared namespace

  // Extract Google Analytics client ID from _ga cookie if present
  let gaClientId: string | null = null
  const gaCookie = readTrackingCookie('_ga')
  if (gaCookie) {
    const parts = gaCookie.split('.')
    if (parts.length >= 4) gaClientId = parts.slice(2).join('.')
  }

  return {
    eventName,
    eventId: newEventId(),
    timestamp: Date.now(),
    url: window.location.href,
    referrer: document.referrer || '',
    trackclearSessionId: ensureTrackClearSessionId(),
    checkoutToken: context.checkoutToken || null,
    cartToken: context.cartToken || null,
    fbp: readTrackingCookie('_fbp'),
    fbc: readTrackingCookie('_fbc'),
    fbclid: clickIds['fbclid'] || null,
    gbraid: clickIds['gbraid'] || null,
    wbraid: clickIds['wbraid'] || null,
    ttclid: clickIds['ttclid'] || null,
    rdtCid: clickIds['rdt_cid'] || null,
    epik: clickIds['epik'] || readTrackingCookie('_epik'),
    gclid: clickIds['gclid'] || null,
    gaClientId,
    utmSource: utm['utm_source'] || null,
    utmMedium: utm['utm_medium'] || null,
    utmCampaign: utm['utm_campaign'] || null,
    utmContent: utm['utm_content'] || null,
    utmTerm: utm['utm_term'] || null,
    consent: {
      analyticsAllowed: true, // gated at call sites already
      marketingAllowed: true,
    },
    userData,
    customData,
  }
}

async function send(
  eventName: string,
  customData: Record<string, unknown>,
  userData: Record<string, string | null> = {},
  context: TrackClearEventContext = {}
): Promise<void> {
  if (!canTrack()) return
  try {
    const payload = buildPayload(eventName, customData, userData, context)
    // keepalive lets the request survive a navigation (checkout redirect).
    await fetch(PROXY_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      keepalive: true,
    })
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[trackClear]', eventName, err)
    }
  }
}

export function trackPageView(): void {
  void send('PageView', {})
}

interface ViewContentPayload {
  variantId?: string
  title: string
  productType: string
  price: number
  currency: string
}
export function trackViewContent(p: ViewContentPayload): void {
  void send('ViewContent', {
    contentIds: p.variantId ? [p.variantId] : [],
    contentType: 'product',
    contentName: p.title,
    contentCategory: p.productType,
    value: p.price,
    currency: p.currency,
  })
}

interface AddToCartPayload {
  variantId: string
  price: number
  currency: string
  quantity: number
  cartId?: string | null
}
export function trackAddToCart(p: AddToCartPayload): void {
  void send('AddToCart', {
    contentIds: [p.variantId],
    contentType: 'product',
    value: p.price * p.quantity,
    currency: p.currency,
    numItems: p.quantity,
  }, {}, { cartToken: p.cartId || null })
}

interface InitiateCheckoutPayload {
  lines: Array<{ variantId: string; quantity: number }>
  totalValue: number
  currency: string
  cartId?: string | null
}
export function trackInitiateCheckout(p: InitiateCheckoutPayload): void {
  void send('InitiateCheckout', {
    contentIds: p.lines.map((l) => l.variantId),
    contentType: 'product',
    value: p.totalValue,
    currency: p.currency,
    numItems: p.lines.reduce((sum, l) => sum + l.quantity, 0),
  }, {}, { cartToken: p.cartId || null })
}
