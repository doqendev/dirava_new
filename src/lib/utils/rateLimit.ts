interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup old entries every 60 seconds
let lastCleanup = Date.now()
function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  store.forEach((entry, key) => {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  })
}

/**
 * Check if a request exceeds the rate limit.
 * Returns { limited: true, retryAfter } if over limit.
 */
export function checkRateLimit(
  key: string,
  opts: { maxRequests: number; windowSeconds: number }
): { limited: boolean; retryAfter?: number } {
  cleanup()

  const now = Date.now()
  const windowMs = opts.windowSeconds * 1000
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { limited: false }
  }

  entry.count++

  if (entry.count > opts.maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    return { limited: true, retryAfter }
  }

  return { limited: false }
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]!.trim()
  }
  return request.headers.get('x-real-ip') || 'unknown'
}
