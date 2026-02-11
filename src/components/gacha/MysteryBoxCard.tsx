'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, Sparkles, Eye } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { OddsDisplay } from './OddsDisplay'
import type { MysteryBox } from '@/types/gacha'

interface MysteryBoxCardProps {
  box: MysteryBox
  variantId: string
  className?: string
}

export function MysteryBoxCard({ box, variantId, className }: MysteryBoxCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showOdds, setShowOdds] = useState(true)

  // Get theme color or default
  const themeColor = box.theme?.color || '#00f5ff'
  const displayName = box.theme?.displayName || box.title
  const description = box.theme?.description || box.description

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className={cn('group relative', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'relative rounded-2xl overflow-hidden',
          'bg-bg-card border-2',
          'transition-all duration-300'
        )}
        style={{
          borderColor: isHovered ? themeColor : 'rgba(255,255,255,0.1)',
          boxShadow: isHovered ? `0 0 30px ${themeColor}40, 0 0 60px ${themeColor}20` : 'none',
        }}
      >
        {/* Theme Badge */}
        {box.theme && (
          <div
            className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
            style={{
              background: `linear-gradient(135deg, ${themeColor} 0%, ${box.theme.secondaryColor || themeColor}80 100%)`,
              color: '#fff',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }}
          >
            {displayName}
          </div>
        )}

        {/* Image Container */}
        <div className="relative aspect-square bg-bg-secondary overflow-hidden">
          {box.image ? (
            <Image
              src={box.image.url}
              alt={box.image.altText || box.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-24 h-24" style={{ color: themeColor }} />
            </div>
          )}

          {/* Shimmer overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: isHovered ? '100%' : '-100%' }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
          />

          {/* Sparkle particles */}
          {isHovered && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    x: [0, (i % 2 === 0 ? 1 : -1) * 20],
                    y: [0, -30],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 0.5,
                  }}
                  style={{
                    left: `${20 + i * 15}%`,
                    top: '70%',
                  }}
                >
                  <Sparkles className="w-4 h-4" style={{ color: themeColor }} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3
            className="font-display text-xl font-bold tracking-wide"
            style={{ color: themeColor }}
          >
            {box.title}
          </h3>
          <p className="mt-2 text-sm text-white/60 line-clamp-2">{description}</p>

          {/* Price */}
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-2xl font-bold text-white">
              {formatPrice(box.price.amount, box.price.currencyCode)}
            </span>
          </div>

          {/* Odds Toggle */}
          {box.lootPool && (
            <>
              <button
                onClick={() => setShowOdds(!showOdds)}
                className="mt-3 text-xs text-white/40 hover:text-white/60 transition-colors underline underline-offset-2"
              >
                {showOdds ? 'Hide odds' : 'View odds'}
              </button>

              {/* Odds Display */}
              {showOdds && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3"
                >
                  <OddsDisplay odds={box.lootPool.odds} compact />
                </motion.div>
              )}
            </>
          )}

          {/* Actions */}
          <div className="mt-4 space-y-2">
            {/* Inspect button */}
            <Link
              href={`/gacha/${box.handle}`}
              className={cn(
                'flex items-center justify-center gap-2 w-full py-3 rounded-xl',
                'bg-white/5 border border-white/10',
                'text-white/80 text-sm font-medium',
                'hover:bg-white/10 hover:border-white/20 transition-all'
              )}
            >
              <Eye className="w-4 h-4" />
              Inspect Contents
            </Link>

            {/* Add to Cart */}
            <AddToCartButton
              variantId={variantId}
              className="w-full"
              available={true}
              attributes={[{ key: '_mystery_box', value: box.handle }]}
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
