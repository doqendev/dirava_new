'use client'

import { motion } from 'framer-motion'

interface ShopHubHeroProps {
  eyebrow: string
  title: string
  subtitle?: string
}

export function ShopHubHero({ eyebrow, title, subtitle }: ShopHubHeroProps) {
  return (
    <div className="relative pt-2 pb-6 md:pb-8">
      {/* Radial glow backdrop */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] rounded-full blur-[90px] opacity-30 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, rgba(0, 245, 255, 0.6), transparent 70%)' }}
      />

      {/* Single h1 with two visually-stacked lines. The eyebrow carries keyword
          weight for SEO ("Shop Anime Merchandise"); the main line is the big
          glowing title ("By Category"). Google reads them as one heading. */}
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative mb-3"
      >
        <span
          className="block text-[10px] sm:text-xs tracking-[4px] text-neon-cyan/70 uppercase mb-2 font-display"
        >
          {eyebrow}
        </span>
        <span
          className="block font-display font-bold tracking-wider uppercase text-3xl sm:text-4xl lg:text-5xl text-white"
          style={{
            textShadow: '0 0 20px rgba(0, 245, 255, 0.5), 0 0 40px rgba(0, 245, 255, 0.25)',
          }}
        >
          {title}
        </span>
      </motion.h1>

      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="relative text-sm sm:text-base text-white/60 max-w-md mb-4"
        >
          {subtitle}
        </motion.p>
      )}

      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative h-px w-32 origin-left mt-4"
        style={{
          background: 'linear-gradient(to right, transparent, rgba(0, 245, 255, 0.8), transparent)',
        }}
      />
    </div>
  )
}
