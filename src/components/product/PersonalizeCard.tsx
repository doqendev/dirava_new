'use client'

import { useState } from 'react'
import { Check, AlertCircle } from 'lucide-react'
import type { Ref, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { isBlockedName } from '@/lib/utils/personalizationBlocklist'

interface PersonalizeCardProps {
  value: string
  onChange: (v: string) => void
  maxLength: number
  inputRef?: Ref<HTMLInputElement>
  /** Universe accent (used for header glow + active border). */
  themeColor?: string
  /** AddToCartButton — caller passes it in fully wired up. */
  cta: ReactNode
  /** Quantity selector slot (rendered between input + CTA so the
   *  buying flow reads top-to-bottom inside one card). */
  quantity?: ReactNode
  /** Live social-proof line (rendered below the CTA + trust line) — a
   *  last urgency nudge right before the click. */
  socialProof?: ReactNode
  /** When false, the input + CTA are visible but the input keeps a
   *  neutral border. When true, the active "ready" state lights up. */
  isReady?: boolean
}

function hexToRgb(hex: string): string {
  const match = hex.replace('#', '').match(/.{2}/g)
  if (!match || match.length < 3) return '25, 255, 122'
  return `${parseInt(match[0]!, 16)}, ${parseInt(match[1]!, 16)}, ${parseInt(match[2]!, 16)}`
}

/**
 * Self-contained buying-flow card. Holds:
 *   1. name input  → 2. validation status → 3. quantity → 4. CTA
 *   5. trust microcopy → 6. live social proof
 * The 3D preview button is intentionally NOT rendered here — the only
 * 3D entry point lives on the gallery image so customers don't see two
 * competing buttons for the same action.
 */
export function PersonalizeCard({
  value,
  onChange,
  maxLength,
  inputRef,
  themeColor = '#22c55e',
  cta,
  quantity,
  socialProof,
  isReady,
}: PersonalizeCardProps) {
  const [focused, setFocused] = useState(false)
  const accentRgb = hexToRgb(themeColor)
  const hasValue = value.trim().length > 0
  const blocked = hasValue && isBlockedName(value)
  const valid = (isReady ?? true) && hasValue && !blocked
  const errorRgb = '255, 90, 90'
  const counterColor = hasValue ? themeColor : 'rgba(255,255,255,0.32)'
  // Halo behind the CTA — uses neon-green so it pairs with the
  // CTA fill (the button itself is intentionally green regardless of
  // universe accent, since it's the dominant action on the page).
  const ctaHaloRgb = '25, 255, 122'

  return (
    <section
      className="relative overflow-hidden rounded-[11px] border bg-[#020b0c] px-4 py-3 sm:px-5 sm:py-3.5"
      style={{
        borderColor: `rgba(${accentRgb}, 0.34)`,
        boxShadow: `0 0 8px rgba(${accentRgb}, 0.055), 0 0 0 1px rgba(0, 0, 0, 0.58), inset 0 0 24px rgba(${accentRgb}, 0.04), inset 0 1px 0 rgba(${accentRgb}, 0.08)`,
      }}
    >
      {/* radial accent wash + soft horizontal gradient */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 0%, rgba(${accentRgb}, 0.08), transparent 38%), linear-gradient(180deg, rgba(${accentRgb}, 0.03), transparent 60%)`,
        }}
      />
      {/* hairline accent lines around the perimeter — same vocabulary
          as the slots banner so the two cards feel like a set */}
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

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Type your name"
          aria-label="Your name on the sign"
          className={cn(
            'block h-12 w-full rounded-[9px] border bg-[#071112] px-4 pr-16 text-left text-base font-bold uppercase tracking-[0.08em] leading-none text-white placeholder-white/20 outline-none transition-all duration-200 sm:text-[17px]',
          )}
          style={{
            caretColor: blocked ? `rgb(${errorRgb})` : themeColor,
            borderColor: blocked
              ? `rgba(${errorRgb}, 0.7)`
              : focused
              ? `rgba(${accentRgb}, 0.85)`
              : valid
              ? `rgba(${accentRgb}, 0.5)`
              : `rgba(${accentRgb}, 0.16)`,
            boxShadow: blocked
              ? `inset 0 0 14px rgba(${errorRgb}, 0.12), 0 0 0 3px rgba(${errorRgb}, 0.18), 0 0 14px rgba(${errorRgb}, 0.3)`
              : focused
              ? `inset 0 0 14px rgba(${accentRgb}, 0.1), 0 0 0 3px rgba(${accentRgb}, 0.18), 0 0 14px rgba(${accentRgb}, 0.32)`
              : valid
              ? `inset 0 0 12px rgba(${accentRgb}, 0.06), 0 0 8px rgba(${accentRgb}, 0.18)`
              : `inset 0 0 10px rgba(${accentRgb}, 0.03)`,
          }}
        />
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-semibold tabular-nums uppercase tracking-wide transition-colors"
          style={{ color: counterColor }}
        >
          {value.length}/{maxLength}
        </span>
      </div>

      {/* Tri-state status — fixed-height row so the card never jumps. */}
      <div className="relative mt-2 flex h-4 items-center justify-center">
        {valid && (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold leading-none"
            style={{ color: themeColor }}
          >
            <Check className="h-3 w-3" strokeWidth={3} />
            Ready to order
          </span>
        )}
        {blocked && (
          <span
            className="inline-flex items-center gap-1 text-[11px] font-semibold leading-none"
            style={{ color: `rgb(${errorRgb})` }}
            role="alert"
          >
            <AlertCircle className="h-3 w-3" strokeWidth={2.5} />
            This name isn&apos;t allowed
          </span>
        )}
      </div>

      {quantity && <div className="relative mt-3">{quantity}</div>}

      <div
        className={cn(
          'cta-halo-wrap relative mt-3 transition-opacity',
          blocked && 'pointer-events-none opacity-40',
        )}
        aria-disabled={blocked || undefined}
      >
        <span
          aria-hidden
          className="cta-halo pointer-events-none absolute -inset-1 rounded-[12px]"
          style={{
            boxShadow: `0 0 28px rgba(${ctaHaloRgb}, 0.5), 0 0 60px rgba(${ctaHaloRgb}, 0.25)`,
          }}
        />
        <div className="relative">{cta}</div>
      </div>

      <p
        className="relative mt-3.5 text-center text-[10.5px] font-semibold uppercase leading-none tracking-[0.16em]"
        style={{ color: `rgba(${accentRgb}, 0.7)` }}
      >
        Made to order
        <span className="mx-1.5 text-white/30">·</span>
        Ships in 2–3 days
      </p>

      {socialProof && (
        <div
          className="relative mt-4 border-t pt-3.5"
          style={{ borderColor: `rgba(${accentRgb}, 0.12)` }}
        >
          {socialProof}
        </div>
      )}
    </section>
  )
}
