/**
 * Product tagline / features string shown right below the product title.
 *
 * Source of truth precedence:
 *   1. Per-product Shopify metafield `custom.features` (string). Set this
 *      in Shopify admin to override for a specific product.
 *   2. Fallback derived from the existing collection-filter product types
 *      (Hoodies, T-Shirts, Name Signs, Keychains, Magnets). Uses
 *      `matchesProductType` so the same rules that power the shop filters
 *      also drive the tagline — no extra mapping to maintain.
 *   3. No tagline if nothing matches.
 *
 * LED signs don't have their own filter type (they share "Name Signs"),
 * so we layer a small extra check on top to split LED out.
 */

import { PRODUCT_TYPE_OPTIONS, matchesProductType, type ProductTypeFilter } from '@/lib/utils/filters'

type FeatureBucket = ProductTypeFilter | 'led-signs'

function resolveBucket(
  productType: string | undefined | null,
  tags: string[] | undefined | null
): FeatureBucket | null {
  const match = PRODUCT_TYPE_OPTIONS.find((opt) =>
    matchesProductType(productType ?? undefined, tags ?? undefined, opt.value)
  )?.value
  if (!match) return null

  // Split LED from plain name-signs.
  if (match === 'name-signs') {
    const t = (productType ?? '').toLowerCase()
    const tagHit = (tags ?? []).some((tag) => tag.toLowerCase().includes('led'))
    if (t.includes('led') || tagHit) return 'led-signs'
  }

  return match
}

const DEFAULTS: Record<FeatureBucket, string> = {
  'led-signs': 'UV Painted · Made to Order · USB with toggle/switch',
  'name-signs': 'UV Painted · Made to Order · Sturdy Plastic',
  hoodies: 'Heavyweight cotton blend · DTF print · Unisex',
  tshirts: '100% cotton · DTF print · Unisex',
  keychains: 'UV Printed · Made to Order · PLA Plastic',
  magnets: 'UV Printed · Neodymium Magnet · Made to Order',
}

export interface ProductFeatureArgs {
  /** Shopify metafield `custom.features` — takes precedence when present. */
  override?: string | null
  /** Shopify `Product.productType`. */
  productType?: string | null
  /** Shopify `Product.tags` — used by the shared `matchesProductType` helper. */
  tags?: string[] | null
}

export function resolveProductFeatures({
  override,
  productType,
  tags,
}: ProductFeatureArgs): string | null {
  const o = override?.trim()
  if (o) return o

  const bucket = resolveBucket(productType, tags)
  if (!bucket) return null
  return DEFAULTS[bucket]
}
