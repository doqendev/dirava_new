import { describe, it, expect, vi } from 'vitest'
import { checkRateLimit, getClientIp } from '../rateLimit'

// Mock Upstash modules so tests don't need real Redis
vi.mock('@upstash/redis', () => ({
  Redis: vi.fn(),
}))

vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: vi.fn(),
}))

describe('checkRateLimit', () => {
  it('allows requests when Redis is not configured (fallback)', async () => {
    // No UPSTASH env vars set → should allow all requests
    delete process.env.UPSTASH_REDIS_REST_URL
    delete process.env.UPSTASH_REDIS_REST_TOKEN

    const result = await checkRateLimit('test-key', { maxRequests: 3, windowSeconds: 60 })
    expect(result.limited).toBe(false)
  })
})

describe('getClientIp', () => {
  it('prefers x-real-ip over x-forwarded-for', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-real-ip': '2.2.2.2',
        'x-forwarded-for': '1.1.1.1',
      },
    })
    expect(getClientIp(request)).toBe('2.2.2.2')
  })

  it('falls back to x-forwarded-for when x-real-ip is missing', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8' },
    })
    expect(getClientIp(request)).toBe('1.2.3.4')
  })

  it('extracts IP from x-real-ip header', () => {
    const request = new Request('http://localhost', {
      headers: { 'x-real-ip': '1.2.3.4' },
    })
    expect(getClientIp(request)).toBe('1.2.3.4')
  })

  it('returns unknown when no IP headers', () => {
    const request = new Request('http://localhost')
    expect(getClientIp(request)).toBe('unknown')
  })
})
