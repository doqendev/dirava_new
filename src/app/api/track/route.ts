import { NextRequest, NextResponse } from 'next/server'
import { requireSameOrigin } from '@/lib/utils/csrf'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'

/**
 * Server-side proxy to the Track Clear ingest API.
 *
 * The client fires to this same-origin route (no CORS, no preflight) and we
 * forward server-to-server with the Authorization header. This also keeps the
 * API key off the client bundle.
 *
 * Silently no-op if env vars are missing — never surface 5xx for tracking.
 */

export const runtime = 'edge'

// Prefer server-only TC_* vars. Fall back to NEXT_PUBLIC_TC_* for
// back-compat with the currently provisioned Vercel env. Final fallback to
// Track Clear's production URL so a stale/wrong env var doesn't silently
// break tracking (the old www.trackclear.io value was returning CORS 401s).
const INGEST_URL =
  process.env.TC_INGEST_URL ||
  process.env.NEXT_PUBLIC_TC_INGEST_URL ||
  'https://api.trackclear.io/api/events/ingest'
const API_KEY = process.env.TC_API_KEY || process.env.NEXT_PUBLIC_TC_API_KEY
const MAX_PAYLOAD_BYTES = 16 * 1024
const ALLOWED_EVENTS = new Set([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export async function POST(req: NextRequest) {
  const csrfReject = requireSameOrigin(req)
  if (csrfReject) return csrfReject

  const contentLength = Number(req.headers.get('content-length') || 0)
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload-too-large' }, { status: 413 })
  }

  const ip = getClientIp(req)
  const rl = await checkRateLimit(`track:${ip}`, { maxRequests: 120, windowSeconds: 60 })
  if (rl.limited) {
    return NextResponse.json(
      { ok: false, error: 'rate-limited' },
      { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
    )
  }

  if (!INGEST_URL || !API_KEY) {
    return NextResponse.json({ ok: false, error: 'not-configured' })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-body' }, { status: 400 })
  }

  if (!isRecord(body)) {
    return NextResponse.json({ ok: false, error: 'bad-body' }, { status: 400 })
  }

  const eventName = typeof body.eventName === 'string' ? body.eventName : null
  if (!eventName || !ALLOWED_EVENTS.has(eventName)) {
    return NextResponse.json({ ok: false, error: 'invalid-event' }, { status: 400 })
  }

  // Enrich with server-side signals for more reliable attribution.
  const forwardedFor = req.headers.get('x-forwarded-for') || ''
  const clientIp =
    forwardedFor.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    undefined
  const userAgent =
    req.headers.get('user-agent') ||
    (typeof body.userAgent === 'string' ? body.userAgent : undefined)

  const enriched = {
    ...body,
    ip: clientIp,
    userAgent,
  }
  const payload = JSON.stringify(enriched)
  if (new TextEncoder().encode(payload).length > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ ok: false, error: 'payload-too-large' }, { status: 413 })
  }

  try {
    // Track Clear's ingest reads X-TL-API-Key (confirmed from their pixel
    // source). Neither X-API-Key nor Authorization: Bearer are recognised.
    const res = await fetch(INGEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-TL-API-Key': API_KEY,
      },
      body: payload,
    })

    // Read body for diagnostics. Track Clear returning 2xx but an error
    // body is a common way events silently drop.
    const text = await res.text().catch(() => '')

    if (!res.ok) {
      console.error(
        `[api/track] upstream rejected ${eventName}: ${res.status} ${text.slice(0, 400)}`
      )
      return NextResponse.json(
        { ok: false, status: res.status, upstream: text.slice(0, 400) },
        { status: 200 }
      )
    }

    // Log successful ingest for visibility while we're debugging attribution.
    console.log(
      `[api/track] upstream ok ${eventName} (${res.status}) ${text.slice(0, 200)}`
    )
    return NextResponse.json({ ok: true, status: res.status })
  } catch (err) {
    console.error(
      '[api/track] fetch failed:',
      err instanceof Error ? err.message : err
    )
    return NextResponse.json({ ok: false, error: 'fetch-failed' })
  }
}
