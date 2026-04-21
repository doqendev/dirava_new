'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, Box, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { UNIVERSE_CONFIG, MAX_PERSONALIZATION_LENGTH } from '@/lib/utils/constants'
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
import { OrderSteps } from '@/components/product/OrderSteps'
import { TrustBadges } from '@/components/product/TrustBadges'
import { useTrackProductView } from '@/hooks/useTrackProductView'
import { useCookieConsentStore } from '@/stores/cookieConsentStore'
import { trackViewContent } from '@/lib/tracking/trackClear'
import { getSizeGuide } from '@/data/sizeGuides'
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

  // Fire Track Clear ViewContent once per product (gated by marketing consent)
  useEffect(() => {
    const consent = useCookieConsentStore.getState()
    if (!consent.consentGiven || !consent.preferences.marketing) return
    trackViewContent({
      variantId: product.variants[0]?.id,
      title: product.title,
      productType: product.productType || '',
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      currency: product.priceRange.minVariantPrice.currencyCode,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id])

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
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ ['--accent' as string]: themeColor } as React.CSSProperties}
    >
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

            {/* Order steps + trust badges — desktop only (below thumbnails).
                On mobile they render inside the info column, after Add-to-Cart. */}
            <div className="mt-6 hidden space-y-4 lg:block">
              <OrderSteps accent={themeColor} />
              <TrustBadges accent={themeColor} />
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6 w-full min-w-0">
            {/* Buy box card — matches the look of OrderSteps + TrustBadges. */}
            <div className="rounded-lg border border-border-subtle bg-bg-card p-5 sm:p-6 space-y-6">
            {/* Badges */}
            {(product.rarity && product.rarity !== 'common' || hasDiscount) && (
              <div className="flex flex-wrap gap-2">
                {product.rarity && product.rarity !== 'common' && (
                  <Badge variant={product.rarity === 'legendary' ? 'yellow' : 'purple'}>
                    {product.rarity}
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge variant="pink">{tCommon('sale').toUpperCase()}</Badge>
                )}
              </div>
            )}

            {/* Title */}
            <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide">
              {product.title}
            </h1>

            {/* Reviews/Rating */}
            {product.rating && product.rating.reviewCount > 0 && (
              <a href="#reviews" className="block w-fit hover:opacity-80 transition-opacity">
                <ReviewSummary rating={product.rating} size="md" color={themeColor} />
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

            {/* Size Guide Button - only for apparel with a matching size guide */}
            {sizeGuide && (
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
                  themeColor={themeColor}
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
                <div className="flex flex-col gap-2">
                  <div className="flex items-stretch gap-2">
                    <div className="relative flex-1 min-w-0">
                      <input
                        ref={personalizationInputRef}
                        type="text"
                        value={personalizationName}
                        maxLength={MAX_PERSONALIZATION_LENGTH}
                        onChange={(e) => {
                          const sliced = e.target.value.slice(0, MAX_PERSONALIZATION_LENGTH)
                          setPersonalizationName(previewConfig ? getPreviewDisplayText(sliced, previewConfig, '') : sliced)
                        }}
                        placeholder={t('personalizationPlaceholder')}
                        className={cn(
                          'w-full min-w-0 px-4 py-3 pr-16 bg-black/80 border rounded-lg text-white placeholder-white/40 focus:outline-none transition-colors',
                          personalizationName.trim()
                            ? 'border-neon-green/50 focus:border-neon-green'
                            : 'border-border-subtle focus:border-[color:var(--accent)]'
                        )}
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[11px] font-mono tabular-nums text-white/25"
                      >
                        {personalizationName.length}/{MAX_PERSONALIZATION_LENGTH}
                      </span>
                    </div>
                    {previewConfig && (
                      <button
                        type="button"
                        onClick={() => galleryRef.current?.goTo3D()}
                        aria-label={t('preview3D')}
                        className={cn(
                          'flex flex-shrink-0 items-center justify-center gap-1.5 rounded-lg px-3 py-3 sm:px-4',
                          'border text-sm font-medium transition-colors'
                        )}
                        style={{
                          backgroundColor: `${themeColor}10`,
                          borderColor: `${themeColor}33`,
                          color: themeColor,
                        }}
                      >
                        <Box className="w-4 h-4" />
                        <span className="sm:hidden">3D</span>
                        <span className="hidden sm:inline">{t('preview3D')}</span>
                      </button>
                    )}
                  </div>
                </div>
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
            <div ref={cartButtonRef} className="pt-2 flex flex-col gap-2.5">
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
                themeColor={themeColor}
              />
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
                className="w-full justify-center py-3"
              />
            </div>
            </div>
            {/* end buy box card */}

            {/* Order steps + trust badges — mobile placement (above description). */}
            <div className="space-y-4 lg:hidden">
              <OrderSteps accent={themeColor} />
              <TrustBadges accent={themeColor} />
            </div>

            {/* Description (collapsible) */}
            <div className="rounded-lg border border-border-subtle bg-bg-card px-5 py-3 sm:px-6">
              <button
                type="button"
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                aria-expanded={isDescriptionOpen}
                className="w-full flex items-center justify-between py-1 group"
              >
                <h2 className="font-display text-lg text-white">{t('description')}</h2>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 transition-transform duration-300',
                    'text-white/50 group-hover:text-[color:var(--accent)]',
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
            <div className="rounded-lg border border-border-subtle bg-bg-card px-5 sm:px-6">
              <button
                type="button"
                onClick={() => setIsShippingOpen(!isShippingOpen)}
                aria-expanded={isShippingOpen}
                className="w-full flex items-center justify-between py-4 group"
              >
                <h2 className="font-display text-lg text-white">{t('shippingTitle')}</h2>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 transition-transform duration-300',
                    'text-white/50 group-hover:text-[color:var(--accent)]',
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
            <div className="rounded-lg border border-border-subtle bg-bg-card px-5 sm:px-6">
              <button
                type="button"
                onClick={() => setIsReturnsOpen(!isReturnsOpen)}
                aria-expanded={isReturnsOpen}
                className="w-full flex items-center justify-between py-4 group"
              >
                <h2 className="font-display text-lg text-white">{t('returnsTitle')}</h2>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 transition-transform duration-300',
                    'text-white/50 group-hover:text-[color:var(--accent)]',
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
            <div className="rounded-lg border border-border-subtle bg-bg-card px-5 sm:px-6">
              <button
                type="button"
                onClick={() => setIsShareOpen(!isShareOpen)}
                aria-expanded={isShareOpen}
                className="w-full flex items-center justify-between py-4 group"
              >
                <h2 className="font-display text-lg text-white">{t('share')}</h2>
                <ChevronDown
                  className={cn(
                    'w-5 h-5 transition-transform duration-300',
                    'text-white/50 group-hover:text-[color:var(--accent)]',
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
      {sizeGuide && (
        <SizeGuideModal
          isOpen={isSizeGuideOpen}
          onClose={() => setIsSizeGuideOpen(false)}
          sizeGuide={sizeGuide}
        />
      )}

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
        themeColor={themeColor}
      />
    </div>
  )
}
