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
      <span className="font-mono text-2xl font-bold tabular-nums text-white">
        {n.toString().padStart(2, '0')}
      </span>
      <span className="text-[10px] uppercase tracking-wider text-white/50">{label}</span>
    </div>
  )

  return (
    <div
      className="flex items-center gap-4 rounded-2xl border bg-white/[0.02] p-4 sm:p-5"
      style={{ borderColor: `${accent}44`, boxShadow: `0 0 22px ${accent}22 inset` }}
    >
      <div
        className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full"
        style={{ background: `${accent}22`, boxShadow: `0 0 16px ${accent}55` }}
      >
        <Zap className="h-6 w-6" style={{ color: accent }} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: accent }}>
          Limited production slots!
        </div>
        <p className="mt-0.5 text-xs text-white/60">
          We only take a few orders each day to ensure premium quality.
        </p>
      </div>
      <div className="flex items-center gap-2 text-white/60">
        {cell(t.h, 'hrs')}
        <span className="text-lg font-bold text-white/30">:</span>
        {cell(t.m, 'mins')}
        <span className="text-lg font-bold text-white/30">:</span>
        {cell(t.s, 'secs')}
      </div>
    </div>
  )
}
