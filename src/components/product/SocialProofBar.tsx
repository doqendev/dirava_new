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
  let s = seed || 1
  return () => {
    s = Math.imul(48271, s) % 0x7fffffff
    return s / 0x7fffffff
  }
}

const AVATAR_COLORS = ['#22c55e', '#3b82f6', '#f97316', '#ec4899', '#a855f7']

/**
 * Avatar pile + "X people viewing now" + "Y sold in the last hour".
 * Numbers vary per product (seeded by handle) and slowly tick across
 * the session to feel alive.
 */
export function SocialProofBar({ productHandle, accent = '#22c55e' }: SocialProofBarProps) {
  const baseSeed = seedFrom(productHandle)
  const [now, setNow] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setNow((n) => n + 1), 25_000)
    return () => clearInterval(id)
  }, [])

  // Per-product, shifts every 25s so the numbers feel live.
  const rng = rngFromSeed(baseSeed + now * 13)
  const viewing = Math.floor(8 + rng() * 14) // 8 - 21
  const sold = Math.floor(2 + rng() * 6) // 2 - 7

  const avatarRng = rngFromSeed(baseSeed + 7)
  const avatars = Array.from({ length: 4 }).map(() => AVATAR_COLORS[Math.floor(avatarRng() * AVATAR_COLORS.length)]!)

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/80">
      <div className="flex items-center">
        <div className="flex -space-x-2">
          {avatars.map((c, i) => (
            <span
              key={i}
              aria-hidden
              className="h-6 w-6 rounded-full border border-[#0a0a12]"
              style={{ background: `linear-gradient(135deg, ${c}, ${c}99)` }}
            />
          ))}
        </div>
        <span className="ml-2.5">
          <strong className="font-semibold text-white">{viewing} people</strong> are viewing this
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <Flame className="h-4 w-4" style={{ color: accent }} />
        <span>
          <strong className="font-semibold text-white">{sold} sold</strong> in the last hour
        </span>
      </div>
    </div>
  )
}
