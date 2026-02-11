/**
 * Gacha / Mystery Box Constants
 *
 * Themed mystery box system - no tiers, each box has its own theme and items
 */

import type { Rarity, AnimationTiming, RarityVisualConfig } from '@/types/gacha'

/**
 * Product type tag used to identify mystery box products in Shopify
 * Add this tag to any product that should be treated as a mystery box
 */
export const MYSTERY_BOX_PRODUCT_TAG = 'mystery-box'

/**
 * Product type for mystery boxes
 */
export const MYSTERY_BOX_PRODUCT_TYPE = 'Mystery Box'

/**
 * Animation timing in milliseconds
 */
export const ANIMATION_TIMING: AnimationTiming = {
  intro: 1500,
  shake: 2000,
  open: 800,
  rarityReveal: 1200,
  itemReveal: 1500,
  celebration: 3000,
}

/**
 * Total animation duration
 */
export const TOTAL_ANIMATION_DURATION =
  ANIMATION_TIMING.intro +
  ANIMATION_TIMING.shake +
  ANIMATION_TIMING.open +
  ANIMATION_TIMING.rarityReveal +
  ANIMATION_TIMING.itemReveal +
  ANIMATION_TIMING.celebration

/**
 * Rarity visual configurations
 */
export const RARITY_CONFIG: Record<Rarity, RarityVisualConfig> = {
  common: {
    color: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.5)',
    particleCount: 20,
    soundFile: 'reveal-common.mp3',
    displayName: 'Common',
  },
  rare: {
    color: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.6)',
    particleCount: 40,
    soundFile: 'reveal-rare.mp3',
    displayName: 'Rare',
  },
  epic: {
    color: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.6)',
    particleCount: 60,
    soundFile: 'reveal-epic.mp3',
    displayName: 'Epic',
  },
  legendary: {
    color: '#ffd700',
    glowColor: 'rgba(255, 215, 0, 0.7)',
    particleCount: 100,
    soundFile: 'reveal-legendary.mp3',
    displayName: 'Legendary',
  },
}

/**
 * Rarity order for sorting (highest to lowest)
 */
export const RARITY_ORDER: Rarity[] = ['legendary', 'epic', 'rare', 'common']

/**
 * Metafield namespace and keys for gacha
 */
export const GACHA_METAFIELD = {
  namespace: 'gacha',
  lootPoolKey: 'loot_pool',
  themeKey: 'theme',
}

/**
 * Sound file paths
 */
export const SOUND_FILES = {
  boxShake: '/sounds/gacha/box-shake.mp3',
  boxOpen: '/sounds/gacha/box-open.mp3',
  revealCommon: '/sounds/gacha/reveal-common.mp3',
  revealRare: '/sounds/gacha/reveal-rare.mp3',
  revealEpic: '/sounds/gacha/reveal-epic.mp3',
  revealLegendary: '/sounds/gacha/reveal-legendary.mp3',
}

/**
 * Redemption code configuration
 */
export const CODE_CONFIG = {
  length: 8,
  charset: 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', // Excludes ambiguous chars: 0, O, I, 1
  separator: '-',
  segmentLength: 4, // XXXX-XXXX format
}

/**
 * Metaobject type for redemption codes
 */
export const REDEMPTION_CODE_METAOBJECT = {
  type: 'redemption_code',
  namespace: 'gacha',
}

/**
 * Default theme color for boxes without custom theme
 */
export const DEFAULT_BOX_THEME = {
  color: '#00f5ff',
  secondaryColor: '#ff2d6a',
}

/**
 * Check if a product is a mystery box (by tag or product type)
 */
export function isMysteryBox(tags: string[], productType?: string): boolean {
  const hasTag = tags.some(
    (tag) => tag.toLowerCase() === MYSTERY_BOX_PRODUCT_TAG.toLowerCase()
  )
  const hasType = productType?.toLowerCase() === MYSTERY_BOX_PRODUCT_TYPE.toLowerCase()
  return hasTag || hasType
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: Rarity): string {
  return RARITY_CONFIG[rarity].color
}

/**
 * Get rarity glow color
 */
export function getRarityGlow(rarity: Rarity): string {
  return RARITY_CONFIG[rarity].glowColor
}

/**
 * Sort rarities by order (legendary first)
 */
export function sortByRarity<T extends { rarity: Rarity }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity)
  )
}
