/**
 * Collection filter and sort utilities
 */

export type ProductTypeFilter =
  | 'hoodies'
  | 'tshirts'
  | 'name-signs'
  | 'keychains'
  | 'magnets'

export type SortOption =
  | 'featured'
  | 'price-asc'
  | 'price-desc'
  | 'newest'
  | 'az'

export interface FilterState {
  productTypes: ProductTypeFilter[]
  universes: string[]
  priceMin: number
  priceMax: number
  sort: SortOption
}

export const PRODUCT_TYPE_OPTIONS: Array<{
  value: ProductTypeFilter
  label: string
  group?: string
}> = [
  { value: 'hoodies', label: 'Hoodies', group: 'Apparel' },
  { value: 'tshirts', label: 'T-Shirts', group: 'Apparel' },
  { value: 'name-signs', label: 'Name Signs' },
  { value: 'keychains', label: 'Keychains' },
  { value: 'magnets', label: 'Magnets' },
]

export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest' },
  { value: 'az', label: 'Name: A-Z' },
]

export const DEFAULT_FILTERS: FilterState = {
  productTypes: [],
  universes: [],
  priceMin: 0,
  priceMax: 1000,
  sort: 'featured',
}

/**
 * Parse filters from URL search params
 */
export function parseFiltersFromParams(
  searchParams: Record<string, string | string[] | undefined>
): FilterState {
  const types = searchParams.types
  const productTypes = types
    ? (typeof types === 'string' ? types.split(',') : types).filter(
        (t): t is ProductTypeFilter =>
          PRODUCT_TYPE_OPTIONS.some((opt) => opt.value === t)
      )
    : []

  const universesRaw = searchParams.universes
  const universes = universesRaw
    ? (typeof universesRaw === 'string' ? universesRaw.split(',') : universesRaw).filter(
        (u): u is string => typeof u === 'string' && u.length > 0
      )
    : []

  const priceMin = parseInt(searchParams.priceMin as string) || 0
  const priceMax = parseInt(searchParams.priceMax as string) || 1000
  const sort = (searchParams.sort as SortOption) || 'featured'

  return {
    productTypes,
    universes,
    priceMin,
    priceMax,
    sort: SORT_OPTIONS.some((opt) => opt.value === sort) ? sort : 'featured',
  }
}

/**
 * Convert filters to URL search params string
 */
export function filtersToParams(filters: FilterState): string {
  const params = new URLSearchParams()

  if (filters.productTypes.length > 0) {
    params.set('types', filters.productTypes.join(','))
  }
  if (filters.universes.length > 0) {
    params.set('universes', filters.universes.join(','))
  }
  if (filters.priceMin > 0) {
    params.set('priceMin', String(filters.priceMin))
  }
  if (filters.priceMax < 1000) {
    params.set('priceMax', String(filters.priceMax))
  }
  if (filters.sort !== 'featured') {
    params.set('sort', filters.sort)
  }

  return params.toString()
}

/**
 * Check if a product matches the given product type filter
 */
function matchesProductType(
  productType: string | undefined,
  productTags: string[] | undefined,
  filterType: ProductTypeFilter
): boolean {
  const type = productType?.toLowerCase() || ''
  const tags = productTags?.map((t) => t.toLowerCase()) || []

  switch (filterType) {
    case 'hoodies':
      return type.includes('hoodie') || tags.some((t) => t.includes('hoodie'))
    case 'tshirts':
      return (
        type.includes('t-shirt') ||
        type.includes('tshirt') ||
        type.includes('tee') ||
        tags.some((t) => t.includes('t-shirt') || t.includes('tshirt') || t.includes('tee'))
      )
    case 'name-signs':
      return (
        type.includes('sign') ||
        type.includes('name') ||
        tags.some((t) => t.includes('sign') || t.includes('name'))
      )
    case 'keychains':
      return type.includes('keychain') || tags.some((t) => t.includes('keychain'))
    case 'magnets':
      return type.includes('magnet') || tags.some((t) => t.includes('magnet'))
    default:
      return false
  }
}

/**
 * Filter products based on filter state
 */
export function filterProducts<
  T extends {
    price: { amount: string }
    productType?: string
    tags?: string[]
    universe?: string | null
  }
>(products: T[], filters: FilterState): T[] {
  return products.filter((product) => {
    // Filter by product type
    if (filters.productTypes.length > 0) {
      const matchesAnyType = filters.productTypes.some((filterType) =>
        matchesProductType(product.productType, product.tags, filterType)
      )
      if (!matchesAnyType) return false
    }

    // Filter by universe
    if (filters.universes.length > 0) {
      if (!product.universe || !filters.universes.includes(product.universe)) {
        return false
      }
    }

    // Filter by price range
    const price = parseFloat(product.price.amount)
    if (isNaN(price)) return false
    if (price < filters.priceMin || price > filters.priceMax) {
      return false
    }

    return true
  })
}

/**
 * Sort products based on sort option
 */
export function sortProducts<
  T extends {
    title: string
    price: { amount: string }
    createdAt?: string
  }
>(products: T[], sort: SortOption): T[] {
  const sorted = [...products]

  switch (sort) {
    case 'price-asc':
      sorted.sort(
        (a, b) => parseFloat(a.price.amount) - parseFloat(b.price.amount)
      )
      break
    case 'price-desc':
      sorted.sort(
        (a, b) => parseFloat(b.price.amount) - parseFloat(a.price.amount)
      )
      break
    case 'newest':
      sorted.sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
      break
    case 'az':
      sorted.sort((a, b) => a.title.localeCompare(b.title))
      break
    case 'featured':
    default:
      // Keep original order
      break
  }

  return sorted
}

/**
 * Filter and sort products in one pass
 */
export function filterAndSortProducts<
  T extends {
    title: string
    price: { amount: string }
    productType?: string
    tags?: string[]
    createdAt?: string
  }
>(products: T[], filters: FilterState): T[] {
  const filtered = filterProducts(products, filters)
  return sortProducts(filtered, filters.sort)
}

/**
 * Calculate price range from products
 */
export function calculatePriceRange<T extends { price: { amount: string } }>(
  products: T[]
): { min: number; max: number } {
  if (products.length === 0) {
    return { min: 0, max: 1000 }
  }

  const prices = products.map((p) => parseFloat(p.price.amount))
  return {
    min: Math.floor(Math.min(...prices)),
    max: Math.ceil(Math.max(...prices)),
  }
}

/**
 * Check if filters are active (different from defaults)
 */
export function hasActiveFilters(filters: FilterState): boolean {
  return (
    filters.productTypes.length > 0 ||
    filters.universes.length > 0 ||
    filters.priceMin > 0 ||
    filters.priceMax < 1000
  )
}
