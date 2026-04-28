'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'

interface SocialProofBarProps {
  /** Stable per-product seed so each product has its own (different) numbers. */
  productHandle: string
  /** Accepted for API stability — no longer applied (the line is now
   *  purely textual to keep the UI clean). */
  accent?: string
}

/** Tiny deterministic PRNG so each product has its own consistent numbers. */
function seedFrom(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function rngFromSeed(seed: number) {
  // `>>> 0` forces unsigned so `% 0x7fffffff` stays non-negative and
  // `s / 0x7fffffff` stays in [0, 1).
  let s = seed || 1
  return () => {
    s = (Math.imul(48271, s) >>> 0) % 0x7fffffff
    return s / 0x7fffffff
  }
}

/** Returns the local date as YYYY-MM-DD — the seed key for "today". */
function localDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Seconds since local midnight. */
function secondsSinceLocalMidnight(d: Date): number {
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()
}

/** Pre-computed sorted tick times (in seconds-since-midnight) for the
 *  given handle on the given day. Returns one entry per "expected
 *  sale today". The customer sees the count grow as wall-clock time
 *  crosses each tick — so the page can sit open and occasionally tick. */
function tickTimesForDay(handle: string, dayKey: string): number[] {
  const seed = seedFrom(`${handle}::sold::${dayKey}`)
  const rng = rngFromSeed(seed)
  // Target volume per day per product — feels real (not "0 sold today",
  // not "200 sold today"). Picks once per day per product.
  const dailyTarget = 4 + Math.floor(rng() * 10) // 4–13 sales/day
  const ticks: number[] = []
  for (let i = 0; i < dailyTarget; i++) {
    // Bias slightly toward 10 AM – 8 PM (the meat of the shopping
    // day) so most sales land in waking hours. We sample two random
    // values and take the average — a simple way to push the
    // distribution toward the centre.
    const u = (rng() + rng()) / 2
    // Scale into seconds. 86400s = full day. Skew toward 10–20h.
    const skewed = 0.4 + (u - 0.5) * 0.85 // ~ [-0.025, 0.825]
    const clamped = Math.max(0, Math.min(0.999, skewed))
    ticks.push(Math.floor(clamped * 86_400))
  }
  return ticks.sort((a, b) => a - b)
}

/**
 * Single-line live-feel proof: "X viewing now · Y sold today".
 * Two different dynamics:
 *  - viewers: bounded random walk that re-rolls every 10s so the
 *    number flickers naturally as people land on / leave the page.
 *  - sold: deterministic schedule of N ticks across the day. The count
 *    grows as wall-clock crosses each tick and resets to 0 at midnight.
 *    Customers staying on the page may catch a real-time tick.
 */
export function SocialProofBar({ productHandle }: SocialProofBarProps) {
  // The component is purely client-side. Initial state derives from the
  // current time so SSR + hydration both render the same value (the
  // server uses UTC date which would mismatch). To avoid hydration
  // mismatch we render placeholders on the very first frame and fill
  // in real numbers in an effect.
  const t = useTranslations('product')
  const [hydrated, setHydrated] = useState(false)
  const [viewing, setViewing] = useState(0)
  const [sold, setSold] = useState(0)

  useEffect(() => {
    let viewerSeed = seedFrom(`${productHandle}::viewing::${localDateKey(new Date())}`)
    let v = 8 + Math.floor((viewerSeed % 1000) / 100) // initial 8–17

    const recompute = () => {
      const now = new Date()
      // Viewer fluctuation: every tick we move v by a step in
      // [-5, -1] ∪ [+1, +5] (never 0), so the number is *always*
      // different from the previous render. Clamped to [6, 24] so it
      // stays within "small custom shop" plausibility.
      viewerSeed = (Math.imul(48271, viewerSeed) >>> 0) % 0x7fffffff
      const magnitude = (viewerSeed % 5) + 1 // 1..5
      viewerSeed = (Math.imul(48271, viewerSeed) >>> 0) % 0x7fffffff
      const direction = viewerSeed & 1 ? 1 : -1
      let next = v + magnitude * direction
      if (next < 6) next = 6 + magnitude // bounce off the floor
      if (next > 24) next = 24 - magnitude // bounce off the ceiling
      // Belt-and-braces: if a bounce somehow lands on the same value,
      // nudge by 1 in the other direction so the user never sees the
      // same number twice in a row.
      if (next === v) next = v === 6 ? 7 : v - 1
      v = next
      setViewing(v)

      // Sold count = how many of today's tick times have already passed.
      const ticks = tickTimesForDay(productHandle, localDateKey(now))
      const elapsed = secondsSinceLocalMidnight(now)
      setSold(ticks.filter((t) => t <= elapsed).length)
    }

    recompute()
    setHydrated(true)
    // Viewer fluctuation cadence — every 30s. The sold count rarely
    // changes between ticks (handful per day) but recomputing each
    // interval is cheap and lets in-page customers catch real ticks.
    const id = setInterval(recompute, 30_000)
    return () => clearInterval(id)
  }, [productHandle])

  if (!hydrated) {
    // Static placeholder during SSR / first paint. Same vertical
    // height as the populated state so layout doesn't jump.
    return (
      <div className="text-[11px] leading-none text-white/30">
        <span>{t('socialProofLoading')}</span>
      </div>
    )
  }

  // Visually secondary to the rating/orders line above: smaller text,
  // softer fill, no white-bold counts. Communicates "live" without
  // pulling the eye away from the durable trust signal.
  return (
    <div className="text-[11px] leading-none text-white/55">
      <span className="truncate">
        <strong className="font-semibold text-white/80">{viewing}</strong> viewing now
        <span className="mx-1.5 text-white/25">·</span>
        <strong className="font-semibold text-white/80">{sold}</strong> sold today
      </span>
    </div>
  )
}
