'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'
import { ProductGallery } from '@/components/product/ProductGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { Badge } from '@/components/ui/Badge'
import type { ShopifyMoney, ShopifySelectedOption } from '@/types/shopify'

interface ProductVariant {
  id: string
  title: string
  availableForSale: boolean
  price: ShopifyMoney
  compareAtPrice?: ShopifyMoney | null
  selectedOptions: ShopifySelectedOption[]
}

interface ProductImage {
  url: string
  altText: string | null
}

interface ProductDetailClientProps {
  universe: string
  product: {
    id: string
    handle: string
    title: string
    description: string
    descriptionHtml: string
    priceRange: {
      minVariantPrice: ShopifyMoney
    }
    compareAtPriceRange?: {
      minVariantPrice: ShopifyMoney
    } | null
    images: ProductImage[]
    variants: ProductVariant[]
    rarity: 'common' | 'rare' | 'legendary' | null
    personalization: boolean
  }
}

export function ProductDetailClient({ universe, product }: ProductDetailClientProps) {
  const config = UNIVERSE_CONFIG[universe as keyof typeof UNIVERSE_CONFIG]
  const themeColor = config?.color || '#00f5ff'
  const universeName = config?.name || universe.replace(/-/g, ' ')

  // Extract unique options
  const options = useMemo(() => {
    const optionMap = new Map<string, Set<string>>()

    product.variants.forEach((variant) => {
      variant.selectedOptions.forEach((option) => {
        if (!optionMap.has(option.name)) {
          optionMap.set(option.name, new Set())
        }
        optionMap.get(option.name)!.add(option.value)
      })
    })

    return Array.from(optionMap.entries()).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }))
  }, [product.variants])

  // Selected options state
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    const firstAvailable = product.variants.find((v) => v.availableForSale)
    if (firstAvailable) {
      firstAvailable.selectedOptions.forEach((opt) => {
        initial[opt.name] = opt.value
      })
    } else if (product.variants[0]) {
      product.variants[0].selectedOptions.forEach((opt) => {
        initial[opt.name] = opt.value
      })
    }
    return initial
  })

  // Quantity state
  const [quantity, setQuantity] = useState(1)

  // Personalization state
  const [personalizationName, setPersonalizationName] = useState('')

  // Find selected variant
  const selectedVariant = useMemo(() => {
    return product.variants.find((variant) =>
      variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name] === opt.value
      )
    )
  }, [product.variants, selectedOptions])

  const handleOptionChange = (name: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [name]: value }))
  }

  const hasDiscount =
    product.compareAtPriceRange &&
    parseFloat(product.compareAtPriceRange.minVariantPrice.amount) >
      parseFloat(product.priceRange.minVariantPrice.amount)

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Background glow */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[150px] opacity-10 pointer-events-none"
        style={{ backgroundColor: themeColor }}
      />

      <div className="relative px-4 py-6 max-w-7xl mx-auto w-full">
        {/* Back link */}
        <Link
          href={`/worlds/${universe}`}
          className={cn(
            'inline-flex items-center gap-2 mb-6',
            'text-white/50 hover:text-white',
            'transition-colors duration-200'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to {universeName}</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 w-full overflow-hidden">
          {/* Gallery */}
          <div className="w-full min-w-0">
            <ProductGallery
              images={product.images}
              productTitle={product.title}
            />
          </div>

          {/* Product Info */}
          <div className="space-y-6 w-full min-w-0">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge
                variant={config?.colorName === 'cyan' ? 'cyan' : config?.colorName === 'pink' ? 'pink' : config?.colorName === 'orange' ? 'orange' : 'green'}
              >
                {universeName}
              </Badge>
              {product.rarity && product.rarity !== 'common' && (
                <Badge variant={product.rarity === 'legendary' ? 'yellow' : 'purple'}>
                  {product.rarity}
                </Badge>
              )}
              {hasDiscount && (
                <Badge variant="pink">SALE</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide">
              {product.title}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-2xl md:text-3xl font-mono font-bold"
                style={{ color: themeColor }}
              >
                {formatPrice(
                  selectedVariant?.price.amount || product.priceRange.minVariantPrice.amount,
                  selectedVariant?.price.currencyCode || product.priceRange.minVariantPrice.currencyCode
                )}
              </span>
              {hasDiscount && (
                <span className="text-lg font-mono text-white/40 line-through">
                  {formatPrice(
                    product.compareAtPriceRange!.minVariantPrice.amount,
                    product.compareAtPriceRange!.minVariantPrice.currencyCode
                  )}
                </span>
              )}
            </div>

            {/* Variant Selector */}
            {options.length > 0 && (
              <VariantSelector
                options={options}
                variants={product.variants}
                selectedOptions={selectedOptions}
                onOptionChange={handleOptionChange}
              />
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Quantity
              </label>
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                min={1}
                max={10}
              />
            </div>

            {/* Personalization */}
            {product.personalization && (
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Personalization Name
                </label>
                <input
                  type="text"
                  value={personalizationName}
                  onChange={(e) => setPersonalizationName(e.target.value)}
                  placeholder="Enter name for personalization"
                  className="w-full px-4 py-3 bg-black/80 border border-border-subtle rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-neon-cyan transition-colors"
                />
                <p className="mt-1 text-xs text-white/50">
                  This name will be added to your custom item
                </p>
              </div>
            )}

            {/* Add to Cart */}
            <div className="pt-4">
              <AddToCartButton
                variantId={selectedVariant?.id || ''}
                quantity={quantity}
                available={selectedVariant?.availableForSale ?? false}
                attributes={
                  product.personalization && personalizationName.trim()
                    ? [{ key: 'Personalization', value: personalizationName.trim() }]
                    : undefined
                }
              />
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-border-subtle">
              <h2 className="font-display text-lg text-white mb-3">Description</h2>
              <div
                className="prose prose-invert prose-sm max-w-none text-white [&_*]:!bg-transparent [&_*]:!text-inherit"
                dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
