'use client'

import { cn } from '@/lib/utils/cn'

type BadgeVariant = 'default' | 'cyan' | 'pink' | 'orange' | 'green' | 'purple' | 'yellow'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  glow?: boolean
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-white/10 text-white border-white/20',
  cyan: 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/50',
  pink: 'bg-neon-pink/20 text-neon-pink border-neon-pink/50',
  orange: 'bg-neon-orange/20 text-neon-orange border-neon-orange/50',
  green: 'bg-neon-green/20 text-neon-green border-neon-green/50',
  purple: 'bg-neon-purple/20 text-neon-purple border-neon-purple/50',
  yellow: 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/50',
}

const glowStyles: Record<BadgeVariant, string> = {
  default: '',
  cyan: 'shadow-glow-sm-cyan',
  pink: 'shadow-glow-sm-pink',
  orange: 'shadow-glow-sm-orange',
  green: 'shadow-glow-sm-green',
  purple: '',
  yellow: '',
}

const sizeStyles = {
  sm: 'px-2 py-0.5 text-[10px]',
  md: 'px-3 py-1 text-xs',
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  glow = false,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'font-medium tracking-wider uppercase',
        'rounded-full border',
        variantStyles[variant],
        sizeStyles[size],
        glow && glowStyles[variant],
        className
      )}
    >
      {children}
    </span>
  )
}
