'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { ArrowLeft, Package, Loader2, MapPin } from 'lucide-react'
import { AccountLayout } from '@/components/account/AccountLayout'
import { useAuthStore } from '@/stores/authStore'
import { shopifyClient } from '@/lib/shopify/client'
import { GET_ORDER } from '@/lib/shopify/customerQueries'
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

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const t = useTranslations('orderHistory')
  const locale = useLocale()
  const { accessToken } = useAuthStore()
  const [order, setOrder] = useState<ShopifyOrder | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchOrder() {
      if (!accessToken) {
        setIsLoading(false)
        return
      }

      try {
        // Decode the base64 URL param to get the Shopify GID
        const orderId = atob(decodeURIComponent(params.id))

        const response = await shopifyClient.request<{
          node: ShopifyOrder | null
        }>(GET_ORDER, { id: orderId })

        if (response.node) {
          setOrder(response.node)
        } else {
          setError('Order not found')
        }
      } catch (err) {
        console.error('Failed to fetch order:', err)
        setError('Failed to load order details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [accessToken, params.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
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

  const getStatusLabel = (status: string) => {
    const key = statusTranslationMap[status]
    return key ? t(key) : status.replace(/_/g, ' ')
  }

  return (
    <AccountLayout
      title={order ? t('orderDetails') : 'Order Details'}
      description={order ? `Order ${order.name}` : undefined}
    >
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
        </div>
      ) : error || !order ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 rounded-full bg-bg-secondary flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white/30" />
          </div>
          <h2 className="font-display text-xl text-white mb-2">
            {error || 'Order Not Found'}
          </h2>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToOrders')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Back Link */}
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('backToOrders')}
          </Link>

          {/* Order Header */}
          <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl text-white mb-2">
                  {order.name}
                </h2>
                <p className="text-white/60">
                  {t('placed', { date: formatDate(order.processedAt) })}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <div>
                  <p className="text-xs text-white/50 mb-1">{t('payment')}</p>
                  <span
                    className={cn(
                      'px-3 py-1.5 rounded text-xs font-medium uppercase',
                      statusColors[order.financialStatus] || 'bg-white/10 text-white'
                    )}
                  >
                    {getStatusLabel(order.financialStatus)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-white/50 mb-1">{t('fulfillment')}</p>
                  <span
                    className={cn(
                      'px-3 py-1.5 rounded text-xs font-medium uppercase',
                      statusColors[order.fulfillmentStatus] || 'bg-white/10 text-white'
                    )}
                  >
                    {getStatusLabel(order.fulfillmentStatus)}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="font-display text-lg text-white">
                {t('items')} ({order.lineItems.edges.length})
              </h3>
              <div className="space-y-3">
                {order.lineItems.edges.map(({ node: item }, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-3 bg-bg-secondary/50 rounded-lg"
                  >
                    {/* Product Image */}
                    <div className="w-20 h-20 rounded-lg bg-bg-secondary overflow-hidden relative flex-shrink-0">
                      {item.variant?.image ? (
                        <Image
                          src={item.variant.image.url}
                          alt={item.variant.image.altText || item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-8 h-8 text-white/30" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white mb-1 truncate">
                        {item.title}
                      </h4>
                      {item.variant && item.variant.title !== 'Default Title' && (
                        <p className="text-sm text-white/50 mb-1">
                          {item.variant.title}
                        </p>
                      )}
                      <p className="text-sm text-white/60">
                        {t('quantity', { quantity: item.quantity })}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      {item.variant && (
                        <>
                          <p className="font-mono text-white">
                            {formatPrice(
                              item.variant.price.amount,
                              item.variant.price.currencyCode
                            )}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-white/50 mt-1">
                              {formatPrice(
                                (
                                  parseFloat(item.variant.price.amount) * item.quantity
                                ).toString(),
                                item.variant.price.currencyCode
                              )}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Order Summary */}
            <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
              <h3 className="font-display text-lg text-white mb-4">
                {t('summary')}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-white/60">
                  <span>{t('subtotal')}</span>
                  <span className="font-mono">
                    {formatPrice(
                      order.subtotalPrice.amount,
                      order.subtotalPrice.currencyCode
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>{t('shipping')}</span>
                  <span className="font-mono">
                    {formatPrice(
                      order.totalShippingPrice.amount,
                      order.totalShippingPrice.currencyCode
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>{t('tax')}</span>
                  <span className="font-mono">
                    {formatPrice(order.totalTax.amount, order.totalTax.currencyCode)}
                  </span>
                </div>
                <div className="border-t border-border-subtle pt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="font-display text-lg text-white">
                      {t('total')}
                    </span>
                    <span className="font-mono text-xl text-neon-cyan">
                      {formatPrice(
                        order.totalPrice.amount,
                        order.totalPrice.currencyCode
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-neon-cyan" />
                  <h3 className="font-display text-lg text-white">
                    {t('shippingAddress')}
                  </h3>
                </div>
                <address className="not-italic text-white/70 space-y-1">
                  {order.shippingAddress.firstName && order.shippingAddress.lastName && (
                    <p>
                      {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                    </p>
                  )}
                  {order.shippingAddress.company && (
                    <p>{order.shippingAddress.company}</p>
                  )}
                  {order.shippingAddress.address1 && (
                    <p>{order.shippingAddress.address1}</p>
                  )}
                  {order.shippingAddress.address2 && (
                    <p>{order.shippingAddress.address2}</p>
                  )}
                  <p>
                    {[
                      order.shippingAddress.city,
                      order.shippingAddress.province,
                      order.shippingAddress.zip,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {order.shippingAddress.country && (
                    <p>{order.shippingAddress.country}</p>
                  )}
                  {order.shippingAddress.phone && (
                    <p className="pt-2">{order.shippingAddress.phone}</p>
                  )}
                </address>
              </div>
            )}
          </div>
        </div>
      )}
    </AccountLayout>
  )
}
