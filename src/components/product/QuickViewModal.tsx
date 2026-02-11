'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Loader2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useUIStore } from '@/stores/uiStore'
import { VariantSelector } from '@/components/product/VariantSelector'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { WishlistButton } from '@/components/product/WishlistButton'

interface ProductImage {
  url: string
  altText: string | null
}

interface ProductVariant {
  id: string
  title: string
  availableForSale: boolean
  price: { amount: string; currencyCode: string }
  compareAtPrice?: { amount: string; currencyCode: string } | null
  selectedOptions: Array<{ name: string; value: string }>
}

interface QuickViewProduct {
  id: string
  handle: string
  title: string
  description: string
  images: ProductImage[]
  variants: ProductVariant[]
  options: Array<{ name: string; values: string[] }>
  personalization: boolean
  universe?: string | null
}

export function QuickViewModal() {
  const t = useTranslations('product')
  const tCommon = useTranslations('common')
  const { quickViewProduct, closeQuickView } = useUIStore()
  const [product, setProduct] = useState<QuickViewProduct | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Form state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [personalizationName, setPersonalizationName] = useState('')
  const personalizationInputRef = useRef<HTMLInputElement>(null)

  const handlePersonalizationError = () => {
    personalizationInputRef.current?.focus()
  }

  // Fetch product data when quickViewProduct changes
  useEffect(() => {
    async function fetchProduct() {
      if (!quickViewProduct) {
        setProduct(null)
        return
      }

      setIsLoading(true)
      setError(null)
      setCurrentImageIndex(0)
      setQuantity(1)
      setPersonalizationName('')

      try {
        const response = await fetch(`/api/products/${quickViewProduct.handle}`)
        if (!response.ok) {
          throw new Error('Failed to load product')
        }
        const data = await response.json()

        // Add universe from quickViewProduct if not in API response
        const productData: QuickViewProduct = {
          ...data,
          universe: quickViewProduct.universe || data.universe,
        }

        setProduct(productData)

        // Initialize selected options from first available variant
        const firstAvailable = data.variants.find((v: ProductVariant) => v.availableForSale)
        if (firstAvailable) {
          const initial: Record<string, string> = {}
          firstAvailable.selectedOptions.forEach((opt: { name: string; value: string }) => {
            initial[opt.name] = opt.value
          })
          setSelectedOptions(initial)
        } else if (data.variants[0]) {
          const initial: Record<string, string> = {}
          data.variants[0].selectedOptions.forEach((opt: { name: string; value: string }) => {
            initial[opt.name] = opt.value
          })
          setSelectedOptions(initial)
        }
      } catch (err) {
        console.error('Quick view fetch error:', err)
        setError('Unable to load product details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [quickViewProduct])

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeQuickView()
    }

    if (quickViewProduct) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [quickViewProduct, closeQuickView])

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

  const goToNextImage = () => {
    if (!product) return
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const goToPrevImage = () => {
    if (!product) return
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  const productUrl = product
    ? product.universe
      ? `/worlds/${product.universe}/${product.handle}`
      : `/products/${product.handle}`
    : '#'

  const hasDiscount = selectedVariant?.compareAtPrice &&
    parseFloat(selectedVariant.compareAtPrice.amount) > parseFloat(selectedVariant.price.amount)

  return (
    <AnimatePresence>
      {quickViewProduct && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            onClick={closeQuickView}
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'w-full max-w-4xl',
                'bg-bg-primary border border-border-subtle rounded-xl',
                'shadow-2xl',
                'max-h-[90vh] overflow-hidden flex flex-col'
              )}
              role="dialog"
              aria-modal="true"
              aria-label="Quick view"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-border-subtle">
                <h2 className="font-display text-lg tracking-wider text-white">
                  {t('quickView').toUpperCase()}
                </h2>
                <button
                  onClick={closeQuickView}
                  className={cn(
                    'w-8 h-8 flex items-center justify-center rounded-lg',
                    'text-white/50 hover:text-white hover:bg-white/10',
                    'transition-colors duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-neon-cyan'
                  )}
                  aria-label={t('closeQuickView')}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <p className="text-white/50 mb-4">{error}</p>
                    <button
                      onClick={closeQuickView}
                      className="text-neon-cyan hover:underline"
                    >
                      {tCommon('close')}
                    </button>
                  </div>
                ) : product ? (
                  <div className="grid md:grid-cols-2 gap-6 p-4">
                    {/* Image Gallery */}
                    <div className="space-y-3">
                      {/* Main Image */}
                      <div className="relative aspect-square bg-bg-secondary rounded-lg overflow-hidden group">
                        {product.images.length > 0 ? (
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={currentImageIndex}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0"
                            >
                              <Image
                                src={product.images[currentImageIndex]?.url || ''}
                                alt={product.images[currentImageIndex]?.altText || product.title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, 400px"
                              />
                            </motion.div>
                          </AnimatePresence>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/20">
                            {t('noImage')}
                          </div>
                        )}

                        {/* Navigation arrows */}
                        {product.images.length > 1 && (
                          <>
                            <button
                              onClick={goToPrevImage}
                              className={cn(
                                'absolute left-2 top-1/2 -translate-y-1/2 z-10',
                                'w-8 h-8 rounded-full',
                                'bg-black/50 backdrop-blur-sm',
                                'flex items-center justify-center',
                                'text-white/70 hover:text-white',
                                'opacity-0 group-hover:opacity-100',
                                'transition-all duration-200'
                              )}
                              aria-label={t('previousImage')}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={goToNextImage}
                              className={cn(
                                'absolute right-2 top-1/2 -translate-y-1/2 z-10',
                                'w-8 h-8 rounded-full',
                                'bg-black/50 backdrop-blur-sm',
                                'flex items-center justify-center',
                                'text-white/70 hover:text-white',
                                'opacity-0 group-hover:opacity-100',
                                'transition-all duration-200'
                              )}
                              aria-label={t('nextImage')}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {/* Image counter */}
                        {product.images.length > 1 && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
                            <div className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/70 text-xs">
                              {currentImageIndex + 1} / {product.images.length}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Thumbnails */}
                      {product.images.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                          {product.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={cn(
                                'relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden',
                                'border-2 transition-all duration-200',
                                index === currentImageIndex
                                  ? 'border-neon-cyan shadow-glow-sm-cyan'
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              )}
                              aria-label={t('viewImageNumber', { number: index + 1 })}
                            >
                              <Image
                                src={image.url}
                                alt={image.altText || `Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-4">
                      {/* Title */}
                      <h3 className="font-display text-xl md:text-2xl font-bold text-white">
                        {product.title}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-3">
                        <span className="text-xl md:text-2xl font-mono font-bold text-neon-cyan">
                          {formatPrice(
                            selectedVariant?.price.amount || product.variants[0]?.price.amount || '0',
                            selectedVariant?.price.currencyCode || product.variants[0]?.price.currencyCode || 'USD'
                          )}
                        </span>
                        {hasDiscount && selectedVariant?.compareAtPrice && (
                          <span className="text-sm font-mono text-white/40 line-through">
                            {formatPrice(
                              selectedVariant.compareAtPrice.amount,
                              selectedVariant.compareAtPrice.currencyCode
                            )}
                          </span>
                        )}
                      </div>

                      {/* Description - truncated */}
                      {product.description && (
                        <p className="text-sm text-white/60 line-clamp-3">
                          {product.description}
                        </p>
                      )}

                      {/* Variant Selector */}
                      {product.options.length > 0 && (
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
                          {t('quantity')}
                        </label>
                        <QuantitySelector
                          quantity={quantity}
                          onQuantityChange={setQuantity}
                          min={1}
                          max={10}
                          size="sm"
                        />
                      </div>

                      {/* Personalization */}
                      {product.personalization && (
                        <div>
                          <label className="block text-sm font-medium text-white/70 mb-2">
                            {t('personalizationName')} <span className="text-neon-pink">*</span>
                          </label>
                          <input
                            ref={personalizationInputRef}
                            type="text"
                            value={personalizationName}
                            onChange={(e) => setPersonalizationName(e.target.value)}
                            placeholder={t('personalizationPlaceholder')}
                            className={cn(
                              'w-full px-3 py-2 text-sm bg-black/80 border rounded-lg text-white placeholder-white/40 focus:outline-none transition-colors',
                              personalizationName.trim()
                                ? 'border-neon-green/50 focus:border-neon-green'
                                : 'border-border-subtle focus:border-neon-cyan'
                            )}
                          />
                        </div>
                      )}

                      {/* Availability */}
                      {selectedVariant && !selectedVariant.availableForSale && (
                        <p className="text-sm text-red-400">
                          {t('variantUnavailable')}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="pt-2 space-y-3">
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <AddToCartButton
                              variantId={selectedVariant?.id || ''}
                              quantity={quantity}
                              available={selectedVariant?.availableForSale ?? false}
                              requiresPersonalization={product.personalization}
                              personalizationValue={personalizationName}
                              onPersonalizationError={handlePersonalizationError}
                              attributes={
                                product.personalization && personalizationName.trim()
                                  ? [{ key: 'Personalization', value: personalizationName.trim() }]
                                  : undefined
                              }
                            />
                          </div>
                          <WishlistButton
                            product={{
                              productId: product.id,
                              variantId: selectedVariant?.id || '',
                              handle: product.handle,
                              title: product.title,
                              price: selectedVariant?.price || product.variants[0]?.price || { amount: '0', currencyCode: 'USD' },
                              compareAtPrice: selectedVariant?.compareAtPrice || null,
                              image: product.images[0] || null,
                              universe: product.universe || undefined,
                            }}
                            size="lg"
                          />
                        </div>

                        {/* View Full Details Link */}
                        <Link
                          href={productUrl}
                          onClick={closeQuickView}
                          className={cn(
                            'flex items-center justify-center gap-2',
                            'w-full py-2 text-sm',
                            'text-white/50 hover:text-neon-cyan',
                            'transition-colors duration-200'
                          )}
                        >
                          <span>{t('viewFullDetails')}</span>
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
