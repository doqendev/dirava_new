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
 * Each dot represents an INTERNAL slot the Dragon Ball can occupy —
 * slot `i` (1..n-1) lands the ball between letter `i` and letter `i+1`.
 * The ends are deliberately omitted: the ball always sits inside the
 * word. Names shorter than 2 characters hide the picker entirely.
 */
export function BallPositionPicker({ text, value, onChange, className }: BallPositionPickerProps) {
  const chars = useMemo(() => Array.from(text), [text])
  const n = chars.length

  if (n < 2) return null

  // Clamp the incoming value into the internal-only range [1, n-1].
  const clamped = Math.max(1, Math.min(n - 1, value))

  return (
    <div
      className={`flex items-center justify-center gap-0.5 px-2 py-1 ${className ?? ''}`.trim()}
      role="radiogroup"
      aria-label="Dragon Ball position"
    >
      {chars.map((ch, charIdx) => {
        // Render the letter. A dot precedes every letter except the
        // first — so dots sit strictly between letters (slots 1..n-1).
        const dotSlot = charIdx // dot before `ch` represents slot = charIdx
        const showDot = charIdx >= 1
        const selected = showDot && dotSlot === clamped
        return (
          <span key={`cell-${charIdx}`} className="flex items-center">
            {showDot && (
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                aria-label={`Place ball between ${chars[charIdx - 1]} and ${ch}`}
                onClick={() => onChange(dotSlot)}
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
            )}
            <span
              aria-hidden="true"
              className="px-0.5 text-[13px] font-semibold uppercase tracking-wide text-white/80"
            >
              {ch}
            </span>
          </span>
        )
      })}
    </div>
  )
}
