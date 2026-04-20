import { shopifyFetch } from '@/lib/shopify/client'
import { GET_PRODUCT } from '@/lib/shopify/queries'
import { getFirstAvailableVariant } from '@/lib/shopify/utils'
import { getCountry } from '@/i18n/country'
import type { BundleConfig, BundleResolved } from '@/types/bundle'
import type { ShopifyProduct } from '@/types/shopify'

export async function resolveBundleProducts(
  config: BundleConfig
): Promise<BundleResolved | null> {
  try {
    const country = await getCountry()
    const productPromises = config.products.map((p) =>
      shopifyFetch<{ product: ShopifyProduct | null }>(GET_PRODUCT, {
        handle: p.handle,
        country,
      })
    )

    const results = await Promise.all(productPromises)
    const products: ShopifyProduct[] = []

    for (const result of results) {
      if (!result.product) return null
      products.push(result.product)
    }

    // Calculate pricing from first available variant of each product
    let originalTotal = 0
    let allAvailable = true
    let currencyCode = 'EUR'

    for (const product of products) {
      const variant = getFirstAvailableVariant(product)
      if (!variant) {
        allAvailable = false
        continue
      }
      if (!variant.availableForSale) {
        allAvailable = false
      }
      originalTotal += parseFloat(variant.price.amount)
      currencyCode = variant.price.currencyCode
    }

    const savings = originalTotal * (config.discountPercent / 100)
    const bundleTotal = originalTotal - savings

    return {
      config,
      products,
      originalTotal,
      bundleTotal,
      savings,
      currencyCode,
      allAvailable,
    }
  } catch (error) {
    console.error(`Failed to resolve bundle ${config.id}:`, error)
    return null
  }
}
