'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { formatPrice } from '@/lib/utils/formatPrice'
import { RARITY_CONFIG } from '@/lib/gacha/constants'
import type { Rarity } from '@/types/gacha'
import type { ShopifyImage, ShopifyMoney } from '@/types/shopify'

interface ItemRevealProps {
  product: {
    id: string
    handle: string
    title: string
    description?: string
    image: ShopifyImage | null
    price: ShopifyMoney
  }
  rarity: Rarity
}

export function ItemReveal({ product, rarity }: ItemRevealProps) {
  const config = RARITY_CONFIG[rarity]

  return (
    <motion.div
      className="relative flex flex-col items-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Glow background */}
      <motion.div
        className="absolute -inset-8 rounded-full blur-3xl"
        style={{ backgroundColor: config.color }}
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 0.3, scale: 1 }}
        transition={{ duration: 0.8 }}
      />

      {/* Product card */}
      <motion.div
        className="relative w-72 md:w-80 rounded-2xl overflow-hidden bg-bg-card"
        style={{
          border: `3px solid ${config.color}`,
          boxShadow: `0 0 40px ${config.glowColor}, 0 0 80px ${config.glowColor}`,
        }}
        initial={{ y: 50, rotateX: 20 }}
        animate={{ y: 0, rotateX: 0 }}
        transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
      >
        {/* Rarity badge */}
        <motion.div
          className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg backdrop-blur-sm"
          style={{
            backgroundColor: `${config.color}30`,
            border: `1px solid ${config.color}`,
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <span
            className="font-display text-sm font-bold uppercase tracking-wider"
            style={{ color: config.color }}
          >
            {config.displayName}
          </span>
        </motion.div>

        {/* Image container */}
        <motion.div
          className="relative aspect-square bg-bg-secondary overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {product.image ? (
            <>
              <Image
                src={product.image.url}
                alt={product.image.altText || product.title}
                fill
                className="object-cover"
                priority
              />
              {/* Shimmer overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: '-100%' }}
                animate={{ x: '200%' }}
                transition={{
                  duration: 1.5,
                  delay: 0.5,
                  repeat: 2,
                  repeatDelay: 0.5,
                }}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="w-20 h-20 text-white/20" />
            </div>
          )}

          {/* Corner glow effects */}
          <div
            className="absolute top-0 left-0 w-32 h-32 opacity-50 pointer-events-none"
            style={{
              background: `radial-gradient(circle at top left, ${config.glowColor} 0%, transparent 70%)`,
            }}
          />
          <div
            className="absolute bottom-0 right-0 w-32 h-32 opacity-50 pointer-events-none"
            style={{
              background: `radial-gradient(circle at bottom right, ${config.glowColor} 0%, transparent 70%)`,
            }}
          />
        </motion.div>

        {/* Product info */}
        <motion.div
          className="relative p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="font-display text-xl text-white text-center mb-2">
            {product.title}
          </h3>
          <motion.div
            className="text-center"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.7, type: 'spring' }}
          >
            <span
              className="font-mono text-2xl font-bold"
              style={{ color: config.color }}
            >
              {formatPrice(product.price.amount, product.price.currencyCode)}
            </span>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Floating particles around the card */}
      {[...Array(8)].map((_, i) => {
        const angle = (i / 8) * Math.PI * 2
        return (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: config.color }}
            initial={{
              x: 0,
              y: 0,
              opacity: 0,
            }}
            animate={{
              x: Math.cos(angle) * 180,
              y: Math.sin(angle) * 180,
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: 2,
              delay: 0.5 + i * 0.1,
              repeat: Infinity,
              repeatDelay: 1,
            }}
          />
        )
      })}
    </motion.div>
  )
}
