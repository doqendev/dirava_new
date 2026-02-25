'use client'

import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Package, ShoppingCart, Sparkles } from 'lucide-react'

const steps = [
  { icon: Package, color: 'text-neon-cyan', glow: 'rgba(0, 245, 255, 0.5)' },
  { icon: ShoppingCart, color: 'text-neon-orange', glow: 'rgba(255, 165, 0, 0.5)' },
  { icon: Sparkles, color: 'text-neon-green', glow: 'rgba(0, 255, 136, 0.5)' },
]

export function BundleHowItWorks() {
  const t = useTranslations('bundles')

  return (
    <section className="py-12 lg:py-16">
      <div className="px-4 max-w-7xl mx-auto">
        <h2 className="font-display text-2xl md:text-3xl font-bold text-white text-center mb-10 tracking-wider">
          {t('howItWorks')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon
            const stepNum = index + 1

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4"
                  style={{ boxShadow: `0 0 20px ${step.glow}` }}
                >
                  <Icon className={`w-7 h-7 ${step.color}`} style={{ filter: `drop-shadow(0 0 6px ${step.glow})` }} />
                </div>

                <div className="text-xs font-bold text-white/30 tracking-widest mb-2">
                  STEP {stepNum}
                </div>

                <h3 className="font-display text-lg font-bold text-white mb-2 tracking-wide">
                  {t(`step${stepNum}Title`)}
                </h3>

                <p className="text-white/50 text-sm leading-relaxed">
                  {t(`step${stepNum}Desc`)}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
