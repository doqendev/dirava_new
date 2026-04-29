import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'

export const ADMIN_SESSION_COOKIE =
  process.env.NODE_ENV === 'production' ? '__Host-mizoke-admin' : 'mizoke-admin'

const ADMIN_SESSION_TTL_SECONDS = 8 * 60 * 60

type AdminSessionPayload = {
  version: 1
  expiresAt: number
}

function getAdminSecret(): string | null {
  const secret = process.env.ADMIN_SECRET?.trim()
  return secret && secret.length > 0 ? secret : null
}

function getSigningSecret(): string | null {
  const sessionSecret = process.env.SESSION_SECRET?.trim()
  if (sessionSecret && sessionSecret.length >= 32) {
    return sessionSecret
  }
  return getAdminSecret()
}

function toBase64Url(value: Buffer | string): string {
  const buffer = Buffer.isBuffer(value) ? value : Buffer.from(value)
  return buffer.toString('base64url')
}

function fromBase64Url(value: string): string {
  return Buffer.from(value, 'base64url').toString('utf8')
}

function timingSafeEqualString(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

function signPayload(payload: string): string | null {
  const signingSecret = getSigningSecret()
  if (!signingSecret) return null
  return toBase64Url(crypto.createHmac('sha256', signingSecret).update(payload).digest())
}

function cookieOptions(expiresAt?: number) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt ? new Date(expiresAt) : new Date(0),
  }
}

export function isAdminSecretConfigured(): boolean {
  return !!getAdminSecret()
}

export function isValidAdminSecret(value: string): boolean {
  const adminSecret = getAdminSecret()
  if (!adminSecret) {
    return process.env.NODE_ENV === 'development'
  }
  return timingSafeEqualString(value, adminSecret)
}

export function createAdminSessionCookieValue(): string | null {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000
  const payload: AdminSessionPayload = { version: 1, expiresAt }
  const encodedPayload = toBase64Url(JSON.stringify(payload))
  const signature = signPayload(encodedPayload)
  return signature ? `${encodedPayload}.${signature}` : null
}

export function verifyAdminSessionCookieValue(value: string | undefined): boolean {
  if (!value) return false

  const [encodedPayload, signature] = value.split('.')
  if (!encodedPayload || !signature) return false

  const expectedSignature = signPayload(encodedPayload)
  if (!expectedSignature || !timingSafeEqualString(signature, expectedSignature)) {
    return false
  }

  try {
    const payload = JSON.parse(fromBase64Url(encodedPayload)) as Partial<AdminSessionPayload>
    return payload.version === 1 && typeof payload.expiresAt === 'number' && payload.expiresAt > Date.now()
  } catch {
    return false
  }
}

export function hasAdminSession(request: Request): boolean {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const cookieValue = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1)

  return verifyAdminSessionCookieValue(cookieValue)
}

export function setAdminSessionCookie(response: NextResponse, value: string): NextResponse {
  response.cookies.set(ADMIN_SESSION_COOKIE, value, cookieOptions(Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000))
  return response
}

export function clearAdminSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', cookieOptions())
  return response
}

export async function enforceAdminRateLimit(
  request: Request,
  action: string,
  opts: { maxRequests: number; windowSeconds: number } = { maxRequests: 20, windowSeconds: 300 }
): Promise<NextResponse | null> {
  const ip = getClientIp(request)
  const result = await checkRateLimit(`admin-${action}:${ip}`, opts)
  if (!result.limited) return null

  return NextResponse.json(
    { success: false, error: 'Too many admin attempts' },
    {
      status: 429,
      headers: {
        'Cache-Control': 'no-store',
        'Retry-After': String(result.retryAfter ?? 60),
      },
    }
  )
}

export function requireAdminSession(request: Request): NextResponse | null {
  if (process.env.NODE_ENV === 'production' && !isAdminSecretConfigured()) {
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (!hasAdminSession(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers: { 'Cache-Control': 'no-store' } }
    )
  }

  return null
}
