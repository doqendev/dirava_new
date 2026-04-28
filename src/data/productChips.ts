import type { LucideIcon } from 'lucide-react'
import { Sparkles, Package } from 'lucide-react'

export interface ProductChip {
  icon: LucideIcon
  /** Short label shown directly under the title (UPPERCASE rendered by the component). */
  label: string
}

/**
 * Single global descriptor used under the product title for every
 * custom/personalized product. Previously this was a per-handle map
 * with slight per-product variations ("UV painted", "LED-lit",
 * "Pocket-sized"…) — but the value the customer actually needs to
 * know up here is identical across the catalogue: this is a custom,
 * made-to-order item. Specific material / format details belong in
 * the long-form description and the "Why this hits different" grid.
 */
const CUSTOM_PRODUCT_CHIPS: ProductChip[] = [
  { icon: Sparkles, label: 'Personalized' },
  { icon: Package, label: 'Made to order' },
]

export function getProductChips(_handle: string): ProductChip[] {
  return CUSTOM_PRODUCT_CHIPS
}
