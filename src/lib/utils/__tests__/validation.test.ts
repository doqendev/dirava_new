import { describe, it, expect } from 'vitest'
import { sanitizeString, isValidEmail, validateShippingAddress, validateReview } from '../validation'

describe('sanitizeString', () => {
  it('trims whitespace', () => {
    expect(sanitizeString('  hello  ')).toBe('hello')
  })

  it('strips control characters', () => {
    expect(sanitizeString('hello\x00world')).toBe('helloworld')
  })

  it('limits length', () => {
    expect(sanitizeString('abcdef', 3)).toBe('abc')
  })

  it('returns empty string for non-string input', () => {
    expect(sanitizeString(123)).toBe('')
    expect(sanitizeString(null)).toBe('')
    expect(sanitizeString(undefined)).toBe('')
  })
})

describe('isValidEmail', () => {
  it('accepts valid emails', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('user+tag@domain.co')).toBe(true)
  })

  it('rejects invalid emails', () => {
    expect(isValidEmail('')).toBe(false)
    expect(isValidEmail('not-an-email')).toBe(false)
    expect(isValidEmail('@missing-local.com')).toBe(false)
  })
})

describe('validateShippingAddress', () => {
  const validAddress = {
    firstName: 'John',
    lastName: 'Doe',
    address1: '123 Main St',
    city: 'Springfield',
    country: 'United States',
    countryCode: 'US',
    zip: '12345',
  }

  it('validates a complete address', () => {
    const result = validateShippingAddress(validAddress)
    expect(result.valid).toBe(true)
    expect(result.sanitized).toBeDefined()
    expect(result.sanitized!.firstName).toBe('John')
  })

  it('fails for missing required fields', () => {
    expect(validateShippingAddress({ ...validAddress, firstName: '' }).valid).toBe(false)
    expect(validateShippingAddress({ ...validAddress, address1: '' }).valid).toBe(false)
    expect(validateShippingAddress({ ...validAddress, city: '' }).valid).toBe(false)
  })

  it('fails for null/undefined input', () => {
    expect(validateShippingAddress(null).valid).toBe(false)
    expect(validateShippingAddress(undefined).valid).toBe(false)
  })

  it('sanitizes inputs', () => {
    const result = validateShippingAddress({
      ...validAddress,
      firstName: '  John\x00  ',
    })
    expect(result.valid).toBe(true)
    expect(result.sanitized!.firstName).toBe('John')
  })
})

describe('validateReview', () => {
  const validReview = {
    productHandle: 'test-product',
    authorName: 'John',
    authorEmail: 'john@example.com',
    rating: 4,
    content: 'This is a great product that I really enjoyed!',
  }

  it('validates a complete review', () => {
    const result = validateReview(validReview)
    expect(result.valid).toBe(true)
    expect(result.sanitized!.rating).toBe(4)
  })

  it('fails for invalid rating', () => {
    expect(validateReview({ ...validReview, rating: 0 }).valid).toBe(false)
    expect(validateReview({ ...validReview, rating: 6 }).valid).toBe(false)
  })

  it('fails for short content', () => {
    expect(validateReview({ ...validReview, content: 'short' }).valid).toBe(false)
  })

  it('fails for invalid email', () => {
    expect(validateReview({ ...validReview, authorEmail: 'not-email' }).valid).toBe(false)
  })
})
