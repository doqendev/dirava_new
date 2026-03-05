import { getTranslations } from 'next-intl/server'
import { Star, Globe, ThumbsUp } from 'lucide-react'

interface SocialProofBannerProps {
  averageRating?: number
  reviewCount?: number
}

export async function SocialProofBanner({ averageRating, reviewCount }: SocialProofBannerProps) {
  const t = await getTranslations('product')

  const displayRating = averageRating && averageRating > 0 ? averageRating.toFixed(1) : '4.9'
  const displayCount = reviewCount && reviewCount > 0 ? reviewCount : 0

  return (
    <div className="relative rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
        {/* Rating */}
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="w-4 h-4 fill-neon-yellow text-neon-yellow"
              />
            ))}
          </div>
          <p className="text-white font-mono text-lg font-bold">
            {displayRating}/5
          </p>
          <p className="text-white/50 text-sm">
            {t('socialProofRating')}
            {displayCount > 0 && (
              <span className="text-white/40"> ({displayCount})</span>
            )}
          </p>
        </div>

        {/* Countries */}
        <div className="flex flex-col items-center gap-2">
          <Globe className="w-6 h-6 text-neon-cyan" />
          <p className="text-white font-mono text-lg font-bold">50+</p>
          <p className="text-white/50 text-sm">{t('socialProofCountries')}</p>
        </div>

        {/* Satisfaction */}
        <div className="flex flex-col items-center gap-2">
          <ThumbsUp className="w-6 h-6 text-neon-green" />
          <p className="text-white font-mono text-lg font-bold">98%</p>
          <p className="text-white/50 text-sm">{t('socialProofSatisfaction')}</p>
        </div>
      </div>
    </div>
  )
}
