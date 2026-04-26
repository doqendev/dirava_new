'use client'

import { useTranslations } from 'next-intl'
import { Sparkles, Check } from 'lucide-react'
import type { Ref, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface PersonalizeCardProps {
  value: string
  onChange: (v: string) => void
  maxLength: number
  inputRef?: Ref<HTMLInputElement>
  /** Universe accent (used for header glow + active border). */
  themeColor?: string
  /** AddToCartButton — caller passes it in fully wired up. */
  cta: ReactNode
  /** Wishlist button slot (optional). */
  wishlist?: ReactNode
  /** When false, the input + CTA are visible but the input keeps a
   *  neutral border. When true, the active "ready" state lights up. */
  isReady?: boolean
}

/**
 * Featured "Personalize your sign" panel that wraps the name input,
 * char counter, validation badge, primary CTA and wishlist button in a
 * single neon-bordered card.
 */
export function PersonalizeCard({
  value,
  onChange,
  maxLength,
  inputRef,
  themeColor = '#22c55e',
  cta,
  wishlist,
  isReady,
}: PersonalizeCardProps) {
  const t = useTranslations('product')
  const ready = isReady ?? value.trim().length > 0
  const placeholder = t('personalizationPlaceholder')

  return (
    <section
      className="relative overflow-hidden rounded-2xl border bg-white/[0.02] p-5 sm:p-6"
      style={{
        borderColor: `${themeColor}55`,
        boxShadow: `0 0 24px ${themeColor}22 inset`,
      }}
    >
      {/* subtle accent halo at the top of the card */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 -top-12 h-24 rounded-full blur-3xl"
        style={{ background: `${themeColor}22` }}
      />

      <header className="relative flex items-center gap-2">
        <Sparkles className="h-4 w-4" style={{ color: themeColor }} />
        <h2
          className="text-sm font-semibold uppercase tracking-[0.18em]"
          style={{ color: themeColor }}
        >
          Personalize your sign
        </h2>
      </header>
      <p className="relative mt-1 text-xs text-white/65">
        Type your name and see it come to life!
      </p>

      <div className="relative mt-4">
        <input
          ref={inputRef}
          type="text"
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          className={cn(
            'block w-full rounded-xl border-2 bg-black/60 px-5 py-4 text-center text-2xl font-bold uppercase tracking-[0.18em] text-white placeholder-white/30 outline-none transition-colors',
          )}
          style={{
            borderColor: ready ? themeColor : 'rgba(255,255,255,0.15)',
            boxShadow: ready ? `0 0 22px ${themeColor}55` : 'none',
          }}
        />
      </div>

      <div className="relative mt-2 flex items-center justify-between text-[11px]">
        <span className="font-mono tabular-nums text-white/50">
          {value.length} / {maxLength} characters
        </span>
        {ready && (
          <span className="flex items-center gap-1 font-semibold" style={{ color: themeColor }}>
            <Check className="h-3.5 w-3.5" />
            Looks perfect!
          </span>
        )}
      </div>

      <div className="relative mt-5">{cta}</div>

      {wishlist && <div className="relative mt-3">{wishlist}</div>}
    </section>
  )
}
