'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface GlowBorderProps {
  color?: 'cyan' | 'pink' | 'orange' | 'green'
  animated?: boolean
  intensity?: 'low' | 'medium' | 'high'
  className?: string
  children: React.ReactNode
}

const colorMap = {
  cyan: {
    border: 'border-neon-cyan',
    shadow: 'shadow-glow-cyan',
    gradient: 'from-neon-cyan via-neon-purple to-neon-cyan',
  },
  pink: {
    border: 'border-neon-pink',
    shadow: 'shadow-glow-pink',
    gradient: 'from-neon-pink via-neon-purple to-neon-pink',
  },
  orange: {
    border: 'border-neon-orange',
    shadow: 'shadow-glow-orange',
    gradient: 'from-neon-orange via-neon-yellow to-neon-orange',
  },
  green: {
    border: 'border-neon-green',
    shadow: 'shadow-glow-green',
    gradient: 'from-neon-green via-neon-cyan to-neon-green',
  },
}

const intensityMap = {
  low: 'opacity-30',
  medium: 'opacity-50',
  high: 'opacity-70',
}

export function GlowBorder({
  color = 'cyan',
  animated = false,
  intensity = 'medium',
  className,
  children,
}: GlowBorderProps) {
  const colors = colorMap[color]

  return (
    <div className={cn('relative', className)}>
      {/* Glow effect */}
      <motion.div
        className={cn(
          'absolute -inset-0.5 rounded-xl',
          'bg-gradient-to-r',
          colors.gradient,
          'blur-sm',
          intensityMap[intensity]
        )}
        animate={
          animated
            ? {
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
              }
            : undefined
        }
        transition={
          animated
            ? {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }
            : undefined
        }
      />

      {/* Content container */}
      <div
        className={cn(
          'relative rounded-xl',
          'border-2',
          colors.border,
          'bg-bg-primary'
        )}
      >
        {children}
      </div>
    </div>
  )
}
