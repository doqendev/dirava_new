'use client'

import { cn } from '@/lib/utils/cn'

interface Preview3DLoadingIndicatorProps {
  label?: string
  className?: string
}

export function Preview3DLoadingIndicator({
  label = 'Loading...',
  className,
}: Preview3DLoadingIndicatorProps) {
  return (
    <div className={cn('pointer-events-none flex flex-col items-center gap-3', className)}>
      <div className="relative h-11 w-11">
        <div className="absolute inset-0 rounded-full bg-neon-cyan/20 blur-md" />
        <div className="absolute inset-0 rounded-full border border-neon-cyan/30" />
        <div className="absolute inset-[4px] rounded-full border-2 border-transparent border-t-neon-cyan border-r-neon-cyan animate-spin" />
      </div>
      <p className="text-xs text-white/60 tracking-[0.08em]">
        {label}
      </p>
    </div>
  )
}

