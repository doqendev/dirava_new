import type { ShopifyProduct, ShopifyCollection, ShopifyConnection } from '@/types/shopify'

/**
 * Extract nodes from a Shopify connection
 */
export function extractNodes<T>(connection: ShopifyConnection<T> | null | undefined): T[] {
  if (!connection?.edges) return []
  return connection.edges.map((edge) => edge.node)
}

/**
 * Get the universe slug from a product's metafields
 */
export function getProductUniverse(product: ShopifyProduct): string | null {
  if (!product.metafields) return null

  const universeMetafield = product.metafields.find(
    (mf) => mf?.key === 'universe'
  )

  return universeMetafield?.value ?? null
}

/**
 * Get the rarity from a product's metafields
 */
export function getProductRarity(
  product: ShopifyProduct
): 'common' | 'rare' | 'legendary' | null {
  if (!product.metafields) return null

  const rarityMetafield = product.metafields.find((mf) => mf?.key === 'rarity')

  if (rarityMetafield?.value) {
    const value = rarityMetafield.value.toLowerCase()
    if (value === 'common' || value === 'rare' || value === 'legendary') {
      return value
    }
  }

  return null
}

/**
 * Check if a product is a drop item
 */
export function isDropProduct(product: ShopifyProduct): boolean {
  if (!product.metafields) return false

  const isDropMetafield = product.metafields.find((mf) => mf?.key === 'is_drop')

  return isDropMetafield?.value === 'true'
}

/**
 * Get the universe slug from a collection's metafield
 */
export function getCollectionUniverse(collection: ShopifyCollection): string | null {
  return collection.metafield?.value ?? null
}

/**
 * Get product count from a collection
 */
export function getCollectionProductCount(collection: ShopifyCollection): number {
  return collection.products?.edges?.length ?? 0
}

/**
 * Create a Shopify GID from an ID and type
 */
export function createGid(type: 'Product' | 'ProductVariant' | 'Collection' | 'Cart', id: string): string {
  if (id.startsWith('gid://')) return id
  return `gid://shopify/${type}/${id}`
}

/**
 * Extract the numeric ID from a Shopify GID
 */
export function extractIdFromGid(gid: string): string {
  const match = gid.match(/\/(\d+)$/)
  return match?.[1] ?? gid
}

/**
 * Check if a variant is available for purchase
 */
export function isVariantAvailable(variant: { availableForSale?: boolean }): boolean {
  return variant.availableForSale === true
}

/**
 * Get the first available variant from a product
 */
export function getFirstAvailableVariant(product: ShopifyProduct) {
  if (!product.variants?.edges) return null

  const availableVariant = product.variants.edges.find(
    (edge) => edge.node.availableForSale
  )

  return availableVariant?.node ?? product.variants.edges[0]?.node ?? null
}

/**
 * Check if a product has a compare-at price (on sale)
 */
export function isProductOnSale(product: ShopifyProduct): boolean {
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount
  const currentPrice = product.priceRange.minVariantPrice.amount

  if (!compareAtPrice) return false

  return parseFloat(compareAtPrice) > parseFloat(currentPrice)
}

/**
 * Calculate discount percentage
 */
export function calculateDiscount(originalPrice: string, salePrice: string): number {
  const original = parseFloat(originalPrice)
  const sale = parseFloat(salePrice)

  if (original <= 0 || sale >= original) return 0

  return Math.round(((original - sale) / original) * 100)
}
