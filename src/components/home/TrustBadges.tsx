'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Package, ShieldCheck, RotateCcw, Globe, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface Badge {
  icon: LucideIcon
  titleKey: string
  descKey: string
}

const badgeConfig: Badge[] = [
  { icon: Package, titleKey: 'freeShipping', descKey: 'freeShippingDesc' },
  { icon: ShieldCheck, titleKey: 'secureCheckout', descKey: 'secureCheckoutDesc' },
  { icon: RotateCcw, titleKey: 'easyReturns', descKey: 'easyReturnsDesc' },
  { icon: Globe, titleKey: 'worldwideShipping', descKey: 'worldwideShippingDesc' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
}

export function TrustBadges() {
  const t = useTranslations('home')

  return (
    <section className="py-12 md:py-16 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {badgeConfig.map((badge) => (
            <motion.div
              key={badge.titleKey}
              variants={itemVariants}
              className="flex flex-col items-center text-center group"
            >
              {/* Icon container */}
              <div className="relative mb-4">
                {/* Always visible glow effect */}
                <div className="absolute inset-0 rounded-full bg-neon-cyan/30 blur-xl" />

                <div className={cn(
                  'relative w-14 h-14 md:w-16 md:h-16 rounded-full',
                  'bg-white/5 border border-neon-cyan/30',
                  'flex items-center justify-center',
                  'shadow-[0_0_20px_rgba(0,245,255,0.3)]'
                )}>
                  <badge.icon className="w-6 h-6 md:w-7 md:h-7 text-neon-cyan drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]" />
                </div>
              </div>

              {/* Text */}
              <h3 className="text-sm md:text-base font-semibold text-white mb-1">
                {t(badge.titleKey)}
              </h3>
              <p className="text-xs md:text-sm text-white/50">
                {t(badge.descKey)}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
