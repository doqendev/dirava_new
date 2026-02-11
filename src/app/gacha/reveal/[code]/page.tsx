'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react'
import { useGachaStore } from '@/stores/gachaStore'
import { RevealSequence } from '@/components/gacha/RevealSequence'
import { RevealComplete } from '@/components/gacha/RevealComplete'
import type { GachaRevealResult, CodeStatusResponse, RevealApiResponse, MysteryBox } from '@/types/gacha'

type PageState = 'loading' | 'ready' | 'revealing' | 'complete' | 'error'

export default function RevealPage() {
  const params = useParams()
  const code = params.code as string

  const [pageState, setPageState] = useState<PageState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<GachaRevealResult | null>(null)
  const [box, setBox] = useState<MysteryBox | null>(null)
  const [alreadyRevealed, setAlreadyRevealed] = useState(false)

  const { phase, setPhase, reset } = useGachaStore()

  // Fetch code status on mount
  useEffect(() => {
    async function fetchCodeStatus() {
      try {
        const response = await fetch(`/api/gacha/codes/${code}`)
        const data: CodeStatusResponse = await response.json()

        if (!data.success || !data.code) {
          setError(data.error || 'Code not found')
          setPageState('error')
          return
        }

        setBox(data.box || null)

        // If already revealed, show the result immediately
        if (data.code.status !== 'unused' && data.revealedProduct) {
          setResult({
            code: data.code.code,
            boxHandle: data.code.boxHandle,
            boxTitle: data.box?.title || 'Mystery Box',
            revealedProduct: data.revealedProduct,
            rarity: data.code.revealedRarity || 'common',
            revealedAt: data.code.revealedAt || new Date().toISOString(),
            seed: data.code.seed || '',
          })
          setAlreadyRevealed(true)
          setPageState('complete')
          return
        }

        setPageState('ready')
      } catch {
        setError('Failed to load code. Please try again.')
        setPageState('error')
      }
    }

    fetchCodeStatus()
  }, [code])

  // Start the reveal
  const startReveal = useCallback(async () => {
    setPageState('revealing')
    reset()
    setPhase('intro')

    try {
      const response = await fetch('/api/gacha/reveal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })

      const data: RevealApiResponse = await response.json()

      if (!data.success || !data.result) {
        // If already revealed during animation, still show result
        if (data.alreadyRevealed && data.result) {
          setResult(data.result)
          setAlreadyRevealed(true)
        } else {
          setError(data.error || 'Failed to reveal')
          setPageState('error')
        }
        return
      }

      setResult(data.result)
    } catch {
      setError('Failed to reveal. Please try again.')
      setPageState('error')
    }
  }, [code, reset, setPhase])

  // Handle animation completion
  useEffect(() => {
    if (phase === 'complete' && result) {
      setPageState('complete')
    }
  }, [phase, result])

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="fixed inset-0 z-[100] bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your mystery box...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="fixed inset-0 z-[100] bg-bg-primary overflow-y-auto">
        <div className="px-4 py-4 max-w-xl mx-auto">
          <Link
            href="/gacha/reveal"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>

        <div className="px-4 py-12 max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-display text-2xl text-white mb-2">Something Went Wrong</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <Link
            href="/gacha/reveal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan text-black font-medium rounded-xl"
          >
            Try Another Code
          </Link>
        </div>
      </div>
    )
  }

  // Ready to reveal state
  if (pageState === 'ready') {
    const themeColor = box?.theme?.color || '#00f5ff'

    return (
      <div className="fixed inset-0 z-[100] bg-bg-primary overflow-y-auto">
        <div className="px-4 py-4 max-w-xl mx-auto">
          <Link
            href="/gacha/reveal"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
        </div>

        <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center px-4 py-12 max-w-xl mx-auto text-center">
          <h1 className="font-display text-3xl md:text-4xl text-white mb-2">
            Ready to Reveal
          </h1>
          <p className="text-white/60 mb-2">
            Code: <span className="font-mono text-white">{code}</span>
          </p>
          {box && (
            <p className="text-white/40 text-sm mb-8">
              {box.theme?.displayName || box.title}
            </p>
          )}

          {/* Animated box preview */}
          <div className="relative w-48 h-48 mx-auto mb-8">
            <div
              className="absolute inset-0 rounded-2xl blur-3xl opacity-30"
              style={{ backgroundColor: themeColor }}
            />
            <div
              className="relative w-full h-full rounded-2xl border-2 flex items-center justify-center"
              style={{
                borderColor: themeColor,
                background: `linear-gradient(135deg, ${themeColor}20 0%, transparent 100%)`,
              }}
            >
              <span className="text-6xl">?</span>
            </div>
          </div>

          <button
            onClick={startReveal}
            className="w-full max-w-xs mx-auto py-4 px-8 bg-neon-cyan text-black font-display font-bold text-lg uppercase tracking-wider rounded-xl hover:bg-neon-cyan/90 transition-colors shadow-glow-cyan"
          >
            Reveal Now
          </button>

          <p className="mt-6 text-white/40 text-xs">
            Once revealed, your item cannot be changed.
          </p>
        </div>
      </div>
    )
  }

  // Revealing animation
  if (pageState === 'revealing' && result) {
    const themeColor = box?.theme?.color || '#00f5ff'
    return <RevealSequence result={result} themeColor={themeColor} />
  }

  // Show loading during reveal if result not ready yet
  if (pageState === 'revealing' && !result) {
    return (
      <div className="fixed inset-0 z-[100] bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mx-auto mb-4" />
          <p className="text-white/60">Revealing your item...</p>
        </div>
      </div>
    )
  }

  // Complete state
  if (pageState === 'complete' && result) {
    return (
      <RevealComplete
        result={result}
        alreadyRevealed={alreadyRevealed}
        showClaimButton={!alreadyRevealed}
        onClaim={() => {
          // Navigate to claim page
          window.location.href = `/gacha/claim/${code}`
        }}
      />
    )
  }

  // Fallback
  return null
}
