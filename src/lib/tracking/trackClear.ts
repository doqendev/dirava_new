/**
 * Track Clear ingest client.
 *
 * Fires server-side-style ad tracking events to the Track Clear ingest API
 * using the credentials configured via NEXT_PUBLIC_TC_INGEST_URL and
 * NEXT_PUBLIC_TC_API_KEY. All calls are fire-and-forget — tracking should
 * never break the user experience if the API is slow or unreachable.
 *
 * Events are gated at call sites by cookie-marketing consent. If either
 * env var is missing, all calls silently no-op.
 */

import { getClickIds } from './clickIds'

const INGEST_URL = process.env.NEXT_PUBLIC_TC_INGEST_URL
const API_KEY = process.env.NEXT_PUBLIC_TC_API_KEY

function canTrack(): boolean {
  return typeof window !== 'undefined' && !!INGEST_URL && !!API_KEY
}

function nowIso(): string {
  return new Date().toISOString()
}

function newEventId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

interface BaseContext {
  url: string
  referrer: string
  userAgent: string
  click_ids: Record<string, string>
}

function baseContext(): BaseContext {
  return {
    url: window.location.href,
    referrer: document.referrer || '',
    userAgent: navigator.userAgent,
    click_ids: getClickIds(),
  }
}

async function send(eventName: string, data: Record<string, unknown>): Promise<void> {
  if (!canTrack()) return
  try {
    const body = JSON.stringify({
      event: eventName,
      event_id: newEventId(),
      timestamp: nowIso(),
      ...baseContext(),
      data,
    })

    // keepalive lets the request survive a navigation (e.g. checkout redirect).
    await fetch(INGEST_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body,
      keepalive: true,
    })
  } catch (err) {
    // Never surface tracking errors — just log.
    if (typeof console !== 'undefined') {
      console.warn('[trackClear]', eventName, err)
    }
  }
}

export function trackPageView(): void {
  void send('PageView', {
    path: window.location.pathname,
    title: document.title,
  })
}

interface ViewContentPayload {
  variantId?: string
  title: string
  productType: string
  price: number
  currency: string
}
export function trackViewContent(payload: ViewContentPayload): void {
  void send('ViewContent', {
    variant_id: payload.variantId,
    content_name: payload.title,
    content_type: payload.productType,
    value: payload.price,
    currency: payload.currency,
  })
}

interface AddToCartPayload {
  variantId: string
  price: number
  currency: string
  quantity: number
}
export function trackAddToCart(payload: AddToCartPayload): void {
  void send('AddToCart', {
    variant_id: payload.variantId,
    value: payload.price,
    currency: payload.currency,
    quantity: payload.quantity,
  })
}

interface InitiateCheckoutPayload {
  lines: Array<{ variantId: string; quantity: number }>
  totalValue: number
  currency: string
}
export function trackInitiateCheckout(payload: InitiateCheckoutPayload): void {
  void send('InitiateCheckout', {
    lines: payload.lines.map((l) => ({
      variant_id: l.variantId,
      quantity: l.quantity,
    })),
    value: payload.totalValue,
    currency: payload.currency,
    num_items: payload.lines.reduce((sum, l) => sum + l.quantity, 0),
  })
}
