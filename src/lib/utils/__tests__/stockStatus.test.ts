import { describe, it, expect } from 'vitest'
import { getStockStatus, getStockStatusColor } from '../stockStatus'

describe('getStockStatus', () => {
  it('returns out_of_stock when not available for sale', () => {
    const result = getStockStatus(false, 10)
    expect(result.status).toBe('out_of_stock')
    expect(result.quantity).toBe(0)
  })

  it('returns in_stock when quantity is null (untracked)', () => {
    const result = getStockStatus(true, null)
    expect(result.status).toBe('in_stock')
    expect(result.quantity).toBeNull()
  })

  it('returns in_stock when quantity is undefined (untracked)', () => {
    const result = getStockStatus(true, undefined)
    expect(result.status).toBe('in_stock')
    expect(result.quantity).toBeNull()
  })

  it('returns out_of_stock when quantity is 0', () => {
    const result = getStockStatus(true, 0)
    expect(result.status).toBe('out_of_stock')
  })

  it('returns low_stock when quantity is <= 5', () => {
    const result = getStockStatus(true, 3)
    expect(result.status).toBe('low_stock')
    expect(result.quantity).toBe(3)
    expect(result.label).toContain('3')
  })

  it('returns in_stock when quantity is > 5', () => {
    const result = getStockStatus(true, 50)
    expect(result.status).toBe('in_stock')
    expect(result.quantity).toBe(50)
  })
})

describe('getStockStatusColor', () => {
  it('returns green for in_stock', () => {
    expect(getStockStatusColor('in_stock')).toBe('#22c55e')
  })

  it('returns orange for low_stock', () => {
    expect(getStockStatusColor('low_stock')).toBe('#f97316')
  })

  it('returns red for out_of_stock', () => {
    expect(getStockStatusColor('out_of_stock')).toBe('#ef4444')
  })
})
