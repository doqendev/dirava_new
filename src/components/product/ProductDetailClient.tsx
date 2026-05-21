'use client'

import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
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
import { JollyRogerSelector } from '@/components/product/JollyRogerSelector'
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
import { ProductDescription } from '@/components/product/ProductDescription'
import { DragonBallOReplacementToggle } from '@/components/product/preview3d/DragonBallOReplacementToggle'
import { getProductChips } from '@/data/productChips'
import { useTrackProductView } from '@/hooks/useTrackProductView'
import { useCookieConsentStore } from '@/stores/cookieConsentStore'
import { trackViewContent } from '@/lib/tracking/trackClear'
import { getSizeGuide } from '@/data/sizeGuides'
import { getPreviewConfig, getVariantImages } from '@/lib/preview'
import { hasDragonBallOReplacement } from '@/lib/preview/dragonBallOReplacement'
import { getPreviewDisplayText } from '@/lib/preview/textTransform'
import { AccentTheme } from '@/components/theme/AccentTheme'
import type { ShopifyMoney, ShopifySelectedOption } from '@/types/shopify'
import type { ReviewRating } from '@/types/reviews'

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
  const consentGiven = useCookieConsentStore((state) => state.consentGiven)
  const marketingEnabled = useCookieConsentStore((state) => state.preferences.marketing)

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
  const variantImages = useMemo(() => getVariantImages(product.handle), [product.handle])

  // Selected options state — prefer variant from URL param (e.g., ?variant=Zoro)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}

    // Try to match variant from URL param (exact title or color option value)
    const variantFromUrl = variantParam
      ? product.variants.find((v) => v.title === variantParam)
        ?? product.variants.find((v) =>
          (product.personalization || v.availableForSale) &&
          v.selectedOptions.some((opt) => opt.value === variantParam)
        )
      : null

    const target = variantFromUrl
      || product.variants.find((v) => product.personalization || v.availableForSale)
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
  const variantImageOptionName = useMemo(
    () => options.find((option) => option.name.toLowerCase() === 'color')?.name,
    [options]
  )
  const selectedVariantName =
    (variantImageOptionName ? selectedOptions[variantImageOptionName] : undefined)
    || selectedOptions['Color']
    || selectedOptions['color']
    || ''
  const activeLightbox2DPreview = selectedVariantName && previewConfig?.variantLightbox2DPreviews?.[selectedVariantName]
  const hasLivePreviewBuilder = Boolean(
    activeLightbox2DPreview && previewConfig?.scene?.variant === 'lightbox'
  )
  const previewActionLabel = activeLightbox2DPreview ? 'Live Preview' : '3D View'
  const previewActionAriaLabel = activeLightbox2DPreview ? 'Open live preview' : undefined
  const showJollyRogerSelector = Boolean(variantImages && variantImageOptionName)
  const showJollyRogerSelectorInPreview = showJollyRogerSelector && Boolean(previewConfig)
  const moveJollyRogerSelectorToPreview = hasLivePreviewBuilder && showJollyRogerSelector
  const [isGalleryPreviewActive, setIsGalleryPreviewActive] = useState(false)
  const hideJollyRogerSelectorInBuyBox =
    moveJollyRogerSelectorToPreview || (showJollyRogerSelectorInPreview && isGalleryPreviewActive)
  const buyBoxVariantOptions = useMemo(
    () =>
      hideJollyRogerSelectorInBuyBox && variantImageOptionName
        ? options.filter((option) => option.name !== variantImageOptionName)
        : options,
    [hideJollyRogerSelectorInBuyBox, options, variantImageOptionName]
  )
  const hasBuyBoxVariantOptions = !(
    buyBoxVariantOptions.length === 0 ||
    (
      buyBoxVariantOptions.length === 1 &&
      buyBoxVariantOptions[0]?.name === 'Title' &&
      buyBoxVariantOptions[0]?.values.length === 1 &&
      buyBoxVariantOptions[0]?.values[0] === 'Default Title'
    )
  )
  const galleryInlineControlsEnabled = !moveJollyRogerSelectorToPreview
  const useStreamlinedPersonalization = !hasLivePreviewBuilder && product.handle.includes('sign')
  const quantity = 1

  // Ref for sticky add-to-cart IntersectionObserver
  const cartButtonRef = useRef<HTMLDivElement>(null)
  const viewContentTrackedProductRef = useRef<string | null>(null)

  // Gallery ref for programmatic 3D navigation
  const galleryRef = useRef<ProductGalleryHandle>(null)

  // Personalization state
  const [personalizationName, setPersonalizationName] = useState('')
  const personalizationInputRef = useRef<HTMLInputElement>(null)
  const previewPersonalizationInputRef = useRef<HTMLInputElement>(null)

  // Dragon Ball position picker state. `null` means "auto-follow midpoint";
  // once the customer clicks a dot it becomes a concrete slot index.
  const [ballPosition, setBallPosition] = useState<number | null>(null)
  const [replaceOsWithBalls, setReplaceOsWithBalls] = useState(false)

  const handlePersonalizationError = () => {
    personalizationInputRef.current?.focus()
    personalizationInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const handlePreviewPersonalizationError = () => {
    previewPersonalizationInputRef.current?.focus()
  }

  const isDragonballSign = previewConfig?.type === 'dragonball-sign'
  // Overlay-mode signs (e.g. HxH) auto-place the mid sprite at a fixed
  // fraction of the text width, so the ball-position picker doesn't
  // apply and no cart attribute is attached for it.
  const ballPickerEnabled = isDragonballSign && previewConfig?.midSpriteMode !== 'overlay'
  const dragonBallOReplacementEnabled = Boolean(
    ballPickerEnabled && previewConfig?.svg === '/svgs/preview/dball.svg'
  )
  const dragonBallOReplacementActive = Boolean(
    dragonBallOReplacementEnabled
    && replaceOsWithBalls
    && hasDragonBallOReplacement(personalizationName)
  )

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
  const describeBallPosition = useCallback((name: string, slot: number): string => {
    if (name.length < 2) return t('personalizationDefaultCenter')
    return t('personalizationBetweenLetters', {
      a: slot,
      letterA: name[slot - 1] ?? '',
      b: slot + 1,
      letterB: name[slot] ?? '',
    })
  }, [t])

  // Unified cart attributes used by every add-to-cart surface on this
  // page (canvas cart, main desktop button, sticky mobile button).
  const cartAttributes = useMemo(() => {
    if (!product.personalization) return undefined
    const trimmed = personalizationName.trim()
    if (!trimmed) return undefined
    const attrs: Array<{ key: string; value: string }> = [
      { key: 'Personalization', value: trimmed },
    ]
    if (dragonBallOReplacementActive) {
      attrs.push({ key: 'Dragon Ball O Replacement', value: 'Yes' })
    } else if (ballPickerEnabled) {
      attrs.push({ key: 'Ball Position', value: describeBallPosition(trimmed, effectiveBallPosition) })
    }
    return attrs
  }, [product.personalization, personalizationName, dragonBallOReplacementActive, ballPickerEnabled, effectiveBallPosition, describeBallPosition])

  // Track product view for recently viewed feature
  const primaryVariantId = product.variants[0]?.id
  useTrackProductView({
    productId: product.id,
    handle: product.handle,
    title: product.title,
    price: product.priceRange.minVariantPrice,
    compareAtPrice: product.compareAtPriceRange?.minVariantPrice,
    image: product.images[0] || null,
    universe,
    variantId: primaryVariantId,
  })

  // Fire Track Clear ViewContent once per product. If the shopper grants
  // marketing consent after landing on the PDP, this effect runs again and
  // sends the product view without requiring a navigation.
  useEffect(() => {
    if (!consentGiven || !marketingEnabled) return
    if (viewContentTrackedProductRef.current === product.id) return

    viewContentTrackedProductRef.current = product.id
    trackViewContent({
      variantId: primaryVariantId,
      title: product.title,
      productType: product.productType || '',
      price: parseFloat(product.priceRange.minVariantPrice.amount),
      currency: product.priceRange.minVariantPrice.currencyCode,
    })
  }, [
    consentGiven,
    marketingEnabled,
    primaryVariantId,
    product.id,
    product.priceRange.minVariantPrice.amount,
    product.priceRange.minVariantPrice.currencyCode,
    product.productType,
    product.title,
  ])

  // Find selected variant
  const selectedVariant = useMemo(() => {
    return product.variants.find((variant) =>
      variant.selectedOptions.every(
        (opt) => selectedOptions[opt.name] === opt.value
      )
    )
  }, [product.variants, selectedOptions])
  const selectedVariantPurchasable = Boolean(
    selectedVariant && (product.personalization || selectedVariant.availableForSale)
  )

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
      const opt = match.selectedOptions.find((o) =>
        o.name === variantImageOptionName || o.name === 'Color' || o.name === 'color'
      )
      return opt?.value ?? null
    })
  }, [product.images, product.variants, variantImageOptionName])

  // Called by the gallery when a thumbnail is tapped while 3D is active.
  const onVariantSelectFromGallery = (variantName: string) => {
    const key =
      variantImageOptionName
      || ('Color' in selectedOptions ? 'Color' : 'color' in selectedOptions ? 'color' : 'Color')
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

      <div className="relative px-4 pt-3 pb-6 md:py-6 max-w-7xl mx-auto w-full">
        {/* Back link */}
        <Link
          href={`/worlds/${universe}`}
          className={cn(
            'inline-flex items-center gap-2 mb-3 md:mb-6',
            'text-white/50 hover:text-white',
            'transition-colors duration-200'
          )}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{t('backTo', { name: universeName })}</span>
        </Link>

        <div className="grid gap-5 lg:grid-cols-2 lg:gap-12 w-full">
          {/* Gallery */}
          <div className="w-full min-w-0">
            <ProductGallery
              ref={galleryRef}
              images={product.images}
              productTitle={product.title}
              initialImageIndex={initialImageIndex}
              previewConfig={previewConfig}
              previewText={personalizationName}
              selectedVariantName={selectedVariantName}
              imageVariantNames={imageVariantNames}
              onVariantSelect={onVariantSelectFromGallery}
              onPreviewTextChange={product.personalization && galleryInlineControlsEnabled ? setPersonalizationName : undefined}
              ballPosition={!dragonBallOReplacementActive && ballPickerEnabled && personalizationName.length > 0 ? effectiveBallPosition : undefined}
              onBallPositionChange={!dragonBallOReplacementActive && ballPickerEnabled ? setBallPosition : undefined}
              replaceOsWithBalls={replaceOsWithBalls}
              onReplaceOsWithBallsChange={dragonBallOReplacementEnabled ? setReplaceOsWithBalls : undefined}
              themeColor={themeColor}
              initialPreviewMode={false}
              onPreviewActiveChange={setIsGalleryPreviewActive}
              previewSelector={showJollyRogerSelectorInPreview && variantImages && variantImageOptionName ? (
                <div className="space-y-3 max-sm:space-y-2.5">
                  <JollyRogerSelector
                    options={options}
                    variants={product.variants}
                    selectedOptions={selectedOptions}
                    onOptionChange={handleOptionChange}
                    variantImages={variantImages}
                    imageOptionName={variantImageOptionName}
                    themeColor={themeColor}
                    mode="preview"
                    ignoreAvailability={product.personalization}
                  />
                  {hasLivePreviewBuilder && (
                  <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:items-stretch lg:hidden">
                    <div className="relative min-w-0">
                      <input
                        ref={previewPersonalizationInputRef}
                        type="text"
                        value={personalizationName}
                        maxLength={MAX_PERSONALIZATION_LENGTH}
                        onChange={(e) => {
                          const value = e.target.value.slice(0, MAX_PERSONALIZATION_LENGTH)
                          setPersonalizationName(previewConfig ? getPreviewDisplayText(value, previewConfig, '') : value)
                        }}
                        placeholder={t('personalizationPlaceholder')}
                        aria-label={t('personalizationNameLabel')}
                        className={cn(
                          'h-12 w-full rounded-lg border bg-black/35 px-3 pr-14',
                          'text-center text-sm font-bold uppercase tracking-[0.12em] text-white placeholder-white/35',
                          'outline-none transition-colors',
                          'focus:border-[color:var(--accent,#00f5ff)] focus:ring-1 focus:ring-[color:var(--accent,#00f5ff)]/55'
                        )}
                        style={{
                          borderColor: `${themeColor}66`,
                          boxShadow: `inset 0 0 14px ${themeColor}14`,
                        }}
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] font-semibold tabular-nums text-white/45"
                      >
                        {personalizationName.length}/{MAX_PERSONALIZATION_LENGTH}
                      </span>
                    </div>
                    <AddToCartButton
                      variantId={selectedVariant?.id || ''}
                      quantity={1}
                      unitPrice={selectedVariant ? parseFloat(selectedVariant.price.amount) : undefined}
                      currency={selectedVariant?.price.currencyCode}
                      available={selectedVariantPurchasable}
                      requiresPersonalization={product.personalization}
                      personalizationValue={personalizationName}
                      onPersonalizationError={handlePreviewPersonalizationError}
                      attributes={cartAttributes}
                      themeColor={themeColor}
                      label="Add to cart"
                      className="!h-12 !py-0 !text-[12px] sm:!w-auto sm:!px-5"
                    />
                  </div>
                  )}
                </div>
              ) : undefined}
              canvasCart={previewConfig && galleryInlineControlsEnabled ? {
                variantId: selectedVariant?.id || '',
                quantity,
                unitPrice: selectedVariant ? parseFloat(selectedVariant.price.amount) : undefined,
                currency: selectedVariant?.price.currencyCode,
                available: selectedVariantPurchasable,
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

              {/* Trust hierarchy: rating + orders is the *primary* trust
                  signal (real reviews, durable proof). Live activity
                  ("X viewing now · Y sold today") follows as a quieter
                  secondary line — it adds urgency without competing
                  with the credible top line. */}
              <a href="#reviews" className="block w-fit hover:opacity-80 transition-opacity">
                <RatingOrdersChip
                  rating={product.rating}
                  productHandle={product.handle}
                  accent={themeColor}
                />
              </a>

              <div className="pt-0.5">
                <SocialProofBar productHandle={product.handle} accent={themeColor} />
              </div>

              <TitleChips chips={getProductChips(product.handle)} accent={themeColor} />
            </div>

            {/* Size Guide Button - only for apparel with a matching size guide */}
            {sizeGuide && (
              <div className="flex justify-end">
                <SizeGuideButton onClick={() => setIsSizeGuideOpen(true)} />
              </div>
            )}

            {/* Variant Selector — hide Shopify's default "Title" option for single-variant products */}
            {hasBuyBoxVariantOptions && (
              <div className="space-y-3">
                {showJollyRogerSelector && !hideJollyRogerSelectorInBuyBox && variantImages && variantImageOptionName ? (
                  <JollyRogerSelector
                    options={buyBoxVariantOptions}
                    variants={product.variants}
                    selectedOptions={selectedOptions}
                    onOptionChange={handleOptionChange}
                    variantImages={variantImages}
                    imageOptionName={variantImageOptionName}
                    themeColor={themeColor}
                    ignoreAvailability={product.personalization}
                  />
                ) : (
                  <VariantSelector
                    options={buyBoxVariantOptions}
                    variants={product.variants}
                    selectedOptions={selectedOptions}
                    onOptionChange={handleOptionChange}
                    themeColor={themeColor}
                    ignoreAvailability={product.personalization}
                  />
                )}
              </div>
            )}

            {/* Shopify stock is only meaningful for stocked products. */}
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
                  layout={useStreamlinedPersonalization ? 'streamlined' : 'standard'}
                  previewPlacement={useStreamlinedPersonalization ? 'header' : 'input'}
                  onPreview3D={previewConfig ? () => galleryRef.current?.goTo3D() : undefined}
                  previewLabel={previewActionLabel}
                  previewAriaLabel={previewActionAriaLabel}
                  customizationOption={
                    dragonBallOReplacementEnabled && hasDragonBallOReplacement(personalizationName) ? (
                      <DragonBallOReplacementToggle
                        checked={dragonBallOReplacementActive}
                        onChange={setReplaceOsWithBalls}
                        className="mb-0 h-10 w-full justify-between rounded-lg border-[#ff6c00]/45 bg-[#ff6c00]/10 px-3 text-[11px] sm:mx-0"
                      />
                    ) : undefined
                  }
                  cta={
                    <AddToCartButton
                      variantId={selectedVariant?.id || ''}
                      quantity={1}
                      unitPrice={selectedVariant ? parseFloat(selectedVariant.price.amount) : undefined}
                      currency={selectedVariant?.price.currencyCode}
                      available={selectedVariantPurchasable}
                      requiresPersonalization={product.personalization}
                      personalizationValue={personalizationName}
                      onPersonalizationError={handlePersonalizationError}
                      attributes={cartAttributes}
                      themeColor={themeColor}
                      className={cn(
                        '!py-4 !text-[15px]',
                        useStreamlinedPersonalization && '!h-[54px] !rounded-lg !font-sans !text-[13px] !font-black !tracking-[0.12em]'
                      )}
                    />
                  }
                />
              </div>
            ) : (
              <div ref={cartButtonRef} className="pt-2 flex flex-col gap-2.5">
                <AddToCartButton
                  variantId={selectedVariant?.id || ''}
                  quantity={quantity}
                  unitPrice={selectedVariant ? parseFloat(selectedVariant.price.amount) : undefined}
                  currency={selectedVariant?.price.currencyCode}
                  available={selectedVariantPurchasable}
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

            <div className="pt-4">
              <TrustStrip
                productType={product.productType}
                isPersonalized={product.personalization}
              />
            </div>

            {/* Limited slots — keep urgency near the buying flow, after the
                baseline trust signals so it supports rather than replaces
                reassurance. The left column under the gallery stays clean. */}
            <div className={cn(product.personalization ? 'pt-5' : 'pt-7')}>
              <LimitedSlotsBanner
                accent={themeColor}
                productHandle={product.handle}
                productType={product.productType}
              />
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
                  <span
                    role="heading"
                    aria-level={2}
                    className="font-display text-[16px] font-bold uppercase tracking-wider text-white"
                  >
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
                    isDescriptionOpen ? 'max-h-[1200px] opacity-100 pb-6' : 'max-h-0 opacity-0'
                  )}
                >
                  <ProductDescription
                    handle={product.handle}
                    isPersonalized={product.personalization}
                    fallbackHtml={product.descriptionHtml}
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
                    <p className="text-white/45 text-xs pt-1">{t('shippingUSUnavailable')}</p>
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
                    {product.personalization && (
                      <p className="text-white/45 text-xs pt-1">{t('returnsFinalSale')}</p>
                    )}
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
        available={selectedVariantPurchasable}
        requiresPersonalization={product.personalization}
        personalizationValue={personalizationName}
        onPersonalizationError={handlePersonalizationError}
        attributes={cartAttributes}
        quantity={quantity}
        cartButtonRef={cartButtonRef}
        themeColor={themeColor}
      />
    </div>
  )
}
