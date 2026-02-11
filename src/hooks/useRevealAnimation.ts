'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useGachaStore } from '@/stores/gachaStore'
import { ANIMATION_TIMING } from '@/lib/gacha/constants'
import type { RevealPhase } from '@/types/gacha'

interface UseRevealAnimationOptions {
  autoStart?: boolean
  onPhaseChange?: (phase: RevealPhase) => void
  onComplete?: () => void
}

const PHASE_ORDER: RevealPhase[] = [
  'idle',
  'intro',
  'shake',
  'open',
  'rarity-reveal',
  'item-reveal',
  'celebration',
  'complete',
]

export function useRevealAnimation(options: UseRevealAnimationOptions = {}) {
  const { autoStart = false, onPhaseChange, onComplete } = options

  const {
    phase,
    setPhase,
    isAnimating,
    setIsAnimating,
    skipRequested,
  } = useGachaStore()

  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const hasStartedRef = useRef(false)

  // Clear any existing timeout
  const clearPhaseTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // Get duration for current phase
  const getPhaseDuration = useCallback((currentPhase: RevealPhase): number => {
    const durations: Record<string, number> = {
      idle: 0,
      intro: ANIMATION_TIMING.intro,
      shake: ANIMATION_TIMING.shake,
      open: ANIMATION_TIMING.open,
      'rarity-reveal': ANIMATION_TIMING.rarityReveal,
      'item-reveal': ANIMATION_TIMING.itemReveal,
      celebration: ANIMATION_TIMING.celebration,
      complete: 0,
    }
    return durations[currentPhase] || 0
  }, [])

  // Progress to next phase
  const nextPhase = useCallback(() => {
    const currentIndex = PHASE_ORDER.indexOf(phase)
    if (currentIndex >= 0 && currentIndex < PHASE_ORDER.length - 1) {
      const next = PHASE_ORDER[currentIndex + 1]
      if (next) {
        setPhase(next)
        onPhaseChange?.(next)

        if (next === 'complete') {
          setIsAnimating(false)
          onComplete?.()
        }
      }
    }
  }, [phase, setPhase, setIsAnimating, onPhaseChange, onComplete])

  // Skip to complete
  const skipToComplete = useCallback(() => {
    clearPhaseTimeout()
    setPhase('complete')
    setIsAnimating(false)
    onPhaseChange?.('complete')
    onComplete?.()
  }, [clearPhaseTimeout, setPhase, setIsAnimating, onPhaseChange, onComplete])

  // Start animation sequence
  const start = useCallback(() => {
    if (hasStartedRef.current) return
    hasStartedRef.current = true
    setIsAnimating(true)
    setPhase('intro')
    onPhaseChange?.('intro')
  }, [setIsAnimating, setPhase, onPhaseChange])

  // Reset animation
  const reset = useCallback(() => {
    clearPhaseTimeout()
    hasStartedRef.current = false
    setPhase('idle')
    setIsAnimating(false)
  }, [clearPhaseTimeout, setPhase, setIsAnimating])

  // Handle phase transitions with timing
  useEffect(() => {
    if (phase === 'idle' || phase === 'complete') return

    const duration = getPhaseDuration(phase)
    if (duration > 0) {
      clearPhaseTimeout()
      timeoutRef.current = setTimeout(nextPhase, duration)
    }

    return clearPhaseTimeout
  }, [phase, getPhaseDuration, nextPhase, clearPhaseTimeout])

  // Handle skip request
  useEffect(() => {
    if (skipRequested && isAnimating) {
      skipToComplete()
    }
  }, [skipRequested, isAnimating, skipToComplete])

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && phase === 'idle' && !hasStartedRef.current) {
      start()
    }
  }, [autoStart, phase, start])

  // Cleanup on unmount
  useEffect(() => {
    return clearPhaseTimeout
  }, [clearPhaseTimeout])

  return {
    phase,
    isAnimating,
    start,
    reset,
    skip: skipToComplete,
    nextPhase,
    progress: PHASE_ORDER.indexOf(phase) / (PHASE_ORDER.length - 1),
  }
}

/**
 * Hook to track animation progress for UI
 */
export function useAnimationProgress() {
  const phase = useGachaStore((state) => state.phase)

  const currentIndex = PHASE_ORDER.indexOf(phase)
  const totalPhases = PHASE_ORDER.length - 1 // Exclude 'idle'

  return {
    phase,
    phaseIndex: currentIndex,
    progress: currentIndex / totalPhases,
    isComplete: phase === 'complete',
    isIdle: phase === 'idle',
  }
}
