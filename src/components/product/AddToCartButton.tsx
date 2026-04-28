'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'
import { useToastStore } from '@/stores/toastStore'
import { useCookieConsentStore } from '@/stores/cookieConsentStore'
import { trackAddToCart } from '@/lib/tracking/trackClear'

interface AddToCartButtonProps {
  variantId: string
  quantity?: number
  available?: boolean
  attributes?: Array<{ key: string; value: string }>
  className?: string
  size?: 'sm' | 'md' | 'lg'
  requiresPersonalization?: boolean
  personalizationValue?: string
  onPersonalizationError?: () => void
  onBeforeAdd?: () => boolean // Return true to proceed, false to cancel
  label?: string
  /** Universe accent color — overrides the default neon-cyan surface. */
  themeColor?: string
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error' | 'personalization-error'

export function AddToCartButton({
  variantId,
  quantity = 1,
  available = true,
  attributes,
  className,
  size = 'lg',
  requiresPersonalization = false,
  personalizationValue = '',
  onPersonalizationError,
  onBeforeAdd,
  label,
  themeColor,
}: AddToCartButtonProps) {
  const t = useTranslations('product')
  const tCommon = useTranslations('common')
  const tCart = useTranslations('cart')
  const [state, setState] = useState<ButtonState>('idle')
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useUIStore((state) => state.openCart)
  const addToast = useToastStore((state) => state.add)

  const handleClick = async () => {
    if (!available || state === 'loading') return

    // Check personalization requirement
    if (requiresPersonalization && !personalizationValue.trim()) {
      setState('personalization-error')
      onPersonalizationError?.()
      setTimeout(() => setState('idle'), 2000)
      return
    }

    // Run validation callback if provided
    if (onBeforeAdd && !onBeforeAdd()) {
      return
    }

    setState('loading')

    try {
      await addItem(variantId, quantity, attributes)
      setState('success')

      // Fire Track Clear AddToCart event (gated by marketing consent)
      const consent = useCookieConsentStore.getState()
      if (consent.consentGiven && consent.preferences.marketing) {
        trackAddToCart({ variantId, price: 0, currency: 'EUR', quantity })
      }

      // Open cart after success
      setTimeout(() => {
        openCart()
        setState('idle')
      }, 1500)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      setState('error')
      addToast({ type: 'error', message: tCart('failedToAdd') })
      setTimeout(() => setState('idle'), 2000)
    }
  }

  const buttonContent = {
    idle: (
      <>
        <ShoppingBag className="w-5 h-5 mr-2" />
        {(label || t('addToCart')).toUpperCase()}
      </>
    ),
    loading: (
      <>
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        {t('adding').toUpperCase()}
      </>
    ),
    success: (
      <>
        <Check className="w-5 h-5 mr-2" />
        {t('addedToCart').toUpperCase()}
      </>
    ),
    error: <>{tCommon('error').toUpperCase()}</>,
    'personalization-error': <>{t('personalizationRequired').toUpperCase()}</>,
  }

  if (!available) {
    return (
      <Button
        variant="outline"
        size={size}
        disabled
        className={cn('w-full', className)}
      >
        {tCommon('outOfStock').toUpperCase()}
      </Button>
    )
  }

  return (
    <motion.div
      animate={state === 'success' ? { scale: [1, 1.02, 1] } : {}}
      transition={{ duration: 0.2 }}
    >
      <Button
        variant="primary"
        size={size}
        onClick={handleClick}
        disabled={state === 'loading'}
        className={cn(
          'w-full',
          // Snap state changes (bg color / shadow) instead of animating
          // them — the 200ms transition mid-frame reads as a glow pulse
          // and a dark "border" while colors are crossing.
          '!transition-none',
          themeColor && state === 'idle' && '!bg-[var(--ug)] hover:!bg-[var(--ug)]/90 !text-black',
          state === 'success' && 'bg-neon-green hover:bg-neon-green/90',
          state === 'error' && 'bg-red-500 hover:bg-red-500/90',
          state === 'personalization-error' && 'bg-orange-500 hover:bg-orange-500/90',
          className
        )}
        style={
          themeColor
            ? ({
                '--ug': themeColor,
                // Shadow stays stable across all states so the button
                // doesn't appear to "glow" on click as the inline style
                // transitions in/out. Background gradient is only on
                // idle so success/error bg classes can take over.
                ...(state === 'idle' && {
                  backgroundImage: `linear-gradient(180deg, ${themeColor}, ${themeColor}cf)`,
                }),
                boxShadow: `0 6px 18px ${themeColor}33, 0 0 0 1px ${themeColor}55, inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(0,0,0,0.18)`,
              } as React.CSSProperties)
            : undefined
        }
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={state}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
          >
            {buttonContent[state]}
          </motion.span>
        </AnimatePresence>
      </Button>
    </motion.div>
  )
}
