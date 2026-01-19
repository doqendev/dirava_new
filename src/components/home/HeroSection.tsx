'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

interface HeroSectionProps {
  className?: string
}

export function HeroSection({ className }: HeroSectionProps) {
  return (
    <section className={cn('relative py-8 lg:py-12 overflow-visible', className)}>
      <div className="px-4 max-w-7xl mx-auto text-center">
        {/* Animated background glow */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-cyan/5 rounded-full blur-[100px]" />
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            'relative font-display',
            'text-4xl md:text-5xl lg:text-6xl',
            'font-bold tracking-wider',
            'text-white'
          )}
        >
          CHOOSE YOUR{' '}
          <span className="text-neon-cyan text-glow-cyan">WORLD</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className={cn(
            'mt-4 font-body',
            'text-base md:text-lg',
            'text-white/60',
            'max-w-md mx-auto'
          )}
        >
          Drops, bundles, and collectibles — tap a universe.
        </motion.p>

        {/* Decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 mx-auto w-24 h-[2px] bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
        />
      </div>
    </section>
  )
}
