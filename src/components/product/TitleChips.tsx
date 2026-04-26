'use client'

import type { ProductChip } from '@/data/productChips'

interface TitleChipsProps {
  chips: ProductChip[]
  /** Hex tint for the icon. Defaults to neon green. */
  accent?: string
}

/**
 * Three small icon-led pills shown directly under the product title.
 * Visually quiet — borderless, monochrome label, accent-tinted icon.
 */
export function TitleChips({ chips, accent = '#22c55e' }: TitleChipsProps) {
  if (!chips.length) return null
  return (
    <ul className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
      {chips.map((chip, i) => {
        const Icon = chip.icon
        return (
          <li
            key={`${i}-${chip.label}`}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/70"
          >
            <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
            <span>{chip.label}</span>
          </li>
        )
      })}
    </ul>
  )
}
