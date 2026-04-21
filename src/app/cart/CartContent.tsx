'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { Button } from '@/components/ui/Button'
import { DiscountCodeInput } from '@/components/cart/DiscountCodeInput'
import { useCartStore } from '@/stores/cartStore'

export default function CartContent() {
  const t = useTranslations('cart')
  const tDiscount = useTranslations('discount')
  const { lines, totalQuantity, subtotal, total, discountAmount, checkoutUrl, updateItem, removeItem, loadingItems } =
    useCartStore()

  if (lines.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-bg-secondary flex items-center justify-center mb-6">
            <ShoppingBag className="w-10 h-10 text-white/30" />
          </div>
          <h1 className="font-display text-2xl text-white mb-2">{t('empty')}</h1>
          <p className="text-white/60 mb-8">
            {t('emptyExplore')}
          </p>
          <Button as="a" href="/" variant="primary" glow="cyan">
            {t('startShopping')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="py-6 border-b border-border-subtle">
        <div className="px-4 max-w-4xl mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">{t('continueShopping')}</span>
          </Link>

          <h1 className="font-display text-2xl md:text-3xl text-white">
            {t('yourCart')} <span className="text-neon-cyan">{t('cartHighlight')}</span>
            <span className="ml-2 text-white/50">({totalQuantity})</span>
          </h1>
        </div>
      </section>

      {/* Cart Items */}
      <section className="py-6">
        <div className="px-4 max-w-4xl mx-auto">
          <div className="space-y-4">
            {lines.map((line) => (
              <div
                key={line.id}
                className="flex gap-4 p-4 bg-bg-card rounded-xl border border-border-subtle"
              >
                {/* Product Image */}
                <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-bg-secondary">
                  {line.merchandise.product.featuredImage && (
                    <Image
                      src={line.merchandise.product.featuredImage.url}
                      alt={
                        line.merchandise.product.featuredImage.altText ||
                        line.merchandise.product.title
                      }
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${line.merchandise.product.handle}`}
                    className="font-medium text-white hover:text-[color:var(--accent,#00f5ff)] transition-colors line-clamp-2"
                  >
                    {line.merchandise.product.title}
                  </Link>

                  {line.merchandise.title !== 'Default Title' && (
                    <p className="text-sm text-white/50 mt-1">
                      {line.merchandise.title}
                    </p>
                  )}

                  <p className="mt-2 font-mono text-neon-cyan">
                    {formatPrice(
                      line.merchandise.price.amount,
                      line.merchandise.price.currencyCode
                    )}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center border border-border-subtle rounded-lg">
                      <button
                        onClick={() =>
                          updateItem(line.id, Math.max(0, line.quantity - 1))
                        }
                        disabled={loadingItems.has(line.id)}
                        className={cn(
                          'w-10 h-10 flex items-center justify-center',
                          'text-white/50 hover:text-white',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'transition-colors'
                        )}
                        aria-label={t('decreaseQuantity')}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center font-mono">
                        {line.quantity}
                      </span>
                      <button
                        onClick={() => updateItem(line.id, line.quantity + 1)}
                        disabled={loadingItems.has(line.id)}
                        className={cn(
                          'w-10 h-10 flex items-center justify-center',
                          'text-white/50 hover:text-white',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'transition-colors'
                        )}
                        aria-label={t('increaseQuantity')}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-white">
                        {formatPrice(
                          parseFloat(line.merchandise.price.amount) * line.quantity,
                          line.merchandise.price.currencyCode
                        )}
                      </span>
                      <button
                        onClick={() => removeItem(line.id)}
                        disabled={loadingItems.has(line.id)}
                        className={cn(
                          'w-10 h-10 flex items-center justify-center rounded-lg',
                          'text-white/30 hover:text-red-500 hover:bg-red-500/10',
                          'disabled:opacity-50 disabled:cursor-not-allowed',
                          'transition-colors'
                        )}
                        aria-label={t('removeItem')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="py-6 border-t border-border-subtle">
        <div className="px-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <DiscountCodeInput />
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-lg text-white/70">{t('subtotal')}</span>
              <span className="text-xl font-mono text-white">
                {subtotal
                  ? formatPrice(subtotal.amount, subtotal.currencyCode)
                  : '$0.00'}
              </span>
            </div>

            {discountAmount && parseFloat(discountAmount.amount) > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-lg text-neon-green">{tDiscount('discount')}</span>
                <span className="text-xl font-mono text-neon-green">
                  -{formatPrice(discountAmount.amount, discountAmount.currencyCode)}
                </span>
              </div>
            )}

            {total && (
              <div className="flex items-center justify-between pt-3 border-t border-border-subtle">
                <span className="text-xl text-white font-medium">{t('total')}</span>
                <span className="text-2xl font-mono text-neon-cyan">
                  {formatPrice(total.amount, total.currencyCode)}
                </span>
              </div>
            )}
          </div>

          <p className="text-sm text-white/50 mb-6">
            {t('shippingTaxesNote')}
          </p>

          <Button
            as="a"
            href={checkoutUrl || '#'}
            variant="primary"
            glow="cyan"
            size="lg"
            className="w-full"
            disabled={!checkoutUrl}
          >
            {t('proceedToCheckout')}
          </Button>
        </div>
      </section>
    </div>
  )
}
