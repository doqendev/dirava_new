'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Trash2, ShoppingCart, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { AccountLayout } from '@/components/account/AccountLayout'
import { WishlistItemDrawer } from '@/components/account/WishlistItemDrawer'
import { Button } from '@/components/ui/Button'
import { useWishlistStore } from '@/stores/wishlistStore'
import { formatPrice } from '@/lib/utils/formatPrice'
import type { WishlistItem } from '@/types/wishlist'

export default function WishlistPage() {
  const { items, removeItem } = useWishlistStore()

  // Hydration fix - only render items after mount
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Drawer state
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const handleAddToCart = (item: WishlistItem) => {
    setSelectedItem(item)
    setIsDrawerOpen(true)
  }

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false)
    setSelectedItem(null)
  }

  if (!mounted) {
    return (
      <AccountLayout title="Wishlist" description="Items you've saved for later">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-bg-card/50 rounded-xl" />
          ))}
        </div>
      </AccountLayout>
    )
  }

  return (
    <AccountLayout title="Wishlist" description="Items you've saved for later">
      {items.length === 0 ? (
        <div className="text-center py-12 bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl">
          <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-white/30" />
          </div>
          <h2 className="font-display text-xl text-white mb-2">Your Wishlist is Empty</h2>
          <p className="text-white/60 mb-6">
            Save items you love by clicking the heart icon on any product.
          </p>
          <Link
            href="/worlds"
            className="inline-flex items-center justify-center px-6 py-3 bg-neon-cyan text-black font-display font-semibold uppercase tracking-wider rounded-lg hover:bg-neon-cyan/90 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <>
          {/* Header with count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-white/60">
              {items.length} {items.length === 1 ? 'item' : 'items'} saved
            </p>
          </div>

          {/* Wishlist Items */}
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.map((item) => {
                const productUrl = item.universe
                  ? `/worlds/${item.universe}/${item.handle}`
                  : `/products/${item.handle}`

                const hasDiscount =
                  item.compareAtPrice &&
                  parseFloat(item.compareAtPrice.amount) > parseFloat(item.price.amount)

                return (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-4 flex gap-4"
                  >
                    {/* Image */}
                    <Link
                      href={productUrl}
                      className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-bg-secondary"
                    >
                      {item.image ? (
                        <Image
                          src={item.image.url}
                          alt={item.image.altText || item.title}
                          fill
                          className="object-cover"
                          sizes="96px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Heart className="w-8 h-8 text-white/20" />
                        </div>
                      )}
                    </Link>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={productUrl}
                        className="font-medium text-white hover:text-neon-cyan transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-neon-cyan">
                          {formatPrice(item.price.amount, item.price.currencyCode)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm font-mono text-white/40 line-through">
                            {formatPrice(
                              item.compareAtPrice!.amount,
                              item.compareAtPrice!.currencyCode
                            )}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-white/40 mt-1">
                        Added {new Date(item.addedAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        glow="cyan"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.productId)}
                        className="text-white/50 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>

          {/* Continue Shopping */}
          <div className="mt-8 text-center">
            <Link
              href="/worlds"
              className="inline-flex items-center gap-2 text-white/60 hover:text-neon-cyan transition-colors"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </>
      )}

      {/* Wishlist Item Drawer */}
      <WishlistItemDrawer
        item={selectedItem}
        isOpen={isDrawerOpen}
        onClose={handleCloseDrawer}
      />
    </AccountLayout>
  )
}
