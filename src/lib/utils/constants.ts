/**
 * Application-wide constants
 */

export const SITE_NAME = 'Mizoke'
export const SITE_TAGLINE = 'Your Anime Spirit'

/**
 * Universe configuration with theme colors and metadata
 */
export const UNIVERSE_CONFIG = {
  'one-piece': {
    slug: 'one-piece',
    name: 'One Piece',
    color: '#00f5ff',
    colorName: 'cyan',
    glowClass: 'shadow-glow-cyan',
    borderClass: 'border-neon-cyan',
    textGlowClass: 'text-glow-cyan',
    bgEffect: 'portal',
  },
  'demon-slayer': {
    slug: 'demon-slayer',
    name: 'Demon Slayer',
    color: '#ff2d6a',
    colorName: 'pink',
    glowClass: 'shadow-glow-pink',
    borderClass: 'border-neon-pink',
    textGlowClass: 'text-glow-pink',
    bgEffect: 'embers',
  },
  'dragon-ball': {
    slug: 'dragon-ball',
    name: 'Dragon Ball',
    color: '#ff8c00',
    colorName: 'orange',
    glowClass: 'shadow-glow-orange',
    borderClass: 'border-neon-orange',
    textGlowClass: 'text-glow-orange',
    bgEffect: 'lightning',
  },
  'hunter-hunter': {
    slug: 'hunter-hunter',
    name: 'Hunter x Hunter',
    color: '#00ff88',
    colorName: 'green',
    glowClass: 'shadow-glow-green',
    borderClass: 'border-neon-green',
    textGlowClass: 'text-glow-green',
    bgEffect: 'nen',
  },
  'attack-on-titan': {
    slug: 'attack-on-titan',
    name: 'Attack on Titan',
    color: '#ff8c00',
    colorName: 'orange',
    glowClass: 'shadow-glow-orange',
    borderClass: 'border-neon-orange',
    textGlowClass: 'text-glow-orange',
    bgEffect: 'embers',
  },
  'digimon': {
    slug: 'digimon',
    name: 'Digimon',
    color: '#00f5ff',
    colorName: 'cyan',
    glowClass: 'shadow-glow-cyan',
    borderClass: 'border-neon-cyan',
    textGlowClass: 'text-glow-cyan',
    bgEffect: 'digital',
  },
  'jujutsu-kaisen': {
    slug: 'jujutsu-kaisen',
    name: 'Jujutsu Kaisen',
    color: '#a855f7',
    colorName: 'purple',
    glowClass: 'shadow-glow-purple',
    borderClass: 'border-neon-purple',
    textGlowClass: 'text-glow-purple',
    bgEffect: 'cursed',
  },
  'bleach': {
    slug: 'bleach',
    name: 'Bleach',
    color: '#ffd700',
    colorName: 'yellow',
    glowClass: 'shadow-glow-yellow',
    borderClass: 'border-neon-yellow',
    textGlowClass: 'text-glow-yellow',
    bgEffect: 'reiatsu',
  },
} as const

export type UniverseSlug = keyof typeof UNIVERSE_CONFIG

/**
 * Navigation items for bottom nav
 */
export const NAV_ITEMS = [
  { icon: 'home', label: 'HOME', href: '/' },
  { icon: 'globe', label: 'WORLDS', href: '/worlds' },
  { icon: 'package', label: 'DROPS', href: '/drops' },
  { icon: 'user', label: 'PROFILE', href: '/profile' },
] as const

/**
 * Breakpoints matching Tailwind config
 */
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

/**
 * Animation timing constants
 */
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  page: 300,
} as const

/**
 * Product rarity levels
 */
export const RARITY_LEVELS = {
  common: { label: 'Common', color: '#ffffff' },
  rare: { label: 'Rare', color: '#a855f7' },
  legendary: { label: 'Legendary', color: '#ffd700' },
} as const

/**
 * Social media links (shared between Footer and Organization schema)
 */
export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/mizoke' },
  { label: 'Twitter', href: 'https://twitter.com/mizoke' },
  { label: 'TikTok', href: 'https://tiktok.com/@mizoke' },
  { label: 'Discord', href: 'https://discord.gg/mizoke' },
] as const
