import { cookies } from 'next/headers'
import type { NextRequest, NextResponse } from 'next/server'
import type { ShopifyCustomer } from '@/types/customer'

// In production use __Host- prefix so the cookie is locked to the origin,
// forbids Domain=, forbids downgrade from any subdomain, and can't be overwritten
// by scripts on subdomains. Falls back to plain name in dev.
export const CUSTOMER_SESSION_COOKIE =
  process.env.NODE_ENV === 'production' ? '__Host-mizoke-session' : 'mizoke-session'

type BaseCustomerSession = {
  version: 1
  expiresAt: string
}

export interface ShopifyCustomerSession extends BaseCustomerSession {
  mode: 'shopify'
  accessToken: string
}

export interface MockCustomerSession extends BaseCustomerSession {
  mode: 'mock'
  customer: ShopifyCustomer
}

export type CustomerSession = ShopifyCustomerSession | MockCustomerSession

function toBase64Url(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
  let binary = ''
  for (let index = 0; index < bytes.length; index += 1) {
    binary += String.fromCharCode(bytes[index] ?? 0)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function fromBase64Url(value: string): ArrayBuffer {
  const normalized = value
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(value.length / 4) * 4, '=')

  const binary = atob(normalized)
  const buffer = new ArrayBuffer(binary.length)
  const bytes = new Uint8Array(buffer)
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return buffer
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET

  // In production: require a dedicated SESSION_SECRET. Do NOT fall back to
  // Shopify admin tokens — rotating those would silently log out every customer,
  // and leaking one would let attackers forge session cookies.
  if (!secret || secret.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'SESSION_SECRET must be set to a random value of at least 32 characters in production.'
      )
    }
    // Dev fallback: accept a shorter value or synthesize a deterministic one.
    // This keeps local development working without forcing env setup.
    return secret || 'dev-session-secret-do-not-use-in-production-change-me'
  }

  return secret
}

// Cache the derived AES-GCM key per-process so we don't pay the SHA-256 +
// importKey cost on every request (middleware runs on every /account/* hit).
let cachedKeyPromise: Promise<CryptoKey> | null = null
let cachedKeySecret: string | null = null

async function getSessionKey(): Promise<CryptoKey> {
  const secret = getSessionSecret()
  if (cachedKeyPromise && cachedKeySecret === secret) {
    return cachedKeyPromise
  }
  cachedKeySecret = secret
  cachedKeyPromise = (async () => {
    const encoder = new TextEncoder()
    const hash = await crypto.subtle.digest('SHA-256', encoder.encode(secret))
    return crypto.subtle.importKey('raw', hash, 'AES-GCM', false, ['encrypt', 'decrypt'])
  })()
  return cachedKeyPromise
}

function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now()
}

function isValidSessionPayload(payload: unknown): payload is CustomerSession {
  if (!payload || typeof payload !== 'object') {
    return false
  }

  const candidate = payload as Partial<CustomerSession>
  if (candidate.version !== 1 || typeof candidate.expiresAt !== 'string' || isSessionExpired(candidate.expiresAt)) {
    return false
  }

  if (candidate.mode === 'shopify') {
    return typeof candidate.accessToken === 'string' && candidate.accessToken.length > 0
  }

  if (candidate.mode === 'mock') {
    // Mock sessions are a dev-only path. Reject them entirely in production
    // so a forged/leaked mock cookie cannot bypass Shopify auth.
    if (process.env.NODE_ENV === 'production') {
      return false
    }
    return !!candidate.customer && typeof candidate.customer.email === 'string'
  }

  return false
}

export async function encryptCustomerSession(session: CustomerSession): Promise<string> {
  const encoder = new TextEncoder()
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await getSessionKey()
  const plaintext = encoder.encode(JSON.stringify(session))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)

  return `${toBase64Url(iv)}.${toBase64Url(ciphertext)}`
}

export async function decryptCustomerSession(
  value: string | null | undefined
): Promise<CustomerSession | null> {
  if (!value) {
    return null
  }

  const [ivPart, ciphertextPart] = value.split('.')
  if (!ivPart || !ciphertextPart) {
    return null
  }

  try {
    const key = await getSessionKey()
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: new Uint8Array(fromBase64Url(ivPart)) },
      key,
      fromBase64Url(ciphertextPart)
    )

    const decoder = new TextDecoder()
    const parsed = JSON.parse(decoder.decode(decrypted)) as unknown
    return isValidSessionPayload(parsed) ? parsed : null
  } catch {
    return null
  }
}

function getCookieOptions(expiresAt?: string) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt ? new Date(expiresAt) : new Date(0),
  }
}

export async function setCustomerSessionCookie(
  response: NextResponse,
  session: CustomerSession
): Promise<NextResponse> {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, await encryptCustomerSession(session), getCookieOptions(session.expiresAt))
  return response
}

export function clearCustomerSessionCookie(response: NextResponse): NextResponse {
  response.cookies.set(CUSTOMER_SESSION_COOKIE, '', getCookieOptions())
  return response
}

export async function getCustomerSessionFromRequest(
  request: Request | NextRequest
): Promise<CustomerSession | null> {
  const cookieHeader = request.headers.get('cookie') ?? ''
  const sessionValue = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CUSTOMER_SESSION_COOKIE}=`))
    ?.slice(CUSTOMER_SESSION_COOKIE.length + 1)

  return decryptCustomerSession(sessionValue)
}

export async function getCustomerSession(): Promise<CustomerSession | null> {
  const cookieStore = await cookies()
  return decryptCustomerSession(cookieStore.get(CUSTOMER_SESSION_COOKIE)?.value)
}
