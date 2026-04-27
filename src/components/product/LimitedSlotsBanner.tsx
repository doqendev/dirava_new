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

function hexToRgb(hex: string): string {
  const match = hex.replace('#', '').match(/.{2}/g)
  if (!match || match.length < 3) return '25, 255, 122'
  return `${parseInt(match[0]!, 16)}, ${parseInt(match[1]!, 16)}, ${parseInt(match[2]!, 16)}`
}

/**
 * Limited-slots banner shown under the gallery: lightning icon + copy
 * on the left, ticking countdown (HRS / MINS / SECS) on the right.
 * The countdown resets at local midnight so it's consistent across
 * visitors but never fakes "expires in 5 minutes" desperation.
 */
export function LimitedSlotsBanner({ accent = '#19ff7a' }: LimitedSlotsBannerProps) {
  const [t, setT] = useState(() => timeUntilMidnight())
  const accentRgb = hexToRgb(accent)

  useEffect(() => {
    const id = setInterval(() => setT(timeUntilMidnight()), 1000)
    return () => clearInterval(id)
  }, [])

  const cell = (n: number, label: string) => (
    <div className="flex flex-col items-center">
      <div
        className="flex h-[40px] w-[46px] items-center justify-center rounded-[7px] border bg-[#071112]"
        style={{
          borderColor: `rgba(${accentRgb}, 0.12)`,
          boxShadow: `inset 0 0 14px rgba(${accentRgb}, 0.045), 0 0 10px rgba(${accentRgb}, 0.045), 0 0 14px rgba(0, 0, 0, 0.35)`,
        }}
      >
        <span className="font-mono text-[20px] font-black leading-none tabular-nums text-white">
          {n.toString().padStart(2, '0')}
        </span>
      </div>
      <span className="mt-[5px] text-[9px] font-bold uppercase leading-none tracking-normal text-white">
        {label.toUpperCase()}
      </span>
    </div>
  )

  return (
    <div
      className="relative flex min-h-[90px] items-center overflow-hidden rounded-[11px] border bg-[#020b0c] px-[26px] py-4"
      style={{
        borderColor: `rgba(${accentRgb}, 0.34)`,
        boxShadow: `0 0 8px rgba(${accentRgb}, 0.055), 0 0 0 1px rgba(0, 0, 0, 0.58), inset 0 0 24px rgba(${accentRgb}, 0.04), inset 0 1px 0 rgba(${accentRgb}, 0.08)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 50%, rgba(${accentRgb}, 0.07), transparent 30%), linear-gradient(90deg, rgba(${accentRgb}, 0.03), transparent 55%)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-4 top-0 h-px w-[36%]"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${accentRgb}, 0.52), rgba(${accentRgb}, 0.16), transparent)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-9 top-0 h-px w-[18%]"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${accentRgb}, 0.24), transparent)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-6 h-px w-[24%]"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${accentRgb}, 0.28), transparent)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-5 h-px w-[30%]"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(${accentRgb}, 0.18), rgba(${accentRgb}, 0.36), transparent)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute left-0 top-4 h-[48%] w-px"
        style={{
          background: `linear-gradient(180deg, transparent, rgba(${accentRgb}, 0.34), rgba(${accentRgb}, 0.12), transparent)`,
        }}
      />
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 bottom-5 h-[34%] w-px"
        style={{
          background: `linear-gradient(180deg, transparent, rgba(${accentRgb}, 0.22), transparent)`,
        }}
      />

      <div className="relative flex min-w-0 flex-1 items-center gap-[14px] pr-5">
        <Zap
          className="h-11 w-8 flex-shrink-0"
          strokeWidth={1.5}
          style={{
            color: accent,
            fill: accent,
            stroke: accent,
            filter: `drop-shadow(0 0 7px rgba(${accentRgb}, 0.82)) drop-shadow(0 0 16px rgba(${accentRgb}, 0.36))`,
          }}
        />

        <div className="min-w-0">
          <div
            className="text-[14px] font-black uppercase leading-tight tracking-normal"
            style={{ color: accent }}
          >
            Limited production slots!
          </div>
          <p className="mt-1 max-w-[205px] text-[12px] font-medium leading-[1.32] text-white">
            We only take a few orders each day to ensure premium quality.
          </p>
        </div>
      </div>

      <div className="relative hidden h-[42px] w-px flex-shrink-0 bg-[#1d2a2b] sm:block" />

      <div className="relative flex flex-shrink-0 items-start gap-2 pl-[22px]">
        {cell(t.h, 'hrs')}
        <span className="pt-[7px] text-[22px] font-black leading-none text-white">:</span>
        {cell(t.m, 'mins')}
        <span className="pt-[7px] text-[22px] font-black leading-none text-white">:</span>
        {cell(t.s, 'secs')}
      </div>
    </div>
  )
}
