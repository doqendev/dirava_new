import { describe, it, expect, beforeEach, vi } from 'vitest'
import { checkRateLimit, getClientIp } from '../rateLimit'

describe('checkRateLimit', () => {
  beforeEach(() => {
    // Each test uses unique keys to avoid interference
  })

  it('allows requests under the limit', () => {
    const key = `test-${Date.now()}-1`
    const result = checkRateLimit(key, { maxRequests: 3, windowSeconds: 60 })
    expect(result.limited).toBe(false)
  })

  it('blocks requests over the limit', () => {
    const key = `test-${Date.now()}-2`
    const opts = { maxRequests: 2, windowSeconds: 60 }

    checkRateLimit(key, opts)
    checkRateLimit(key, opts)
    const result = checkRateLimit(key, opts)

    expect(result.limited).toBe(true)
    expect(result.retryAfter).toBeGreaterThan(0)
  })

  it('allows requests after window expires', () => {
    vi.useFakeTimers()
    try {
      const key = `test-${Date.now()}-3`
      const opts = { maxRequests: 1, windowSeconds: 1 } // 1 second window

      checkRateLimit(key, opts)
      // Advance time past the window
      vi.advanceTimersByTime(1100)
      const result = checkRateLimit(key, opts)
      expect(result.limited).toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('counts correctly at the boundary', () => {
    const key = `test-${Date.now()}-4`
    const opts = { maxRequests: 3, windowSeconds: 60 }

    expect(checkRateLimit(key, opts).limited).toBe(false) // 1
    expect(checkRateLimit(key, opts).limited).toBe(false) // 2
    expect(checkRateLimit(key, opts).limited).toBe(false) // 3
    expect(checkRateLimit(key, opts).limited).toBe(true)  // 4 - over limit
  })
})

describe('getClientIp', () => {
  it('extracts IP from x-forwarded-for header', () => {
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

  it('prefers x-forwarded-for over x-real-ip', () => {
    const request = new Request('http://localhost', {
      headers: {
        'x-forwarded-for': '1.1.1.1',
        'x-real-ip': '2.2.2.2',
      },
    })
    expect(getClientIp(request)).toBe('1.1.1.1')
  })
})
