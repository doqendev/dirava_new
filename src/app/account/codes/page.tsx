'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Ticket, Loader2, Package, Sparkles, AlertCircle, Copy, Check, ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/utils/cn'
import { RARITY_CONFIG } from '@/lib/gacha/constants'
import { getRarityStyles } from '@/stores/gachaStore'
import type { RedemptionCode, CodeStatus } from '@/types/gacha'

type PageState = 'loading' | 'ready' | 'error' | 'unauthenticated'

const STATUS_CONFIG: Record<CodeStatus, { color: string; bgColor: string }> = {
  unused: { color: 'text-neon-cyan', bgColor: 'bg-neon-cyan/10' },
  revealed: { color: 'text-neon-purple', bgColor: 'bg-neon-purple/10' },
  claimed: { color: 'text-neon-green', bgColor: 'bg-neon-green/10' },
  shipped: { color: 'text-neon-yellow', bgColor: 'bg-neon-yellow/10' },
}

export default function AccountCodesPage() {
  const t = useTranslations('codes')
  const { customer, accessToken, isAuthenticated } = useAuthStore()

  const statusLabels: Record<CodeStatus, string> = {
    unused: t('statusUnused'),
    revealed: t('statusRevealed'),
    claimed: t('statusClaimed'),
    shipped: t('statusShipped'),
  }

  const [pageState, setPageState] = useState<PageState>('loading')
  const [codes, setCodes] = useState<RedemptionCode[]>([])
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Check auth and fetch codes
  useEffect(() => {
    if (!isAuthenticated()) {
      setPageState('unauthenticated')
      return
    }

    if (!customer?.email) {
      setPageState('error')
      return
    }

    async function fetchCodes() {
      try {
        const response = await fetch(`/api/gacha/user-codes?email=${encodeURIComponent(customer!.email)}`, {
          headers: accessToken ? { 'X-Customer-Access-Token': accessToken } : {},
        })
        const data = await response.json()

        if (!data.success) {
          setPageState('error')
          return
        }

        setCodes(data.codes || [])
        setPageState('ready')
      } catch {
        setPageState('error')
      }
    }

    fetchCodes()
  }, [customer, accessToken, isAuthenticated])

  const handleCopyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(code)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch {
      // Clipboard API not available
    }
  }

  const getActionButton = (code: RedemptionCode) => {
    switch (code.status) {
      case 'unused':
        return (
          <Link
            href={`/gacha/reveal/${code.code}`}
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-black font-medium rounded-lg text-sm"
          >
            <Sparkles className="w-4 h-4" />
            {t('revealNow')}
          </Link>
        )
      case 'revealed':
        return (
          <Link
            href={`/gacha/claim/${code.code}`}
            className="flex items-center gap-2 px-4 py-2 bg-neon-purple text-white font-medium rounded-lg text-sm"
          >
            <Package className="w-4 h-4" />
            {t('claimPrize')}
          </Link>
        )
      case 'claimed':
      case 'shipped':
        return (
          <Link
            href={`/gacha/reveal/${code.code}`}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white/80 font-medium rounded-lg text-sm"
          >
            <ExternalLink className="w-4 h-4" />
            {t('viewDetails')}
          </Link>
        )
    }
  }

  // Unauthenticated
  if (pageState === 'unauthenticated') {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="px-4 py-4 max-w-2xl mx-auto">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back')}</span>
          </Link>
        </div>

        <div className="px-4 py-12 max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
            <Ticket className="w-8 h-8 text-white/30" />
          </div>
          <h1 className="font-display text-2xl text-white mb-2">{t('signInRequired')}</h1>
          <p className="text-white/60 mb-6">
            {t('signInToView')}
          </p>
          <Link
            href="/account/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan text-black font-medium rounded-xl"
          >
            {t('signIn')}
          </Link>
        </div>
      </div>
    )
  }

  // Loading
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mx-auto mb-4" />
          <p className="text-white/60">{t('loadingCodes')}</p>
        </div>
      </div>
    )
  }

  // Error
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="px-4 py-4 max-w-2xl mx-auto">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t('back')}</span>
          </Link>
        </div>

        <div className="px-4 py-12 max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-display text-2xl text-white mb-2">{t('somethingWrong')}</h1>
          <p className="text-white/60 mb-6">
            {t('loadError')}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan text-black font-medium rounded-xl"
          >
            {t('tryAgain')}
          </button>
        </div>
      </div>
    )
  }

  // Ready
  return (
    <div className="min-h-screen bg-bg-primary pb-8">
      {/* Header */}
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </Link>
      </div>

      <div className="px-4 max-w-2xl mx-auto">
        {/* Title */}
        <div className="mb-6">
          <h1 className="font-display text-2xl md:text-3xl text-white mb-1">{t('myRedemptionCodes')}</h1>
          <p className="text-white/60 text-sm">
            {t('codesTotal', { count: codes.length })}
          </p>
        </div>

        {/* Empty state */}
        {codes.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <Ticket className="w-8 h-8 text-white/30" />
            </div>
            <h2 className="font-display text-xl text-white mb-2">{t('noCodesYet')}</h2>
            <p className="text-white/60 mb-6">
              {t('noCodesDescription')}
            </p>
            <Link
              href="/gacha"
              className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan text-black font-medium rounded-xl"
            >
              <Package className="w-5 h-5" />
              {t('browseMysteryBoxes')}
            </Link>
          </div>
        )}

        {/* Codes list */}
        {codes.length > 0 && (
          <div className="space-y-4">
            {codes.map((code) => {
              const statusConfig = STATUS_CONFIG[code.status]
              const rarityConfig = code.revealedRarity ? RARITY_CONFIG[code.revealedRarity] : null
              const rarityStyles = code.revealedRarity ? getRarityStyles(code.revealedRarity) : null

              return (
                <div
                  key={code.id}
                  className={cn(
                    'bg-bg-card border rounded-xl overflow-hidden',
                    rarityStyles ? rarityStyles.borderColor : 'border-border-subtle'
                  )}
                >
                  {/* Code header */}
                  <div className="p-4 border-b border-white/5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {/* Code */}
                        <div className="font-mono text-lg text-white">{code.code}</div>
                        <button
                          onClick={() => handleCopyCode(code.code)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                          title="Copy code"
                        >
                          {copiedCode === code.code ? (
                            <Check className="w-4 h-4 text-neon-green" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                          )}
                        </button>
                      </div>

                      {/* Status badge */}
                      <div
                        className={cn(
                          'px-3 py-1 rounded-full text-xs font-medium',
                          statusConfig.bgColor,
                          statusConfig.color
                        )}
                      >
                        {statusLabels[code.status]}
                      </div>
                    </div>

                    {/* Box info */}
                    <p className="text-white/40 text-sm mt-1">
                      {code.boxHandle.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </p>
                  </div>

                  {/* Revealed item (if applicable) */}
                  {code.revealedRarity && code.revealedProductHandle && rarityConfig && (
                    <div className={cn('px-4 py-3', rarityStyles?.bgColor)}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded"
                          style={{ backgroundColor: rarityConfig.color }}
                        />
                        <span
                          className="text-sm font-medium"
                          style={{ color: rarityConfig.color }}
                        >
                          {rarityConfig.displayName}
                        </span>
                        <span className="text-white/60 text-sm">
                          - {code.revealedProductHandle.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Action */}
                  <div className="px-4 py-3 bg-white/[0.02] flex items-center justify-between">
                    <span className="text-white/40 text-xs">
                      {code.purchaseOrderName && `Order ${code.purchaseOrderName}`}
                    </span>
                    {getActionButton(code)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Redeem another code */}
        <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/10">
          <h3 className="text-white font-medium mb-2">{t('haveCode')}</h3>
          <p className="text-white/60 text-sm mb-4">
            {t('haveCodeDescription')}
          </p>
          <Link
            href="/gacha/reveal"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 text-white font-medium rounded-lg text-sm hover:bg-white/20 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            {t('enterCode')}
          </Link>
        </div>
      </div>
    </div>
  )
}
