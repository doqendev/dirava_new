/**
 * Universe-related types
 */

import type { UNIVERSE_CONFIG } from '@/lib/utils/constants'

export type UniverseSlug = keyof typeof UNIVERSE_CONFIG

export type UniverseColorName = 'cyan' | 'pink' | 'orange' | 'green' | 'purple' | 'yellow'

export type UniverseEffect = 'portal' | 'embers' | 'lightning' | 'nen' | 'digital' | 'cursed' | 'reiatsu'

export interface UniverseTheme {
  slug: UniverseSlug
  name: string
  color: string
  colorName: UniverseColorName
  glowClass: string
  borderClass: string
  textGlowClass: string
  bgEffect: UniverseEffect
}

export interface Universe {
  slug: UniverseSlug
  name: string
  description?: string
  itemCount: number
  backgroundImage?: string
  theme: UniverseTheme
}

export interface UniverseCardData {
  slug: string
  name: string
  itemCount: number
  themeColor: UniverseColorName
  backgroundImage?: string
}
