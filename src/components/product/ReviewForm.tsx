'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

interface ReviewFormProps {
  productHandle: string
}

export default function ReviewForm({ productHandle }: ReviewFormProps) {
  const t = useTranslations('reviews')
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError(t('ratingRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productHandle,
          rating,
          authorName: name,
          authorEmail: email,
          title,
          content,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit review')
      }

      setIsSubmitted(true)
      setRating(0)
      setName('')
      setEmail('')
      setTitle('')
      setContent('')

      setTimeout(() => {
        setIsSubmitted(false)
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="bg-neon-green/10 border border-neon-green/30 rounded-xl p-6 text-center">
        <h3 className="text-xl font-display font-bold text-neon-green mb-2">
          {t('submitted')}
        </h3>
        <p className="text-white/70">{t('submittedDescription')}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
      <h3 className="text-xl font-display font-bold mb-6">{t('writeReview')}</h3>

      {/* Star Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          {t('yourRating')} <span className="text-neon-cyan">*</span>
        </label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={cn(
                  'w-8 h-8 transition-colors',
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-white/20'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          {t('name')} <span className="text-neon-cyan">*</span>
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('namePlaceholder')}
          required
          className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
        />
      </div>

      {/* Email */}
      <div className="mb-4">
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          {t('email')} <span className="text-neon-cyan">*</span>
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          required
          className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
        />
      </div>

      {/* Title */}
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          {t('title')}
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('titlePlaceholder')}
          className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
        />
      </div>

      {/* Content */}
      <div className="mb-6">
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          {t('content')} <span className="text-neon-cyan">*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('contentPlaceholder')}
          required
          rows={5}
          className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan resize-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 bg-neon-cyan text-bg-primary font-display font-semibold uppercase tracking-wider rounded-lg hover:bg-neon-cyan/90 shadow-glow-sm-cyan hover:shadow-glow-cyan transition-all disabled:opacity-50"
      >
        {isSubmitting ? t('submitting') : t('submit')}
      </button>
    </form>
  )
}
