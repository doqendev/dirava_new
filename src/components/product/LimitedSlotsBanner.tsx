'use client'

import { Zap } from 'lucide-react'
import { getProductSlots } from '@/data/productSlots'

interface LimitedSlotsBannerProps {
  accent?: string
  /** Product handle — used to read its bucketed slot total + the
   *  per-day deterministic available count. */
  productHandle: string
}

function hexToRgb(hex: string): string {
  const match = hex.replace('#', '').match(/.{2}/g)
  if (!match || match.length < 3) return '25, 255, 122'
  return `${parseInt(match[0]!, 16)}, ${parseInt(match[1]!, 16)}, ${parseInt(match[2]!, 16)}`
}

/**
 * Limited-slots banner shown under the gallery: lightning icon + copy
 * on the left, ticking countdown (HRS / MINS / SECS) on the right.
 * The countdown resets at local midnight so it's consistent across
 * visitors but never fakes "expires in 5 minutes" desperation.
 */
export function LimitedSlotsBanner({ accent = '#19ff7a', productHandle }: LimitedSlotsBannerProps) {
  const accentRgb = hexToRgb(accent)
  const { available, total } = getProductSlots(productHandle)
  const filled = Math.max(0, Math.min(total, total - available))
  const filledPct = total === 0 ? 0 : (filled / total) * 100

  return (
    <div
      className="relative flex flex-col items-stretch gap-2 overflow-hidden rounded-[11px] border bg-[#010708] px-3 py-3 sm:min-h-[82px] sm:flex-row sm:items-center sm:gap-0 sm:px-[22px] sm:py-3.5"
      style={{
        borderColor: `rgba(${accentRgb}, 0.16)`,
        boxShadow: `0 0 0 1px rgba(0, 0, 0, 0.45), inset 0 0 12px rgba(${accentRgb}, 0.018), inset 0 1px 0 rgba(${accentRgb}, 0.035)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 18% 50%, rgba(${accentRgb}, 0.04), transparent 30%), linear-gradient(90deg, rgba(${accentRgb}, 0.015), transparent 55%)`,
        }}
      />
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

      <div className="relative flex min-w-0 flex-1 items-center gap-2.5 pr-0 sm:gap-[14px] sm:pr-5">
        <Zap
          className="h-7 w-5 flex-shrink-0 sm:h-9 sm:w-7"
          strokeWidth={1.5}
          style={{
            color: accent,
            fill: accent,
            stroke: accent,
            filter: `drop-shadow(0 0 4px rgba(${accentRgb}, 0.45))`,
          }}
        />

        <div className="min-w-0">
          <div
            className="text-[12px] font-black uppercase leading-tight tracking-normal sm:text-[14px]"
            style={{ color: accent }}
          >
            Limited production slots!
          </div>
          <p className="mt-0.5 max-w-none text-[10.5px] font-medium leading-[1.3] text-white sm:mt-1 sm:max-w-[230px] sm:text-[12px]">
            We only take a few orders at a time to keep quality high. As we finish each piece, a slot opens up.
          </p>
        </div>
      </div>

      <div className="relative hidden h-[42px] w-px flex-shrink-0 bg-[#1d2a2b] sm:block" />

      <div
        className="relative flex w-full flex-shrink-0 flex-col items-stretch gap-1.5 border-t pt-2 sm:w-auto sm:items-end sm:border-t-0 sm:pt-0 sm:pl-[22px]"
        style={{ borderColor: `rgba(${accentRgb}, 0.12)` }}
      >
        <div className="flex items-baseline justify-center gap-1.5 sm:justify-end">
          <span
            className="font-mono text-[22px] font-black leading-none tabular-nums sm:text-[26px]"
            style={{ color: accent, textShadow: `0 0 6px rgba(${accentRgb}, 0.32)` }}
          >
            {available}
          </span>
          <span className="text-[10px] font-bold uppercase leading-none tracking-[0.12em] text-white/55 sm:text-[11px]">
            / {total} slots left
          </span>
        </div>
        <div
          className="relative h-[5px] w-full overflow-hidden rounded-full sm:w-[150px]"
          style={{
            background: `rgba(${accentRgb}, 0.1)`,
            boxShadow: `inset 0 0 6px rgba(${accentRgb}, 0.08)`,
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${filledPct}%`,
              background: `linear-gradient(90deg, rgba(${accentRgb}, 0.4), rgba(${accentRgb}, 0.85))`,
              boxShadow: `0 0 5px rgba(${accentRgb}, 0.3)`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
