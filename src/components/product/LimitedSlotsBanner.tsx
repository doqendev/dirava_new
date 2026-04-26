'use client'

import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'

interface LimitedSlotsBannerProps {
  accent?: string
}

function timeUntilMidnight(): { h: number; m: number; s: number } {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setHours(24, 0, 0, 0)
  const diff = tomorrow.getTime() - now.getTime()
  const h = Math.floor(diff / 3_600_000)
  const m = Math.floor((diff / 60_000) % 60)
  const s = Math.floor((diff / 1_000) % 60)
  return { h, m, s }
}

/**
 * Limited-slots banner shown under the gallery: lightning icon + copy
 * on the left, ticking countdown (HRS / MINS / SECS) on the right.
 * The countdown resets at local midnight so it's consistent across
 * visitors but never fakes "expires in 5 minutes" desperation.
 */
export function LimitedSlotsBanner({ accent = '#22c55e' }: LimitedSlotsBannerProps) {
  const [t, setT] = useState(() => timeUntilMidnight())

  useEffect(() => {
    const id = setInterval(() => setT(timeUntilMidnight()), 1000)
    return () => clearInterval(id)
  }, [])

  const cell = (n: number, label: string) => (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-12 w-14 items-center justify-center overflow-hidden rounded-md border"
        style={{
          borderColor: `${accent}33`,
          background: 'rgba(0, 0, 0, 0.45)',
          boxShadow: `inset 0 0 14px ${accent}1f`,
        }}
      >
        <span className="font-mono text-xl font-bold tabular-nums tracking-wider text-white">
          {n.toString().padStart(2, '0')}
        </span>
        {/* Tiny accent underglow at the bottom of each cell. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-2 bottom-0 h-px"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
      </div>
      <span
        className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50"
      >
        {label}
      </span>
    </div>
  )

  return (
    <div
      className="relative flex items-center gap-4 overflow-hidden rounded-2xl border p-4 sm:gap-5 sm:p-5"
      style={{
        borderColor: `${accent}55`,
        background: `linear-gradient(135deg, ${accent}14, rgba(0, 0, 0, 0.4) 60%)`,
        boxShadow: `0 0 24px ${accent}22, inset 0 0 30px ${accent}14`,
      }}
    >
      {/* Soft accent halo behind the icon. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-12 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full blur-3xl"
        style={{ background: `${accent}33` }}
      />

      <div
        className="relative flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border"
        style={{
          borderColor: `${accent}55`,
          background: `${accent}22`,
          boxShadow: `0 0 18px ${accent}55, inset 0 0 12px ${accent}33`,
        }}
      >
        <Zap className="h-7 w-7" style={{ color: accent, filter: `drop-shadow(0 0 6px ${accent})` }} />
      </div>

      <div className="relative min-w-0 flex-1">
        <div
          className="text-sm font-bold uppercase tracking-[0.16em]"
          style={{ color: accent, textShadow: `0 0 10px ${accent}55` }}
        >
          Limited production slots!
        </div>
        <p className="mt-1 text-xs leading-snug text-white/65">
          We only take a few orders each day
          <br className="hidden sm:block" /> to ensure premium quality.
        </p>
      </div>

      <div className="relative flex items-center gap-1.5 sm:gap-2">
        {cell(t.h, 'hrs')}
        <span className="-mt-4 text-xl font-bold text-white/30">:</span>
        {cell(t.m, 'mins')}
        <span className="-mt-4 text-xl font-bold text-white/30">:</span>
        {cell(t.s, 'secs')}
      </div>
    </div>
  )
}
