'use client'

import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface Preview3DLoadingIndicatorProps {
  /** Optional override. When omitted, falls back to the translated
   *  `product.preview3dLoading` ("Loading...") so the indicator is
   *  localised by default for every 3D scene. */
  label?: string
  className?: string
}

export function Preview3DLoadingIndicator({
  label,
  className,
}: Preview3DLoadingIndicatorProps) {
  const t = useTranslations('product')
  const text = label ?? t('preview3dLoading')
  return (
    <div className={cn('pointer-events-none flex flex-col items-center gap-3', className)}>
      <div className="relative h-11 w-11">
        <div className="absolute inset-0 rounded-full bg-neon-cyan/20 blur-md" />
        <div className="absolute inset-0 rounded-full border border-neon-cyan/30" />
        <div className="absolute inset-[4px] rounded-full border-2 border-transparent border-t-neon-cyan border-r-neon-cyan animate-spin" />
      </div>
      <p className="text-xs text-white/60 tracking-[0.08em]">
        {text}
      </p>
    </div>
  )
}

