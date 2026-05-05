'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle, Box, LockKeyhole } from 'lucide-react'
import type { Ref, ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'
import { isBlockedName } from '@/lib/utils/personalizationBlocklist'

interface PersonalizeCardProps {
  value: string
  onChange: (v: string) => void
  maxLength: number
  inputRef?: Ref<HTMLInputElement>
  /** Universe accent (used for header colour + active border + microcopy). */
  themeColor?: string
  /** AddToCartButton — caller passes it in fully wired up. */
  cta: ReactNode
  /** Optional quantity selector slot, rendered between input and CTA. */
  quantity?: ReactNode
  /** Optional product-specific choice shown below the name input. */
  customizationOption?: ReactNode
  /** Optional live social-proof line, rendered below the microcopy. */
  socialProof?: ReactNode
  /** Reserved (kept for API stability — the new layout shows the
   *  "Ready to order" state implicitly via the active border). */
  isReady?: boolean
  /** When provided, an inline "3D" affordance appears inside the input
   *  (right side, after the character counter). Replaces the previous
   *  mobile-only stand-alone preview button. */
  onPreview3D?: () => void
  previewLabel?: string
  previewAriaLabel?: string
  layout?: 'standard' | 'streamlined'
  previewPlacement?: 'input' | 'header'
}

function hexToRgb(hex: string): string {
  const match = hex.replace('#', '').match(/.{2}/g)
  if (!match || match.length < 3) return '0, 245, 255'
  return `${parseInt(match[0]!, 16)}, ${parseInt(match[1]!, 16)}, ${parseInt(match[2]!, 16)}`
}

/**
 * Buying-flow card: header → name input (with counter + inline 3D
 * affordance) → CTA → microcopy. Visual language is the cyberpunk
 * neon-bordered panel with a soft cyan glow — dialled to read as a
 * single self-contained "build your sign" card.
 */
export function PersonalizeCard({
  value,
  onChange,
  maxLength,
  inputRef,
  themeColor = '#00f5ff',
  cta,
  quantity,
  customizationOption,
  socialProof,
  onPreview3D,
  previewLabel = '3D View',
  previewAriaLabel,
  layout = 'standard',
  previewPlacement = 'input',
}: PersonalizeCardProps) {
  const t = useTranslations('product')
  const [focused, setFocused] = useState(false)
  const accentRgb = hexToRgb(themeColor)
  const hasValue = value.trim().length > 0
  const blocked = hasValue && isBlockedName(value)
  const errorRgb = '255, 90, 90'
  const counterColor = hasValue ? themeColor : 'rgba(255,255,255,0.45)'
  const isStreamlined = layout === 'streamlined'
  const showHeaderPreview = onPreview3D && previewPlacement === 'header'
  const showInputPreview = onPreview3D && previewPlacement === 'input'

  return (
    <section
      className={cn(
        'relative overflow-hidden border bg-[#06080d]',
        isStreamlined ? 'rounded-xl p-4 sm:p-5' : 'rounded-2xl p-5 sm:p-6'
      )}
      style={{
        borderColor: `rgba(${accentRgb}, 0.45)`,
        boxShadow: isStreamlined
          ? `0 0 0 1px rgba(${accentRgb}, 0.04), inset 0 0 22px rgba(${accentRgb}, 0.045), 0 14px 34px -26px rgba(${accentRgb}, 0.32)`
          : `0 0 0 1px rgba(${accentRgb}, 0.05), inset 0 0 28px rgba(${accentRgb}, 0.05), 0 18px 40px -24px rgba(${accentRgb}, 0.35)`,
      }}
    >
      {/* Header */}
      <header className={cn('relative', isStreamlined ? 'mb-3' : 'mb-4')}>
        <div className="flex flex-wrap items-start justify-between gap-2.5 sm:gap-3">
          <div className="min-w-0 flex-1 basis-[170px]">
            <h3
              className={cn(
                'font-display font-bold uppercase leading-tight',
                isStreamlined
                  ? 'whitespace-nowrap text-[12px] tracking-[0.13em] max-[360px]:text-[11.5px] max-[360px]:tracking-[0.09em] sm:text-[13px] sm:tracking-[0.15em]'
                  : 'text-[13px] tracking-[0.16em] sm:text-sm'
              )}
              style={{ color: themeColor }}
            >
              {isStreamlined ? t('personalizationNameOnSign') : t('personalizeYourSign')}
            </h3>
            {!isStreamlined && (
              <p className="mt-1.5 text-[13px] leading-snug text-white/65 sm:text-sm">
                {t('personalizeYourSignSub')}
              </p>
            )}
          </div>

          {showHeaderPreview && (
            <button
              type="button"
              onClick={onPreview3D}
              aria-label={previewAriaLabel ?? t('personalizationOpen3D')}
              className="inline-flex h-8 shrink-0 items-center justify-center gap-1 rounded-md border px-2 text-[9.5px] font-bold uppercase tracking-[0.08em] transition-all duration-150 active:scale-[0.985] focus:outline-none focus-visible:ring-2 min-[380px]:h-8 min-[380px]:px-2.5 min-[380px]:text-[10px] min-[380px]:tracking-[0.09em] sm:h-9 sm:px-3 sm:tracking-[0.11em]"
              style={{
                color: themeColor,
                borderColor: `rgba(${accentRgb}, 0.38)`,
                background: `rgba(${accentRgb}, 0.035)`,
                boxShadow: `inset 0 1px 0 rgba(${accentRgb}, 0.08)`,
              }}
            >
              <Box className="h-3 w-3" strokeWidth={2.25} />
              {previewLabel}
            </button>
          )}
        </div>
      </header>

      {/* Input row */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          maxLength={maxLength}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={t('personalizationPlaceholder')}
          aria-label={t('personalizationNameLabel')}
          className={cn(
            'block h-14 w-full rounded-xl border bg-transparent pl-5 text-left text-base font-bold uppercase tracking-[0.1em] leading-none text-white placeholder-white/30 outline-none transition-all duration-200 sm:text-lg',
            // Right-padding only reserves room for the inline 3D pill
            // on >=sm, where it sits inside the input. On smaller
            // mobiles the pill drops to its own row below the input,
            // so the name has the full width to breathe.
            showInputPreview ? 'pr-16 sm:pr-[150px]' : 'pr-16 sm:pr-20',
            isStreamlined && 'h-[54px] rounded-lg bg-white/[0.025] pl-4 placeholder-white/35',
          )}
          style={{
            caretColor: blocked ? `rgb(${errorRgb})` : themeColor,
            borderColor: blocked
              ? `rgba(${errorRgb}, 0.7)`
              : focused
              ? `rgba(${accentRgb}, 0.85)`
              : `rgba(${accentRgb}, 0.4)`,
            boxShadow: blocked
              ? `inset 0 0 14px rgba(${errorRgb}, 0.12), 0 0 0 3px rgba(${errorRgb}, 0.18)`
              : focused
              ? `inset 0 0 14px rgba(${accentRgb}, 0.08), 0 0 0 3px rgba(${accentRgb}, 0.18), 0 0 14px rgba(${accentRgb}, 0.28)`
              : `inset 0 0 12px rgba(${accentRgb}, 0.04)`,
          }}
        />

        {/* Right-side cluster: counter · thin divider · 3D View pill.
            Pointer-events stay off on the wrapper so the input still
            takes clicks across the row; the 3D button re-enables them
            on itself so it remains tappable. */}
        <div className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2.5">
          <span
            aria-hidden
            className="font-mono text-xs font-semibold tabular-nums tracking-wide transition-colors"
            style={{ color: counterColor }}
          >
            {value.length}/{maxLength}
          </span>

          {showInputPreview && (
            <>
              {/* Hairline divider — full pill height, soft edges via
                  fade-out gradient so it reads as a separator, not a
                  hard partition. Hidden on mobile (the pill moves
                  below the input on small screens). */}
              <span
                aria-hidden
                className="hidden sm:block h-7 w-px"
                style={{
                  background: `linear-gradient(180deg, transparent 0%, rgba(${accentRgb}, 0.45) 30%, rgba(${accentRgb}, 0.45) 70%, transparent 100%)`,
                }}
              />
              <button
                type="button"
                onClick={onPreview3D}
                aria-label={previewAriaLabel ?? t('personalizationOpen3D')}
                className="pointer-events-auto hidden sm:inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] transition-all duration-150 hover:scale-[1.03] active:scale-95 focus:outline-none focus-visible:ring-2"
                style={{
                  color: themeColor,
                  borderColor: `rgba(${accentRgb}, 0.55)`,
                  background: `rgba(${accentRgb}, 0.1)`,
                  boxShadow: `inset 0 1px 0 rgba(${accentRgb}, 0.18), 0 0 10px rgba(${accentRgb}, 0.18)`,
                }}
              >
                <Box className="h-3.5 w-3.5" strokeWidth={2.25} />
                {previewLabel}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile-only stand-alone 3D View button. Smaller than the CTA
          and visually secondary (outlined, low-fill, lighter shadow)
          so Add to Cart remains the dominant action below it. Hidden
          on >=sm where the inline pill in the input row takes over. */}
      {showInputPreview && (
        <button
          type="button"
          onClick={onPreview3D}
          aria-label={previewAriaLabel ?? t('personalizationOpen3D')}
          className="sm:hidden mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-[11.5px] font-bold uppercase tracking-[0.14em] transition-all duration-150 active:scale-[0.985] focus:outline-none focus-visible:ring-2"
          style={{
            color: themeColor,
            borderColor: `rgba(${accentRgb}, 0.45)`,
            background: `rgba(${accentRgb}, 0.06)`,
            boxShadow: `inset 0 1px 0 rgba(${accentRgb}, 0.12)`,
          }}
        >
          <Box className="h-4 w-4" strokeWidth={2.25} />
          {previewLabel}
        </button>
      )}

      {/* Blocked-name error — only shown when the entered name fails the
          word-list. The "Ready to order" success state was dropped per
          the redesign; the lit-up input border is signal enough. */}
      {blocked && (
        <div className="mt-2 flex items-center gap-1.5 text-[11.5px] font-semibold leading-none" role="alert">
          <AlertCircle className="h-3.5 w-3.5" strokeWidth={2.5} style={{ color: `rgb(${errorRgb})` }} />
          <span style={{ color: `rgb(${errorRgb})` }}>{t('personalizationBlocked')}</span>
        </div>
      )}

      {customizationOption && <div className="mt-3">{customizationOption}</div>}

      {quantity && <div className="mt-4">{quantity}</div>}

      {/* CTA — soft halo behind it that breathes on hover */}
      <div
        className={cn(
          'cta-halo-wrap relative transition-opacity',
          isStreamlined ? 'mt-4' : 'mt-5',
          blocked && 'pointer-events-none opacity-40',
        )}
        aria-disabled={blocked || undefined}
      >
        <span
          aria-hidden
          className="cta-halo pointer-events-none absolute -inset-1 rounded-[14px]"
          style={{
            boxShadow: `0 0 28px rgba(${accentRgb}, 0.5), 0 0 60px rgba(${accentRgb}, 0.25)`,
          }}
        />
        <div className="relative">{cta}</div>
      </div>

      {/* Microcopy — accent-coloured, centered, all-caps */}
      <p
        className={cn(
          'text-center font-bold uppercase leading-none',
          isStreamlined
            ? 'mt-3 text-[10.5px] tracking-[0.15em]'
            : 'mt-4 text-[11px] tracking-[0.18em]'
        )}
        style={{ color: `rgba(${accentRgb}, 0.85)` }}
      >
        Made to order
        <span className="mx-2 text-white/30">·</span>
        {isStreamlined ? 'Ready 2-3 days' : 'Ready in 2-3 days'}
      </p>
      <p
        className={cn(
          'mt-2 flex items-center justify-center gap-1.5 font-semibold uppercase leading-none text-white/42',
          isStreamlined ? 'text-[10px] tracking-[0.1em]' : 'text-[10.5px] tracking-[0.12em]'
        )}
      >
        <LockKeyhole className="h-3 w-3" strokeWidth={2.25} />
        Encrypted checkout
      </p>

      {socialProof && (
        <div
          className="mt-4 border-t pt-3.5"
          style={{ borderColor: `rgba(${accentRgb}, 0.15)` }}
        >
          {socialProof}
        </div>
      )}
    </section>
  )
}
