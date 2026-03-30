'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Box, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'
import { ProductGallery } from '@/components/product/ProductGallery'
import type { ProductGalleryHandle } from '@/components/product/ProductGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { QuantitySelector } from '@/components/product/QuantitySelector'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { WishlistButton } from '@/components/product/WishlistButton'
import { Badge } from '@/components/ui/Badge'
import { StockIndicator } from '@/components/product/StockIndicator'
import { ShareButtons } from '@/components/product/ShareButtons'
import { SizeGuideButton } from '@/components/product/SizeGuideButton'
import { SizeGuideModal } from '@/components/product/SizeGuideModal'
import { ReviewSummary } from '@/components/product/ReviewSummary'
import { StickyAddToCart } from '@/components/product/StickyAddToCart'
import { useTrackProductView } from '@/hooks/useTrackProductView'
import { getSizeGuide } from '@/data/sizeGuides'
import { getProductHighlights } from '@/data/productHighlights'
import { getPreviewConfig, getVariantImages } from '@/lib/preview'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'
import type { ShopifyMoney, ShopifySelectedOption } from '@/types/shopify'
import type { ReviewRating } from '@/types/reviews'
import { sanitizeHtml } from '@/lib/utils/sanitizeHtml'

interface ProductVariant {
  id: string
  title: string
  availableForSale: boolean
  quantityAvailable?: number | null
  price: ShopifyMoney
  compareAtPrice?: ShopifyMoney | null
  selectedOptions: ShopifySelectedOption[]
  image?: { url: string; altText: string | null } | null
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
    productType?: string
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
    rating?: ReviewRating | null
  }
}

