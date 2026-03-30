'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { UniverseCard } from './UniverseCard'
import type { UniverseColorName } from '@/types/universe'

interface Universe {
  slug: string
  name: string
  itemCount: number
  themeColor: UniverseColorName
  themeColorHex?: string
  backgroundImage?: string
}

interface UniverseGridProps {
  universes: Universe[]
  className?: string
}

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
    transition: {
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  },
}

export function UniverseGrid({ universes, className }: UniverseGridProps) {
  return (
    <section className={cn('py-6 overflow-visible', className)}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="px-4 max-w-7xl mx-auto overflow-visible"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {universes.map((universe) => (
            <motion.div key={universe.slug} variants={itemVariants}>
              <UniverseCard
                slug={universe.slug}
                name={universe.name}
                itemCount={universe.itemCount}
                themeColor={universe.themeColor}
                themeColorHex={universe.themeColorHex}
                backgroundImage={universe.backgroundImage}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}

// Loading skeleton
export function UniverseGridSkeleton() {
  return (
    <section className="py-6">
      <div className="px-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] rounded-xl skeleton"
            />
          ))}
        </div>
      </div>
    </section>
  )
}
