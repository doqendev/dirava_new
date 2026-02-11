'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useGachaMuted } from '@/stores/gachaStore'
import { SOUND_FILES } from './constants'

type SoundName = keyof typeof SOUND_FILES

interface AudioCache {
  [key: string]: HTMLAudioElement
}

// Global audio cache
const audioCache: AudioCache = {}

/**
 * Preload audio files for better performance
 */
export function preloadSounds(): void {
  if (typeof window === 'undefined') return

  Object.entries(SOUND_FILES).forEach(([name, path]) => {
    if (!audioCache[name]) {
      const audio = new Audio(path)
      audio.preload = 'auto'
      audioCache[name] = audio
    }
  })
}

/**
 * Play a sound effect
 */
export function playSound(name: SoundName, volume: number = 0.5): void {
  if (typeof window === 'undefined') return

  try {
    let audio = audioCache[name]

    if (!audio) {
      audio = new Audio(SOUND_FILES[name])
      audioCache[name] = audio
    }

    // Clone for overlapping sounds
    const sound = audio.cloneNode() as HTMLAudioElement
    sound.volume = Math.max(0, Math.min(1, volume))

    sound.play().catch((err) => {
      // Autoplay was prevented, user hasn't interacted yet
      console.debug('Sound play prevented:', err)
    })
  } catch (error) {
    console.error('Error playing sound:', error)
  }
}

/**
 * Stop all playing sounds
 */
export function stopAllSounds(): void {
  Object.values(audioCache).forEach((audio) => {
    audio.pause()
    audio.currentTime = 0
  })
}

/**
 * Hook for playing sounds with mute support
 */
export function useSoundEffects() {
  const isMuted = useGachaMuted()
  const audioContextRef = useRef<AudioContext | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  // Initialize Web Audio API context
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Create audio context on first user interaction
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        gainNodeRef.current = audioContextRef.current.createGain()
        gainNodeRef.current.connect(audioContextRef.current.destination)
      }
      // Resume context if suspended
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume()
      }
    }

    // Try to initialize on click/touch
    const handleInteraction = () => {
      initAudioContext()
      preloadSounds()
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }

    window.addEventListener('click', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('click', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
    }
  }, [])

  // Update gain based on mute state
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = isMuted ? 0 : 1
    }
  }, [isMuted])

  const playSoundEffect = useCallback(
    (name: SoundName, volume: number = 0.5) => {
      if (isMuted) return
      playSound(name, volume)
    },
    [isMuted]
  )

  const stopAll = useCallback(() => {
    stopAllSounds()
  }, [])

  return {
    playSound: playSoundEffect,
    stopAll,
    isMuted,
  }
}

/**
 * Create placeholder sound files info for documentation
 * These files should be created/added to public/sounds/gacha/
 */
export const REQUIRED_SOUND_FILES = [
  {
    name: 'box-shake.mp3',
    description: 'Anticipation building sound during box shake phase',
    duration: '~2 seconds, loopable',
  },
  {
    name: 'box-open.mp3',
    description: 'Burst/explosion sound when box opens',
    duration: '~0.5 seconds',
  },
  {
    name: 'reveal-common.mp3',
    description: 'Simple chime for common items',
    duration: '~1 second',
  },
  {
    name: 'reveal-rare.mp3',
    description: 'Mystical tone for rare items',
    duration: '~1.5 seconds',
  },
  {
    name: 'reveal-epic.mp3',
    description: 'Powerful reveal sound for epic items',
    duration: '~2 seconds',
  },
  {
    name: 'reveal-legendary.mp3',
    description: 'Epic fanfare for legendary items',
    duration: '~3 seconds',
  },
]
