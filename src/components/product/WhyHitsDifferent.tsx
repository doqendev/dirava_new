'use client'

import type { FeatureTile } from '@/data/productFeatureTiles'

interface WhyHitsDifferentProps {
  tiles: FeatureTile[]
  accent?: string
}

/**
 * 4-tile grid below the gallery — title "WHY THIS HITS DIFFERENT".
 */
export function WhyHitsDifferent({ tiles, accent = '#22c55e' }: WhyHitsDifferentProps) {
  if (tiles.length === 0) return null
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
      <h2 className="mb-5 text-center text-sm font-semibold uppercase tracking-[0.2em] text-white/90 flex items-center justify-center gap-3">
        <span className="h-px w-6 bg-white/20" aria-hidden />
        <span style={{ color: accent }} aria-hidden>◆</span>
        <span>Why this hits different</span>
        <span style={{ color: accent }} aria-hidden>◆</span>
        <span className="h-px w-6 bg-white/20" aria-hidden />
      </h2>
      <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {tiles.slice(0, 4).map((t, i) => {
          const Icon = t.icon
          return (
            <li
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-center transition-colors hover:bg-white/[0.05]"
            >
              <div
                className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: `${accent}1A`, boxShadow: `0 0 20px ${accent}33` }}
              >
                <Icon className="h-6 w-6" style={{ color: accent }} />
              </div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-white">{t.title}</h3>
              <p className="mt-1.5 text-xs leading-snug text-white/60">{t.body}</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
