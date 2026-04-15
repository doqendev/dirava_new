'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Particles, BorderPulse } from '@/components/ui/neon'
import { cn } from '@/lib/utils/cn'

interface CategoryCardProps {
  href: string
  title: string
  subtitle: string
  color: string
  glow: string
  itemCount: number
  itemsLabel: string
  enterLabel: string
  heroImage?: string | null
  index?: number
}

export function CategoryCard({
  href,
  title,
  subtitle,
  color,
  glow,
  itemCount,
  itemsLabel,
  enterLabel,
  heroImage,
  index = 0,
}: CategoryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={href}
        className={cn(
          'relative block rounded-xl overflow-hidden group',
          'bg-bg-card',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary'
        )}
        style={{
          ['--focus-ring-color' as string]: color,
        }}
      >
        {/* Ambient glow behind card */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at right center, ${glow}, transparent 70%)`,
          }}
        />

        <div className="relative flex items-stretch gap-3 sm:gap-5 p-3 sm:p-4 h-[120px] sm:h-[140px] lg:h-[160px]">
          {/* Left: product image tile */}
          <div
            className="relative flex-shrink-0 aspect-square h-full rounded-lg overflow-hidden"
            style={{
              backgroundColor: `${color}08`,
              border: `1px solid ${color}25`,
            }}
          >
            {heroImage ? (
              <Image
                src={heroImage}
                alt=""
                fill
                sizes="(max-width: 640px) 96px, (max-width: 1024px) 120px, 140px"
                className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              // Fallback: gradient backdrop with category color
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${color}30, ${color}10 60%, transparent)`,
                }}
              />
            )}
          </div>

          {/* Right: wordmark, subtitle, meta */}
          <div className="flex-1 min-w-0 flex flex-col justify-center pr-2 sm:pr-3">
            <h2
              className="font-display font-bold tracking-wider uppercase text-lg sm:text-xl lg:text-2xl leading-tight mb-1"
              style={{
                color,
                textShadow: `0 0 12px ${glow}`,
              }}
            >
              {title}
            </h2>
            <div
              className="h-px w-8 mb-1.5 sm:mb-2"
              style={{
                background: `linear-gradient(to right, ${color}, transparent)`,
              }}
            />
            <p className="text-[11px] sm:text-xs text-white/50 leading-snug mb-2 sm:mb-3 line-clamp-2">
              {subtitle}
            </p>
            <div className="flex items-center justify-between gap-2 mt-auto">
              <span
                className="text-[10px] sm:text-xs tabular-nums"
                style={{ color: `${color}B3` }}
              >
                {itemCount} {itemsLabel}
              </span>
              <span
                className="flex items-center gap-0.5 text-[10px] sm:text-xs font-display tracking-wider uppercase"
                style={{ color }}
              >
                {enterLabel}
                <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>

          {/* Motion primitives — subtle amplitude (differentiates from UniverseCard intense) */}
          <Particles color={color} amplitude="subtle" />
          <BorderPulse color={color} amplitude="subtle" radius="xl" />
        </div>
      </Link>
    </motion.div>
  )
}
