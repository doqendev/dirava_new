'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cartStore'
import { useUIStore } from '@/stores/uiStore'

interface AddToCartButtonProps {
  variantId: string
  quantity?: number
  available?: boolean
  attributes?: Array<{ key: string; value: string }>
  className?: string
}

type ButtonState = 'idle' | 'loading' | 'success' | 'error'

export function AddToCartButton({
  variantId,
  quantity = 1,
  available = true,
  attributes,
  className,
}: AddToCartButtonProps) {
  const [state, setState] = useState<ButtonState>('idle')
  const addItem = useCartStore((state) => state.addItem)
  const openCart = useUIStore((state) => state.openCart)

  const handleClick = async () => {
    if (!available || state === 'loading') return

    setState('loading')

    try {
      await addItem(variantId, quantity, attributes)
      setState('success')

      // Open cart after success
      setTimeout(() => {
        openCart()
        setState('idle')
      }, 1500)
    } catch (error) {
      console.error('Failed to add to cart:', error)
      setState('error')
      setTimeout(() => setState('idle'), 2000)
    }
  }

  const buttonContent = {
    idle: (
      <>
        <ShoppingBag className="w-5 h-5 mr-2" />
        ADD TO CART
      </>
    ),
    loading: (
      <>
        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
        ADDING...
      </>
    ),
    success: (
      <>
        <Check className="w-5 h-5 mr-2" />
        ADDED!
      </>
    ),
    error: <>TRY AGAIN</>,
  }

  if (!available) {
    return (
      <Button
        variant="outline"
        size="lg"
        disabled
        className={cn('w-full', className)}
      >
        OUT OF STOCK
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
        size="lg"
        glow="cyan"
        onClick={handleClick}
        disabled={state === 'loading'}
        className={cn(
          'w-full',
          state === 'success' && 'bg-neon-green hover:bg-neon-green/90',
          state === 'error' && 'bg-red-500 hover:bg-red-500/90',
          className
        )}
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
