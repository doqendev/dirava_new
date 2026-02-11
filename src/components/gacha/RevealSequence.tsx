'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, VolumeX, SkipForward } from 'lucide-react'
import { useGachaStore, useGachaPhase, useGachaMuted } from '@/stores/gachaStore'
import { MysteryBox3D } from './MysteryBox3D'
import { RarityBurst } from './RarityBurst'
import { ItemReveal } from './ItemReveal'
import { CelebrationEffects } from './CelebrationEffects'
import { ANIMATION_TIMING } from '@/lib/gacha/constants'
import { useSoundEffects } from '@/lib/gacha/sounds'
import type { GachaRevealResult, RevealPhase } from '@/types/gacha'

interface RevealSequenceProps {
  result: GachaRevealResult
  themeColor?: string
}

export function RevealSequence({ result, themeColor = '#00f5ff' }: RevealSequenceProps) {
  const phase = useGachaPhase()
  const isMuted = useGachaMuted()
  const { setPhase, setIsAnimating, toggleMute, requestSkip, canSkip } = useGachaStore()
  const { playSound } = useSoundEffects()

  // Animation phase progression
  const progressPhase = useCallback(() => {
    const phases: RevealPhase[] = [
      'intro',
      'shake',
      'open',
      'rarity-reveal',
      'item-reveal',
      'celebration',
      'complete',
    ]
    const currentIndex = phases.indexOf(phase)
    if (currentIndex >= 0 && currentIndex < phases.length - 1) {
      const nextPhase = phases[currentIndex + 1]
      if (nextPhase) {
        setPhase(nextPhase)
      }
    }
  }, [phase, setPhase])

  // Handle phase timing
  useEffect(() => {
    if (phase === 'idle' || phase === 'complete') return

    setIsAnimating(true)

    const timings: Record<string, number> = {
      intro: ANIMATION_TIMING.intro,
      shake: ANIMATION_TIMING.shake,
      open: ANIMATION_TIMING.open,
      'rarity-reveal': ANIMATION_TIMING.rarityReveal,
      'item-reveal': ANIMATION_TIMING.itemReveal,
      celebration: ANIMATION_TIMING.celebration,
    }

    const duration = timings[phase]
    if (duration) {
      const timer = setTimeout(progressPhase, duration)
      return () => clearTimeout(timer)
    }

    return undefined
  }, [phase, progressPhase, setIsAnimating])

  // Sound effects for phases
  useEffect(() => {
    if (isMuted) return

    switch (phase) {
      case 'shake':
        playSound('boxShake')
        break
      case 'open':
        playSound('boxOpen')
        break
      case 'rarity-reveal':
        playSound(`reveal${result.rarity.charAt(0).toUpperCase()}${result.rarity.slice(1)}` as 'revealCommon' | 'revealRare' | 'revealEpic' | 'revealLegendary')
        break
    }
  }, [phase, isMuted, playSound, result.rarity])

  // Handle skip
  const handleSkip = () => {
    if (canSkip()) {
      requestSkip()
      setPhase('complete')
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-bg-primary overflow-hidden">
      {/* Background gradient based on phase */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background:
            phase === 'rarity-reveal' || phase === 'item-reveal' || phase === 'celebration'
              ? `radial-gradient(circle at center, rgba(${getRarityRGB(result.rarity)}, 0.15) 0%, transparent 70%)`
              : 'radial-gradient(circle at center, rgba(0, 245, 255, 0.05) 0%, transparent 70%)',
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Main content */}
      <div className="relative flex items-center justify-center min-h-screen">
        <AnimatePresence mode="wait">
          {/* Box phases: intro, shake, open */}
          {(phase === 'intro' || phase === 'shake' || phase === 'open') && (
            <MysteryBox3D
              key="mystery-box"
              themeColor={themeColor}
              phase={phase}
            />
          )}

          {/* Rarity burst */}
          {phase === 'rarity-reveal' && (
            <RarityBurst key="rarity-burst" rarity={result.rarity} />
          )}

          {/* Item reveal */}
          {(phase === 'item-reveal' || phase === 'celebration') && (
            <ItemReveal
              key="item-reveal"
              product={result.revealedProduct}
              rarity={result.rarity}
            />
          )}
        </AnimatePresence>

        {/* Celebration effects overlay */}
        {phase === 'celebration' && (
          <CelebrationEffects rarity={result.rarity} />
        )}
      </div>

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom flex items-center justify-center gap-3">
        {/* Mute button */}
        <button
          onClick={toggleMute}
          className="p-4 rounded-full bg-white/10 active:bg-white/20 transition-colors"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className="w-6 h-6 text-white/60" />
          ) : (
            <Volume2 className="w-6 h-6 text-white/60" />
          )}
        </button>

        {/* Skip button */}
        {canSkip() && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleSkip}
            className="flex items-center gap-2 px-6 py-4 rounded-full bg-white/10 active:bg-white/20 transition-colors text-white/60 active:text-white"
          >
            <SkipForward className="w-5 h-5" />
            <span className="text-base font-medium">Skip</span>
          </motion.button>
        )}
      </div>

      {/* Phase indicator (for debugging, can be hidden in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed top-4 left-4 text-xs text-white/30 font-mono">
          Phase: {phase}
        </div>
      )}
    </div>
  )
}

function getRarityRGB(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return '255, 215, 0' // Gold
    case 'epic':
      return '168, 85, 247' // Purple
    case 'rare':
      return '59, 130, 246' // Blue
    case 'common':
    default:
      return '34, 197, 94' // Green
  }
}