export function ProductDetailClient({ universe, product }: ProductDetailClientProps) {
  const t = useTranslations('product')
  const tCommon = useTranslations('common')
  const searchParams = useSearchParams()
  const variantParam = searchParams.get('variant')
  const config = UNIVERSE_CONFIG[universe as keyof typeof UNIVERSE_CONFIG]
  const themeColor = config?.color || '#00f5ff'
  const universeName = config?.name || universe.replace(/-/g, ' ')

  // Size guide modal state
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState(false)
  const [isHighlightsOpen, setIsHighlightsOpen] = useState(true)
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(true)
  const [isShippingOpen, setIsShippingOpen] = useState(false)
  const [isReturnsOpen, setIsReturnsOpen] = useState(false)
  const [isShareOpen, setIsShareOpen] = useState(false)

  // Extract unique options — skip Shopify's default "Title: Default Title"
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

    return Array.from(optionMap.entries())
      .filter(([name, values]) => {
        // Hide the default variant that Shopify creates for products without real variants
        if (name === 'Title' && values.size === 1 && values.has('Default Title')) return false
        return true
      })
      .map(([name, values]) => ({
        name,
        values: Array.from(values),
      }))
  }, [product.variants])

  // Get size guide based on product type
  const sizeGuide = useMemo(() => {
    return getSizeGuide(product.productType || '')
  }, [product.productType])

  // Get 3D preview config for this product
  const previewConfig = useMemo(() => {
    return getPreviewConfig(product.handle)
  }, [product.handle])

  // Selected options state — prefer variant from URL param (e.g., ?variant=Zoro)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}

    // Try to match variant from URL param (exact title or color option value)
    const variantFromUrl = variantParam
      ? product.variants.find((v) => v.title === variantParam)
        ?? product.variants.find((v) =>
          v.availableForSale &&
          v.selectedOptions.some((opt) => opt.value === variantParam)
        )
      : null

    const target = variantFromUrl
      || product.variants.find((v) => v.availableForSale)
      || product.variants[0]

    if (target) {
      target.selectedOptions.forEach((opt) => {
        initial[opt.name] = opt.value
      })
    }
    return initial
  })

  // Quantity state
  const [quantity, setQuantity] = useState(1)

  // Ref for sticky add-to-cart IntersectionObserver
  const cartButtonRef = useRef<HTMLDivElement>(null)

  // Product highlights for "What You Get" section
  const highlights = useMemo(() => getProductHighlights(product.handle), [product.handle])

  // Gallery ref for programmatic 3D navigation
  const galleryRef = useRef<ProductGalleryHandle>(null)

  // Personalization state
  const [personalizationName, setPersonalizationName] = useState('')
  const personalizationInputRef = useRef<HTMLInputElement>(null)

  const handlePersonalizationError = () => {
    personalizationInputRef.current?.focus()
    personalizationInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // Track product view for recently viewed feature
  useTrackProductView({
    productId: product.id,
    handle: product.handle,
    title: product.title,
    price: product.priceRange.minVariantPrice,
    compareAtPrice: product.compareAtPriceRange?.minVariantPrice,
    image: product.images[0] || null,
    universe,
    variantId: product.variants[0]?.id,
  })

  // Find selected variant
  const selectedVariant = useMemo(() => {
    return product.variants.find((variant) =>
      variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name] === opt.value
      )
    )
  }, [product.variants, selectedOptions])

  // Compute initial gallery image index from URL variant's image
  const initialImageIndex = useMemo(() => {
    if (!variantParam) return 0
    const variantFromUrl = product.variants.find((v) => v.title === variantParam)
      ?? product.variants.find((v) => v.selectedOptions.some((opt) => opt.value === variantParam))
    if (!variantFromUrl?.image?.url) return 0
    const idx = product.images.findIndex((img) =>
      img.url.split('?')[0] === variantFromUrl.image!.url.split('?')[0]
    )
    return idx >= 0 ? idx : 0
  }, [variantParam, product.variants, product.images])

  // Jump gallery to the selected variant's image when options change
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (selectedVariant?.image?.url) {
      const idx = product.images.findIndex((img) =>
        img.url.split('?')[0] === selectedVariant.image!.url.split('?')[0]
      )
      if (idx >= 0) {
        galleryRef.current?.goToIndex(idx)
      }
    }
  }, [selectedVariant, product.images])

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
          <span className="text-sm">{t('backTo', { name: universeName })}</span>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 w-full overflow-hidden">
          {/* Gallery */}
          <div className="w-full min-w-0">
            <ProductGallery
              ref={galleryRef}
              images={product.images}
              productTitle={product.title}
              initialImageIndex={initialImageIndex}
              previewConfig={previewConfig}
              previewText={personalizationName}
              selectedVariantName={selectedOptions['Color'] || selectedOptions['color'] || ''}
              onPreviewTextChange={product.personalization ? setPersonalizationName : undefined}
              canvasCart={previewConfig ? {
                variantId: selectedVariant?.id || '',
                quantity,
                available: selectedVariant?.availableForSale ?? false,
                requiresPersonalization: product.personalization,
                personalizationValue: personalizationName,
                onPersonalizationError: handlePersonalizationError,
                attributes: product.personalization && personalizationName.trim()
                  ? [{ key: 'Personalization', value: personalizationName.trim() }]
                  : undefined,
              } : undefined}
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
                <Badge variant="pink">{tCommon('sale').toUpperCase()}</Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide">
              {product.title}
            </h1>

            {/* Reviews/Rating */}
            {product.rating && product.rating.reviewCount > 0 && (
              <a href="#reviews" className="block w-fit hover:opacity-80 transition-opacity">
                <ReviewSummary rating={product.rating} size="md" />
              </a>
            )}

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

            {/* Size Guide Button - only for apparel (not personalizable/3D products) */}
            {!previewConfig && (
              <div className="flex justify-end">
                <SizeGuideButton onClick={() => setIsSizeGuideOpen(true)} />
              </div>
            )}

            {/* Variant Selector — hide Shopify's default "Title" option for single-variant products */}
            {options.length > 0 &&
              !(options.length === 1 && options[0]?.name === 'Title' && options[0]?.values.length === 1 && options[0]?.values[0] === 'Default Title') && (
              <div className="space-y-3">
                <VariantSelector
                  options={options}
                  variants={product.variants}
                  selectedOptions={selectedOptions}
                  onOptionChange={handleOptionChange}
                  optionImages={getVariantImages(product.handle)}
                  imageOptionName={getVariantImages(product.handle) ? 'Color' : undefined}
                />
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                {t('quantity')}
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
                  {t('personalizationName')} <span className="text-neon-pink">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    ref={personalizationInputRef}
                    type="text"
                    value={personalizationName}
                    onChange={(e) => setPersonalizationName(previewConfig ? getPreviewDisplayText(e.target.value, previewConfig, '') : e.target.value)}
                    placeholder={t('personalizationPlaceholder')}
                    className={cn(
                      'flex-1 min-w-0 px-4 py-3 bg-black/80 border rounded-lg text-white placeholder-white/40 focus:outline-none transition-colors',
                      personalizationName.trim()
                        ? 'border-neon-green/50 focus:border-neon-green'
                        : 'border-border-subtle focus:border-neon-cyan'
                    )}
                  />
                  {previewConfig && (
                    <button
                      type="button"
                      onClick={() => galleryRef.current?.goTo3D()}
                      className={cn(
                        'flex-shrink-0 flex items-center gap-1.5 px-3 py-3 rounded-lg',
                        'bg-neon-cyan/10 border border-neon-cyan/30',
                        'text-neon-cyan text-sm font-medium',
                        'hover:bg-neon-cyan/20 hover:border-neon-cyan/50',
                        'transition-colors'
                      )}
                    >
                      <Box className="w-4 h-4" />
                      3D
                    </button>
                  )}
                </div>
                <p className="mt-1 text-xs text-white/50">
                  {t('personalizationHint')}
                </p>
              </div>
            )}

            {/* Stock Indicator (hidden for personalized products) */}
            {selectedVariant && !product.personalization && (
              <StockIndicator
                availableForSale={selectedVariant.availableForSale}
                quantityAvailable={selectedVariant.quantityAvailable}
              />
            )}

            {/* Add to Cart & Wishlist */}
            <div ref={cartButtonRef} className="pt-4 flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <AddToCartButton
                  variantId={selectedVariant?.id || ''}
                  quantity={quantity}
                  available={selectedVariant?.availableForSale ?? false}
                  requiresPersonalization={product.personalization}
                  personalizationValue={personalizationName}
                  onPersonalizationError={handlePersonalizationError}
                  attributes={
                    product.personalization && personalizationName.trim()
                      ? [{ key: 'Personalization', value: personalizationName.trim() }]
                      : undefined
                  }
                />
              </div>
              <WishlistButton
                product={{
                  productId: product.id,
                  variantId: selectedVariant?.id || '',
                  handle: product.handle,
                  title: product.title,
                  price: selectedVariant?.price || product.priceRange.minVariantPrice,
                  compareAtPrice: selectedVariant?.compareAtPrice || product.compareAtPriceRange?.minVariantPrice,
                  image: product.images[0] || null,
                  universe,
                }}
                variant="button"
                size="lg"
              />
            </div>

            {/* What You Get (collapsible) — only if highlights exist */}
            {highlights && (
              <div className="pt-6 border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsHighlightsOpen(!isHighlightsOpen)}
                  aria-expanded={isHighlightsOpen}
                  className="w-full flex items-center justify-between py-1 group"
                >
                  <h2 className="font-display text-lg text-white">{t('whatYouGet')}</h2>
                  <ChevronDown className={cn(
                    'w-5 h-5 text-white/50 transition-transform duration-300',
                    isHighlightsOpen && 'rotate-180'
                  )} />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isHighlightsOpen ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                  )}
                >
                  <ul className="space-y-2.5">
                    {highlights.map((highlight) => {
                      const Icon = highlight.icon
                      return (
                        <li key={highlight.textKey} className="flex items-start gap-3">
                          <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: themeColor }} />
                          <span className="text-sm text-white/70">{t(highlight.textKey)}</span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            )}

            {/* Description (collapsible) */}
            <div className="pt-6 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                aria-expanded={isDescriptionOpen}
                className="w-full flex items-center justify-between py-1 group"
              >
                <h2 className="font-display text-lg text-white">{t('description')}</h2>
                <ChevronDown className={cn(
                  'w-5 h-5 text-white/50 transition-transform duration-300',
                  isDescriptionOpen && 'rotate-180'
                )} />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  isDescriptionOpen ? 'max-h-[500px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                )}
              >
                <div
                  className="prose prose-invert prose-sm max-w-none text-white [&_*]:!bg-transparent [&_*]:!text-inherit"
                  dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.descriptionHtml) }}
                />
              </div>
            </div>

            {/* Shipping */}
            <div className="border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsShippingOpen(!isShippingOpen)}
                aria-expanded={isShippingOpen}
                className="w-full flex items-center justify-between py-4 group"
              >
                <h2 className="font-display text-lg text-white">{t('shippingTitle')}</h2>
                <ChevronDown className={cn(
                  'w-5 h-5 text-white/50 transition-transform duration-300',
                  isShippingOpen && 'rotate-180'
                )} />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  isShippingOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
                )}
              >
                <div className="space-y-2 text-sm text-white/60">
                  <p>{t('shippingProcessing')}</p>
                  <p>{t('shippingEurope')}</p>
                  <p>{t('shippingUK')}</p>
                  <p>{t('shippingCanada')}</p>
                  <p>{t('shippingAustralia')}</p>
                  <p className="text-white/40 text-xs pt-1">{t('shippingCustoms')}</p>
                </div>
              </div>
            </div>

            {/* Returns & Exchanges */}
            <div className="border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsReturnsOpen(!isReturnsOpen)}
                aria-expanded={isReturnsOpen}
                className="w-full flex items-center justify-between py-4 group"
              >
                <h2 className="font-display text-lg text-white">{t('returnsTitle')}</h2>
                <ChevronDown className={cn(
                  'w-5 h-5 text-white/50 transition-transform duration-300',
                  isReturnsOpen && 'rotate-180'
                )} />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  isReturnsOpen ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
                )}
              >
                <div className="space-y-2 text-sm text-white/60">
                  <p>{t('returnsPolicy')}</p>
                  <p>{t('returnsExchanges')}</p>
                  <p>{t('returnsRefund')}</p>
                  <p className="text-white/40 text-xs pt-1">{t('returnsFinalSale')}</p>
                </div>
              </div>
            </div>

            {/* Share */}
            <div className="border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setIsShareOpen(!isShareOpen)}
                aria-expanded={isShareOpen}
                className="w-full flex items-center justify-between py-4 group"
              >
                <h2 className="font-display text-lg text-white">{t('share')}</h2>
                <ChevronDown className={cn(
                  'w-5 h-5 text-white/50 transition-transform duration-300',
                  isShareOpen && 'rotate-180'
                )} />
              </button>
              <div
                className={cn(
                  'overflow-hidden transition-all duration-300',
                  isShareOpen ? 'max-h-[200px] opacity-100 pb-4' : 'max-h-0 opacity-0'
                )}
              >
                <ShareButtons
                  title={product.title}
                  handle={product.handle}
                  universe={universe}
                  image={product.images[0]?.url}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        sizeGuide={sizeGuide}
      />

      {/* Sticky Mobile Add-to-Cart */}
      <StickyAddToCart
        productTitle={product.title}
        price={selectedVariant?.price || product.priceRange.minVariantPrice}
        variantId={selectedVariant?.id || ''}
        available={selectedVariant?.availableForSale ?? false}
        requiresPersonalization={product.personalization}
        personalizationValue={personalizationName}
        onPersonalizationError={handlePersonalizationError}
        attributes={
          product.personalization && personalizationName.trim()
            ? [{ key: 'Personalization', value: personalizationName.trim() }]
            : undefined
        }
        quantity={quantity}
        cartButtonRef={cartButtonRef}
      />
    </div>
  )
}
