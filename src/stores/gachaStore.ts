/**
 * Gacha / Mystery Box Zustand Store
 *
 * Manages reveal animation state and code redemption flow
 */

import { create } from 'zustand'
import type { RevealPhase, GachaRevealResult, Rarity, RedemptionCode, MysteryBox } from '@/types/gacha'

interface GachaState {
  // Current redemption code
  currentCode: string | null
  redemptionCode: RedemptionCode | null
  mysteryBox: MysteryBox | null

  // Reveal state
  phase: RevealPhase
  result: GachaRevealResult | null

  // Animation control
  isAnimating: boolean
  skipRequested: boolean

  // Audio control
  isMuted: boolean

  // Claim flow
  isClaimOpen: boolean

  // Error handling
  error: string | null
  isLoading: boolean

  // Actions
  setCode: (code: string) => void
  setRedemptionCode: (redemptionCode: RedemptionCode) => void
  setMysteryBox: (mysteryBox: MysteryBox) => void
  setPhase: (phase: RevealPhase) => void
  setResult: (result: GachaRevealResult) => void
  setIsAnimating: (isAnimating: boolean) => void
  requestSkip: () => void
  toggleMute: () => void
  openClaim: () => void
  closeClaim: () => void
  setError: (error: string | null) => void
  setIsLoading: (isLoading: boolean) => void
  reset: () => void

  // Computed helpers
  canSkip: () => boolean
}

const initialState = {
  currentCode: null,
  redemptionCode: null,
  mysteryBox: null,
  phase: 'idle' as RevealPhase,
  result: null,
  isAnimating: false,
  skipRequested: false,
  isMuted: false,
  isClaimOpen: false,
  error: null,
  isLoading: false,
}

export const useGachaStore = create<GachaState>((set, get) => ({
  ...initialState,

  setCode: (code) => set({ currentCode: code }),

  setRedemptionCode: (redemptionCode) => set({ redemptionCode }),

  setMysteryBox: (mysteryBox) => set({ mysteryBox }),

  setPhase: (phase) => set({ phase }),

  setResult: (result) => set({ result }),

  setIsAnimating: (isAnimating) => set({ isAnimating }),

  requestSkip: () => {
    const { canSkip } = get()
    if (canSkip()) {
      set({ skipRequested: true })
    }
  },

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  openClaim: () => set({ isClaimOpen: true }),

  closeClaim: () => set({ isClaimOpen: false }),

  setError: (error) => set({ error }),

  setIsLoading: (isLoading) => set({ isLoading }),

  reset: () => set(initialState),

  canSkip: () => {
    const { phase, isAnimating } = get()
    // Can only skip during certain animation phases
    const skippablePhases: RevealPhase[] = ['intro', 'shake', 'open', 'rarity-reveal']
    return isAnimating && skippablePhases.includes(phase)
  },
}))

/**
 * Selector hooks for performance optimization
 */
export const useGachaPhase = () => useGachaStore((state) => state.phase)
export const useGachaResult = () => useGachaStore((state) => state.result)
export const useGachaError = () => useGachaStore((state) => state.error)
export const useGachaIsLoading = () => useGachaStore((state) => state.isLoading)
export const useGachaMuted = () => useGachaStore((state) => state.isMuted)
export const useGachaCode = () => useGachaStore((state) => state.currentCode)
export const useRedemptionCode = () => useGachaStore((state) => state.redemptionCode)
export const useMysteryBox = () => useGachaStore((state) => state.mysteryBox)
export const useIsClaimOpen = () => useGachaStore((state) => state.isClaimOpen)

/**
 * Get rarity-specific styles
 */
export function getRarityStyles(rarity: Rarity): {
  textColor: string
  bgColor: string
  borderColor: string
  glowClass: string
} {
  switch (rarity) {
    case 'legendary':
      return {
        textColor: 'text-yellow-400',
        bgColor: 'bg-yellow-500/20',
        borderColor: 'border-yellow-500',
        glowClass: 'shadow-[0_0_30px_rgba(255,215,0,0.6)]',
      }
    case 'epic':
      return {
        textColor: 'text-purple-400',
        bgColor: 'bg-purple-500/20',
        borderColor: 'border-purple-500',
        glowClass: 'shadow-[0_0_30px_rgba(168,85,247,0.6)]',
      }
    case 'rare':
      return {
        textColor: 'text-blue-400',
        bgColor: 'bg-blue-500/20',
        borderColor: 'border-blue-500',
        glowClass: 'shadow-[0_0_30px_rgba(59,130,246,0.6)]',
      }
    case 'common':
    default:
      return {
        textColor: 'text-green-400',
        bgColor: 'bg-green-500/20',
        borderColor: 'border-green-500',
        glowClass: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]',
      }
  }
}

/**
 * Get box theme color or default
 */
export function getBoxThemeColor(box: MysteryBox | null): string {
  return box?.theme?.color || '#00f5ff'
}
