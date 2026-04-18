'use client'

import Link from 'next/link'
import { Package, MapPin, Settings, ArrowRight } from 'lucide-react'
import { AccountLayout } from '@/components/account/AccountLayout'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { cn } from '@/lib/utils/cn'
import { useTranslations } from 'next-intl'

export default function DashboardPage() {
  const { customer } = useRequireAuth()
  const t = useTranslations('account')

  const quickLinks = [
    {
      href: '/account/orders',
      icon: Package,
      label: t('viewOrders'),
      description: t('viewOrdersDescription'),
    },
    {
      href: '/account/addresses',
      icon: MapPin,
      label: t('manageAddresses'),
      description: t('manageAddressesDescription'),
    },
    {
      href: '/account/settings',
      icon: Settings,
      label: t('accountSettings'),
      description: t('accountSettingsDescription'),
    },
  ]

  return (
    <AccountLayout title={t('dashboard')} description={t('dashboardDescription')}>
      {/* Welcome Card */}
      <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6 mb-6">
        <h2 className="font-display text-xl text-white">
          {t('welcomeBack', { name: customer?.firstName || 'there' })}
        </h2>
      </div>

      {/* Quick Links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {quickLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'group bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-5',
              'transition-all duration-200',
              'hover:border-neon-cyan/50 hover:shadow-glow-sm-cyan'
            )}
          >
            <div className="w-12 h-12 rounded-lg bg-bg-secondary flex items-center justify-center mb-4">
              <link.icon className="w-6 h-6 text-neon-cyan" />
            </div>
            <h3 className="font-medium text-white flex items-center gap-2">
              {link.label}
              <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </h3>
            <p className="text-sm text-white/50 mt-1">{link.description}</p>
          </Link>
        ))}
      </div>

      {/* Account Summary */}
      <div className="mt-8 bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
        <h3 className="font-display text-lg text-white mb-4">{t('accountDetails')}</h3>
        <dl className="grid sm:grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-white/50">{t('name')}</dt>
            <dd className="text-white">
              {customer?.firstName} {customer?.lastName}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-white/50">{t('email')}</dt>
            <dd className="text-white">{customer?.email}</dd>
          </div>
          {customer?.phone && (
            <div>
              <dt className="text-sm text-white/50">{t('phone')}</dt>
              <dd className="text-white">{customer.phone}</dd>
            </div>
          )}
          {customer?.defaultAddress && (
            <div className="sm:col-span-2">
              <dt className="text-sm text-white/50">{t('defaultAddress')}</dt>
              <dd className="text-white">
                {customer.defaultAddress.formatted.join(', ')}
              </dd>
            </div>
          )}
        </dl>
      </div>
    </AccountLayout>
  )
}
