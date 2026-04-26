import type { LucideIcon } from 'lucide-react'
import { Brush, Shield, Package, Star, Sparkles, Lightbulb, Box, Heart } from 'lucide-react'

export interface FeatureTile {
  icon: LucideIcon
  title: string
  body: string
}

/**
 * Four "Why this hits different" feature tiles per product handle.
 * Falls back to a generic 4-tile set when a handle has no entry.
 */
export const productFeatureTiles: Record<string, FeatureTile[]> = {
  'one-piece-custom-led-lightbox-sign': [
    { icon: Lightbulb, title: 'LED-lit', body: 'Glows the moment you flick the switch.' },
    { icon: Shield, title: 'Durable acrylic', body: 'Built to last on a desk or wall.' },
    { icon: Package, title: 'Made to order', body: 'Crafted just for you.' },
    { icon: Star, title: 'Anime accurate', body: 'Designed for true One Piece fans.' },
  ],
  'one-piece-custom-keychain': [
    { icon: Brush, title: 'UV painted', body: 'Vibrant colours that pop and last.' },
    { icon: Box, title: 'Pocket-sized', body: 'Hand-painted micro-detail.' },
    { icon: Package, title: 'Made to order', body: 'Custom made just for you.' },
    { icon: Star, title: 'Anime accurate', body: 'Designed for true fans.' },
  ],
  'dragon-ball-custom-keychain': [
    { icon: Brush, title: 'UV painted', body: 'Vibrant colours that pop and last.' },
    { icon: Box, title: 'Pocket-sized', body: 'Hand-painted micro-detail.' },
    { icon: Package, title: 'Made to order', body: 'Custom made just for you.' },
    { icon: Star, title: 'Anime accurate', body: 'Designed for true fans.' },
  ],
  'hunter-x-hunter-custom-keychain': [
    { icon: Brush, title: 'UV painted', body: 'Vibrant colours that pop and last.' },
    { icon: Box, title: 'Pocket-sized', body: 'Hand-painted micro-detail.' },
    { icon: Package, title: 'Made to order', body: 'Custom made just for you.' },
    { icon: Star, title: 'Anime accurate', body: 'Designed for true fans.' },
  ],
}

const DEFAULT_FEATURES: FeatureTile[] = [
  { icon: Brush, title: 'UV painted', body: 'Vibrant colours that pop and last.' },
  { icon: Shield, title: 'Durable material', body: 'Made with premium PLA plastic.' },
  { icon: Package, title: 'Made to order', body: 'Custom made just for you.' },
  { icon: Star, title: 'Anime accurate', body: 'Designed for true fans.' },
]

export function getProductFeatureTiles(handle: string): FeatureTile[] {
  return productFeatureTiles[handle] ?? DEFAULT_FEATURES
}

// Keep imports tree-shakeable when individual icons aren't actually
// referenced by any active config above.
void Sparkles
void Heart
