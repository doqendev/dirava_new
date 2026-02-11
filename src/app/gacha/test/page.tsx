'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, RotateCcw, Settings, Sparkles } from 'lucide-react'
import { useGachaStore } from '@/stores/gachaStore'
import { RevealSequence } from '@/components/gacha/RevealSequence'
import { RevealComplete } from '@/components/gacha/RevealComplete'
import { OddsDisplay } from '@/components/gacha/OddsDisplay'
import { RARITY_CONFIG } from '@/lib/gacha/constants'
import type { GachaRevealResult, Rarity, RarityOdds } from '@/types/gacha'

// Test box configuration
const TEST_BOX = {
  handle: 'test-mystery-box',
  title: 'Test Mystery Box',
  color: '#00f5ff',
  odds: {
    common: 50,
    rare: 30,
    epic: 15,
    legendary: 5,
  } as RarityOdds,
}

// Mock products for testing
const MOCK_PRODUCTS: Record<Rarity, Array<{ title: string; handle: string }>> = {
  legendary: [
    { title: 'Gomu Gomu (Luffy) - Size M', handle: 'devil-fruit-collection-unisex-hoodie' },
  ],
  epic: [
    { title: 'Mera Mera (Ace/Sabo) - Size M', handle: 'devil-fruit-collection-unisex-hoodie' },
  ],
  rare: [
    { title: 'Bara Bara (Buggy) - Size M', handle: 'devil-fruit-collection-unisex-hoodie' },
  ],
  common: [
    { title: 'Ope Ope (Law) - Size M', handle: 'devil-fruit-collection-unisex-hoodie' },
    { title: 'Hana Hana (Boa) - Size M', handle: 'devil-fruit-collection-unisex-hoodie' },
  ],
}

function selectRandomRarity(odds: RarityOdds): Rarity {
  const roll = Math.random() * 100

  let cumulative = 0
  cumulative += odds.legendary
  if (roll < cumulative) return 'legendary'

  cumulative += odds.epic
  if (roll < cumulative) return 'epic'

  cumulative += odds.rare
  if (roll < cumulative) return 'rare'

  return 'common'
}

function generateMockResult(forcedRarity?: Rarity): GachaRevealResult {
  const rarity = forcedRarity || selectRandomRarity(TEST_BOX.odds)
  const products = MOCK_PRODUCTS[rarity]
  const product = products[Math.floor(Math.random() * products.length)] || products[0]

  return {
    code: 'TEST-' + Math.random().toString(36).substring(2, 6).toUpperCase(),
    boxHandle: TEST_BOX.handle,
    boxTitle: TEST_BOX.title,
    revealedProduct: {
      id: 'test-product-id',
      handle: product?.handle || 'test-product',
      title: product?.title || 'Test Product',
      description: 'This is a test reveal. No actual product will be shipped.',
      image: null,
      price: { amount: '39.99', currencyCode: 'EUR' },
    },
    rarity,
    revealedAt: new Date().toISOString(),
    seed: 'test-seed-' + Math.random().toString(36).substring(7),
  }
}

export default function GachaTestPage() {
  const [forcedRarity, setForcedRarity] = useState<Rarity | 'random'>('random')
  const [result, setResult] = useState<GachaRevealResult | null>(null)
  const [isRevealing, setIsRevealing] = useState(false)

  const { phase, setPhase, reset } = useGachaStore()

  const startReveal = () => {
    const mockResult = generateMockResult(
      forcedRarity === 'random' ? undefined : forcedRarity
    )
    setResult(mockResult)
    setIsRevealing(true)
    reset()
    setPhase('intro')
  }

  const resetTest = () => {
    reset()
    setResult(null)
    setIsRevealing(false)
  }

  // Show reveal sequence
  if (isRevealing && result && phase !== 'complete') {
    return <RevealSequence result={result} />
  }

  // Show complete state
  if (phase === 'complete' && result) {
    return (
      <div className="pb-24">
        <RevealComplete result={result} />
        <div className="fixed bottom-[70px] lg:bottom-0 left-0 right-0 z-40 p-4">
          <button
            onClick={resetTest}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-neon-cyan text-black font-medium rounded-xl active:scale-[0.98] transition-transform"
          >
            <RotateCcw className="w-5 h-5" />
            Test Again
          </button>
        </div>
      </div>
    )
  }

  // Settings / Start screen
  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="px-4 py-6 pb-40 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/20 border border-yellow-500/50 mb-3">
            <Settings className="w-4 h-4 text-yellow-500" />
            <span className="text-yellow-500 font-medium text-sm">TEST MODE</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl text-white mb-2">Gacha Test</h1>
          <p className="text-white/60 text-sm md:text-base">
            Test the reveal animation
          </p>
        </div>

        {/* Box Info */}
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 md:p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${TEST_BOX.color}20` }}
            >
              <Sparkles className="w-6 h-6" style={{ color: TEST_BOX.color }} />
            </div>
            <div>
              <h2 className="font-display text-lg text-white">{TEST_BOX.title}</h2>
              <p className="text-white/60 text-sm">Preview reveal animations</p>
            </div>
          </div>

          {/* Odds display */}
          <OddsDisplay odds={TEST_BOX.odds} />
        </div>

        {/* Force Rarity */}
        <div className="bg-bg-card border border-border-subtle rounded-2xl p-4 md:p-6 mb-4">
          <h2 className="font-display text-base md:text-lg text-white mb-2">Force Rarity</h2>
          <p className="text-white/40 text-xs md:text-sm mb-4">
            Test a specific rarity animation
          </p>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            <button
              onClick={() => setForcedRarity('random')}
              className={`py-3 md:py-2 px-2 md:px-3 rounded-xl md:rounded-lg text-sm font-medium transition-all border active:scale-[0.97] flex items-center justify-center gap-1.5 ${
                forcedRarity === 'random'
                  ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                  : 'border-white/20 text-white/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Random</span>
            </button>
            {(['common', 'rare', 'epic', 'legendary'] as Rarity[]).map((rarity) => (
              <button
                key={rarity}
                onClick={() => setForcedRarity(rarity)}
                className={`py-3 md:py-2 px-2 md:px-3 rounded-xl md:rounded-lg text-sm font-medium transition-all border active:scale-[0.97] ${
                  forcedRarity === rarity
                    ? 'bg-white/10'
                    : 'border-white/20'
                }`}
                style={{
                  borderColor: forcedRarity === rarity ? RARITY_CONFIG[rarity].color : undefined,
                  color: forcedRarity === rarity ? RARITY_CONFIG[rarity].color : 'rgba(255,255,255,0.6)',
                  boxShadow: forcedRarity === rarity ? `0 0 15px ${RARITY_CONFIG[rarity].color}30` : undefined,
                }}
              >
                {rarity === 'legendary' ? 'Legend' : RARITY_CONFIG[rarity].displayName}
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="p-3 md:p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 mb-4">
          <p className="text-yellow-500/80 text-xs md:text-sm">
            <strong>Test Mode:</strong> No actual order is created. Preview animations and test outcomes.
          </p>
        </div>
      </div>

      {/* Fixed Start Button */}
      <div className="fixed bottom-[70px] lg:bottom-0 left-0 right-0 z-40 p-4">
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={startReveal}
          className="w-full py-4 rounded-xl bg-neon-cyan text-black font-display font-bold text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-3 active:bg-neon-cyan/90 transition-colors shadow-glow-cyan"
        >
          <Play className="w-5 h-5 md:w-6 md:h-6" />
          Start Reveal
        </motion.button>
      </div>
    </div>
  )
}
