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
        className="flex h-11 w-12 items-center justify-center rounded-md border sm:h-12 sm:w-14"
        style={{
          borderColor: `${accent}26`,
          background: 'rgba(0, 0, 0, 0.55)',
        }}
      >
        <span className="font-mono text-lg font-bold tabular-nums text-white sm:text-xl">
          {n.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45 sm:text-[10px]">
        {label}
      </span>
    </div>
  )

  return (
    <div
      className="relative flex flex-wrap items-center gap-3 overflow-hidden rounded-xl border p-3 sm:flex-nowrap sm:gap-4 sm:p-4"
      style={{
        borderColor: `${accent}55`,
        background: `linear-gradient(180deg, ${accent}14 0%, rgba(0, 0, 0, 0.55) 100%)`,
        boxShadow: `0 0 18px ${accent}1a`,
      }}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md border sm:h-10 sm:w-10"
        style={{
          borderColor: `${accent}55`,
          background: `${accent}1f`,
        }}
      >
        <Zap className="h-5 w-5" style={{ color: accent }} />
      </div>

      <div className="min-w-0 flex-1">
        <div
          className="text-[13px] font-bold uppercase tracking-[0.06em] sm:text-sm"
          style={{ color: accent }}
        >
          Limited production slots!
        </div>
        <p className="mt-0.5 text-[11px] leading-snug text-white/70 sm:text-xs">
          We only take a few orders each day
          <br className="hidden sm:block" /> to ensure premium quality.
        </p>
      </div>

      <div className="flex w-full items-center justify-end gap-1.5 sm:w-auto sm:gap-2">
        {cell(t.h, 'hrs')}
        <span className="-mt-3 text-lg font-bold text-white/30">:</span>
        {cell(t.m, 'mins')}
        <span className="-mt-3 text-lg font-bold text-white/30">:</span>
        {cell(t.s, 'secs')}
      </div>
    </div>
  )
}
