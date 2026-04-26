import type { LucideIcon } from 'lucide-react'
import { Brush, Package, Shield, Sparkles, Lightbulb, Box } from 'lucide-react'

export interface ProductChip {
  icon: LucideIcon
  /** Short label shown inside the pill (UPPERCASE rendered by the component). */
  label: string
}

/**
 * Three short attribute chips shown directly under the product title.
 * Keyed by product handle. Falls back to a sensible default trio when
 * a handle has no entry.
 */
export const productChips: Record<string, ProductChip[]> = {
  'one-piece-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Shield, label: 'Sturdy plastic' },
  ],
  'one-piece-custom-keychain': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Box, label: 'Pocket-sized' },
  ],
  'one-piece-custom-led-lightbox-sign': [
    { icon: Lightbulb, label: 'LED-lit' },
    { icon: Package, label: 'Made to order' },
    { icon: Sparkles, label: 'Acrylic + LED' },
  ],
  'demon-slayer-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Shield, label: 'Sturdy plastic' },
  ],
  'dragon-ball-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Shield, label: 'Sturdy plastic' },
  ],
  'dragon-ball-custom-keychain': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Box, label: 'Pocket-sized' },
  ],
  'hunter-x-hunter-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Shield, label: 'Sturdy plastic' },
  ],
  'hunter-x-hunter-custom-keychain': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Box, label: 'Pocket-sized' },
  ],
  'bleach-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Shield, label: 'Sturdy plastic' },
  ],
  'attack-on-titan-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Shield, label: 'Sturdy plastic' },
  ],
  'digimon-custom-sign': [
    { icon: Brush, label: 'UV painted' },
    { icon: Package, label: 'Made to order' },
    { icon: Shield, label: 'Sturdy plastic' },
  ],
}

const DEFAULT_CHIPS: ProductChip[] = [
  { icon: Brush, label: 'UV painted' },
  { icon: Package, label: 'Made to order' },
  { icon: Shield, label: 'Sturdy plastic' },
]

export function getProductChips(handle: string): ProductChip[] {
  return productChips[handle] ?? DEFAULT_CHIPS
}
