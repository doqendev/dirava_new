import { readTrackingCookie } from './metaAttribution'

const TRACKCLEAR_SESSION_COOKIE = '_trackclear_session_id'
const TRACKCLEAR_SESSION_STORAGE_KEY = 'mizoke-trackclear-session-id'
const TRACKCLEAR_SESSION_MAX_AGE_SECONDS = 365 * 24 * 60 * 60

function canUseBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

function normalizeSessionId(value: unknown): string | null {
  const text = typeof value === 'string' ? value.trim() : ''
  return text && text.length <= 512 ? text : null
}

function makeSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`
}

function readStoredSessionId(): string | null {
  if (typeof window === 'undefined') return null
  try {
    return normalizeSessionId(window.localStorage.getItem(TRACKCLEAR_SESSION_STORAGE_KEY))
  } catch {
    return null
  }
}

function persistSessionId(sessionId: string): void {
  if (!canUseBrowserStorage()) return

  try {
    window.localStorage.setItem(TRACKCLEAR_SESSION_STORAGE_KEY, sessionId)
  } catch {
    // Cookie persistence below is still enough for the current page flow.
  }

  const secure = window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = [
    `${TRACKCLEAR_SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    `Max-Age=${TRACKCLEAR_SESSION_MAX_AGE_SECONDS}`,
    'Path=/',
    'SameSite=Lax',
    secure,
  ].filter(Boolean).join('; ')
}

export function readTrackClearSessionId(): string | null {
  return readStoredSessionId() || readTrackingCookie(TRACKCLEAR_SESSION_COOKIE)
}

export function ensureTrackClearSessionId(): string | null {
  if (!canUseBrowserStorage()) return null

  const existing = normalizeSessionId(readTrackClearSessionId())
  const sessionId = existing || makeSessionId()
  persistSessionId(sessionId)
  return sessionId
}
