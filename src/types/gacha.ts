/**
 * Gacha / Mystery Box Types
 *
 * Themed mystery box system with redeemable codes
 */

import type { ShopifyImage, ShopifyMoney } from './shopify'

/**
 * Rarity tiers for items
 */
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'

/**
 * Animation phases during reveal
 */
export type RevealPhase =
  | 'idle'
  | 'intro'
  | 'shake'
  | 'open'
  | 'rarity-reveal'
  | 'item-reveal'
  | 'celebration'
  | 'complete'

/**
 * Redemption code status
 */
export type CodeStatus = 'unused' | 'revealed' | 'claimed' | 'shipped'

/**
 * Loot pool item stored in Shopify metafield
 */
export interface LootPoolItem {
  productHandle: string
  variantId?: string
  rarity: Rarity
  weight: number // Relative weight for selection within rarity
}

/**
 * Loot pool configuration for a mystery box
 */
export interface LootPool {
  odds: RarityOdds
  items: LootPoolItem[]
}

/**
 * Odds for each rarity tier (percentages that sum to 100)
 */
export interface RarityOdds {
  common: number
  rare: number
  epic: number
  legendary: number
}

/**
 * Mystery box theme configuration (stored in metafield)
 */
export interface MysteryBoxTheme {
  displayName: string
  description: string
  color: string // Primary theme color (hex)
  secondaryColor?: string
}

/**
 * Mystery box product from Shopify
 */
export interface MysteryBox {
  id: string
  handle: string
  title: string
  description: string
  image: ShopifyImage | null
  price: ShopifyMoney
  lootPool: LootPool | null
  theme: MysteryBoxTheme | null
}

/**
 * Shipping address for claim
 */
export interface ShippingAddress {
  firstName: string
  lastName: string
  address1: string
  address2?: string
  city: string
  province?: string
  provinceCode?: string
  country: string
  countryCode: string
  zip: string
  phone?: string
}

/**
 * Redemption code stored in Shopify Metaobject
 */
export interface RedemptionCode {
  id: string // Metaobject GID
  code: string // 8 char code (e.g., "DFRT-X7K2")
  boxHandle: string // Which mystery box
  purchaseOrderId: string // Original Shopify order GID
  purchaseOrderName?: string // Order number (e.g., "#1001")
  purchaserEmail: string // Who bought it
  status: CodeStatus

  // After reveal
  revealedProductHandle?: string
  revealedVariantId?: string
  revealedRarity?: Rarity
  revealedAt?: string // ISO timestamp
  seed?: string // For audit trail

  // After claim
  shippingAddress?: ShippingAddress
  claimedAt?: string // ISO timestamp
  fulfillmentOrderId?: string

  createdAt: string // ISO timestamp
}

/**
 * Product variant for selection
 */
export interface ProductVariant {
  id: string
  title: string
  availableForSale: boolean
  price: ShopifyMoney
}

/**
 * Revealed product details
 */
export interface RevealedProduct {
  id: string
  handle: string
  title: string
  description?: string
  image: ShopifyImage | null
  price: ShopifyMoney
  variantId?: string
  variants?: ProductVariant[]
}

/**
 * Result of a gacha reveal
 */
export interface GachaRevealResult {
  code: string
  boxHandle: string
  boxTitle: string
  revealedProduct: RevealedProduct
  rarity: Rarity
  revealedAt: string // ISO timestamp
  seed: string // For audit trail
}

/**
 * API response for code status
 */
export interface CodeStatusResponse {
  success: boolean
  code?: RedemptionCode
  box?: MysteryBox
  revealedProduct?: RevealedProduct
  error?: string
}

/**
 * API response for reveal endpoint
 */
export interface RevealApiResponse {
  success: boolean
  result?: GachaRevealResult
  error?: string
  alreadyRevealed?: boolean
}

/**
 * API response for claim endpoint
 */
export interface ClaimApiResponse {
  success: boolean
  fulfillmentOrderId?: string
  error?: string
}

/**
 * API response for boxes list
 */
export interface BoxesApiResponse {
  success: boolean
  boxes?: MysteryBox[]
  error?: string
}

/**
 * Grouped items by rarity for display
 */
export interface ItemsByRarity {
  rarity: Rarity
  items: Array<{
    handle: string
    title: string
    image: ShopifyImage | null
  }>
}

/**
 * Animation timing configuration
 */
export interface AnimationTiming {
  intro: number
  shake: number
  open: number
  rarityReveal: number
  itemReveal: number
  celebration: number
}

/**
 * Rarity visual configuration
 */
export interface RarityVisualConfig {
  color: string
  glowColor: string
  particleCount: number
  soundFile: string
  displayName: string
}
