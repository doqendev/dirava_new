'use client'

import { Ruler } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface SizeGuideButtonProps {
  onClick: () => void
  className?: string
}

export function SizeGuideButton({ onClick, className }: SizeGuideButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5',
        'text-sm text-white/60 hover:text-neon-cyan',
        'transition-colors duration-200',
        'underline-offset-4 hover:underline',
        className
      )}
    >
      <Ruler className="w-4 h-4" />
      <span>Size Guide</span>
    </button>
  )
}
