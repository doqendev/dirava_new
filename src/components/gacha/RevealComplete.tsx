'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Package, ShoppingBag, Home, Share2, Check, ExternalLink, Gift } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { getRarityStyles } from '@/stores/gachaStore'
import { RARITY_CONFIG } from '@/lib/gacha/constants'
import type { GachaRevealResult } from '@/types/gacha'

interface RevealCompleteProps {
  result: GachaRevealResult
  alreadyRevealed?: boolean
  showClaimButton?: boolean
  onClaim?: () => void
}

export function RevealComplete({
  result,
  alreadyRevealed,
  showClaimButton = false,
  onClaim,
}: RevealCompleteProps) {
  const [copied, setCopied] = useState(false)
  const { rarity, revealedProduct, boxTitle, code } = result
  const rarityConfig = RARITY_CONFIG[rarity]
  const rarityStyles = getRarityStyles(rarity)

  const handleShare = async () => {
    const shareText = `I just revealed a ${rarityConfig.displayName} item from a ${boxTitle}! Check out what I got: ${revealedProduct.title}`

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mystery Box Reveal',
          text: shareText,
          url: window.location.href,
        })
      } catch (err) {
        console.log('Share cancelled:', err)
      }
    } else {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-bg-primary overflow-y-auto py-6 md:py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Already revealed notice */}
        {alreadyRevealed && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 md:mb-6 p-3 md:p-4 rounded-lg bg-white/5 border border-white/10 text-center"
          >
            <p className="text-white/60 text-xs md:text-sm">
              This mystery box was already revealed. Here&apos;s what you got!
            </p>
          </motion.div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-4 md:mb-8"
        >
          <div
            className={cn(
              'inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-3 md:mb-4',
              rarityStyles.bgColor,
              'border',
              rarityStyles.borderColor
            )}
          >
            <Package className="w-4 h-4 md:w-5 md:h-5" style={{ color: rarityConfig.color }} />
            <span
              className="font-display font-bold uppercase tracking-wider text-sm md:text-base"
              style={{ color: rarityConfig.color }}
            >
              {rarityConfig.displayName}
            </span>
          </div>

          <h1 className="font-display text-2xl md:text-4xl text-white mb-1 md:mb-2">
            Congratulations!
          </h1>
          <p className="text-white/60 text-sm md:text-base">
            You revealed a <span style={{ color: rarityConfig.color }}>{rarityConfig.displayName}</span> item
            {code && <span className="text-white/40"> (Code: {code})</span>}
          </p>
        </motion.div>

        {/* Revealed Item Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(
            'relative rounded-2xl overflow-hidden',
            'bg-bg-card border-2',
            rarityStyles.borderColor,
            rarityStyles.glowClass
          )}
        >
          {/* Rarity glow effect */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              background: `radial-gradient(circle at center, ${rarityConfig.glowColor} 0%, transparent 70%)`,
            }}
          />

          {/* Product Image */}
          <div className="relative aspect-square bg-bg-secondary">
            {revealedProduct.image ? (
              <Image
                src={revealedProduct.image.url}
                alt={revealedProduct.image.altText || revealedProduct.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="w-24 h-24 text-white/20" />
              </div>
            )}

            {/* Rarity badge */}
            <div
              className={cn(
                'absolute top-4 left-4 px-3 py-1.5 rounded-lg',
                rarityStyles.bgColor,
                'border',
                rarityStyles.borderColor,
                'backdrop-blur-sm'
              )}
            >
              <span
                className="font-display text-sm font-bold uppercase tracking-wider"
                style={{ color: rarityConfig.color }}
              >
                {rarityConfig.displayName}
              </span>
            </div>
          </div>

          {/* Product Info */}
          <div className="relative p-4 md:p-6">
            <h2 className="font-display text-xl md:text-2xl text-white mb-1 md:mb-2">
              {revealedProduct.title}
            </h2>
            {revealedProduct.description && (
              <p className="text-white/60 text-xs md:text-sm mb-3 md:mb-4 line-clamp-2">
                {revealedProduct.description}
              </p>
            )}
            <div className="flex items-center justify-between">
              <span className="font-mono text-lg md:text-xl font-bold text-neon-cyan">
                {formatPrice(
                  revealedProduct.price.amount,
                  revealedProduct.price.currencyCode
                )}
              </span>
              <span className="text-[10px] md:text-xs text-white/40">Retail Value</span>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 md:mt-8 space-y-3 md:space-y-4"
        >
          {/* Claim Prize Button (if applicable) */}
          {showClaimButton && onClaim && (
            <button
              onClick={onClaim}
              className={cn(
                'flex items-center justify-center gap-2 w-full py-4 rounded-xl',
                'bg-neon-cyan text-black font-medium',
                'active:bg-neon-cyan/90 transition-colors'
              )}
            >
              <Gift className="w-5 h-5" />
              Claim Your Prize
            </button>
          )}

          {/* View Product */}
          <Link
            href={`/products/${revealedProduct.handle}`}
            className={cn(
              'flex items-center justify-center gap-2 w-full py-4 rounded-xl',
              showClaimButton
                ? 'bg-white/10 text-white'
                : 'bg-neon-cyan text-black font-medium',
              'active:bg-opacity-90 transition-colors'
            )}
          >
            <ExternalLink className="w-5 h-5" />
            View Product Details
          </Link>

          {/* Secondary actions */}
          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/gacha"
              className={cn(
                'flex items-center justify-center gap-2 py-4 md:py-3 rounded-xl',
                'bg-white/10 text-white',
                'active:bg-white/20 transition-colors'
              )}
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="text-sm md:text-base">More Boxes</span>
            </Link>
            <button
              onClick={handleShare}
              className={cn(
                'flex items-center justify-center gap-2 py-4 md:py-3 rounded-xl',
                'bg-white/10 text-white',
                'active:bg-white/20 transition-colors'
              )}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-neon-green" />
                  <span className="text-sm md:text-base">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span className="text-sm md:text-base">Share</span>
                </>
              )}
            </button>
          </div>

          {/* Continue Shopping */}
          <Link
            href="/"
            className="flex items-center justify-center gap-2 py-4 md:py-3 text-white/60 active:text-white transition-colors"
          >
            <Home className="w-4 h-4" />
            <span className="text-sm md:text-base">Continue Shopping</span>
          </Link>
        </motion.div>

        {/* Order Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 md:mt-12 text-center text-[10px] md:text-xs text-white/40 px-2"
        >
          <p>
            Your item will be shipped after you claim it with your shipping address.
          </p>
          <p className="mt-2">
            Revealed at: {new Date(result.revealedAt).toLocaleString()}
          </p>
        </motion.div>
      </div>
    </div>
  )
}
