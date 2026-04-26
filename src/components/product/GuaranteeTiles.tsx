'use client'

import { Heart, ShieldCheck, Truck } from 'lucide-react'

const TILES = [
  { icon: Heart, title: 'Handmade', sub: 'with care' },
  { icon: ShieldCheck, title: 'Premium', sub: 'quality' },
  { icon: Truck, title: 'Ships from', sub: 'EU' },
]

interface GuaranteeTilesProps {
  accent?: string
}

/**
 * Three small confidence tiles between the price and personalisation
 * card: Handmade · Premium · Ships from. Hardcoded site-wide content.
 */
export function GuaranteeTiles({ accent = '#22c55e' }: GuaranteeTilesProps) {
  return (
    <ul className="grid grid-cols-3 gap-2">
      {TILES.map((t, i) => {
        const Icon = t.icon
        return (
          <li
            key={i}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
          >
            <Icon className="h-5 w-5 flex-shrink-0" style={{ color: accent }} />
            <div className="min-w-0">
              <div className="text-xs font-semibold leading-tight text-white">{t.title}</div>
              <div className="text-[10px] uppercase tracking-wider text-white/50 leading-tight">{t.sub}</div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
