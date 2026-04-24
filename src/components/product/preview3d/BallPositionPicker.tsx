'use client'

import { useMemo } from 'react'

interface BallPositionPickerProps {
  /** The currently displayed text — dot count is text.length + 1. */
  text: string
  /** Selected slot index in [0, text.length]. */
  value: number
  /** Called with the newly-picked slot when a dot is tapped. */
  onChange: (value: number) => void
  className?: string
}

/**
 * Row of small clickable dots interleaved with the letters of `text`.
 * Each dot represents a slot the Dragon Ball can occupy:
 *   slot 0        — before the first letter
 *   slot i (1..n-1) — between letter i-1 and letter i
 *   slot n        — after the last letter
 *
 * The picker hides itself when `text` is empty so it doesn't flash an
 * orphan control.
 */
export function BallPositionPicker({ text, value, onChange, className }: BallPositionPickerProps) {
  const chars = useMemo(() => Array.from(text), [text])
  const slots = chars.length + 1

  if (chars.length === 0) return null

  const clamped = Math.max(0, Math.min(chars.length, value))

  return (
    <div
      className={`flex items-center justify-center gap-0.5 px-2 py-1 ${className ?? ''}`.trim()}
      role="radiogroup"
      aria-label="Dragon Ball position"
    >
      {Array.from({ length: slots }).map((_, slotIdx) => {
        const selected = slotIdx === clamped
        return (
          <span key={`cell-${slotIdx}`} className="flex items-center">
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={
                slotIdx === 0
                  ? `Place ball before ${chars[0]}`
                  : slotIdx === chars.length
                    ? `Place ball after ${chars[chars.length - 1]}`
                    : `Place ball between ${chars[slotIdx - 1]} and ${chars[slotIdx]}`
              }
              onClick={() => onChange(slotIdx)}
              className="relative inline-flex h-6 w-6 items-center justify-center focus-visible:outline-none"
            >
              <span
                aria-hidden="true"
                className="block rounded-full transition-all"
                style={
                  selected
                    ? {
                        width: 10,
                        height: 10,
                        background: '#ff6c00',
                        boxShadow: '0 0 0 2px rgba(255,108,0,0.35), 0 0 10px rgba(255,108,0,0.55)',
                      }
                    : {
                        width: 6,
                        height: 6,
                        background: 'rgba(255,255,255,0.35)',
                      }
                }
              />
            </button>
            {slotIdx < chars.length && (
              <span
                aria-hidden="true"
                className="px-0.5 text-[13px] font-semibold uppercase tracking-wide text-white/80"
              >
                {chars[slotIdx]}
              </span>
            )}
          </span>
        )
      })}
    </div>
  )
}
