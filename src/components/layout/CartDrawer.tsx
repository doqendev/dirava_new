'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useUIStore } from '@/stores/uiStore'
import { useCartStore } from '@/stores/cartStore'
import { Button } from '@/components/ui/Button'

export function CartDrawer() {
  const { isCartOpen, closeCart } = useUIStore()
  const { lines, totalQuantity, subtotal, checkoutUrl, updateItem, removeItem, isLoading } =
    useCartStore()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart()
    }

    if (isCartOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isCartOpen, closeCart])

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={closeCart}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={cn(
              'fixed top-0 right-0 z-50',
              'w-full max-w-md h-full',
              'bg-bg-primary border-l border-border-subtle',
              'flex flex-col'
            )}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <h2 className="font-display text-lg tracking-wider text-white">
                YOUR CART
                {totalQuantity > 0 && (
                  <span className="ml-2 text-neon-cyan">({totalQuantity})</span>
                )}
              </h2>
              <button
                onClick={closeCart}
                className={cn(
                  'w-10 h-10 flex items-center justify-center',
                  'text-white/50 hover:text-white',
                  'transition-colors duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan rounded-lg'
                )}
                aria-label="Close cart"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Cart Content */}
            <div className="flex-1 overflow-y-auto">
              {lines.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <div className="w-20 h-20 mb-4 rounded-full bg-bg-secondary flex items-center justify-center">
                    <ShoppingBag className="w-10 h-10 text-white/30" />
                  </div>
                  <h3 className="font-display text-lg text-white mb-2">
                    Your cart is empty
                  </h3>
                  <p className="text-white/50 text-sm mb-6">
                    Explore our universes and find something you love.
                  </p>
                  <Button variant="outline" onClick={closeCart}>
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {lines.map((line) => (
                    <li key={line.id} className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-bg-secondary">
                          {line.merchandise.product.featuredImage && (
                            <Image
                              src={line.merchandise.product.featuredImage.url}
                              alt={
                                line.merchandise.product.featuredImage.altText ||
                                line.merchandise.product.title
                              }
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${line.merchandise.product.handle}`}
                            className="font-medium text-white hover:text-neon-cyan transition-colors line-clamp-2"
                            onClick={closeCart}
                          >
                            {line.merchandise.product.title}
                          </Link>

                          {line.merchandise.title !== 'Default Title' && (
                            <p className="text-sm text-white/50 mt-0.5">
                              {line.merchandise.title}
                            </p>
                          )}

                          {/* Line Item Attributes (Personalization) */}
                          {line.attributes && line.attributes.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {line.attributes.map((attr) => (
                                <p key={attr.key} className="text-xs text-neon-pink">
                                  {attr.key}: {attr.value}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center border border-border-subtle rounded-lg">
                              <button
                                onClick={() =>
                                  updateItem(line.id, Math.max(0, line.quantity - 1))
                                }
                                disabled={isLoading}
                                className={cn(
                                  'w-8 h-8 flex items-center justify-center',
                                  'text-white/50 hover:text-white',
                                  'disabled:opacity-50 disabled:cursor-not-allowed',
                                  'transition-colors'
                                )}
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="w-8 text-center font-mono text-sm">
                                {line.quantity}
                              </span>
                              <button
                                onClick={() => updateItem(line.id, line.quantity + 1)}
                                disabled={isLoading}
                                className={cn(
                                  'w-8 h-8 flex items-center justify-center',
                                  'text-white/50 hover:text-white',
                                  'disabled:opacity-50 disabled:cursor-not-allowed',
                                  'transition-colors'
                                )}
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono text-neon-cyan">
                                {formatPrice(
                                  parseFloat(line.merchandise.price.amount) * line.quantity,
                                  line.merchandise.price.currencyCode
                                )}
                              </span>
                              <button
                                onClick={() => removeItem(line.id)}
                                disabled={isLoading}
                                className={cn(
                                  'w-8 h-8 flex items-center justify-center',
                                  'text-white/30 hover:text-red-500',
                                  'disabled:opacity-50 disabled:cursor-not-allowed',
                                  'transition-colors'
                                )}
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {lines.length > 0 && (
              <div className="p-4 border-t border-border-subtle space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">Subtotal</span>
                  <span className="font-mono text-lg text-white">
                    {subtotal
                      ? formatPrice(subtotal.amount, subtotal.currencyCode)
                      : '$0.00'}
                  </span>
                </div>

                <Button
                  as="a"
                  href={checkoutUrl || '#'}
                  variant="primary"
                  glow="cyan"
                  className="w-full"
                  disabled={!checkoutUrl}
                >
                  CONTINUE TO CHECKOUT
                </Button>

                <button
                  onClick={closeCart}
                  className="w-full text-center text-white/50 hover:text-neon-cyan text-sm transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
