import { describe, it, expect } from 'vitest'
import { formatPrice, formatShopifyPrice } from '../formatPrice'

describe('formatPrice', () => {
  it('formats USD with string amount', () => {
    expect(formatPrice('29.99', 'USD')).toBe('$29.99')
  })

  it('formats USD with numeric amount', () => {
    expect(formatPrice(29.99, 'USD')).toBe('$29.99')
  })

  it('formats EUR', () => {
    const result = formatPrice('45.00', 'EUR')
    expect(result).toContain('45.00')
  })

  it('handles zero', () => {
    expect(formatPrice('0', 'USD')).toBe('$0.00')
  })

  it('defaults to USD', () => {
    expect(formatPrice('10')).toBe('$10.00')
  })
})

describe('formatShopifyPrice', () => {
  it('formats Shopify money object', () => {
    expect(formatShopifyPrice({ amount: '29.99', currencyCode: 'USD' })).toBe('$29.99')
  })
})
