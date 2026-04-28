'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle2, X, ChevronLeft, ChevronRight, Camera } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils/cn'
import { ReviewSummary } from '@/components/product/ReviewSummary'
import { StarRating } from '@/components/product/StarRating'
import ReviewForm from '@/components/product/ReviewForm'
import type { Review, ReviewRating } from '@/types/reviews'

/** Convert ISO 3166-1 alpha-2 country code to flag emoji */
function countryCodeToFlag(code: string): string {
  const upper = code.toUpperCase()
  if (upper.length !== 2) return ''
  const offset = 0x1F1E6 - 65 // 'A' char code
  return String.fromCodePoint(
    upper.charCodeAt(0) + offset,
    upper.charCodeAt(1) + offset
  )
}

interface ReviewListProps {
  productHandle: string
  /** Universe accent color used to theme stars and breakdown bars. */
  color?: string
}

export default function ReviewList({ productHandle, color }: ReviewListProps) {
  const t = useTranslations('reviews')
  const locale = useLocale()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewRating | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)
  const [photosOnly, setPhotosOnly] = useState(false)

  const filteredReviews = useMemo(
    () => photosOnly ? reviews.filter(r => r.images && r.images.length > 0) : reviews,
    [reviews, photosOnly]
  )

  const hasPhotosReviews = useMemo(
    () => reviews.some(r => r.images && r.images.length > 0),
    [reviews]
  )

  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/reviews/${productHandle}`)
        if (response.ok) {
          const data = await response.json()
          setReviews(data.reviews || [])
          setStats(data.stats || null)
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [productHandle])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const openLightbox = (images: string[], index: number) => {
    setLightbox({ images, index })
  }

  const closeLightbox = useCallback(() => {
    setLightbox(null)
  }, [])

  const navigateLightbox = useCallback((direction: 1 | -1) => {
    setLightbox(prev => {
      if (!prev) return null
      const newIndex = prev.index + direction
      if (newIndex < 0 || newIndex >= prev.images.length) return prev
      return { ...prev, index: newIndex }
    })
  }, [])

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightbox) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      else if (e.key === 'ArrowLeft') navigateLightbox(-1)
      else if (e.key === 'ArrowRight') navigateLightbox(1)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [lightbox, closeLightbox, navigateLightbox])

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Summary Skeleton */}
        <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6 animate-pulse">
          <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
          <div className="h-16 bg-white/10 rounded"></div>
        </div>

        {/* Review Skeletons */}
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-4 animate-pulse"
          >
            <div className="h-6 bg-white/10 rounded w-1/4 mb-3"></div>
            <div className="h-4 bg-white/10 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-full mb-2"></div>
            <div className="h-4 bg-white/10 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Review Summary */}
      {stats && <ReviewSummary rating={stats} showBreakdown={true} color={color} />}

      {/* Reviews List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-display font-bold">{t('title')}</h3>
          {hasPhotosReviews && (
            <button
              type="button"
              onClick={() => setPhotosOnly(!photosOnly)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border',
                photosOnly
                  ? 'bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30'
                  : 'bg-white/5 text-white/60 border-white/10 hover:text-white/80 hover:border-white/20'
              )}
            >
              <Camera className="w-3.5 h-3.5" />
              {t('withPhotos')}
            </button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-8 text-center">
            <p className="text-lg font-medium">{t('beFirst')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((review) => (
              <div
                key={review.id}
                className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-4"
              >
                {/* Rating and Author */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <StarRating rating={review.rating} size="sm" color={color} />
                    <div className="flex items-center gap-1.5 mt-2">
                      {review.countryCode && (
                        <span className="text-sm" title={review.countryCode}>
                          {countryCodeToFlag(review.countryCode)}
                        </span>
                      )}
                      <span className="font-medium">{review.author}</span>
                      {review.verified && (
                        <CheckCircle2 className="w-4 h-4 text-neon-green flex-shrink-0" aria-label={t('verified')} />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-white/50">
                    {formatDate(review.createdAt)}
                  </span>
                </div>

                {/* Title */}
                {review.title && (
                  <h4 className="font-bold mb-2">{review.title}</h4>
                )}

                {/* Content */}
                {review.content && (
                  <p className="text-white/70 leading-relaxed">{review.content}</p>
                )}

                {/* Review Images */}
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {review.images.map((imageUrl, imgIndex) => (
                      <button
                        key={imageUrl}
                        type="button"
                        onClick={() => openLightbox(review.images!, imgIndex)}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-white/10 hover:border-[color:var(--accent,#00f5ff)]/50 transition-colors flex-shrink-0"
                      >
                        <Image
                          src={imageUrl}
                          alt={`${review.author} review photo ${imgIndex + 1}`}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Form */}
      <div>
        <ReviewForm productHandle={productHandle} />
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          {/* Previous button */}
          {lightbox.index > 0 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(-1) }}
              className="absolute left-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Next button */}
          {lightbox.index < lightbox.images.length - 1 && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigateLightbox(1) }}
              className="absolute right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          )}

          {/* Image */}
          <div
            className="relative max-w-[90vw] max-h-[85vh] w-full h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={lightbox.images[lightbox.index]!}
              alt={t('photoAlt')}
              fill
              className="object-contain"
              sizes="90vw"
              priority
            />
          </div>

          {/* Image counter */}
          {lightbox.images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-white/10 text-sm text-white/70">
              {lightbox.index + 1} / {lightbox.images.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
