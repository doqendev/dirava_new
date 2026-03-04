/**
 * Sanitize a string input: trim, strip control characters, limit length.
 */
export function sanitizeString(input: unknown, maxLength = 500): string {
  if (typeof input !== 'string') return ''
  // Strip control chars (except newlines/tabs), trim, and limit length
  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength)
}

/**
 * Basic email format check.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254
}

/**
 * Validate and sanitize a shipping address for gacha claims.
 */
export function validateShippingAddress(address: unknown): {
  valid: boolean
  error?: string
  sanitized?: {
    firstName: string
    lastName: string
    address1: string
    address2: string | null
    city: string
    province: string | null
    provinceCode: string | null
    country: string
    countryCode: string
    zip: string
    phone: string | null
  }
} {
  if (!address || typeof address !== 'object') {
    return { valid: false, error: 'Shipping address is required' }
  }

  const addr = address as Record<string, unknown>

  const firstName = sanitizeString(addr.firstName, 100)
  const lastName = sanitizeString(addr.lastName, 100)
  const address1 = sanitizeString(addr.address1, 200)
  const city = sanitizeString(addr.city, 100)
  const country = sanitizeString(addr.country, 100)
  const countryCode = sanitizeString(addr.countryCode, 10)
  const zip = sanitizeString(addr.zip, 20)

  if (!firstName) return { valid: false, error: 'First name is required' }
  if (!lastName) return { valid: false, error: 'Last name is required' }
  if (!address1) return { valid: false, error: 'Address is required' }
  if (!city) return { valid: false, error: 'City is required' }
  if (!country) return { valid: false, error: 'Country is required' }
  if (!countryCode) return { valid: false, error: 'Country code is required' }
  if (!zip) return { valid: false, error: 'ZIP code is required' }

  return {
    valid: true,
    sanitized: {
      firstName,
      lastName,
      address1,
      address2: sanitizeString(addr.address2, 200) || null,
      city,
      province: sanitizeString(addr.province, 100) || null,
      provinceCode: sanitizeString(addr.provinceCode, 10) || null,
      country,
      countryCode,
      zip,
      phone: sanitizeString(addr.phone, 30) || null,
    },
  }
}

/**
 * Validate a review submission body.
 * Supports anonymous reviews (no name/email) and rating-only reviews (no content).
 */
export function validateReview(body: unknown): {
  valid: boolean
  error?: string
  sanitized?: {
    productHandle: string
    authorName: string
    authorEmail: string
    rating: number
    title: string | undefined
    content: string
    anonymous: boolean
  }
} {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Request body is required' }
  }

  const b = body as Record<string, unknown>

  const productHandle = sanitizeString(b.productHandle, 200)
  const anonymous = b.anonymous === true
  const authorName = anonymous ? 'Anonymous' : sanitizeString(b.authorName, 100)
  const rawEmail = sanitizeString(b.authorEmail, 254)
  const authorEmail = anonymous ? 'anonymous@review.local' : (rawEmail || 'noemail@review.local')
  const content = sanitizeString(b.content, 2000)
  const title = sanitizeString(b.title, 200) || undefined
  const rating = typeof b.rating === 'number' ? Math.round(b.rating) : NaN

  if (!productHandle) return { valid: false, error: 'Product handle is required' }
  if (!anonymous && !authorName) return { valid: false, error: 'Name is required' }
  if (!anonymous && authorEmail && !isValidEmail(authorEmail)) return { valid: false, error: 'Please enter a valid email' }
  if (isNaN(rating) || rating < 1 || rating > 5) return { valid: false, error: 'Rating must be between 1 and 5' }

  return {
    valid: true,
    sanitized: { productHandle, authorName, authorEmail, rating, title, content, anonymous },
  }
}
