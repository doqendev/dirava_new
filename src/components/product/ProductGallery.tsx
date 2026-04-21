'use client'

import { useState, useEffect, useRef, lazy, Suspense, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, Box, X, Info } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { Preview3DLoadingIndicator } from '@/components/product/preview3d/LoadingSpinner'
import type { PreviewConfig } from '@/lib/preview/types'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'

const Preview3DCanvas = lazy(() =>
  import('@/components/product/preview3d/Preview3DCanvas').then((mod) => ({
    default: mod.Preview3DCanvas,
  }))
)

interface ProductImage {
  url: string
  altText: string | null
}

interface CanvasCartProps {
  variantId: string
  quantity: number
  available: boolean
  requiresPersonalization: boolean
  personalizationValue: string
  onPersonalizationError: () => void
  attributes?: Array<{ key: string; value: string }>
}

interface ProductGalleryProps {
  images: ProductImage[]
  productTitle: string
  className?: string
  previewConfig?: PreviewConfig | null
  previewText?: string
  selectedVariantName?: string
  onPreviewTextChange?: (text: string) => void
  canvasCart?: CanvasCartProps
  initialImageIndex?: number
}

export interface ProductGalleryHandle {
  goTo3D: () => void
  goToIndex: (index: number) => void
  /** True when the 3D preview slide is currently displayed. */
  isAt3D: () => boolean
}

