import { getFirstAvailableVariant } from '@/lib/shopify/utils'
import type { ShopifyProduct } from '@/types/shopify'

export interface VariantCard {
  id: string
  handle: string
  title: string
  variantName: string | null
  price: { amount: string; currencyCode: string }
  compareAtPrice: { amount: string; currencyCode: string } | null
  image: { url: string; altText: string | null } | null
  variantId?: string
  rarity?: 'common' | 'rare' | 'legendary'
  productType?: string
  tags?: string[]
  createdAt?: string
  universe?: string | null
}

type ProductWithMeta = ShopifyProduct & {
  metafield?: { value: string } | null
  universe?: { value: string } | null
}

/**
 * Expand a product list into per-variant cards, matching the logic used
 * on /worlds/[universe] pages. For each product:
 *   - If variants expose ≥2 "visual" options (options where different values
 *     yield distinct images), render one card per unique combination.
 *   - If variants expose 1 visual option, render one card per value.
 *   - Otherwise, render a single card for the product.
 */
export function expandProductsToVariantCards(products: ProductWithMeta[]): VariantCard[] {
  return products.flatMap((product): VariantCard[] => {
    const variants = product.variants?.edges?.map((e) => e.node) || []
    const variantsWithImages = variants.filter((v) => v.image)

    if (variantsWithImages.length > 1) {
      const optionNames = variants[0]?.selectedOptions
        ?.map((o) => o.name)
        .filter((name) => !(name === 'Title' && variants.length === 1)) || []

      const visualOptions: string[] = []
      for (const optName of optionNames) {
        const groups = new Map<string, typeof variants[0]>()
        for (const v of variants) {
          const val = v.selectedOptions.find((o) => o.name === optName)?.value
          if (val && !groups.has(val)) {
            groups.set(val, v)
          }
        }
        const imageUrls = new Set(
          Array.from(groups.values())
            .map((v) => v.image?.url?.split('?')[0])
            .filter(Boolean)
        )
        if (imageUrls.size > 1) {
          visualOptions.push(optName)
        }
      }

      if (visualOptions.length >= 2) {
        const groups = new Map<string, typeof variants[0]>()
        for (const v of variants) {
          const key = visualOptions
            .map((optName) => v.selectedOptions.find((o) => o.name === optName)?.value || '')
            .join(' / ')
          if (!groups.has(key)) {
            groups.set(key, v)
          }
        }
        return Array.from(groups.entries()).map(([comboName, variant]) => ({
          id: `${product.id}__${variant.id}`,
          handle: product.handle,
          title: product.title,
          variantName: comboName,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice ?? null,
          image: variant.image || product.featuredImage || null,
          variantId: variant.id,
          rarity: product.metafield?.value as 'common' | 'rare' | 'legendary' | undefined,
          productType: product.productType,
          tags: product.tags,
          createdAt: product.createdAt,
          universe: product.universe?.value ?? null,
        }))
      }

      if (visualOptions.length === 1) {
        const optName = visualOptions[0]!
        const groups = new Map<string, typeof variants[0]>()
        for (const v of variants) {
          const val = v.selectedOptions.find((o) => o.name === optName)?.value
          if (val && !groups.has(val)) {
            groups.set(val, v)
          }
        }
        return Array.from(groups.entries()).map(([value, variant]) => ({
          id: `${product.id}__${optName}__${value}`,
          handle: product.handle,
          title: product.title,
          variantName: value,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice ?? null,
          image: variant.image || product.featuredImage || null,
          variantId: variant.id,
          rarity: product.metafield?.value as 'common' | 'rare' | 'legendary' | undefined,
          productType: product.productType,
          tags: product.tags,
          createdAt: product.createdAt,
          universe: product.universe?.value ?? null,
        }))
      }
    }

    const firstVariant = getFirstAvailableVariant(product)
    return [{
      id: product.id,
      handle: product.handle,
      title: product.title,
      variantName: null,
      price: product.priceRange.minVariantPrice,
      compareAtPrice: product.compareAtPriceRange?.minVariantPrice ?? null,
      image: product.featuredImage ?? null,
      variantId: firstVariant?.id,
      rarity: product.metafield?.value as 'common' | 'rare' | 'legendary' | undefined,
      productType: product.productType,
      tags: product.tags,
      createdAt: product.createdAt,
      universe: product.universe?.value ?? null,
    }]
  })
}
