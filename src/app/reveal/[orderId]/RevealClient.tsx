'use client'

import { useEffect, useState, useCallback } from 'react'
import { useGachaStore } from '@/stores/gachaStore'
import { RevealSequence } from '@/components/gacha/RevealSequence'
import { RevealComplete } from '@/components/gacha/RevealComplete'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { GachaRevealResult, RevealApiResponse } from '@/types/gacha'

interface RevealClientProps {
  orderId: string
}

export function RevealClient({ orderId }: RevealClientProps) {
  const [result, setResult] = useState<GachaRevealResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [alreadyRevealed, setAlreadyRevealed] = useState(false)

  const { phase, setPhase, reset } = useGachaStore()

  const performReveal = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/gacha/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      })

      const data: RevealApiResponse = await response.json()

      if (!data.success || !data.result) {
        setError(data.error || 'Failed to reveal mystery box')
        return
      }

      setResult(data.result)
      setAlreadyRevealed(data.alreadyRevealed || false)

      // If already revealed, skip animation
      if (data.alreadyRevealed) {
        setPhase('complete')
      } else {
        setPhase('intro')
      }
    } catch (err) {
      console.error('Reveal error:', err)
      setError('Failed to connect to server. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [orderId, setPhase])

  useEffect(() => {
    reset()
    performReveal()
  }, [performReveal, reset])

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-display">Loading your mystery box...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="font-display text-2xl text-white mb-2">Unable to Reveal</h2>
          <p className="text-white/60 mb-6">{error}</p>
          <button
            onClick={performReveal}
            className="px-6 py-3 bg-neon-cyan text-black font-medium rounded-lg hover:bg-neon-cyan/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // No result
  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-primary">
        <div className="text-center">
          <p className="text-white/60">No reveal data found.</p>
        </div>
      </div>
    )
  }

  // Complete state (after animation or already revealed)
  if (phase === 'complete') {
    return <RevealComplete result={result} alreadyRevealed={alreadyRevealed} />
  }

  // Animation sequence
  return <RevealSequence result={result} />
}
