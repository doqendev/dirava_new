'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils/cn'
import {
  getTwitterShareUrl,
  getFacebookShareUrl,
  getPinterestShareUrl,
  getWhatsAppShareUrl,
  canUseWebShare,
  webShare,
  copyToClipboard,
  type ShareData,
} from '@/lib/utils/shareUrls'
import { Share2, Link2, Check } from 'lucide-react'

interface ShareButtonsProps {
  title: string
  handle: string
  universe: string
  image?: string
  className?: string
}

export function ShareButtons({
  title,
  handle,
  universe,
  image,
  className,
}: ShareButtonsProps) {
  const t = useTranslations('share')
  const [copied, setCopied] = useState(false)
  const [showNativeShare, setShowNativeShare] = useState(false)
  const [productUrl, setProductUrl] = useState('')

  useEffect(() => {
    // Build URL on client side to get the correct origin
    const url = `${window.location.origin}/worlds/${universe}/${handle}`
    setProductUrl(url)
    setShowNativeShare(canUseWebShare())
  }, [universe, handle])

  const shareData: ShareData = {
    url: productUrl,
    title: title,
    text: t('shareText', { title }),
    image: image,
  }

  const handleCopyLink = async () => {
    const success = await copyToClipboard(productUrl)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleNativeShare = async () => {
    await webShare(shareData)
  }

  const openShareWindow = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400,menubar=no,toolbar=no')
  }

  const buttonClass = cn(
    'w-9 h-9 flex items-center justify-center rounded-lg',
    'bg-white/5 hover:bg-white/10',
    'text-white/60 hover:text-white',
    'border border-white/10 hover:border-white/20',
    'transition-all duration-200'
  )

  if (!productUrl) return null

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Native Share (mobile) */}
      {showNativeShare && (
        <button
          onClick={handleNativeShare}
          className={buttonClass}
          aria-label={t('share')}
          title={t('share')}
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={cn(buttonClass, copied && 'bg-green-500/20 border-green-500/50 text-green-500')}
        aria-label={copied ? t('copied') : t('copyLink')}
        title={copied ? t('copied') : t('copyLink')}
      >
        {copied ? (
          <Check className="w-4 h-4" />
        ) : (
          <Link2 className="w-4 h-4" />
        )}
      </button>

      {/* Twitter/X */}
      <button
        onClick={() => openShareWindow(getTwitterShareUrl(shareData))}
        className={buttonClass}
        aria-label={t('shareOnX')}
        title={t('shareOnX')}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>

      {/* Facebook */}
      <button
        onClick={() => openShareWindow(getFacebookShareUrl(shareData))}
        className={buttonClass}
        aria-label={t('shareOnFacebook')}
        title={t('shareOnFacebook')}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      </button>

      {/* Pinterest */}
      <button
        onClick={() => openShareWindow(getPinterestShareUrl(shareData))}
        className={buttonClass}
        aria-label={t('shareOnPinterest')}
        title={t('shareOnPinterest')}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
        </svg>
      </button>

      {/* WhatsApp */}
      <button
        onClick={() => openShareWindow(getWhatsAppShareUrl(shareData))}
        className={buttonClass}
        aria-label={t('shareOnWhatsApp')}
        title={t('shareOnWhatsApp')}
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </button>
    </div>
  )
}
