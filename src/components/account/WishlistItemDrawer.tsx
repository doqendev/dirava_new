'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { ShoppingCart, Loader2, Heart } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { VariantSelector } from '@/components/product/VariantSelector'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { Button } from '@/components/ui/Button'
import { useCartStore } from '@/stores/cartStore'
import { useWishlistStore } from '@/stores/wishlistStore'
import { useUIStore } from '@/stores/uiStore'
import { formatPrice } from '@/lib/utils/formatPrice'
import type { WishlistItem } from '@/types/wishlist'
import type { ShopifyMoney, ShopifySelectedOption } from '@/types/shopify'

interface ProductVariant {
  id: string
  title: string
  availableForSale: boolean
  price: ShopifyMoney
  compareAtPrice?: ShopifyMoney | null
  selectedOptions: ShopifySelectedOption[]
}

interface ProductData {
  id: string
  handle: string
  title: string
  description: string
  images: Array<{ url: string; altText: string | null }>
  variants: ProductVariant[]
  personalization: boolean
  options: Array<{ name: string; values: string[] }>
}

interface WishlistItemDrawerProps {
  item: WishlistItem | null
  isOpen: boolean
  onClose: () => void
}

export function WishlistItemDrawer({ item, isOpen, onClose }: WishlistItemDrawerProps) {
  const tProduct = useTranslations('product')
  const tWishlist = useTranslations('wishlist')
  const addToCart = useCartStore((state) => state.addItem)
  const { removeItem: removeFromWishlist } = useWishlistStore()
  const openCart = useUIStore((state) => state.openCart)

  const [product, setProduct] = useState<ProductData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [personalizationName, setPersonalizationName] = useState('')

  // Fetch product data when drawer opens
  useEffect(() => {
    if (!isOpen || !item) {
      setProduct(null)
      setSelectedOptions({})
      setQuantity(1)
      setPersonalizationName('')
      setError(null)
      return
    }

    const fetchProduct = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/products/${item.handle}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || 'Failed to fetch product')
        }

        const productData: ProductData = await response.json()

        // Set product data
        setProduct(productData)

        // Set initial selected options (first available variant or saved variant)
        const savedVariant = productData.variants.find((v) => v.id === item.variantId)
        const firstAvailable = productData.variants.find((v) => v.availableForSale)
        const defaultVariant = savedVariant || firstAvailable || productData.variants[0]

        if (defaultVariant) {
          const initial: Record<string, string> = {}
          defaultVariant.selectedOptions.forEach((opt) => {
            initial[opt.name] = opt.value
          })
          setSelectedOptions(initial)
        }
      } catch (err) {
        console.error('Failed to fetch product:', err)
        console.error('Product handle:', item.handle)
        // Show more specific error if available
        const errorMessage = err instanceof Error ? err.message : 'Failed to load product details'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [isOpen, item])

  // Find selected variant
  const selectedVariant = useMemo(() => {
    if (!product) return null
    return product.variants.find((variant) =>
      variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name] === opt.value
      )
    )
  }, [product, selectedOptions])

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }))
  }

  const [personalizationError, setPersonalizationError] = useState<string | null>(null)

  const handleAddToCart = async () => {
    if (!selectedVariant || !item) return

    // Validate personalization is filled if required
    if (product?.personalization && !personalizationName.trim()) {
      setPersonalizationError('Personalization name is required')
      return
    }

    setPersonalizationError(null)
    setIsAddingToCart(true)
    try {
      const attributes = product?.personalization && personalizationName.trim()
        ? [{ key: 'Personalization', value: personalizationName.trim() }]
        : undefined

      await addToCart(selectedVariant.id, quantity, attributes)
      removeFromWishlist(item.productId)
      onClose()
      openCart()
    } catch (err) {
      console.error('Failed to add to cart:', err)
      setError('Failed to add to cart')
    } finally {
      setIsAddingToCart(false)
    }
  }

  const hasMultipleVariants = product && product.options.length > 0 &&
    !(product.options.length === 1 && product.options[0]?.values.length === 1)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tProduct('addToCart')} size="md">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-neon-cyan animate-spin mb-4" />
          <p className="text-white/60">{tWishlist('loadingProductDetails')}</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-white/60 mb-4">{error}</p>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      ) : product && item ? (
        <div className="space-y-6">
          {/* Product Info */}
          <div className="flex gap-4">
            <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-bg-secondary">
              {item.image ? (
                <Image
                  src={item.image.url}
                  alt={item.image.altText || product.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Heart className="w-8 h-8 text-white/20" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-white line-clamp-2">{product.title}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-neon-cyan">
                  {formatPrice(
                    selectedVariant?.price.amount || item.price.amount,
                    selectedVariant?.price.currencyCode || item.price.currencyCode
                  )}
                </span>
                {selectedVariant?.compareAtPrice &&
                  parseFloat(selectedVariant.compareAtPrice.amount) > parseFloat(selectedVariant.price.amount) && (
                  <span className="text-sm font-mono text-white/40 line-through">
                    {formatPrice(
                      selectedVariant.compareAtPrice.amount,
                      selectedVariant.compareAtPrice.currencyCode
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Variant Selector */}
          {hasMultipleVariants && (
            <VariantSelector
              options={product.options}
              variants={product.variants}
              selectedOptions={selectedOptions}
              onOptionChange={handleOptionChange}
            />
          )}

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Quantity
            </label>
            <QuantitySelector
              quantity={quantity}
              onQuantityChange={setQuantity}
              min={1}
              max={10}
            />
          </div>

          {/* Personalization */}
          {product.personalization && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Personalization Name <span className="text-neon-pink">*</span>
              </label>
              <input
                type="text"
                value={personalizationName}
                onChange={(e) => {
                  setPersonalizationName(e.target.value)
                  if (personalizationError) setPersonalizationError(null)
                }}
                placeholder={tWishlist('enterNameForPersonalization')}
                className={`w-full px-4 py-3 bg-black/80 border rounded-lg text-white placeholder-white/40 focus:outline-none transition-colors ${
                  personalizationError
                    ? 'border-red-500 focus:border-red-500'
                    : 'border-border-subtle focus:border-neon-cyan'
                }`}
              />
              {personalizationError ? (
                <p className="mt-1 text-xs text-red-500">{personalizationError}</p>
              ) : (
                <p className="mt-1 text-xs text-white/50">
                  This name will be added to your custom item
                </p>
              )}
            </div>
          )}

          {/* Add to Cart Button */}
          <Button
            variant="primary"
            glow="cyan"
            className="w-full"
            onClick={handleAddToCart}
            isLoading={isAddingToCart}
            disabled={!selectedVariant?.availableForSale}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {selectedVariant?.availableForSale ? 'Add to Cart' : 'Out of Stock'}
          </Button>
        </div>
      ) : null}
    </Modal>
  )
}
