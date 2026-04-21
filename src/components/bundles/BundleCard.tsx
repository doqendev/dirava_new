'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Plus, ShoppingCart, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useCartStore } from '@/stores/cartStore'
import { useToastStore } from '@/stores/toastStore'
import { getFirstAvailableVariant } from '@/lib/shopify/utils'
import { Badge } from '@/components/ui/Badge'
import type { BundleResolved } from '@/types/bundle'

interface BundleCardProps {
  bundle: BundleResolved
}

export function BundleCard({ bundle }: BundleCardProps) {
  const t = useTranslations('bundles')
  const tCart = useTranslations('cart')
  const addBundle = useCartStore((state) => state.addBundle)
  const addToast = useToastStore((state) => state.add)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const { config, products, originalTotal, bundleTotal, currencyCode, allAvailable } = bundle

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  }

  const handleAddBundle = async () => {
    if (!allAvailable || status === 'loading') return

    setStatus('loading')

    const items = products.map((product) => {
      const variant = getFirstAvailableVariant(product)
      return {
        variantId: variant!.id,
        quantity: 1,
      }
    })

    const result = await addBundle(items, config.discountCode, config.id)

    if (result.success) {
      setStatus('success')
      addToast({ type: 'success', message: tCart('itemAdded') })
      setTimeout(() => setStatus('idle'), 2000)
    } else {
      setStatus('error')
      addToast({ type: 'error', message: tCart('failedToAddBundle') })
      setTimeout(() => setStatus('idle'), 3000)
    }
  }

  const themeColorMap = {
    cyan: { border: 'border-neon-cyan/30', glow: 'rgba(0, 245, 255, 0.15)', text: 'text-neon-cyan', badge: 'cyan' as const },
    pink: { border: 'border-neon-pink/30', glow: 'rgba(255, 0, 170, 0.15)', text: 'text-neon-pink', badge: 'pink' as const },
    orange: { border: 'border-neon-orange/30', glow: 'rgba(255, 165, 0, 0.15)', text: 'text-neon-orange', badge: 'orange' as const },
  }

  const theme = themeColorMap[config.themeColor || 'cyan']

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={cn(
        'relative bg-bg-card border rounded-2xl overflow-hidden',
        'transition-shadow duration-300',
        theme.border
      )}
      style={{ boxShadow: `0 0 30px ${theme.glow}` }}
    >
      {/* Badge */}
      {config.badge && (
        <div className="absolute top-4 right-4 z-10">
          <Badge variant={theme.badge} glow size="sm">{config.badge}</Badge>
        </div>
      )}

      {/* Products Display */}
      <div className="p-6">
        <div className="flex items-center justify-center gap-3 mb-6">
          {products.map((product, index) => (
            <div key={product.id} className="flex items-center gap-3">
              {index > 0 && (
                <div
                  className={cn('flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10', theme.text)}
                  style={{ filter: `drop-shadow(0 0 8px ${theme.glow})` }}
                >
                  <Plus className="w-4 h-4" />
                </div>
              )}
              <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white/5 border border-white/10">
                {product.featuredImage ? (
                  <Image
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText || product.title}
                    fill
                    className="object-cover"
                    sizes="112px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
                    No Image
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Product Names */}
        <div className="space-y-1 mb-4">
          <p className="text-xs text-white/40 tracking-widest uppercase">{t('includes')}</p>
          {products.map((product) => {
            const variant = getFirstAvailableVariant(product)
            return (
              <div key={product.id} className="flex items-center justify-between">
                <span className="text-sm text-white/80 truncate">{product.title}</span>
                {variant && (
                  <span className="text-sm text-white/40 ml-2 shrink-0">
                    {formatPrice(parseFloat(variant.price.amount))}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Pricing */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-white/40 line-through text-sm">
            {formatPrice(originalTotal)}
          </span>
          <span className={cn('text-2xl font-bold', theme.text)} style={{ textShadow: `0 0 10px ${theme.glow}` }}>
            {formatPrice(bundleTotal)}
          </span>
          <Badge variant="green" size="sm" glow>
            {t('savePercent', { percent: config.discountPercent })}
          </Badge>
        </div>

        {/* Add to Cart Button */}
        <motion.button
          whileHover={allAvailable ? { scale: 1.02 } : {}}
          whileTap={allAvailable ? { scale: 0.98 } : {}}
          onClick={handleAddBundle}
          disabled={!allAvailable || status === 'loading'}
          className={cn(
            'w-full py-3.5 rounded-xl font-bold text-sm tracking-wider uppercase',
            'transition-all duration-200',
            'flex items-center justify-center gap-2',
            allAvailable
              ? status === 'success'
                ? 'bg-neon-green/20 text-neon-green border border-neon-green/50'
                : 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 hover:bg-[color:var(--accent,#00f5ff)]/30'
              : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
          )}
          style={allAvailable && status !== 'success' ? { boxShadow: '0 0 20px rgba(0, 245, 255, 0.3)' } : {}}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('adding')}
            </>
          ) : status === 'success' ? (
            <>
              <Check className="w-4 h-4" />
              {t('added')}
            </>
          ) : !allAvailable ? (
            t('outOfStock')
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              {t('addToCart')}
            </>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
