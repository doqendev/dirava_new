import { shopifyFetch } from '@/lib/shopify/client'
import { GET_ALL_PRODUCTS } from '@/lib/shopify/queries'
import { extractNodes } from '@/lib/shopify/utils'
import { getCountry } from '@/i18n/country'
import { filterProducts, PRODUCT_TYPE_OPTIONS, type ProductTypeFilter } from '@/lib/utils/filters'
import { expandProductsToVariantCards } from '@/lib/utils/variantExpansion'
import type { ShopifyProduct } from '@/types/shopify'

export interface CategoryPreview {
  type: ProductTypeFilter
  count: number
  heroImage: string | null
}

type ShopifyProductNode = ShopifyProduct & { universe?: { value: string } | null }

export async function getCategoryPreviews(): Promise<Map<ProductTypeFilter, CategoryPreview>> {
  const previews = new Map<ProductTypeFilter, CategoryPreview>()

  // Initialize every category with zero/null so the map is always complete
  PRODUCT_TYPE_OPTIONS.forEach((opt) => {
    previews.set(opt.value, { type: opt.value, count: 0, heroImage: null })
  })

  try {
    const country = await getCountry()
    const data = await shopifyFetch<{
      products: { edges: Array<{ node: ShopifyProductNode }> }
    }>(GET_ALL_PRODUCTS, { first: 250, country })

    const rawProducts = extractNodes(data.products)

    PRODUCT_TYPE_OPTIONS.forEach((opt) => {
      // Filter using lightweight shape, then re-select the raw product for expansion
      const matchingProducts = filterProducts(
        rawProducts.map((p) => ({
          price: p.priceRange.minVariantPrice,
          productType: p.productType,
          tags: p.tags,
          _ref: p,
        })),
        {
          productTypes: [opt.value],
          universes: [],
          priceMin: 0,
          priceMax: Number.MAX_SAFE_INTEGER,
          sort: 'featured',
        }
      ).map((p) => (p as unknown as { _ref: typeof rawProducts[number] })._ref)

      const variantCards = expandProductsToVariantCards(matchingProducts)
      const firstWithImage = variantCards.find((c) => c.image?.url) ?? variantCards[0]

      previews.set(opt.value, {
        type: opt.value,
        count: variantCards.length,
        heroImage: firstWithImage?.image?.url ?? null,
      })
    })
  } catch (error) {
    console.error('Failed to fetch category previews:', error)
  }

  return previews
}
