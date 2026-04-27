import type { LucideIcon } from 'lucide-react'
import { Brush, Package, Lightbulb, Box } from 'lucide-react'

export interface ProductChip {
  icon: LucideIcon
  /** Short label shown inside the pill (UPPERCASE rendered by the component). */
  label: string
}

/**
 * Short attribute chips shown directly under the product title.
 * Keyed by product handle. Falls back to a sensible default pair when
 * a handle has no entry. Kept intentionally minimal — only highlight
 * differentiators, never generic trust signals (those live below the
 * CTA so they support the buying decision instead of crowding the
 * top of the page).
 */
export const productChips: Record<string, ProductChip[]> = {
  'one-piece-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
  ],
  'one-piece-custom-keychain': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Box, label: 'Pocket-sized' },
  ],
  'one-piece-custom-led-lightbox-sign': [
    { icon: Lightbulb, label: 'LED-lit' },
    { icon: Brush, label: 'UV painted' },
  ],
  'demon-slayer-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
  ],
  'dragon-ball-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
  ],
  'dragon-ball-custom-keychain': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Box, label: 'Pocket-sized' },
  ],
  'hunter-x-hunter-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
  ],
  'hunter-x-hunter-custom-keychain': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Box, label: 'Pocket-sized' },
  ],
  'bleach-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
  ],
  'attack-on-titan-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
  ],
  'digimon-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
  ],
}

const DEFAULT_CHIPS: ProductChip[] = [
  { icon: Brush, label: 'UV painted' },
  { icon: Package, label: 'Made to order' },
]

export function getProductChips(handle: string): ProductChip[] {
  return productChips[handle] ?? DEFAULT_CHIPS
}
