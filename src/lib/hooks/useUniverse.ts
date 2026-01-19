'use client'

import { useMemo } from 'react'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'
import type { UniverseSlug } from '@/types/universe'

/**
 * Hook to get universe configuration and theming
 */
export function useUniverse(slug: string | undefined) {
  return useMemo(() => {
    if (!slug) return null

    const config = UNIVERSE_CONFIG[slug as UniverseSlug]
    if (!config) return null

    return {
      slug: config.slug,
      name: config.name,
      color: config.color,
      colorName: config.colorName,
      classes: {
        glow: config.glowClass,
        border: config.borderClass,
        textGlow: config.textGlowClass,
      },
      effect: config.bgEffect,
    }
  }, [slug])
}

/**
 * Get all available universes
 */
export function useUniverses() {
  return useMemo(() => {
    return Object.values(UNIVERSE_CONFIG)
  }, [])
}
