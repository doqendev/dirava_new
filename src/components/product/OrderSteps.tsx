'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface OrderStepsProps {
  accent: string
  className?: string
}

function hexToRgb(hex: string): string {
  const m = hex.replace('#', '').match(/.{2}/g)
  if (!m || m.length < 3) return '0,245,255'
  return `${parseInt(m[0]!, 16)},${parseInt(m[1]!, 16)},${parseInt(m[2]!, 16)}`
}

const STEP_KEYS = [
  ['step1Title', 'step1Sub'],
  ['step2Title', 'step2Sub'],
  ['step3Title', 'step3Sub'],
  ['step4Title', 'step4Sub'],
  ['step5Title', 'step5Sub'],
  ['step6Title', 'step6Sub'],
] as const

export function OrderSteps({ accent, className }: OrderStepsProps) {
  const t = useTranslations('product.orderSteps')
  const rgb = hexToRgb(accent)

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg border border-border-subtle bg-bg-card p-5 sm:p-6',
        className
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-[0.08] blur-[60px]"
        style={{ background: accent }}
      />

      <div className="relative mb-6 flex items-center justify-between gap-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-white/55">
          {t('title')}
        </div>
        <div
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: accent }}
        >
          {t('eta')}
        </div>
      </div>

      <div className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute left-[14px] right-[14px] top-[16px] hidden h-px sm:block"
          style={{
            backgroundImage: `linear-gradient(90deg, rgba(${rgb},0.5), rgba(${rgb},0.15))`,
            WebkitMaskImage:
              'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
            maskImage:
              'linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent)',
          }}
        />
        <div className="relative grid grid-cols-3 gap-x-3 gap-y-5 sm:grid-cols-6 sm:gap-y-0">
          {STEP_KEYS.map(([titleKey, subKey], i) => (
            <div key={titleKey} className="flex flex-col items-center text-center">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-full"
                  style={{
                    boxShadow: `0 0 0 1px rgba(${rgb},0.12), 0 0 10px rgba(${rgb},0.15)`,
                  }}
                />
                <div
                  className="relative flex h-8 w-8 items-center justify-center rounded-full"
                  style={{
                    background: `radial-gradient(ellipse at 50% 30%, rgba(${rgb},0.18), transparent 70%), #0b0b16`,
                    border: `1px solid rgba(${rgb},0.55)`,
                  }}
                >
                  <span
                    className="font-display text-[11px] font-extrabold"
                    style={{
                      color: accent,
                      textShadow: `0 0 5px rgba(${rgb},0.6)`,
                    }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                </div>
              </div>
              <div className="mt-2.5 font-display text-[11px] font-bold uppercase tracking-[0.08em] text-white/90">
                {t(titleKey)}
              </div>
              <div className="mt-0.5 font-mono text-[9px] uppercase tracking-widest text-white/45">
                {t(subKey)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
