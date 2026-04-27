'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { UNIVERSE_CONFIG, MAX_PERSONALIZATION_LENGTH } from '@/lib/utils/constants'
import { ProductGallery } from '@/components/product/ProductGallery'
import type { ProductGalleryHandle } from '@/components/product/ProductGallery'
import { VariantSelector } from '@/components/product/VariantSelector'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { WishlistButton } from '@/components/product/WishlistButton'
import { Badge } from '@/components/ui/Badge'
import { StockIndicator } from '@/components/product/StockIndicator'
import { ShareButtons } from '@/components/product/ShareButtons'
import { SizeGuideButton } from '@/components/product/SizeGuideButton'
import { SizeGuideModal } from '@/components/product/SizeGuideModal'
import { StickyAddToCart } from '@/components/product/StickyAddToCart'
import { PersonalizeCard } from '@/components/product/PersonalizeCard'
import { TitleChips } from '@/components/product/TitleChips'
import { RatingOrdersChip } from '@/components/product/RatingOrdersChip'
import { SocialProofBar } from '@/components/product/SocialProofBar'
import { LimitedSlotsBanner } from '@/components/product/LimitedSlotsBanner'
import { TrustStrip } from '@/components/product/TrustStrip'
import { WhyHitsDifferent } from '@/components/product/WhyHitsDifferent'
import { HowItsMade } from '@/components/product/HowItsMade'
import { getProductChips } from '@/data/productChips'
import { getProductFeatureTiles } from '@/data/productFeatureTiles'
import { useTrackProductView } from '@/hooks/useTrackProductView'
import { useCookieConsentStore } from '@/stores/cookieConsentStore'
import { trackViewContent } from '@/lib/tracking/trackClear'
import { getSizeGuide } from '@/data/sizeGuides'
import { getPreviewConfig, getVariantImages } from '@/lib/preview'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'
import { AccentTheme } from '@/components/theme/AccentTheme'
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
    /** Per-product features tagline override (Shopify metafield custom.features). */
    featuresOverride?: string | null
    /** Product tags (used for features fallback categorisation). */
    tags?: string[]
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

  // Quantity is fixed at 1 on the PDP — adjustments happen in the
  // cart drawer instead so the buying flow stays focused on
  // personalization → add-to-cart.
  const quantity = 1

  // Ref for sticky add-to-cart IntersectionObserver
  const cartButtonRef = useRef<HTMLDivElement>(null)

  // Gallery ref for programmatic 3D navigation
  const galleryRef = useRef<ProductGalleryHandle>(null)

  // Personalization state
  const [personalizationName, setPersonalizationName] = useState('')
  const personalizationInputRef = useRef<HTMLInputElement>(null)

  // Dragon Ball position picker state. `null` means "auto-follow midpoint";
  // once the customer clicks a dot it becomes a concrete slot index.
  const [ballPosition, setBallPosition] = useState<number | null>(null)

  const handlePersonalizationError = () => {
    personalizationInputRef.current?.focus()
    personalizationInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const isDragonballSign = previewConfig?.type === 'dragonball-sign'
  // Overlay-mode signs (e.g. HxH) auto-place the mid sprite at a fixed
  // fraction of the text width, so the ball-position picker doesn't
  // apply and no cart attribute is attached for it.
  const ballPickerEnabled = isDragonballSign && previewConfig?.midSpriteMode !== 'overlay'

  // Effective ball slot — only *internal* positions are allowed, so the
  // clamp is [1, n - 1]. When the user hasn't manually picked, falls
  // back to the legacy midpoint (Math.ceil(n / 2), already inside the
  // internal range for every n ≥ 2) so the default looks identical to
  // what the preview used to produce before the picker existed.
  const effectiveBallPosition = useMemo(() => {
    const n = personalizationName.length
    if (n < 2) return Math.ceil(n / 2) // no internal slots; mostly a no-op path
    const fallback = Math.ceil(n / 2)
    const requested = ballPosition ?? fallback
    return Math.max(1, Math.min(n - 1, requested))
  }, [ballPosition, personalizationName])

  // Human-readable description for the order line item. Manufacturing
  // reads this directly so we don't have to map slot indices on the
  // warehouse side. Only internal slots are valid now — the ball always
  // lives between two letters.
  const describeBallPosition = (name: string, slot: number): string => {
    if (name.length < 2) return 'Default (center)'
    return `Between letter ${slot} (${name[slot - 1]}) and letter ${slot + 1} (${name[slot]})`
  }

  // Unified cart attributes used by every add-to-cart surface on this
  // page (canvas cart, main desktop button, sticky mobile button).
  const cartAttributes = useMemo(() => {
    if (!product.personalization) return undefined
    const trimmed = personalizationName.trim()
    if (!trimmed) return undefined
    const attrs: Array<{ key: string; value: string }> = [
      { key: 'Personalization', value: trimmed },
    ]
    if (ballPickerEnabled) {
      attrs.push({ key: 'Ball Position', value: describeBallPosition(trimmed, effectiveBallPosition) })
    }
    return attrs
  }, [product.personalization, personalizationName, ballPickerEnabled, effectiveBallPosition])

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

  // Jump gallery to the selected variant's image when options change —
  // unless the shopper is currently in the 3D preview, in which case we
  // keep 3D open so they can see the new variant render live.
  const isInitialMount = useRef(true)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }
    if (galleryRef.current?.isAt3D()) return
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

  // Map each gallery thumbnail index → the variant option value it
  // represents (or null when the image isn't pinned to a variant). Lets
  // the gallery swap characters inside an open 3D preview when a
  // thumbnail is tapped, so mobile shoppers don't have to exit the
  // preview just to compare variants.
  const imageVariantNames = useMemo<(string | null)[]>(() => {
    return product.images.map((img) => {
      const match = product.variants.find((v) =>
        v.image?.url && v.image.url.split('?')[0] === img.url.split('?')[0]
      )
      if (!match) return null
      const opt = match.selectedOptions.find((o) => o.name === 'Color' || o.name === 'color')
      return opt?.value ?? null
    })
  }, [product.images, product.variants])

  // Called by the gallery when a thumbnail is tapped while 3D is active.
  const onVariantSelectFromGallery = (variantName: string) => {
    const key = 'Color' in selectedOptions ? 'Color' : 'color' in selectedOptions ? 'color' : 'Color'
    handleOptionChange(key, variantName)
  }

  const hasDiscount =
    product.compareAtPriceRange &&
    parseFloat(product.compareAtPriceRange.minVariantPrice.amount) >
      parseFloat(product.priceRange.minVariantPrice.amount)

  // Publish the universe accent as CSS variables so descendants can build
  // accent-tinted rgba() shadows / backgrounds via var(--accent-rgb).
  const accentRgb = (() => {
    const m = themeColor.replace('#', '').match(/.{2}/g)
    if (!m || m.length < 3) return '0, 245, 255'
    return `${parseInt(m[0]!, 16)}, ${parseInt(m[1]!, 16)}, ${parseInt(m[2]!, 16)}`
  })()

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{
        ['--accent' as string]: themeColor,
        ['--accent-rgb' as string]: accentRgb,
      } as React.CSSProperties}
    >
      {/* Publish the accent at document root so Footer (outside the
          product page tree) can tint itself to match. */}
      <AccentTheme themeColor={themeColor} />
      {/* Global ambient glow — fixed at the top of the viewport, 900x400
          blurred ellipse at ~8% accent, mirroring the design's subtle
          atmospheric wash. */}
      <div
        aria-hidden
        className="pointer-events-none fixed left-1/2 top-0 -translate-x-1/2 h-[400px] w-[900px] max-w-full rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, ${themeColor}14, transparent 65%)`,
          filter: 'blur(40px)',
        }}
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

        <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 w-full">
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
              imageVariantNames={imageVariantNames}
              onVariantSelect={onVariantSelectFromGallery}
              onPreviewTextChange={product.personalization ? setPersonalizationName : undefined}
              ballPosition={ballPickerEnabled && personalizationName.length > 0 ? effectiveBallPosition : undefined}
              onBallPositionChange={ballPickerEnabled ? setBallPosition : undefined}
              themeColor={themeColor}
              canvasCart={previewConfig ? {
                variantId: selectedVariant?.id || '',
                quantity,
                available: selectedVariant?.availableForSale ?? false,
                requiresPersonalization: product.personalization,
                personalizationValue: personalizationName,
                onPersonalizationError: handlePersonalizationError,
                attributes: cartAttributes,
                themeColor,
              } : undefined}
            />

          </div>

          {/* Product Info */}
          <div className="space-y-6 w-full min-w-0">
            {/* Buy box — plain stacked column (no card chrome), mirroring
                the design reference. Keeps the same vertical rhythm. */}
            <div className="space-y-6">
            {/* Title cluster — kept tighter than the surrounding
                space-y-6 so title / price / rating / features read
                as one identifying group instead of disconnected
                rows. Hierarchy intent: title → price → rating →
                features. */}
            <div className="space-y-2.5">
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

              <h1 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold text-white tracking-wide">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-3 pt-1.5">
                <span
                  className="text-[36px] md:text-[38px] font-mono font-black leading-none"
                  style={{
                    color: themeColor,
                    textShadow: `0 0 22px ${themeColor}66, 0 0 6px ${themeColor}55`,
                  }}
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

              {/* Mobile social proof — surfaces urgency above the
                  fold on small screens. Desktop reuses the same data
                  inside the PersonalizeCard, below the CTA. */}
              <div className="pt-1">
                <SocialProofBar productHandle={product.handle} accent={themeColor} />
              </div>

              <a href="#reviews" className="block w-fit hover:opacity-80 transition-opacity">
                <RatingOrdersChip
                  rating={product.rating}
                  productHandle={product.handle}
                  accent={themeColor}
                />
              </a>

              <TitleChips chips={getProductChips(product.handle)} accent={themeColor} />
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
                {/* One Piece variant tiles ARE the Jolly Roger selector
                    — make that explicit with a small header so the
                    customer immediately understands what they're
                    picking. Scoped to the four handles where the
                    crew-symbol vocabulary applies. */}
                {[
                  'one-piece-custom-sign',
                  'one-piece-magnet',
                  'one-piece-custom-keychain',
                  'one-piece-custom-led-lightbox-sign',
                ].includes(product.handle) && getVariantImages(product.handle) && (
                  <div>
                    <h2 className="text-[13px] font-bold uppercase tracking-[0.12em] text-white">
                      Choose your Jolly Roger
                    </h2>
                    <p className="mt-1 text-[12px] leading-snug text-white/55">
                      Select your crew symbol, then enter your name below.
                    </p>
                  </div>
                )}
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

            {/* Stock Indicator (hidden for personalized products) */}
            {selectedVariant && !product.personalization && (
              <StockIndicator
                availableForSale={selectedVariant.availableForSale}
                quantityAvailable={selectedVariant.quantityAvailable}
              />
            )}

            {product.personalization ? (
              <div ref={cartButtonRef} className="lg:-mt-2">
                <PersonalizeCard
                  value={personalizationName}
                  onChange={(v) => setPersonalizationName(previewConfig ? getPreviewDisplayText(v, previewConfig, '') : v)}
                  maxLength={MAX_PERSONALIZATION_LENGTH}
                  inputRef={personalizationInputRef}
                  themeColor={themeColor}
                  cta={
                    <AddToCartButton
                      variantId={selectedVariant?.id || ''}
                      quantity={1}
                      available={selectedVariant?.availableForSale ?? false}
                      requiresPersonalization={product.personalization}
                      personalizationValue={personalizationName}
                      onPersonalizationError={handlePersonalizationError}
                      attributes={cartAttributes}
                      themeColor={themeColor}
                      className="!py-4 !text-[15px]"
                    />
                  }
                />
              </div>
            ) : (
              <div ref={cartButtonRef} className="pt-2 flex flex-col gap-2.5">
                <AddToCartButton
                  variantId={selectedVariant?.id || ''}
                  quantity={quantity}
                  available={selectedVariant?.availableForSale ?? false}
                  attributes={cartAttributes}
                  themeColor="#19ff7a"
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
            )}

            {/* Limited slots — sits between social proof and the trust
                strip in the buying column on every viewport. The left
                column under the gallery stays clean (the banner used to
                duplicate there). */}
            <div className={cn(product.personalization ? 'pt-6' : 'pt-7')}>
              <LimitedSlotsBanner accent={themeColor} productHandle={product.handle} />
            </div>

            <div className="pt-4">
              <TrustStrip />
            </div>
            </div>
            {/* end buy box card */}

            {/* Collapsible panels — border-top separators, display title,
                accent chevron when open. Matches the design. */}
            <div>
              <div className="border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                  aria-expanded={isDescriptionOpen}
                  className="w-full flex items-center justify-between py-5"
                >
                  <span className="font-display text-[16px] font-bold uppercase tracking-wider text-white">
                    {t('description')}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      isDescriptionOpen && 'rotate-180'
                    )}
                    style={{
                      color: isDescriptionOpen
                        ? 'rgb(var(--accent-rgb, 0, 245, 255))'
                        : 'rgba(255,255,255,0.45)',
                    }}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isDescriptionOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'
                  )}
                >
                  <div
                    className="prose prose-invert prose-sm max-w-[680px] text-[14px] text-white/75 leading-relaxed [&_*]:!bg-transparent [&_*]:!text-inherit"
                    dangerouslySetInnerHTML={{ __html: sanitizeHtml(product.descriptionHtml) }}
                  />
                </div>
              </div>

              <div className="border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsShippingOpen(!isShippingOpen)}
                  aria-expanded={isShippingOpen}
                  className="w-full flex items-center justify-between py-5"
                >
                  <span className="font-display text-[16px] font-bold uppercase tracking-wider text-white">
                    {t('shippingTitle')}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      isShippingOpen && 'rotate-180'
                    )}
                    style={{
                      color: isShippingOpen
                        ? 'rgb(var(--accent-rgb, 0, 245, 255))'
                        : 'rgba(255,255,255,0.45)',
                    }}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isShippingOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="space-y-2 text-[14px] text-white/75 leading-relaxed">
                    <p>{t('shippingProcessing')}</p>
                    <p>{t('shippingEurope')}</p>
                    <p>{t('shippingUK')}</p>
                    <p>{t('shippingCanada')}</p>
                    <p>{t('shippingAustralia')}</p>
                    <p className="text-white/45 text-xs pt-1">{t('shippingCustoms')}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsReturnsOpen(!isReturnsOpen)}
                  aria-expanded={isReturnsOpen}
                  className="w-full flex items-center justify-between py-5"
                >
                  <span className="font-display text-[16px] font-bold uppercase tracking-wider text-white">
                    {t('returnsTitle')}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      isReturnsOpen && 'rotate-180'
                    )}
                    style={{
                      color: isReturnsOpen
                        ? 'rgb(var(--accent-rgb, 0, 245, 255))'
                        : 'rgba(255,255,255,0.45)',
                    }}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isReturnsOpen ? 'max-h-[500px] opacity-100 pb-6' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="space-y-2 text-[14px] text-white/75 leading-relaxed">
                    <p>{t('returnsPolicy')}</p>
                    <p>{t('returnsExchanges')}</p>
                    <p>{t('returnsRefund')}</p>
                    <p className="text-white/45 text-xs pt-1">{t('returnsFinalSale')}</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-b border-border-subtle">
                <button
                  type="button"
                  onClick={() => setIsShareOpen(!isShareOpen)}
                  aria-expanded={isShareOpen}
                  className="w-full flex items-center justify-between py-5"
                >
                  <span className="font-display text-[16px] font-bold uppercase tracking-wider text-white">
                    {t('share')}
                  </span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 transition-transform duration-200',
                      isShareOpen && 'rotate-180'
                    )}
                    style={{
                      color: isShareOpen
                        ? 'rgb(var(--accent-rgb, 0, 245, 255))'
                        : 'rgba(255,255,255,0.45)',
                    }}
                  />
                </button>
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300',
                    isShareOpen ? 'max-h-[200px] opacity-100 pb-6' : 'max-h-0 opacity-0'
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
      </div>

      {/* New PDP sections: Why-hits-different + How-it's-made + trust
          strip. Sit between the buy-box grid and the existing reviews
          section (which lives outside this component, in the page
          shell). */}
      <div className="relative px-4 pb-10 max-w-7xl mx-auto w-full space-y-6">
        <WhyHitsDifferent tiles={getProductFeatureTiles(product.handle)} accent={themeColor} />
        <HowItsMade accent={themeColor} />
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
