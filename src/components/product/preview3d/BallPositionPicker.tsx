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
  /** Hex colour for letters left of the ball (default: yellow). */
  firstHalfColor?: string
  /** Hex colour for letters right of the ball (default: red). */
  secondHalfColor?: string
  /** Ball icon URL — rendered as a small sprite for the selected dot. */
  ballIconSrc?: string
}

/**
 * Row of small clickable dots interleaved with the letters of `text`.
 * Each dot represents an INTERNAL slot the Dragon Ball can occupy —
 * slot `i` (1..n-1) lands the ball between letter `i` and letter `i+1`.
 * The ends are deliberately omitted: the ball always sits inside the
 * word. Names shorter than 2 characters hide the picker entirely.
 */
export function BallPositionPicker({
  text,
  value,
  onChange,
  className,
  firstHalfColor = '#ffcc00',
  secondHalfColor = '#e20a0a',
  ballIconSrc = '/svgs/preview/dball.svg',
}: BallPositionPickerProps) {
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
        // Letter colour mirrors the 3D preview: yellow before the ball,
        // red after. Uses the same hex the scene paints with so the
        // picker reads as a condensed preview of the split.
        const letterColor = charIdx < clamped ? firstHalfColor : secondHalfColor
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
                {selected ? (
                  // Mini dragon ball for the active slot — the same SVG
                  // the 3D scene uses, shrunk to a 14 px sprite.
                  <img
                    src={ballIconSrc}
                    alt=""
                    aria-hidden="true"
                    width={14}
                    height={14}
                    className="block drop-shadow-[0_0_6px_rgba(255,108,0,0.6)]"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="block rounded-full transition-all"
                    style={{
                      width: 6,
                      height: 6,
                      background: 'rgba(255,255,255,0.35)',
                    }}
                  />
                )}
              </button>
            )}
            <span
              aria-hidden="true"
              className="px-0.5 text-[13px] font-semibold uppercase tracking-wide"
              style={{ color: letterColor }}
            >
              {ch}
            </span>
          </span>
        )
      })}
    </div>
  )
}
