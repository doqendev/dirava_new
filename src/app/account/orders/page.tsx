'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Package, Loader2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useTranslations, useLocale } from 'next-intl'
import { AccountLayout } from '@/components/account/AccountLayout'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { formatPrice } from '@/lib/utils/formatPrice'
import { cn } from '@/lib/utils/cn'
import type { ShopifyOrder } from '@/types/customer'

const statusColors: Record<string, string> = {
  PAID: 'bg-neon-green/20 text-neon-green',
  PENDING: 'bg-neon-orange/20 text-neon-orange',
  REFUNDED: 'bg-neon-pink/20 text-neon-pink',
  PARTIALLY_REFUNDED: 'bg-neon-orange/20 text-neon-orange',
  UNFULFILLED: 'bg-white/20 text-white',
  FULFILLED: 'bg-neon-green/20 text-neon-green',
  PARTIALLY_FULFILLED: 'bg-neon-cyan/20 text-neon-cyan',
}

const statusTranslationMap: Record<string, string> = {
  PAID: 'paid',
  PENDING: 'pending',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partiallyRefunded',
  UNFULFILLED: 'unfulfilled',
  FULFILLED: 'fulfilled',
  PARTIALLY_FULFILLED: 'partiallyFulfilled',
}

export default function OrdersPage() {
  const t = useTranslations('orderHistory')
  const locale = useLocale()
  const { isAuthenticated } = useRequireAuth()
  const [orders, setOrders] = useState<ShopifyOrder[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchOrders() {
      if (!isAuthenticated) {
        return
      }

      try {
        const response = await fetch('/api/account/orders', {
          cache: 'no-store',
        })
        const data = (await response.json()) as {
          success: boolean
          orders?: ShopifyOrder[]
        }

        if (response.ok && data.success && data.orders) {
          setOrders(data.orders)
        }
      } catch (error) {
        console.error('Failed to fetch orders:', error)
      } finally {
        setIsLoading(false)
      }
    }

    void fetchOrders()
  }, [isAuthenticated])

  return (
    <AccountLayout title={t('title')} description={t('description')}>
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-white/30" />
          </div>
          <h2 className="font-display text-xl text-white mb-2">{t('noOrders')}</h2>
          <p className="text-white/60 mb-6">
            {t('noOrdersDescription')}
          </p>
          <Link
            href="/worlds"
            className="inline-flex items-center justify-center px-6 py-3 bg-neon-cyan text-black font-display font-semibold uppercase tracking-wider rounded-lg hover:bg-[color:var(--accent,#00f5ff)]/90 transition-colors"
          >
            {t('browseProducts')}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${encodeURIComponent(btoa(order.id))}`}
              className="block bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl overflow-hidden hover:border-[color:var(--accent,#00f5ff)]/50 transition-colors"
            >
              {/* Order Header */}
              <div className="px-4 py-3 border-b border-border-subtle flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-neon-cyan" />
                  <span className="font-mono text-white">{order.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium uppercase',
                      statusColors[order.financialStatus] || 'bg-white/10 text-white'
                    )}
                  >
                    {t(statusTranslationMap[order.financialStatus] || 'unknown')}
                  </span>
                  <span
                    className={cn(
                      'px-2 py-1 rounded text-xs font-medium uppercase',
                      statusColors[order.fulfillmentStatus] || 'bg-white/10 text-white'
                    )}
                  >
                    {t(statusTranslationMap[order.fulfillmentStatus] || 'unknown')}
                  </span>
                </div>
              </div>

              {/* Order Items Preview */}
              <div className="p-4">
                <div className="flex flex-wrap gap-3 mb-4">
                  {order.lineItems.edges.slice(0, 4).map(({ node: item }, index) => (
                    <div
                      key={index}
                      className="w-16 h-16 rounded-lg bg-bg-secondary overflow-hidden relative"
                    >
                      {item.variant?.image ? (
                        <Image
                          src={item.variant.image.url}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-6 h-6 text-white/30" />
                        </div>
                      )}
                      {item.quantity > 1 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-neon-cyan text-black text-xs font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      )}
                    </div>
                  ))}
                  {order.lineItems.edges.length > 4 && (
                    <div className="w-16 h-16 rounded-lg bg-bg-secondary flex items-center justify-center">
                      <span className="text-white/50 text-sm">
                        +{order.lineItems.edges.length - 4}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/50">
                      {new Date(order.processedAt).toLocaleDateString(locale, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="font-mono text-neon-cyan">
                      {formatPrice(order.totalPrice.amount, order.totalPrice.currencyCode)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-neon-cyan text-sm font-medium">
                    {t('viewDetails')}
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AccountLayout>
  )
}
