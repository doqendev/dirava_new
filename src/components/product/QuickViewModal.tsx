'use client'

import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, Loader2, ExternalLink, Box } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { MAX_PERSONALIZATION_LENGTH } from '@/lib/utils/constants'
import { formatPrice } from '@/lib/utils/formatPrice'
import { useUIStore } from '@/stores/uiStore'
import { VariantSelector } from '@/components/product/VariantSelector'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { WishlistButton } from '@/components/product/WishlistButton'
import { getPreviewConfig, getVariantImages } from '@/lib/preview'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'
import { Preview3DLoadingIndicator } from '@/components/product/preview3d/LoadingSpinner'

const Preview3DCanvas = lazy(() =>
  import('@/components/product/preview3d/Preview3DCanvas').then((mod) => ({
    default: mod.Preview3DCanvas,
  }))
)

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
  image?: { url: string; altText: string | null } | null
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

        // Initialize selected options — prefer variant from quick view trigger (exact title or color option value)
        const variantFromTrigger = quickViewProduct.variantName
          ? data.variants.find((v: ProductVariant) => v.title === quickViewProduct.variantName)
            ?? data.variants.find((v: ProductVariant) =>
              v.availableForSale &&
              v.selectedOptions.some((opt: { name: string; value: string }) => opt.value === quickViewProduct.variantName)
            )
          : null
        const target = variantFromTrigger
          || data.variants.find((v: ProductVariant) => v.availableForSale)
          || data.variants[0]

        if (target) {
          const initial: Record<string, string> = {}
          target.selectedOptions.forEach((opt: { name: string; value: string }) => {
            initial[opt.name] = opt.value
          })
          setSelectedOptions(initial)

          // Jump gallery to the variant's image
          if (variantFromTrigger?.image?.url && productData.images.length > 0) {
            const idx = productData.images.findIndex(
              (img: ProductImage) => img.url.split('?')[0] === variantFromTrigger.image!.url.split('?')[0]
            )
            if (idx >= 0) setCurrentImageIndex(idx)
          }
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

  // Get preview config for variant image tiles and 3D preview
  const previewConfig = useMemo(() => {
    if (!product) return null
    return getPreviewConfig(product.handle)
  }, [product])

  // 3D preview state
  const selectedVariantName = selectedOptions['Color'] || selectedOptions['color'] || ''
  const isTextExtrusion = previewConfig?.type === 'text-extrusion'
  const isSvgPreview = previewConfig?.type === 'svg-extrusion' || previewConfig?.type === 'composite-sign'
  const hasVariantSvg = isSvgPreview && !!selectedVariantName && !!previewConfig?.variantSvgs?.[selectedVariantName]
  const hasSingleSvg = isSvgPreview && !!previewConfig?.svg
  const isComposite = previewConfig?.type === 'composite-sign' && !!previewConfig?.barParts
  const show3DTab = !!previewConfig && (isTextExtrusion || hasVariantSvg || hasSingleSvg || isComposite)
  const preview3DIndex = product ? product.images.length : 0
  const is3DActive = currentImageIndex === preview3DIndex && show3DTab

  const previewCanvasText = useMemo(
    () => (previewConfig ? getPreviewDisplayText(personalizationName, previewConfig, 'Name') : 'Name'),
    [personalizationName, previewConfig]
  )

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
    setSelectedOptions((prev) => {
      const next = { ...prev, [name]: value }
      // Jump gallery to the newly selected variant's image
      if (product) {
        const matchedVariant = product.variants.find((v) =>
          v.selectedOptions.every((opt) => (next[opt.name] ?? prev[opt.name]) === opt.value)
        )
        if (matchedVariant?.image?.url) {
          const idx = product.images.findIndex(
            (img) => img.url.split('?')[0] === matchedVariant.image!.url.split('?')[0]
          )
          if (idx >= 0) setCurrentImageIndex(idx)
        }
      }
      return next
    })
  }

  const goToNextImage = () => {
    if (!product) return
    const maxIndex = show3DTab ? product.images.length : product.images.length - 1
    setCurrentImageIndex((prev) => prev >= maxIndex ? 0 : prev + 1)
  }

  const goToPrevImage = () => {
    if (!product) return
    const maxIndex = show3DTab ? product.images.length : product.images.length - 1
    setCurrentImageIndex((prev) => prev <= 0 ? maxIndex : prev - 1)
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
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'w-full sm:max-w-4xl',
                'bg-bg-primary border border-border-subtle rounded-t-xl sm:rounded-xl',
                'shadow-2xl',
                'max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col'
              )}
              role="dialog"
              aria-modal="true"
              aria-label="Quick view"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5 sm:p-4 border-b border-border-subtle">
                <h2 className="font-display text-base sm:text-lg tracking-wider text-white">
                  {t('quickView').toUpperCase()}
                </h2>
                <button
                  onClick={closeQuickView}
                  className={cn(
                    'w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg',
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
                  <div className="grid md:grid-cols-2 gap-3 sm:gap-6 p-3 sm:p-4">
                    {/* Image Gallery */}
                    <div className="space-y-3">
                      {/* Main Image / 3D Preview */}
                      <div className="relative aspect-[4/3] sm:aspect-square bg-bg-secondary rounded-lg overflow-hidden group">
                        <AnimatePresence mode="wait">
                          {is3DActive && previewConfig ? (
                            <motion.div
                              key="3d-preview"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="absolute inset-0"
                            >
                              <Suspense
                                fallback={
                                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a12]">
                                    <Preview3DLoadingIndicator label={tCommon('loading')} />
                                  </div>
                                }
                              >
                                <Preview3DCanvas config={previewConfig} text={previewCanvasText} selectedVariantName={selectedVariantName} />
                              </Suspense>

                              {/* Personalization input overlay on 3D */}
                              {product.personalization && (
                                <div className="absolute bottom-0 inset-x-0 z-20">
                                  <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-8 pb-3 px-3">
                                    <input
                                      type="text"
                                      value={personalizationName}
                                      onChange={(e) => setPersonalizationName(previewConfig ? getPreviewDisplayText(e.target.value, previewConfig, '') : e.target.value)}
                                      placeholder="Name"
                                      className={cn(
                                        'w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/40',
                                        'bg-white/10 backdrop-blur-md border border-white/20',
                                        'focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan/50',
                                        'transition-colors text-center'
                                      )}
                                    />
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ) : product.images.length > 0 ? (
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
                          ) : (
                            <motion.div key="no-image" className="absolute inset-0 flex items-center justify-center text-white/20">
                              {t('noImage')}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        {/* 3D toggle button */}
                        {show3DTab && !is3DActive && (
                          <button
                            onClick={() => setCurrentImageIndex(preview3DIndex)}
                            className={cn(
                              'absolute top-2 left-2 z-10',
                              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
                              'bg-black/60 backdrop-blur-sm',
                              'text-white/80 hover:text-white text-xs font-medium',
                              'transition-all duration-200'
                            )}
                          >
                            <Box className="w-3.5 h-3.5" />
                            <span>3D</span>
                          </button>
                        )}

                        {/* Navigation arrows */}
                        {(product.images.length > 1 || show3DTab) && !is3DActive && (
                          <>
                            <button
                              onClick={goToPrevImage}
                              className={cn(
                                'absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-10',
                                'w-9 h-9 sm:w-8 sm:h-8 rounded-full',
                                'bg-black/50 backdrop-blur-sm',
                                'flex items-center justify-center',
                                'text-white/70 hover:text-white',
                                'sm:opacity-0 sm:group-hover:opacity-100',
                                'transition-all duration-200'
                              )}
                              aria-label={t('previousImage')}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                              onClick={goToNextImage}
                              className={cn(
                                'absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-10',
                                'w-9 h-9 sm:w-8 sm:h-8 rounded-full',
                                'bg-black/50 backdrop-blur-sm',
                                'flex items-center justify-center',
                                'text-white/70 hover:text-white',
                                'sm:opacity-0 sm:group-hover:opacity-100',
                                'transition-all duration-200'
                              )}
                              aria-label={t('nextImage')}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </>
                        )}

                        {/* Image counter */}
                        {(product.images.length > 1 || show3DTab) && !is3DActive && (
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-10">
                            <div className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/70 text-xs">
                              {currentImageIndex + 1} / {product.images.length + (show3DTab ? 1 : 0)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Thumbnails — hidden on mobile to save space */}
                      {(product.images.length > 1 || show3DTab) && (
                        <div className="hidden sm:flex gap-2 overflow-x-auto hide-scrollbar">
                          {product.images.map((image, index) => (
                            <button
                              key={index}
                              onClick={() => setCurrentImageIndex(index)}
                              className={cn(
                                'relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden',
                                'border-2 transition-all duration-200',
                                index === currentImageIndex && !is3DActive
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
                          {show3DTab && (
                            <button
                              onClick={() => setCurrentImageIndex(preview3DIndex)}
                              className={cn(
                                'relative flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden',
                                'border-2 transition-all duration-200',
                                'flex items-center justify-center bg-bg-secondary',
                                is3DActive
                                  ? 'border-neon-cyan shadow-glow-sm-cyan'
                                  : 'border-transparent opacity-60 hover:opacity-100'
                              )}
                              aria-label="3D Preview"
                            >
                              <Box className="w-5 h-5 text-neon-cyan" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="space-y-2.5 sm:space-y-4">
                      {/* Title */}
                      <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-white">
                        {product.title}
                      </h3>

                      {/* Price */}
                      <div className="flex items-baseline gap-2 sm:gap-3">
                        <span className="text-lg sm:text-xl md:text-2xl font-mono font-bold text-neon-cyan">
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

                      {/* Description - hidden on mobile, truncated on desktop */}
                      {product.description && (
                        <p className="hidden sm:block text-sm text-white/60 line-clamp-3">
                          {product.description}
                        </p>
                      )}

                      {/* Variant Selector — hide Shopify's default "Title" option for single-variant products */}
                      {product.options.length > 0 &&
                        !(product.options.length === 1 && product.options[0]?.name === 'Title' && product.options[0]?.values.length === 1 && product.options[0]?.values[0] === 'Default Title') && (
                        <VariantSelector
                          options={product.options}
                          variants={product.variants}
                          selectedOptions={selectedOptions}
                          onOptionChange={handleOptionChange}
                          optionImages={product ? getVariantImages(product.handle) : undefined}
                          imageOptionName={product && getVariantImages(product.handle) ? 'Color' : undefined}
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
                            maxLength={MAX_PERSONALIZATION_LENGTH}
                            onChange={(e) =>
                              setPersonalizationName(
                                e.target.value.slice(0, MAX_PERSONALIZATION_LENGTH)
                              )
                            }
                            placeholder={t('personalizationPlaceholder')}
                            className={cn(
                              'w-full px-3 py-2 text-sm bg-black/80 border rounded-lg text-white placeholder-white/40 focus:outline-none transition-colors',
                              personalizationName.trim()
                                ? 'border-neon-green/50 focus:border-neon-green'
                                : 'border-border-subtle focus:border-neon-cyan'
                            )}
                          />
                          <p className="mt-1 text-xs text-white/40">
                            {personalizationName.length} / {MAX_PERSONALIZATION_LENGTH}
                          </p>
                        </div>
                      )}

                      {/* Availability */}
                      {selectedVariant && !selectedVariant.availableForSale && (
                        <p className="text-sm text-red-400">
                          {t('variantUnavailable')}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="pt-1 sm:pt-2 space-y-2 sm:space-y-3">
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