export const ProductGallery = forwardRef<ProductGalleryHandle, ProductGalleryProps>(
  function ProductGallery(
    {
      images,
      productTitle,
      className,
      previewConfig,
      previewText,
      selectedVariantName,
      onPreviewTextChange,
      canvasCart,
      initialImageIndex,
    },
    ref
  ) {
    const t = useTranslations('gallery')
    const tCommon = useTranslations('common')
    const containerRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(initialImageIndex ?? 0)
    const [isZoomed, setIsZoomed] = useState(false)
    const [isPreviewInfoOpen, setIsPreviewInfoOpen] = useState(false)
    const touchStartRef = useRef<{ x: number; y: number } | null>(null)

    const hasMultipleImages = images.length > 1
    const isTextExtrusion = previewConfig?.type === 'text-extrusion'
    const isSvgPreview = previewConfig?.type === 'svg-extrusion' || previewConfig?.type === 'composite-sign'
    const hasVariantSvg = isSvgPreview && !!selectedVariantName && !!previewConfig?.variantSvgs?.[selectedVariantName]
    const hasSingleSvg = isSvgPreview && !!previewConfig?.svg
    const isComposite = previewConfig?.type === 'composite-sign' && !!previewConfig?.barParts
    const normalizedPreviewText = useMemo(
      () => (previewConfig ? getPreviewDisplayText(previewText, previewConfig, '') : (previewText ?? '')),
      [previewText, previewConfig]
    )
    const previewCanvasText = useMemo(
      () => (previewConfig ? getPreviewDisplayText(previewText, previewConfig, 'Name') : 'Name'),
      [previewText, previewConfig]
    )

    // 3D tab is available for text-extrusion (always) or SVG/composite types with content
    const show3DTab = !!previewConfig && (isTextExtrusion || hasVariantSvg || hasSingleSvg || isComposite)

    // 3D is the last slide (index = images.length)
    const preview3DIndex = images.length
    const is3DActive = currentIndex === preview3DIndex

    const goTo3D = useCallback(() => {
      setCurrentIndex(preview3DIndex)
      setIsZoomed(false)
      // Scroll with offset for fixed header (h-16 = 64px + 8px breathing room)
      if (containerRef.current) {
        const top = containerRef.current.getBoundingClientRect().top + window.scrollY - 80
        window.scrollTo({ top, behavior: 'smooth' })
      }
    }, [preview3DIndex])

    useImperativeHandle(
      ref,
      () => ({
        goTo3D,
        goToIndex: (index: number) => {
          setCurrentIndex(index)
          setIsZoomed(false)
        },
        isAt3D: () => is3DActive,
      }),
      [goTo3D, is3DActive]
    )

    const goToNext = useCallback(() => {
      const nextIndex = currentIndex + 1
      const maxIndex = show3DTab ? images.length : images.length - 1
      if (nextIndex > maxIndex) {
        setCurrentIndex(0)
      } else {
        setCurrentIndex(nextIndex)
      }
    }, [currentIndex, show3DTab, images.length])

    const goToPrev = useCallback(() => {
      if (currentIndex === 0) {
        setCurrentIndex(show3DTab ? images.length : images.length - 1)
      } else {
        setCurrentIndex(currentIndex - 1)
      }
    }, [currentIndex, show3DTab, images.length])

    const goToIndex = (index: number) => {
      setCurrentIndex(index)
      if (index !== preview3DIndex) {
        setIsZoomed(false)
      }
    }

    // Touch swipe handlers
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
      const touch = e.touches[0]
      if (touch) {
        touchStartRef.current = { x: touch.clientX, y: touch.clientY }
      }
    }, [])

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
      if (!touchStartRef.current) return
      const touch = e.changedTouches[0]
      if (!touch) return

      const dx = touch.clientX - touchStartRef.current.x
      const dy = touch.clientY - touchStartRef.current.y
      touchStartRef.current = null

      // Only swipe if horizontal movement is dominant and exceeds threshold
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        if (dx < 0) {
          goToNext()
        } else {
          goToPrev()
        }
      }
    }, [goToNext, goToPrev])

    // If 3D tab disappears while viewing it (e.g. variant changed to one without SVG), go back
    useEffect(() => {
      if (!show3DTab && is3DActive) {
        setCurrentIndex(0)
      }
    }, [show3DTab, is3DActive])

    useEffect(() => {
      if (!is3DActive) {
        setIsPreviewInfoOpen(false)
      }
    }, [is3DActive])

    const totalSlides = images.length + (show3DTab ? 1 : 0)
    const displayIndex = is3DActive ? totalSlides : currentIndex + 1

    if (images.length === 0 && !show3DTab) {
      return (
        <div
          className={cn(
            'aspect-square bg-bg-secondary rounded-xl',
            'flex items-center justify-center text-white/20',
            className
          )}
        >
          {t('noImage')}
        </div>
      )
    }

    return (
      <div ref={containerRef} className={cn('space-y-4', className)}>
        {/* Main Image / 3D Preview — solid accent border, no glow. */}
        <div
          className="relative aspect-square bg-bg-secondary rounded-xl overflow-hidden group border-2"
          style={{ borderColor: 'rgb(var(--accent-rgb, 0, 245, 255))' }}
          onTouchStart={!is3DActive ? handleTouchStart : undefined}
          onTouchEnd={!is3DActive ? handleTouchEnd : undefined}
        >
          <AnimatePresence mode="wait">
            {is3DActive && previewConfig ? (
              <motion.div
                key="3d-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
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

                <div className="absolute left-3 bottom-16 z-20 sm:bottom-[4.5rem]">
                  <div className="relative">
                    <div className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/45 px-2.5 py-1.5 text-[11px] font-medium text-white/75 backdrop-blur-sm">
                      <span>{t('preview3DShortLabel')}</span>
                      <button
                        type="button"
                        onClick={() => setIsPreviewInfoOpen((prev) => !prev)}
                        className="pointer-events-auto inline-flex h-4 w-4 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent,#00f5ff)]"
                        aria-label={t('preview3DInfoLabel')}
                        aria-expanded={isPreviewInfoOpen}
                      >
                        <Info className="h-2.5 w-2.5" />
                      </button>
                    </div>

                    {isPreviewInfoOpen && (
                      <div
                        className="pointer-events-auto absolute left-0 bottom-full mb-2 w-56 rounded-lg border border-white/10 bg-black/75 px-3 py-2 text-[11px] leading-relaxed text-white/75 backdrop-blur-md"
                        style={{ boxShadow: '0 10px 30px rgba(0, 0, 0, 0.18)' }}
                      >
                        {t('preview3DDisclaimer')}
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom bar: input + Add to Cart */}
                {(onPreviewTextChange || canvasCart) && (
                  <div className="absolute bottom-0 inset-x-0 z-20">
                    <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-8 pb-3 px-3">
                      <div className="flex gap-2 items-center">
                        {onPreviewTextChange && (
                          <input
                            type="text"
                            value={normalizedPreviewText}
                            onChange={(e) => onPreviewTextChange(previewConfig ? getPreviewDisplayText(e.target.value, previewConfig, '') : e.target.value)}
                            placeholder="Name"
                            className={cn(
                              'flex-1 min-w-0 px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/40',
                              'bg-white/10 backdrop-blur-md border border-white/20',
                              'focus:outline-none focus:border-[color:var(--accent,#00f5ff)] focus:ring-1 focus:ring-[color:var(--accent,#00f5ff)]/50',
                              'transition-colors text-center'
                            )}
                          />
                        )}
                        {canvasCart && (
                          <div className="flex-shrink-0">
                            <AddToCartButton
                              variantId={canvasCart.variantId}
                              quantity={canvasCart.quantity}
                              available={canvasCart.available}
                              requiresPersonalization={canvasCart.requiresPersonalization}
                              personalizationValue={canvasCart.personalizationValue}
                              onPersonalizationError={canvasCart.onPersonalizationError}
                              attributes={canvasCart.attributes}
                              label="Add"
                              className="!py-2.5 !px-3 !text-xs !w-auto"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="absolute inset-0"
              >
                <Image
                  src={images[currentIndex]?.url || ''}
                  alt={images[currentIndex]?.altText || `${productTitle} - Image ${currentIndex + 1}`}
                  fill
                  className={cn(
                    'object-cover transition-transform duration-300',
                    isZoomed && 'scale-150 cursor-zoom-out'
                  )}
                  onClick={() => setIsZoomed(!isZoomed)}
                  priority={currentIndex === 0}
                  quality={90}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Zoom indicator (only for images, not 3D) */}
          {!is3DActive && (
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className={cn(
                'absolute top-4 right-4 z-10',
                'w-10 h-10 rounded-lg',
                'bg-black/50 backdrop-blur-sm',
                'flex items-center justify-center',
                'text-white/70 hover:text-white',
                'opacity-0 group-hover:opacity-100',
                'transition-all duration-200'
              )}
              aria-label={isZoomed ? t('zoomOut') : t('zoomIn')}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          )}

          {/* Mobile 3D Preview button — always visible on mobile so users discover 3D immediately */}
          {show3DTab && !is3DActive && (
            <button
              onClick={() => goToIndex(preview3DIndex)}
              className={cn(
                'absolute top-4 right-4 z-10 lg:hidden',
                'flex items-center gap-1.5 px-3 py-2 rounded-lg',
                'bg-[color:var(--accent,#00f5ff)]/15 border border-[color:var(--accent,#00f5ff)]/40 backdrop-blur-sm',
                'text-[color:var(--accent,#00f5ff)]',
                'active:scale-95 transition-transform'
              )}
              aria-label={t('view3DPreview')}
            >
              <Box className="w-4 h-4" />
              <span className="text-xs font-bold tracking-wide">3D</span>
            </button>
          )}

          {/* Navigation arrows (hidden in 3D mode) */}
          {totalSlides > 1 && !is3DActive && (
            <>
              <button
                onClick={goToPrev}
                className={cn(
                  'absolute left-2 top-1/2 -translate-y-1/2 z-10',
                  'w-10 h-10 rounded-full',
                  'bg-black/50 backdrop-blur-sm',
                  'flex items-center justify-center',
                  'text-white/70 hover:text-white',
                  'opacity-0 group-hover:opacity-100',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent,#00f5ff)]'
                )}
                aria-label={t('previousImage')}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={goToNext}
                className={cn(
                  'absolute right-2 top-1/2 -translate-y-1/2 z-10',
                  'w-10 h-10 rounded-full',
                  'bg-black/50 backdrop-blur-sm',
                  'flex items-center justify-center',
                  'text-white/70 hover:text-white',
                  'opacity-0 group-hover:opacity-100',
                  'transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent,#00f5ff)]'
                )}
                aria-label={t('nextImage')}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {/* Close button for 3D preview */}
          {is3DActive && (
            <button
              onClick={() => setCurrentIndex(0)}
              className={cn(
                'absolute top-3 right-3 z-10',
                'w-9 h-9 rounded-lg',
                'bg-black/50 backdrop-blur-sm',
                'flex items-center justify-center',
                'text-white/70 hover:text-white',
                'transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent,#00f5ff)]'
              )}
              aria-label={t('close3DPreview')}
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Slide counter — moves to top-left in 3D mode to avoid bottom bar */}
          {totalSlides > 1 && (
            <div className={cn(
              'absolute z-10',
              is3DActive ? 'top-3 left-3' : 'bottom-4 left-1/2 -translate-x-1/2'
            )}>
              <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/70 text-sm">
                {is3DActive ? '3D' : `${displayIndex} / ${totalSlides}`}
              </div>
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {(hasMultipleImages || show3DTab) && (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden',
                  'border-2 transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent,#00f5ff)]',
                  index === currentIndex
                    ? 'border-[color:var(--accent,#00f5ff)]'
                    : 'border-transparent opacity-60 hover:opacity-100'
                )}
                aria-label={t('viewImage', { number: index + 1 })}
                aria-current={index === currentIndex ? 'true' : undefined}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}

            {/* 3D Preview thumbnail — last in sequence */}
            {show3DTab && (
              <button
                onClick={() => goToIndex(preview3DIndex)}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden',
                  'border-2 transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--accent,#00f5ff)]',
                  'flex items-center justify-center',
                  is3DActive
                    ? 'border-[color:var(--accent,#00f5ff)] bg-[color:var(--accent,#00f5ff)]/10'
                    : 'border-transparent opacity-60 hover:opacity-100 bg-white/5'
                )}
                aria-label={t('view3DPreview')}
                aria-current={is3DActive ? 'true' : undefined}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <Box className={cn(
                    'w-5 h-5 transition-colors',
                    is3DActive ? 'text-[color:var(--accent,#00f5ff)]' : 'text-white/60'
                  )} />
                  <span className={cn(
                    'text-[9px] font-bold tracking-wide transition-colors',
                    is3DActive ? 'text-[color:var(--accent,#00f5ff)]' : 'text-white/60'
                  )}>
                    3D
                  </span>
                </div>
              </button>
            )}
          </div>
        )}
      </div>
    )
  }
)
