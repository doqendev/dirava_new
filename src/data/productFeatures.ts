/**
 * Product tagline / features string shown right below the product title.
 *
 * Source of truth precedence:
 *   1. Per-product Shopify metafield `custom.features` (string). Set this
 *      in Shopify admin to override for a specific product. Format is
 *      freeform, e.g. `Neon-cut acrylic · plate-mounted LED · made to order`.
 *   2. Fallback default based on the product's category/productType + tags.
 *   3. No tagline if nothing matches.
 */

function norm(s: string | undefined | null): string {
  return (s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
}

function categorise(
  productType: string | undefined,
  tags: string[] | undefined
): 'led-sign' | 'sign' | 'hoodie' | 'tshirt' | 'keychain' | 'magnet' | null {
  const t = norm(productType)
  const tagSet = new Set((tags ?? []).map(norm))

  // Apparel first — avoids "shirt sign" edge cases.
  if (t.includes('hood') || tagSet.has('hoodie') || tagSet.has('hoodies')) return 'hoodie'
  if (t.includes('shirt') || t.includes('tee') || tagSet.has('tshirt') || tagSet.has('tshirts') || tagSet.has('t-shirt')) {
    return 'tshirt'
  }
  if (t.includes('keychain') || tagSet.has('keychain') || tagSet.has('keychains')) return 'keychain'
  if (t.includes('magnet') || tagSet.has('magnet') || tagSet.has('magnets')) return 'magnet'

  // LED takes precedence when the signal is explicit.
  const looksLikeLed = t.includes('led') || tagSet.has('led') || tagSet.has('lamp') || t.includes('lamp')
  const looksLikeSign = t.includes('sign') || tagSet.has('name-sign') || tagSet.has('sign')
  if (looksLikeLed) return 'led-sign'
  if (looksLikeSign) return 'sign'

  return null
}

const DEFAULTS: Record<NonNullable<ReturnType<typeof categorise>>, string> = {
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
  productType?: string | null
  tags?: string[] | null
}

export function resolveProductFeatures({
  override,
  productType,
  tags,
}: ProductFeatureArgs): string | null {
  const o = override?.trim()
  if (o) return o

  const bucket = categorise(productType ?? undefined, tags ?? undefined)
  if (!bucket) return null
  return DEFAULTS[bucket]
}
