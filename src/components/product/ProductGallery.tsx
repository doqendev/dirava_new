'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ProductImage {
  url: string
  altText: string | null
}

interface ProductGalleryProps {
  images: ProductImage[]
  productTitle: string
  className?: string
}

export function ProductGallery({
  images,
  productTitle,
  className,
}: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isZoomed, setIsZoomed] = useState(false)

  const hasMultipleImages = images.length > 1

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToIndex = (index: number) => {
    setCurrentIndex(index)
  }

  if (images.length === 0) {
    return (
      <div
        className={cn(
          'aspect-square bg-bg-secondary rounded-xl',
          'flex items-center justify-center text-white/20',
          className
        )}
      >
        No Image Available
      </div>
    )
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Main Image */}
      <div className="relative aspect-square bg-bg-secondary rounded-xl overflow-hidden group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom indicator */}
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
          aria-label={isZoomed ? 'Zoom out' : 'Zoom in'}
        >
          <ZoomIn className="w-5 h-5" />
        </button>

        {/* Navigation arrows */}
        {hasMultipleImages && (
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
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan'
              )}
              aria-label="Previous image"
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
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan'
              )}
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image counter */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
            <div className="px-3 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white/70 text-sm">
              {currentIndex + 1} / {images.length}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultipleImages && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={cn(
                'relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden',
                'border-2 transition-all duration-200',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan',
                index === currentIndex
                  ? 'border-neon-cyan shadow-glow-sm-cyan'
                  : 'border-transparent opacity-60 hover:opacity-100'
              )}
              aria-label={`View image ${index + 1}`}
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
        </div>
      )}
    </div>
  )
}
