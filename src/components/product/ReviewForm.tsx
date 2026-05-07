'use client'

import { useEffect, useState, useRef } from 'react'
import { Star, ImagePlus, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_FILE_SIZE = 4 * 1024 * 1024 // 4MB
const MAX_IMAGES = 3
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ''

interface TurnstileApi {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string
      theme: 'dark'
      callback: (token: string) => void
      'expired-callback': () => void
      'error-callback': () => void
    }
  ) => string | undefined
  reset: (widgetId?: string) => void
  remove: (widgetId: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

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
  const [website, setWebsite] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const turnstileContainerRef = useRef<HTMLDivElement>(null)
  const turnstileWidgetRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileContainerRef.current) return

    let cancelled = false

    const renderTurnstile = () => {
      if (cancelled || turnstileWidgetRef.current || !turnstileContainerRef.current || !window.turnstile) {
        return
      }

      turnstileWidgetRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'dark',
        callback: (token) => {
          setTurnstileToken(token)
          setError('')
        },
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      })
    }

    if (window.turnstile) {
      renderTurnstile()
    } else {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[src^="https://challenges.cloudflare.com/turnstile/v0/api.js"]'
      )
      const script = existingScript || document.createElement('script')

      script.addEventListener('load', renderTurnstile, { once: true })
      if (!existingScript) {
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
        script.async = true
        script.defer = true
        document.head.appendChild(script)
      }
    }

    return () => {
      cancelled = true
      if (turnstileWidgetRef.current && window.turnstile) {
        window.turnstile.remove(turnstileWidgetRef.current)
        turnstileWidgetRef.current = undefined
      }
    }
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    const newFiles: File[] = []
    const newPreviews: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) continue

      // Check max count
      if (images.length + newFiles.length >= MAX_IMAGES) {
        setError(t('maxPhotos'))
        break
      }

      // Validate type
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError(t('invalidPhotoType'))
        continue
      }

      // Validate size
      if (file.size > MAX_FILE_SIZE) {
        setError(t('photoTooLarge'))
        continue
      }

      newFiles.push(file)
      newPreviews.push(URL.createObjectURL(file))
    }

    if (newFiles.length > 0) {
      setImages(prev => [...prev, ...newFiles])
      setImagePreviews(prev => [...prev, ...newPreviews])
      setError('')
    }

    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const removeImage = (index: number) => {
    const preview = imagePreviews[index]
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (rating === 0) {
      setError(t('ratingRequired'))
      return
    }

    if (!anonymous && !name.trim()) {
      setError(t('nameRequired'))
      return
    }

    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      setError(t('captchaRequired'))
      return
    }

    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('productHandle', productHandle)
      formData.append('rating', rating.toString())
      formData.append('anonymous', anonymous.toString())
      formData.append('authorName', anonymous ? '' : name)
      formData.append('authorEmail', anonymous ? '' : email)
      formData.append('title', title)
      formData.append('content', content)
      formData.append('website', website)
      formData.append('turnstileToken', turnstileToken)

      for (const img of images) {
        formData.append('images', img)
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json().catch(() => null)
        throw new Error(data?.error || 'Failed to submit review')
      }

      // Clean up preview URLs
      for (const preview of imagePreviews) {
        URL.revokeObjectURL(preview)
      }

      setIsSubmitted(true)
      setRating(0)
      setName('')
      setEmail('')
      setTitle('')
      setContent('')
      setWebsite('')
      setTurnstileToken('')
      setAnonymous(false)
      setImages([])
      setImagePreviews([])
      window.turnstile?.reset(turnstileWidgetRef.current)

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
      <input
        type="text"
        name="website"
        value={website}
        onChange={(e) => setWebsite(e.target.value)}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />

      {/* Star Rating */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          {t('yourRating')} <span className="text-[color:var(--accent,#00f5ff)]">*</span>
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
                    ? 'fill-[color:var(--accent,#00f5ff)] text-[color:var(--accent,#00f5ff)]'
                    : 'text-white/20'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Anonymous Toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(e) => setAnonymous(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-10 h-5 bg-white/10 border border-white/20 rounded-full peer-checked:bg-[color:var(--accent,#00f5ff)]/30 peer-checked:border-[color:var(--accent,#00f5ff)]/50 transition-colors" />
            <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white/50 rounded-full peer-checked:translate-x-5 peer-checked:bg-[color:var(--accent,#00f5ff)] transition-all" />
          </div>
          <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">
            {t('anonymous')}
          </span>
        </label>
      </div>

      {/* Name & Email (hidden when anonymous) */}
      {!anonymous && (
        <>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              {t('name')} <span className="text-[color:var(--accent,#00f5ff)]">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('namePlaceholder')}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[color:var(--accent,#00f5ff)] focus:ring-1 focus:ring-[color:var(--accent,#00f5ff)]"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              {t('email')}
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[color:var(--accent,#00f5ff)] focus:ring-1 focus:ring-[color:var(--accent,#00f5ff)]"
            />
          </div>
        </>
      )}

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
          className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[color:var(--accent,#00f5ff)] focus:ring-1 focus:ring-[color:var(--accent,#00f5ff)]"
        />
      </div>

      {/* Content (optional) */}
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          {t('content')}
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('contentPlaceholder')}
          rows={4}
          className="w-full px-4 py-3 bg-black/40 border border-white/20 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[color:var(--accent,#00f5ff)] focus:ring-1 focus:ring-[color:var(--accent,#00f5ff)] resize-none"
        />
      </div>

      {/* Image Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">
          {t('addPhotos')}
          <span className="text-white/40 font-normal ml-2">({t('maxPhotos')})</span>
        </label>

        {/* Image Previews */}
        {imagePreviews.length > 0 && (
          <div className="flex gap-3 mb-3 flex-wrap">
            {imagePreviews.map((preview, index) => (
              <div
                key={preview}
                className="relative w-20 h-20 rounded-lg overflow-hidden border border-white/20 group"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Photo Button */}
        {images.length < MAX_IMAGES && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/20 border-dashed rounded-lg text-white/60 hover:text-white/90 hover:border-white/40 transition-colors text-sm"
            >
              <ImagePlus className="w-4 h-4" />
              {t('addPhotos')}
            </button>
          </>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {TURNSTILE_SITE_KEY && (
        <div className="mb-4 min-h-[65px]" ref={turnstileContainerRef} />
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="px-6 py-3 bg-[color:var(--accent,#00f5ff)] text-bg-primary font-display font-semibold uppercase tracking-wider rounded-lg hover:bg-[color:var(--accent,#00f5ff)]/90 transition-all disabled:opacity-50"
      >
        {isSubmitting
          ? (images.length > 0 ? t('uploading') : t('submitting'))
          : t('submit')
        }
      </button>
    </form>
  )
}
