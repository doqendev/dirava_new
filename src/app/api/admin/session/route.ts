import { NextResponse } from 'next/server'
import {
  clearAdminSessionCookie,
  createAdminSessionCookieValue,
  enforceAdminRateLimit,
  hasAdminSession,
  isValidAdminSecret,
  setAdminSessionCookie,
} from '@/lib/auth/admin'
import { requireSameOrigin } from '@/lib/utils/csrf'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const rateLimitReject = await enforceAdminRateLimit(request, 'session-check', {
    maxRequests: 60,
    windowSeconds: 300,
  })
  if (rateLimitReject) return rateLimitReject

  return NextResponse.json(
    { success: true, authenticated: hasAdminSession(request) },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}

export async function POST(request: Request) {
  const csrfReject = requireSameOrigin(request)
  if (csrfReject) return csrfReject

  const rateLimitReject = await enforceAdminRateLimit(request, 'session-login', {
    maxRequests: 5,
    windowSeconds: 300,
  })
  if (rateLimitReject) return rateLimitReject

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const secret = (body as { secret?: unknown }).secret
  if (typeof secret !== 'string' || !isValidAdminSecret(secret)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  const sessionValue = createAdminSessionCookieValue()
  if (!sessionValue) {
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return setAdminSessionCookie(
    NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store' } }
    ),
    sessionValue
  )
}

export async function DELETE(request: Request) {
  const csrfReject = requireSameOrigin(request)
  if (csrfReject) return csrfReject

  return clearAdminSessionCookie(
    NextResponse.json(
      { success: true },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  )
}
