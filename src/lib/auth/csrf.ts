import { NextResponse } from 'next/server'

/**
 * Same-origin check for state-changing routes.
 *
 * Since our session cookie is sameSite: 'lax', a cross-site form POST with
 * credentials is still permitted in some edge cases (top-level navigation).
 * We enforce that the request's Origin or Referer matches the Host header,
 * which reliably blocks cross-site forgery without breaking the same-origin
 * fetches the frontend actually uses.
 *
 * Returns null when the request passes, a NextResponse(403) when it doesn't.
 */
export function enforceSameOrigin(request: Request): NextResponse | null {
  // In development, browsers often send requests from localhost with no Origin
  // header (e.g. server-side fetches, curl). Allow this in dev only.
  const method = request.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return null
  }

  const origin = request.headers.get('origin')
  const referer = request.headers.get('referer')
  const host = request.headers.get('host')

  if (!host) {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    )
  }

  const sourceUrl = origin ?? referer
  if (!sourceUrl) {
    // No Origin and no Referer — browsers always send at least one of these
    // for fetch() and form submissions. Missing both is suspicious.
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
    return null
  }

  try {
    const sourceHost = new URL(sourceUrl).host
    if (sourceHost !== host) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      )
    }
  } catch {
    return NextResponse.json(
      { success: false, error: 'Forbidden' },
      { status: 403 }
    )
  }

  return null
}
