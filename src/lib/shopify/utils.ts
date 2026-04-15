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
 * Count the number of cards that would be displayed for a collection.
 * Each variant with a distinct image counts as a separate card,
 * matching the visual-option expansion logic in the collection page.
 */
export function getCollectionProductCount(collection: ShopifyCollection): number {
  const products = collection.products?.edges
  if (!products) return 0

  let count = 0

  for (const edge of products) {
    const product = edge.node
    const variants = product.variants?.edges?.map((e) => e.node) || []
    const variantsWithImages = variants.filter((v) => v.image)

    if (variantsWithImages.length > 1) {
      // Check which options produce distinct images
      const optionNames = variants[0]?.selectedOptions
        ?.map((o) => o.name)
        .filter((name) => !(name === 'Title' && variants.length === 1)) || []

      const visualOptions: string[] = []
      for (const optName of optionNames) {
        const groups = new Map<string, string>()
        for (const v of variants) {
          const val = v.selectedOptions?.find((o) => o.name === optName)?.value
          if (val && !groups.has(val) && v.image?.url) {
            groups.set(val, v.image.url.split('?')[0]!)
          }
        }
        const imageUrls = new Set(groups.values())
        if (imageUrls.size > 1) {
          visualOptions.push(optName)
        }
      }

      if (visualOptions.length >= 2) {
        // Multiple visual options: count unique combinations
        const combos = new Set<string>()
        for (const v of variants) {
          const key = visualOptions
            .map((optName) => v.selectedOptions?.find((o) => o.name === optName)?.value || '')
            .join(' / ')
          combos.add(key)
        }
        count += combos.size
      } else if (visualOptions.length === 1) {
        // One visual option: count unique values
        const values = new Set<string>()
        for (const v of variants) {
          const val = v.selectedOptions?.find((o) => o.name === visualOptions[0])?.value
          if (val) values.add(val)
        }
        count += values.size
      } else {
        count += 1
      }
    } else {
      count += 1
    }
  }

  return count
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
