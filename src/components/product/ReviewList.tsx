'use client'

import { useState, useEffect } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'
import { ReviewSummary } from '@/components/product/ReviewSummary'
import { StarRating } from '@/components/product/StarRating'
import ReviewForm from '@/components/product/ReviewForm'
import type { Review, ReviewRating } from '@/types/reviews'

interface ReviewListProps {
  productHandle: string
}

export default function ReviewList({ productHandle }: ReviewListProps) {
  const t = useTranslations('reviews')
  const locale = useLocale()
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<ReviewRating | null>(null)
  const [isLoading, setIsLoading] = useState(true)

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
      {stats && <ReviewSummary rating={stats} showBreakdown={true} />}

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-bold">{t('title')}</h3>

        {reviews.length === 0 ? (
          <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-8 text-center">
            <p className="text-lg font-medium mb-2">{t('noReviews')}</p>
            <p className="text-white/60">{t('noReviewsDescription')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-4"
              >
                {/* Rating and Author */}
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <StarRating rating={review.rating} size="sm" />
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-medium">{review.author}</span>
                      {review.verified && (
                        <span className="inline-flex items-center gap-1 text-xs bg-neon-green/20 text-neon-green px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3" />
                          {t('verified')}
                        </span>
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
                <p className="text-white/70 leading-relaxed">{review.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Form */}
      <div>
        <ReviewForm productHandle={productHandle} />
      </div>
    </div>
  )
}
