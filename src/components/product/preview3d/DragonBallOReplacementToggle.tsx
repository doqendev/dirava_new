'use client'

import { useTranslations } from 'next-intl'

import { cn } from '@/lib/utils/cn'

interface DragonBallOReplacementToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  className?: string
}

export function DragonBallOReplacementToggle({
  checked,
  onChange,
  className,
}: DragonBallOReplacementToggleProps) {
  const t = useTranslations('product')

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'mx-auto mb-1 flex h-8 max-w-full items-center justify-center gap-2 rounded-full px-2.5',
        'border border-white/15 bg-black/35 text-[11px] font-semibold uppercase tracking-[0.08em]',
        'text-white/80 backdrop-blur-md transition-colors',
        'hover:border-[#ff6c00]/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6c00]/70',
        checked && 'border-[#ff6c00]/70 bg-[#ff6c00]/15 text-white',
        className,
      )}
    >
      <span className="truncate">{t('dragonBallReplaceOs')}</span>
      <span
        aria-hidden="true"
        className={cn(
          'relative h-4 w-7 flex-shrink-0 rounded-full border border-white/25 bg-white/10 transition-colors',
          checked && 'border-[#ff6c00]/70 bg-[#ff6c00]/55',
        )}
      >
        <span
          className={cn(
            'absolute left-0.5 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white transition-transform',
            checked && 'translate-x-3',
          )}
        />
      </span>
    </button>
  )
}
