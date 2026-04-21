'use client'

import { useTranslations } from 'next-intl'
import { Truck, Lock, Gem, Globe, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useLocaleStore } from '@/stores/localeStore'
import { getFreeShippingThreshold } from '@/lib/shipping/freeShippingThreshold'

interface TrustBadgesProps {
  accent: string
  className?: string
}

export function TrustBadges({ accent, className }: TrustBadgesProps) {
  const t = useTranslations('product.trustBadges')
  const currency = useLocaleStore((s) => s.currency)
  const { display: shippingThreshold } = getFreeShippingThreshold(currency)

  const badges: { icon: LucideIcon; title: string; sub: string }[] = [
    {
      icon: Truck,
      title: t('freeShippingTitle'),
      sub: t('freeShippingSub', { threshold: shippingThreshold }),
    },
    { icon: Lock, title: t('securePaymentsTitle'), sub: t('securePaymentsSub') },
    { icon: Gem, title: t('uniquePieceTitle'), sub: t('uniquePieceSub') },
    { icon: Globe, title: t('shipsWorldwideTitle'), sub: t('shipsWorldwideSub') },
  ]

  return (
    <div className={cn('grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4', className)}>
      {badges.map(({ icon: Icon, title, sub }) => (
        <div
          key={title}
          className="flex items-center gap-3 rounded-md border border-border-subtle bg-bg-card p-3"
        >
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-border-subtle"
            style={{ color: accent }}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[12px] leading-tight text-white">
              {title}
            </div>
            <div className="mt-0.5 font-mono text-[10px] uppercase tracking-wider text-white/45 leading-snug">
              {sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
