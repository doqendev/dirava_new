/**
 * Product tagline / features string shown right below the product title.
 *
 * Source of truth precedence:
 *   1. Per-product Shopify metafield `custom.features` (string). Set this
 *      in Shopify admin to override for a specific product. Format is
 *      freeform, e.g. `UV Painted · Made to Order · USB with toggle/switch`.
 *   2. Fallback keyed by the Shopify product type (the `Product.productType`
 *      field — admin-editable, distinct from collections).
 *   3. No tagline if nothing matches.
 *
 * Match is case-insensitive and tolerates singular/plural.
 */

function norm(s: string | undefined | null): string {
  return (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
}

/**
 * Map the Shopify productType → tagline category.
 *
 * Matches substrings (case-insensitive) so admin values like
 * "LED Custom Sign" or "Custom Hoodie" still resolve. LED takes
 * precedence over plain signs so "LED Sign" doesn't fall into the
 * non-LED bucket.
 */
function categoriseByProductType(
  productType: string | undefined | null
): 'led-sign' | 'sign' | 'hoodie' | 'tshirt' | 'keychain' | 'magnet' | null {
  const t = norm(productType)
  if (!t) return null

  if (t.includes('hood')) return 'hoodie'
  if (t.includes('t-shirt') || t.includes('tshirt') || t.includes('tee')) return 'tshirt'
  if (t.includes('keychain')) return 'keychain'
  if (t.includes('magnet')) return 'magnet'
  if (t.includes('led')) return 'led-sign'
  if (t.includes('sign') || t.includes('name')) return 'sign'

  return null
}

const DEFAULTS: Record<NonNullable<ReturnType<typeof categoriseByProductType>>, string> = {
  'led-sign': 'UV Painted · Made to Order · USB with toggle/switch',
  sign: 'UV Painted · Made to Order · Sturdy Plastic',
  hoodie: 'Heavyweight cotton blend · DTF print · Unisex',
  tshirt: '100% cotton · DTF print · Unisex',
  keychain: 'UV Printed · Made to Order · PLA Plastic',
  magnet: 'UV Printed · Neodymium Magnet · Made to Order',
}

export interface ProductFeatureArgs {
  /** Shopify metafield `custom.features` — takes precedence when present. */
  override?: string | null
  /** Shopify `Product.productType` — drives the fallback copy. */
  productType?: string | null
  /**
   * @deprecated Tags are no longer consulted for the fallback — product
   * type is the single source of truth. Accepted for back-compat.
   */
  tags?: string[] | null
}

export function resolveProductFeatures({
  override,
  productType,
}: ProductFeatureArgs): string | null {
  const o = override?.trim()
  if (o) return o

  const bucket = categoriseByProductType(productType)
  if (!bucket) return null
  return DEFAULTS[bucket]
}
