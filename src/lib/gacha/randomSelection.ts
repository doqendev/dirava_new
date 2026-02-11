/**
 * Server-side weighted random selection for Gacha
 * Uses cryptographically secure randomization
 */

import { randomBytes } from 'crypto'
import type { Rarity, LootPoolItem, RarityOdds } from '@/types/gacha'

/**
 * Generate a cryptographically secure random seed
 */
export function generateSeed(): string {
  return randomBytes(32).toString('hex')
}

/**
 * Generate a secure random number between 0 and 1
 * Uses crypto.randomBytes for server-side security
 */
export function secureRandom(): number {
  const bytes = randomBytes(4)
  const value = bytes.readUInt32BE(0)
  return value / 0xffffffff
}

/**
 * Generate a seeded random number (for reproducibility/audit)
 * Uses a simple hash-based approach
 */
export function seededRandom(seed: string, iteration: number = 0): number {
  const combined = `${seed}:${iteration}`
  let hash = 0
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  // Normalize to 0-1
  return Math.abs(hash) / 0x7fffffff
}

/**
 * Select a rarity based on odds using secure random
 */
export function selectRarity(odds: RarityOdds, seed?: string): Rarity {
  const random = seed ? seededRandom(seed) : secureRandom()
  const roll = random * 100

  let cumulative = 0

  // Check legendary first (lowest odds)
  cumulative += odds.legendary
  if (roll < cumulative) return 'legendary'

  // Then epic
  cumulative += odds.epic
  if (roll < cumulative) return 'epic'

  // Then rare
  cumulative += odds.rare
  if (roll < cumulative) return 'rare'

  // Default to common
  return 'common'
}

/**
 * Filter loot pool items by rarity
 */
export function filterByRarity(items: LootPoolItem[], rarity: Rarity): LootPoolItem[] {
  return items.filter(item => item.rarity === rarity)
}

/**
 * Select an item from a filtered list using weighted random
 */
export function selectWeightedItem(
  items: LootPoolItem[],
  seed?: string,
  iteration: number = 1
): LootPoolItem | null {
  if (items.length === 0) return null
  const firstItem = items[0]
  if (items.length === 1) return firstItem ?? null

  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0)
  const random = seed ? seededRandom(seed, iteration) : secureRandom()
  const roll = random * totalWeight

  let cumulative = 0
  for (const item of items) {
    cumulative += item.weight
    if (roll < cumulative) {
      return item
    }
  }

  // Fallback to last item (shouldn't happen with valid weights)
  const lastItem = items[items.length - 1]
  return lastItem ?? null
}

/**
 * Main gacha selection function
 * 1. Selects a rarity based on tier odds
 * 2. Filters loot pool to that rarity
 * 3. Selects a weighted item from the filtered pool
 * 4. Falls back to adjacent rarities if pool is empty
 */
export function performGachaSelection(
  lootPool: LootPoolItem[],
  odds: RarityOdds,
  seed?: string
): { item: LootPoolItem; rarity: Rarity; seed: string } {
  const usedSeed = seed || generateSeed()

  // Select rarity
  let selectedRarity = selectRarity(odds, usedSeed)

  // Get items of that rarity
  let eligibleItems = filterByRarity(lootPool, selectedRarity)

  // Fallback logic if no items in selected rarity
  // Try adjacent rarities (downgrade first, then upgrade)
  const rarityFallbackOrder: Record<Rarity, Rarity[]> = {
    legendary: ['epic', 'rare', 'common'],
    epic: ['rare', 'legendary', 'common'],
    rare: ['common', 'epic', 'legendary'],
    common: ['rare', 'epic', 'legendary'],
  }

  if (eligibleItems.length === 0) {
    for (const fallbackRarity of rarityFallbackOrder[selectedRarity]) {
      eligibleItems = filterByRarity(lootPool, fallbackRarity)
      if (eligibleItems.length > 0) {
        selectedRarity = fallbackRarity
        break
      }
    }
  }

  // Final fallback: use any item
  if (eligibleItems.length === 0) {
    eligibleItems = lootPool
    const firstEligible = eligibleItems[0]
    if (firstEligible) {
      selectedRarity = firstEligible.rarity
    }
  }

  // Select weighted item
  const selectedItem = selectWeightedItem(eligibleItems, usedSeed, 1)

  if (!selectedItem) {
    throw new Error('No items available in loot pool')
  }

  return {
    item: selectedItem,
    rarity: selectedRarity,
    seed: usedSeed,
  }
}

/**
 * Validate that odds sum to 100
 */
export function validateOdds(odds: RarityOdds): boolean {
  const total = odds.common + odds.rare + odds.epic + odds.legendary
  return Math.abs(total - 100) < 0.01 // Allow small floating point variance
}

/**
 * Calculate expected values for display
 */
export function calculateExpectedValues(
  odds: RarityOdds,
  lootPool: LootPoolItem[]
): Record<Rarity, { count: number; percentage: number }> {
  const result: Record<Rarity, { count: number; percentage: number }> = {
    common: { count: 0, percentage: odds.common },
    rare: { count: 0, percentage: odds.rare },
    epic: { count: 0, percentage: odds.epic },
    legendary: { count: 0, percentage: odds.legendary },
  }

  for (const item of lootPool) {
    result[item.rarity].count++
  }

  return result
}
