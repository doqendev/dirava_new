'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Minus, Plus, Trash2, Heart, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useUIStore } from '@/stores/uiStore'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useToastStore } from '@/stores/toastStore'
import { useCookieConsentStore } from '@/stores/cookieConsentStore'
import { syncCartClickIds } from '@/lib/tracking/syncCartClickIds'
import { trackInitiateCheckout } from '@/lib/tracking/trackClear'
import { Button } from '@/components/ui/Button'
import { CartUpsells } from '@/components/cart/CartUpsells'
import { DiscountCodeInput } from '@/components/cart/DiscountCodeInput'

export function CartDrawer() {
  const t = useTranslations('cart')
  const tCommon = useTranslations('common')
  const tProduct = useTranslations('product')
  const { isCartOpen, closeCart } = useUIStore()
  const tDiscount = useTranslations('discount')
  const { lines, totalQuantity, subtotal, total, discountAmount, checkoutUrl, updateItem, removeItem, loadingItems, error, cartId, initializeCart } =
    useCartStore()
  const { addItem: addToWishlist, isInWishlist } = useWishlistStore()
  const addToast = useToastStore((state) => state.add)

  // Hydrate cart from Shopify on mount if cartId exists but lines aren't loaded
  useEffect(() => {
    if (cartId && lines.length === 0) {
      initializeCart()
    }
  }, [cartId, lines.length, initializeCart])

  const handleSaveForLater = (line: typeof lines[0]) => {
    // Add to wishlist
    addToWishlist({
      productId: line.merchandise.product.id,
      variantId: line.merchandise.id,
      handle: line.merchandise.product.handle,
      title: line.merchandise.product.title,
      price: line.merchandise.price,
      compareAtPrice: line.merchandise.compareAtPrice,
      image: line.merchandise.image ?? line.merchandise.product.featuredImage,
    })
    // Remove from cart
    removeItem(line.id)
  }

  // Show translated toast on cart errors
  useEffect(() => {
    if (error) {
      addToast({ type: 'error', message: t('failedToUpdate') })
    }
  }, [error, addToast, t])

  const drawerRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const [liveMessage, setLiveMessage] = useState('')

  // Focus trap and keyboard handling
  useEffect(() => {
    if (!isCartOpen) return

    // Save the element that had focus before the drawer opened
    previousFocusRef.current = document.activeElement as HTMLElement
    document.body.style.overflow = 'hidden'

    // Focus the drawer after animation starts
    const focusTimer = setTimeout(() => {
      drawerRef.current?.focus()
    }, 100)

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeCart()
        return
      }

      if (e.key !== 'Tab' || !drawerRef.current) return

      const focusableElements = drawerRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )

      if (focusableElements.length === 0) return

      const firstElement = focusableElements[0]!
      const lastElement = focusableElements[focusableElements.length - 1]!

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault()
          lastElement.focus()
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault()
          firstElement.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      // Restore focus to the element that was focused before the drawer opened
      previousFocusRef.current?.focus()
    }
  }, [isCartOpen, closeCart])

  // ARIA live announcements for cart quantity changes
  useEffect(() => {
    if (isCartOpen && totalQuantity >= 0) {
      setLiveMessage(
        totalQuantity === 0
          ? 'Cart is empty'
          : `Cart updated: ${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`
      )
    }
  }, [totalQuantity, isCartOpen])

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
            ref={drawerRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-subtle">
              <h2 className="font-display text-lg tracking-wider text-white">
                {t('title').toUpperCase()}
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
                aria-label={tCommon('close')}
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
                    {t('empty')}
                  </h3>
                  <p className="text-white/50 text-sm mb-6">
                    {t('emptyDescription')}
                  </p>
                  <Button variant="outline" onClick={closeCart}>
                    {t('continueShopping')}
                  </Button>
                </div>
              ) : (
                <ul className="divide-y divide-border-subtle">
                  {lines.filter((line) => line?.merchandise?.product).map((line) => {
                    // Prefer the variant-level image so e.g. an "Ace" lightbox
                    // line shows the Ace artwork instead of the product's
                    // default featured image.
                    const lineImage = line.merchandise.image ?? line.merchandise.product.featuredImage
                    return (
                    <li key={line.id} className="p-4">
                      <div className="flex gap-4">
                        {/* Product Image */}
                        <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-bg-secondary">
                          {lineImage && (
                            <Image
                              src={lineImage.url}
                              alt={
                                lineImage.altText ||
                                line.merchandise.product.title
                              }
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${line.merchandise.product.handle}`}
                            className="font-medium text-white hover:text-[color:var(--accent,#00f5ff)] transition-colors line-clamp-2"
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
                                disabled={loadingItems.has(line.id)}
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
                                disabled={loadingItems.has(line.id)}
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

                            <div className="flex items-center gap-2">
                              <span className="font-mono text-neon-cyan">
                                {formatPrice(
                                  parseFloat(line.merchandise.price.amount) * line.quantity,
                                  line.merchandise.price.currencyCode
                                )}
                              </span>
                              <button
                                onClick={() => handleSaveForLater(line)}
                                disabled={loadingItems.has(line.id) || isInWishlist(line.merchandise.product.id)}
                                className={cn(
                                  'w-8 h-8 flex items-center justify-center',
                                  isInWishlist(line.merchandise.product.id)
                                    ? 'text-neon-pink'
                                    : 'text-white/30 hover:text-neon-pink',
                                  'disabled:opacity-50 disabled:cursor-not-allowed',
                                  'transition-colors'
                                )}
                                aria-label={tProduct('addToWishlist')}
                                title={isInWishlist(line.merchandise.product.id) ? tProduct('inWishlist') : tProduct('addToWishlist')}
                              >
                                <Heart className={cn('w-4 h-4', isInWishlist(line.merchandise.product.id) && 'fill-current')} />
                              </button>
                              <button
                                onClick={() => removeItem(line.id)}
                                disabled={loadingItems.has(line.id)}
                                className={cn(
                                  'w-8 h-8 flex items-center justify-center',
                                  'text-white/30 hover:text-red-500',
                                  'disabled:opacity-50 disabled:cursor-not-allowed',
                                  'transition-colors'
                                )}
                                aria-label={tCommon('remove')}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    )
                  })}
                </ul>
              )}
            </div>

            {/* Upsells - show when cart has items */}
            {lines.length > 0 && (
              <CartUpsells
                cartLines={lines}
                onClose={closeCart}
              />
            )}

            {/* Footer */}
            {lines.length > 0 && (
              <div className="p-4 border-t border-border-subtle space-y-4">
                <DiscountCodeInput />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/70">{t('subtotal')}</span>
                    <span className="font-mono text-white">
                      {subtotal
                        ? formatPrice(subtotal.amount, subtotal.currencyCode)
                        : '$0.00'}
                    </span>
                  </div>

                  {discountAmount && parseFloat(discountAmount.amount) > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-neon-green">{tDiscount('discount')}</span>
                      <span className="font-mono text-neon-green">
                        -{formatPrice(discountAmount.amount, discountAmount.currencyCode)}
                      </span>
                    </div>
                  )}

                  {total && (
                    <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
                      <span className="text-white font-medium">{t('total')}</span>
                      <span className="font-mono text-lg text-neon-cyan">
                        {formatPrice(total.amount, total.currencyCode)}
                      </span>
                    </div>
                  )}
                </div>

                <Button
                  as="a"
                  href={checkoutUrl || '#'}
                  variant="primary"
                  glow="cyan"
                  className="w-full"
                  disabled={!checkoutUrl}
                  onClick={(e: React.MouseEvent) => {
                    const store = useCartStore.getState()
                    if (!store.cartId || !checkoutUrl) return
                    const consent = useCookieConsentStore.getState()
                    if (!consent.consentGiven || !consent.preferences.marketing) return

                    // Fire tracking + sync click IDs, then redirect to checkout.
                    e.preventDefault()
                    trackInitiateCheckout({
                      lines: lines.map((l) => ({
                        variantId: l.merchandise.id,
                        quantity: l.quantity,
                      })),
                      totalValue: parseFloat(total?.amount || subtotal?.amount || '0'),
                      currency: total?.currencyCode || subtotal?.currencyCode || 'EUR',
                    })
                    syncCartClickIds(store.cartId).finally(() => {
                      window.location.href = checkoutUrl
                    })
                  }}
                >
                  {t('checkout').toUpperCase()}
                </Button>

                <button
                  onClick={closeCart}
                  className="w-full text-center text-white/50 hover:text-[color:var(--accent,#00f5ff)] text-sm transition-colors"
                >
                  {t('continueShopping')}
                </button>
              </div>
            )}

            {/* Screen reader announcements */}
            <div
              role="status"
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {liveMessage}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
