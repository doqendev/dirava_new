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

// Read from NEXT_PUBLIC_ for back-compat with the currently provisioned
// Vercel env vars, but prefer server-only TC_* if set.
const INGEST_URL =
  process.env.TC_INGEST_URL || process.env.NEXT_PUBLIC_TC_INGEST_URL
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
    const res = await fetch(INGEST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify(enriched),
    })
    return NextResponse.json({ ok: res.ok })
  } catch {
    return NextResponse.json({ ok: false, error: 'fetch-failed' })
  }
}
