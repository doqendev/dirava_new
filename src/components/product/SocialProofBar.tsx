'use client'

import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'

interface SocialProofBarProps {
  /** Stable per-product seed so each product has its own (different) numbers. */
  productHandle: string
  accent?: string
}

/** Tiny deterministic PRNG so each product has its own consistent numbers. */
function seedFrom(handle: string): number {
  let h = 2166136261
  for (let i = 0; i < handle.length; i++) {
    h ^= handle.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rngFromSeed(seed: number) {
  // `Math.imul` returns a signed 32-bit int, and JS `%` is remainder
  // (not modulo) — so the previous `s % 0x7fffffff` could land negative
  // and bleed through to negative viewer/sold counts. The `>>> 0`
  // forces unsigned before the mod so `s` is always in [0, 0x7fffffff)
  // and `s / 0x7fffffff` stays in [0, 1).
  let s = seed || 1
  return () => {
    s = (Math.imul(48271, s) >>> 0) % 0x7fffffff
    return s / 0x7fffffff
  }
}

/**
 * Single-line live-feel proof: "🔥 X viewing now · Y sold in the last
 * hour". Numbers shift every 25s so the feed feels alive but never
 * fakes desperation.
 */
export function SocialProofBar({ productHandle, accent = '#22c55e' }: SocialProofBarProps) {
  const baseSeed = seedFrom(productHandle)
  const [now, setNow] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 25_000)
    return () => clearInterval(id)
  }, [])

  const rng = rngFromSeed(baseSeed + now * 13)
  const viewing = Math.floor(8 + rng() * 14) // 8 - 21
  const sold = Math.floor(2 + rng() * 6) // 2 - 7

  return (
    <div className="flex items-center gap-1.5 text-[12px] leading-none text-white/65">
      <Flame className="h-3 w-3 flex-shrink-0" strokeWidth={2.25} style={{ color: accent }} />
      <span className="truncate">
        <strong className="font-semibold text-white/90">{viewing}</strong> viewing now
        <span className="mx-1.5 text-white/30">·</span>
        <strong className="font-semibold text-white/90">{sold}</strong> sold in the last hour
      </span>
    </div>
  )
}
