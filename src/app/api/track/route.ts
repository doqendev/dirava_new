import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(req: NextRequest) {
  if (!INGEST_URL || !API_KEY) {
    return NextResponse.json({ ok: false, error: 'not-configured' })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'bad-body' }, { status: 400 })
  }

  // Enrich with server-side signals for more reliable attribution.
  const forwardedFor = req.headers.get('x-forwarded-for') || ''
  const clientIp =
    forwardedFor.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    undefined
  const userAgent =
    req.headers.get('user-agent') || (body as { userAgent?: string })?.userAgent

  const enriched = {
    ...(body as Record<string, unknown>),
    ip: clientIp,
    userAgent,
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
      body: JSON.stringify(enriched),
    })

    // Read body for diagnostics. Track Clear returning 2xx but an error
    // body is a common way events silently drop.
    const text = await res.text().catch(() => '')
    const eventName =
      (body as { event?: string } | null)?.event || 'unknown'

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
