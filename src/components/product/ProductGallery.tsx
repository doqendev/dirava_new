'use client'

import { useState, useEffect, useRef, lazy, Suspense, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn, Box, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { Preview3DLoadingIndicator } from '@/components/product/preview3d/LoadingSpinner'
import { BallPositionPicker } from '@/components/product/preview3d/BallPositionPicker'
import type { PreviewConfig } from '@/lib/preview/types'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'
import { MAX_PERSONALIZATION_LENGTH } from '@/lib/utils/constants'

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
  themeColor?: string
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
  /** For each thumbnail index, the variant option value it represents (or
   *  null when the image isn't tied to a specific variant). Used to let
   *  shoppers switch characters inside the active 3D preview by tapping a
   *  thumbnail — no need to exit 3D, tap the variant, then re-enter. */
  imageVariantNames?: (string | null)[]
  /** Called when a thumbnail is tapped while the 3D preview is active and
   *  that thumbnail maps to a variant. Receives the variant option value. */
  onVariantSelect?: (variantName: string) => void
  /** Only consulted for dragonball-sign previews — slot index [0, text.length]
   *  where the Dragon Ball sits. */
  ballPosition?: number
  /** Ball-position picker change handler. Only consumed on dragonball-sign. */
  onBallPositionChange?: (value: number) => void
  /** Universe accent color for the gallery card glow / 3D pill / active thumb ring. */
  themeColor?: string
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
      imageVariantNames,
      onVariantSelect,
      ballPosition,
      onBallPositionChange,
      themeColor = '#00f5ff',
    },
    ref
  ) {
    const t = useTranslations('gallery')
    const tCommon = useTranslations('common')
    const containerRef = useRef<HTMLDivElement>(null)
    const [currentIndex, setCurrentIndex] = useState(initialImageIndex ?? 0)
    const [isZoomed, setIsZoomed] = useState(false)
    const [showAllThumbs, setShowAllThumbs] = useState(false)
    const touchStartRef = useRef<{ x: number; y: number } | null>(null)

    const hasMultipleImages = images.length > 1
    const isTextExtrusion = previewConfig?.type === 'text-extrusion'
    const isSvgPreview = previewConfig?.type === 'svg-extrusion' || previewConfig?.type === 'composite-sign'
    const hasVariantSvg = isSvgPreview && !!selectedVariantName && !!previewConfig?.variantSvgs?.[selectedVariantName]
    const hasSingleSvg = isSvgPreview && !!previewConfig?.svg
    const isComposite = previewConfig?.type === 'composite-sign' && !!previewConfig?.barParts
    const isDragonballSign = previewConfig?.type === 'dragonball-sign' && !!previewConfig.font && !!previewConfig.svg
    const isBleachSign = previewConfig?.type === 'bleach-sign' && !!previewConfig.font && !!previewConfig.bleachFrameSvgs
    const normalizedPreviewText = useMemo(
      () => (previewConfig ? getPreviewDisplayText(previewText, previewConfig, '') : (previewText ?? '')),
      [previewText, previewConfig]
    )
    const previewCanvasText = useMemo(
      () => (previewConfig ? getPreviewDisplayText(previewText, previewConfig, 'Name') : 'Name'),
      [previewText, previewConfig]
    )

    // 3D tab is available for text-extrusion (always) or SVG/composite types with content
    const show3DTab = !!previewConfig && (isTextExtrusion || hasVariantSvg || hasSingleSvg || isComposite || isDragonballSign || isBleachSign)

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
      <div ref={containerRef} className={cn('relative space-y-4', className)}>
        {/* Soft accent halo behind the card. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -inset-y-2 rounded-2xl blur-3xl"
          style={{ background: `radial-gradient(60% 60% at 50% 50%, ${themeColor}1f, transparent 70%)` }}
        />
        {/* Main Image / 3D Preview — accent border + ambient inner glow. */}
        <div
          className="relative aspect-square bg-bg-secondary rounded-xl overflow-hidden group border"
          style={{
            borderColor: `${themeColor}66`,
            boxShadow: `0 0 24px ${themeColor}22, inset 0 0 30px ${themeColor}1a`,
          }}
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
                  <Preview3DCanvas
                    config={previewConfig}
                    text={previewCanvasText}
                    selectedVariantName={selectedVariantName}
                    ballPosition={isDragonballSign ? ballPosition : undefined}
                  />
                </Suspense>


                {/* Bottom bar: input + Add to Cart */}
                {(onPreviewTextChange || canvasCart) && (
                  <div className="absolute bottom-0 inset-x-0 z-20">
                    <div className="bg-gradient-to-t from-black/90 via-black/70 to-transparent pt-8 pb-3 px-3">
                      {/* Dragon Ball position picker — a row of clickable dots
                          interleaved with the typed letters. Only shows up on
                          the Dragon Ball sign preview. */}
                      {isDragonballSign && onBallPositionChange && typeof ballPosition === 'number' && normalizedPreviewText && (
                        <BallPositionPicker
                          text={normalizedPreviewText}
                          value={ballPosition}
                          onChange={onBallPositionChange}
                          className="mb-1"
                        />
                      )}
                      <div className="flex gap-2 items-center">
                        {onPreviewTextChange && (
                          <input
                            type="text"
                            value={normalizedPreviewText}
                            maxLength={MAX_PERSONALIZATION_LENGTH}
                            onChange={(e) => {
                              const sliced = e.target.value.slice(0, MAX_PERSONALIZATION_LENGTH)
                              onPreviewTextChange(previewConfig ? getPreviewDisplayText(sliced, previewConfig, '') : sliced)
                            }}
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
                              themeColor={canvasCart.themeColor}
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
                  quality={80}
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
                />
              </motion.div>
            )}

            {/* Preload the neighbouring images so a swipe lands on an already
                cached + decoded image instead of a spinner. Rendered tiny +
                invisible; `priority` emits a <link rel="preload"> so the
                browser fetches them right after the current image. */}
            {images.length > 1 && (
              <div aria-hidden="true" className="pointer-events-none absolute h-px w-px overflow-hidden opacity-0">
                {[
                  (currentIndex + 1) % images.length,
                  (currentIndex - 1 + images.length) % images.length,
                ].filter((i) => i !== currentIndex).map((i) => {
                  const img = images[i]
                  if (!img) return null
                  return (
                    <Image
                      key={`preload-${i}`}
                      src={img.url}
                      alt=""
                      width={1}
                      height={1}
                      priority
                      quality={80}
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 640px"
                    />
                  )
                })}
              </div>
            )}
          </AnimatePresence>

          {/* Zoom indicator (only for images, not 3D) — sits below the 3D
              button so both can coexist on desktop. */}
          {!is3DActive && (
            <button
              onClick={() => setIsZoomed(!isZoomed)}
              className={cn(
                'absolute top-4 right-4 z-10 lg:top-16',
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

          {/* 3D Preview pill — full label, prominent accent fill. */}
          {show3DTab && !is3DActive && (
            <button
              onClick={() => goToIndex(preview3DIndex)}
              className={cn(
                'absolute top-3 right-3 z-10',
                'inline-flex items-center gap-1.5 rounded-full px-3.5 py-2',
                'border backdrop-blur-md',
                'text-xs font-bold uppercase tracking-[0.12em]',
                'active:scale-95 transition-all',
              )}
              style={{
                background: `${themeColor}1f`,
                borderColor: `${themeColor}77`,
                color: themeColor,
                boxShadow: `0 0 14px ${themeColor}66`,
              }}
              aria-label={t('view3DPreview')}
            >
              <Box className="w-4 h-4" />
              <span>3D Preview</span>
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

          {/* Slide counter intentionally removed — the thumbnail strip
              already conveys position and the close button covers 3D. */}
        </div>

        {/* Thumbnails — capped at 3 with a +N overflow tile until the
            customer expands the strip. The 3D tile always sits last
            outside the cap so it stays discoverable. */}
        {(hasMultipleImages || show3DTab) && (() => {
          const THUMB_CAP = 3
          const overflow = !showAllThumbs && images.length > THUMB_CAP
          const visible = overflow ? images.slice(0, THUMB_CAP) : images
          const hiddenCount = overflow ? images.length - THUMB_CAP : 0
          return (
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            {visible.map((image, index) => {
              const thumbVariant = imageVariantNames?.[index] ?? null
              const stayInPreview = is3DActive && thumbVariant && onVariantSelect
              const isActive = stayInPreview ? thumbVariant === selectedVariantName : index === currentIndex
              return (
              <button
                key={index}
                onClick={() => {
                  if (stayInPreview) {
                    onVariantSelect(thumbVariant)
                  } else {
                    goToIndex(index)
                  }
                }}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden',
                  'border-2 transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2',
                  isActive ? '' : 'border-white/15 opacity-60 hover:opacity-100',
                )}
                style={
                  isActive
                    ? {
                        borderColor: themeColor,
                        boxShadow: `0 0 12px ${themeColor}88`,
                      }
                    : undefined
                }
                aria-label={t('viewImage', { number: index + 1 })}
                aria-current={isActive ? 'true' : undefined}
              >
                <Image
                  src={image.url}
                  alt={image.altText || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
              )
            })}

            {/* +N overflow tile — clicking expands the rest of the strip. */}
            {overflow && (
              <button
                onClick={() => setShowAllThumbs(true)}
                className={cn(
                  'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden',
                  'border-2 transition-all duration-200',
                  'flex items-center justify-center',
                  'bg-black/60 hover:bg-black/40',
                  'focus-visible:outline-none focus-visible:ring-2',
                )}
                style={{ borderColor: `${themeColor}55`, color: themeColor }}
                aria-label={`Show ${hiddenCount} more images`}
              >
                <span className="text-sm font-bold">+{hiddenCount}</span>
              </button>
            )}

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
          )
        })()}
      </div>
    )
  }
)
