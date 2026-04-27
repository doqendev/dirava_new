'use client'

import { Truck, Lock, RefreshCw, Globe } from 'lucide-react'

const ITEMS = [
  { icon: Truck, title: 'Free shipping', sub: 'Orders over €45' },
  { icon: Lock, title: 'Secure payment', sub: 'SSL encrypted' },
  { icon: RefreshCw, title: 'Easy returns', sub: '30-day returns' },
  { icon: Globe, title: 'Worldwide', sub: 'shipping' },
]

/**
 * 4-icon strip shown right below the cart actions on every product.
 * Replaces the older TrustBadges component visually.
 */
export function TrustStrip() {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {ITEMS.map((it, i) => {
        const Icon = it.icon
        return (
          <li
            key={i}
            className="flex items-center gap-2 rounded-xl border border-white/[0.04] bg-transparent px-3 py-2"
          >
            <Icon className="h-4 w-4 flex-shrink-0 text-white/35" />
            <div className="min-w-0 leading-tight">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-white/60">{it.title}</div>
              <div className="truncate text-[10px] text-white/30">{it.sub}</div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
