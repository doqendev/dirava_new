'use client'

import type { ProductChip } from '@/data/productChips'

interface TitleChipsProps {
  chips: ProductChip[]
  /** Hex tint — accepted for API stability but no longer applied
   *  (icons were removed; the labels are now monochrome). */
  accent?: string
}

/**
 * Inline text labels under the product title — e.g.
 *   UV PAINTED · MADE TO ORDER
 * No icons, no pill chrome. The text already communicates the value
 * cleanly; the icons were decorative and added scan noise.
 */
export function TitleChips({ chips }: TitleChipsProps) {
  if (!chips.length) return null
  return (
    <div className="mt-3 flex flex-wrap items-center text-[11.5px] font-bold uppercase tracking-[0.14em] text-white/75">
      {chips.map((chip, i) => (
        <span key={`${i}-${chip.label}`} className="flex items-center">
          {i > 0 && (
            <span aria-hidden className="mx-2.5 text-white/30">
              ·
            </span>
          )}
          <span>{chip.label}</span>
        </span>
      ))}
    </div>
  )
}
