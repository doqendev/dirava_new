import { describe, it, expect } from 'vitest'
import {
  parseFiltersFromParams,
  filtersToParams,
  filterProducts,
  sortProducts,
  calculatePriceRange,
  hasActiveFilters,
  DEFAULT_FILTERS,
} from '../filters'

describe('parseFiltersFromParams', () => {
  it('returns defaults for empty params', () => {
    const result = parseFiltersFromParams({})
    expect(result).toEqual(DEFAULT_FILTERS)
  })

  it('parses product types from comma-separated string', () => {
    const result = parseFiltersFromParams({ types: 'hoodies,keychains' })
    expect(result.productTypes).toEqual(['hoodies', 'keychains'])
  })

  it('ignores invalid product types', () => {
    const result = parseFiltersFromParams({ types: 'hoodies,invalid' })
    expect(result.productTypes).toEqual(['hoodies'])
  })

  it('parses price range', () => {
    const result = parseFiltersFromParams({ priceMin: '10', priceMax: '50' })
    expect(result.priceMin).toBe(10)
    expect(result.priceMax).toBe(50)
  })

  it('parses sort option', () => {
    const result = parseFiltersFromParams({ sort: 'price-asc' })
    expect(result.sort).toBe('price-asc')
  })

  it('defaults invalid sort to featured', () => {
    const result = parseFiltersFromParams({ sort: 'invalid' })
    expect(result.sort).toBe('featured')
  })
})

describe('filtersToParams', () => {
  it('returns empty string for defaults', () => {
    expect(filtersToParams(DEFAULT_FILTERS)).toBe('')
  })

  it('includes product types', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, productTypes: ['hoodies'] })
    expect(result).toContain('types=hoodies')
  })

  it('includes price range when non-default', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, priceMin: 10, priceMax: 50 })
    expect(result).toContain('priceMin=10')
    expect(result).toContain('priceMax=50')
  })

  it('includes sort when non-default', () => {
    const result = filtersToParams({ ...DEFAULT_FILTERS, sort: 'price-asc' })
    expect(result).toContain('sort=price-asc')
  })
})

describe('filterProducts', () => {
  const products = [
    { price: { amount: '29.99' }, productType: 'Hoodie', tags: [], title: 'A' },
    { price: { amount: '14.99' }, productType: 'T-Shirt', tags: [], title: 'B' },
    { price: { amount: '9.99' }, productType: 'Keychain', tags: [], title: 'C' },
  ]

  it('returns all products with default filters', () => {
    expect(filterProducts(products, DEFAULT_FILTERS)).toHaveLength(3)
  })

  it('filters by product type', () => {
    const result = filterProducts(products, { ...DEFAULT_FILTERS, productTypes: ['hoodies'] })
    expect(result).toHaveLength(1)
    expect(result[0]!.productType).toBe('Hoodie')
  })

  it('filters by price range', () => {
    const result = filterProducts(products, { ...DEFAULT_FILTERS, priceMin: 10, priceMax: 20 })
    expect(result).toHaveLength(1)
    expect(result[0]!.title).toBe('B')
  })
})

describe('sortProducts', () => {
  const products = [
    { title: 'B Product', price: { amount: '20.00' }, createdAt: '2024-01-01' },
    { title: 'A Product', price: { amount: '30.00' }, createdAt: '2024-02-01' },
    { title: 'C Product', price: { amount: '10.00' }, createdAt: '2024-01-15' },
  ]

  it('sorts by price ascending', () => {
    const sorted = sortProducts(products, 'price-asc')
    expect(sorted[0]!.title).toBe('C Product')
    expect(sorted[2]!.title).toBe('A Product')
  })

  it('sorts by price descending', () => {
    const sorted = sortProducts(products, 'price-desc')
    expect(sorted[0]!.title).toBe('A Product')
  })

  it('sorts by name A-Z', () => {
    const sorted = sortProducts(products, 'az')
    expect(sorted[0]!.title).toBe('A Product')
  })

  it('sorts by newest', () => {
    const sorted = sortProducts(products, 'newest')
    expect(sorted[0]!.title).toBe('A Product')
  })

  it('keeps original order for featured', () => {
    const sorted = sortProducts(products, 'featured')
    expect(sorted[0]!.title).toBe('B Product')
  })
})

describe('calculatePriceRange', () => {
  it('returns min and max from products', () => {
    const products = [
      { price: { amount: '10.50' } },
      { price: { amount: '29.99' } },
      { price: { amount: '5.00' } },
    ]
    const range = calculatePriceRange(products)
    expect(range.min).toBe(5)
    expect(range.max).toBe(30)
  })

  it('returns defaults for empty array', () => {
    expect(calculatePriceRange([])).toEqual({ min: 0, max: 1000 })
  })
})

describe('hasActiveFilters', () => {
  it('returns false for defaults', () => {
    expect(hasActiveFilters(DEFAULT_FILTERS)).toBe(false)
  })

  it('returns true when product types are set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, productTypes: ['hoodies'] })).toBe(true)
  })

  it('returns true when price min is set', () => {
    expect(hasActiveFilters({ ...DEFAULT_FILTERS, priceMin: 10 })).toBe(true)
  })
})
