import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Serverless-compatible rate limiter using Upstash Redis.
 * Falls back to allowing all requests if Redis is not configured.
 */

let redis: Redis | null = null
const limiters = new Map<string, Ratelimit>()

function getRedis(): Redis | null {
  if (redis) return redis
  const url = process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) return null
  redis = new Redis({ url, token })
  return redis
}

function getLimiter(prefix: string, maxRequests: number, windowSeconds: number): Ratelimit | null {
  const redisClient = getRedis()
  if (!redisClient) return null

  const key = `${prefix}:${maxRequests}:${windowSeconds}`
  const existing = limiters.get(key)
  if (existing) return existing

  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
    analytics: false,
    prefix: `ratelimit:${prefix}`,
  })
  limiters.set(key, limiter)
  return limiter
}

/**
 * Check if a request exceeds the rate limit.
 * Returns { limited: true, retryAfter } if over limit.
 * Falls back to allowing all requests if Redis is not configured.
 */
export async function checkRateLimit(
  key: string,
  opts: { maxRequests: number; windowSeconds: number }
): Promise<{ limited: boolean; retryAfter?: number }> {
  const limiter = getLimiter('api', opts.maxRequests, opts.windowSeconds)

  if (!limiter) {
    // Redis not configured - allow request but warn
    if (process.env.NODE_ENV === 'production') {
      console.warn('[Rate Limit] Upstash Redis not configured. Rate limiting is disabled.')
    }
    return { limited: false }
  }

  try {
    const result = await limiter.limit(key)

    if (!result.success) {
      const retryAfter = Math.ceil((result.reset - Date.now()) / 1000)
      return { limited: true, retryAfter: Math.max(retryAfter, 1) }
    }

    return { limited: false }
  } catch (error) {
    // If Redis fails, allow the request (fail open)
    console.error('[Rate Limit] Redis error, allowing request:', error instanceof Error ? error.message : 'Unknown error')
    return { limited: false }
  }
}

/**
 * Extract client IP from request headers.
 * Prefers x-real-ip (set by Vercel) over x-forwarded-for (spoofable).
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-real-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  )
}
