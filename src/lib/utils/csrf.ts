/**
 * Lightweight same-origin guard for state-changing API routes.
 *
 * Checks the request's Origin (preferred) or Referer header against an
 * allowlist of trusted origins. Returns `null` if the request is allowed
 * to proceed, or a 403 NextResponse if it should be rejected.
 *
 * This is the cheapest CSRF defense for routes that already require
 * authentication via cookie - browsers send Origin/Referer on cross-site
 * fetches, so a malicious page can't forge them. We pair this with the
 * existing same-site session cookie for defense-in-depth.
 */
import { NextResponse } from 'next/server'
import { SITE_URL } from '@/lib/utils/siteUrl'

/** Build the set of origins the app should accept POSTs from. */
function getAllowedOrigins(): string[] {
  const allowed = new Set<string>()
  // Always trust the canonical site URL.
  try {
    allowed.add(new URL(SITE_URL).origin)
  } catch {
    // siteUrl was malformed; fall through to env-only allow-list.
  }
  // Apex variant - some users land on https://mizoke.com which redirects
  // to www, but if our cookie domain is set on .mizoke.com a same-origin
  // POST from the apex is still legitimate.
  try {
    const u = new URL(SITE_URL)
    if (u.hostname.startsWith('www.')) {
      allowed.add(`${u.protocol}//${u.hostname.slice(4)}`)
    } else {
      allowed.add(`${u.protocol}//www.${u.hostname}`)
    }
  } catch {}
  // localhost dev workflows.
  if (process.env.NODE_ENV !== 'production') {
    allowed.add('http://localhost:3000')
    allowed.add('http://127.0.0.1:3000')
  }
  return Array.from(allowed)
}

/**
 * Returns `null` when the request is same-origin (safe to proceed), or a
 * 403 NextResponse when it isn't. Pass `request` from a route handler.
 *
 * Behaviour:
 * - If `Origin` is present, must match the allow-list.
 * - Else if `Referer` is present, its origin must match.
 * - If neither header is present, REJECT (browsers always send at least
 *   one on a fetch with credentials, so the absence is itself suspicious
 *   for a state-changing route).
 */
export function requireSameOrigin(request: Request): NextResponse | null {
  const allowed = getAllowedOrigins()

  const origin = request.headers.get('origin')
  if (origin) {
    if (allowed.includes(origin)) return null
    return NextResponse.json({ error: 'Forbidden: cross-origin request' }, { status: 403 })
  }

  const referer = request.headers.get('referer')
  if (referer) {
    try {
      const refOrigin = new URL(referer).origin
      if (allowed.includes(refOrigin)) return null
    } catch {
      // Malformed referer falls through to the rejection below.
    }
  }

  return NextResponse.json({ error: 'Forbidden: missing or invalid origin' }, { status: 403 })
}
