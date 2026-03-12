'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Loader2, AlertCircle, Package, Check, Truck } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { formatPrice } from '@/lib/utils/formatPrice'
import { RARITY_CONFIG } from '@/lib/gacha/constants'
import { getRarityStyles } from '@/stores/gachaStore'
import type { CodeStatusResponse, ShippingAddress, ClaimApiResponse, ProductVariant } from '@/types/gacha'

type PageState = 'loading' | 'form' | 'submitting' | 'success' | 'error' | 'already-claimed'

// Country list (simplified)
const COUNTRIES = [
  { code: 'ES', name: 'Spain' },
  { code: 'FR', name: 'France' },
  { code: 'DE', name: 'Germany' },
  { code: 'IT', name: 'Italy' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'AT', name: 'Austria' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IE', name: 'Ireland' },
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
]

export default function ClaimContent() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string
  const tClaim = useTranslations('claim')
  const tCommon = useTranslations('common')

  const [pageState, setPageState] = useState<PageState>('loading')
  const [error, setError] = useState<string | null>(null)
  const [codeData, setCodeData] = useState<CodeStatusResponse | null>(null)

  // Variant selection
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [variantError, setVariantError] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: '',
    lastName: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    country: '',
    countryCode: '',
    zip: '',
    phone: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof ShippingAddress, string>>>({})

  // Fetch code status
  useEffect(() => {
    async function fetchCodeStatus() {
      try {
        const response = await fetch(`/api/gacha/codes/${code}`)
        const data: CodeStatusResponse = await response.json()

        if (!data.success || !data.code) {
          setError(data.error || tClaim('errorCodeNotFound'))
          setPageState('error')
          return
        }

        // Must be revealed to claim
        if (data.code.status === 'unused') {
          router.push(`/gacha/reveal/${code}`)
          return
        }

        // Already claimed
        if (data.code.status === 'claimed' || data.code.status === 'shipped') {
          setCodeData(data)
          setPageState('already-claimed')
          return
        }

        setCodeData(data)

        // Auto-select first available variant if only one option
        const variants = data.revealedProduct?.variants || []
        const availableVariants = variants.filter(v => v.availableForSale)
        if (availableVariants.length === 1) {
          setSelectedVariantId(availableVariants[0]!.id)
        }

        setPageState('form')
      } catch {
        setError(tClaim('errorLoadCode'))
        setPageState('error')
      }
    }

    fetchCodeStatus()
  }, [code, router])

  const handleInputChange = (field: keyof ShippingAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const handleCountryChange = (countryCode: string) => {
    const country = COUNTRIES.find((c) => c.code === countryCode)
    setFormData((prev) => ({
      ...prev,
      countryCode,
      country: country?.name || '',
    }))
    if (formErrors.country) {
      setFormErrors((prev) => ({ ...prev, country: undefined }))
    }
  }

  const handleVariantSelect = (variantId: string) => {
    setSelectedVariantId(variantId)
    setVariantError(null)
  }

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof ShippingAddress, string>> = {}

    if (!formData.firstName.trim()) errors.firstName = tClaim('validationFirstName')
    if (!formData.lastName.trim()) errors.lastName = tClaim('validationLastName')
    if (!formData.address1.trim()) errors.address1 = tClaim('validationAddress')
    if (!formData.city.trim()) errors.city = tClaim('validationCity')
    if (!formData.countryCode) errors.country = tClaim('validationCountry')
    if (!formData.zip.trim()) errors.zip = tClaim('validationPostalCode')

    setFormErrors(errors)

    // Check variant selection
    const variants = codeData?.revealedProduct?.variants || []
    if (variants.length > 1 && !selectedVariantId) {
      setVariantError(tClaim('validationSelectVariant'))
      return false
    }

    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setPageState('submitting')
    setError(null)

    try {
      const response = await fetch('/api/gacha/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          variantId: selectedVariantId,
          shippingAddress: formData,
        }),
      })

      const data: ClaimApiResponse = await response.json()

      if (!data.success) {
        setError(data.error || tClaim('errorClaimFailed'))
        setPageState('form')
        return
      }

      setPageState('success')
    } catch {
      setError(tClaim('errorGeneric'))
      setPageState('form')
    }
  }

  // Get selected variant title for success page
  const getSelectedVariantTitle = () => {
    if (!selectedVariantId || !codeData?.revealedProduct?.variants) return null
    const variant = codeData.revealedProduct.variants.find(v => v.id === selectedVariantId)
    return variant?.title
  }

  // Loading state
  if (pageState === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-neon-cyan animate-spin mx-auto mb-4" />
          <p className="text-white/60">{tCommon('loading')}</p>
        </div>
      </div>
    )
  }

  // Error state
  if (pageState === 'error') {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="px-4 py-4 max-w-xl mx-auto">
          <Link
            href="/gacha/reveal"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{tCommon('back')}</span>
          </Link>
        </div>

        <div className="px-4 py-12 max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-500/20 mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="font-display text-2xl text-white mb-2">{tClaim('errorTitle')}</h1>
          <p className="text-white/60 mb-6">{error}</p>
          <Link
            href="/gacha/reveal"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan text-black font-medium rounded-xl"
          >
            {tClaim('tryAnotherCode')}
          </Link>
        </div>
      </div>
    )
  }

  // Already claimed state
  if (pageState === 'already-claimed' && codeData) {
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="px-4 py-4 max-w-xl mx-auto">
          <Link
            href="/gacha"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{tCommon('back')}</span>
          </Link>
        </div>

        <div className="px-4 py-12 max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon-green/20 mb-4">
            <Check className="w-8 h-8 text-neon-green" />
          </div>
          <h1 className="font-display text-2xl text-white mb-2">{tClaim('alreadyClaimedTitle')}</h1>
          <p className="text-white/60 mb-6">
            {tClaim('alreadyClaimedDescription')}
          </p>
          <Link
            href="/gacha"
            className="inline-flex items-center gap-2 px-6 py-3 bg-neon-cyan text-black font-medium rounded-xl"
          >
            {tClaim('browseMoreBoxes')}
          </Link>
        </div>
      </div>
    )
  }

  // Success state
  if (pageState === 'success') {
    const variantTitle = getSelectedVariantTitle()
    return (
      <div className="min-h-screen bg-bg-primary">
        <div className="px-4 py-12 max-w-xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neon-green/20 mb-6">
            <Truck className="w-10 h-10 text-neon-green" />
          </div>
          <h1 className="font-display text-3xl text-white mb-3">{tClaim('successTitle')}</h1>
          <p className="text-white/60 mb-8">
            {tClaim('successDescription')}
          </p>

          {codeData?.revealedProduct && (
            <div className="bg-bg-card border border-border-subtle rounded-xl p-4 mb-8 text-left">
              <div className="flex gap-4">
                {codeData.revealedProduct.image && (
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                    <Image
                      src={codeData.revealedProduct.image.url}
                      alt={codeData.revealedProduct.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {codeData.revealedProduct.title}
                  </p>
                  {variantTitle && variantTitle !== 'Default Title' && (
                    <p className="text-neon-cyan text-sm">{variantTitle}</p>
                  )}
                  <p className="text-white/60 text-sm">
                    {tClaim('shippingTo', { city: formData.city, country: formData.country })}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Link
              href="/gacha"
              className="block w-full py-3 bg-neon-cyan text-black font-medium rounded-xl"
            >
              {tClaim('openMoreBoxes')}
            </Link>
            <Link
              href="/"
              className="block w-full py-3 bg-white/10 text-white font-medium rounded-xl"
            >
              {tClaim('continueShopping')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Form state
  const product = codeData?.revealedProduct
  const variants = product?.variants || []
  const hasVariants = variants.length > 1
  const rarity = codeData?.code?.revealedRarity || 'common'
  const rarityConfig = RARITY_CONFIG[rarity]
  const rarityStyles = getRarityStyles(rarity)

  return (
    <div className="min-h-screen bg-bg-primary pb-8">
      <div className="px-4 py-4 max-w-2xl mx-auto">
        <Link
          href={`/gacha/reveal/${code}`}
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tCommon('back')}</span>
        </Link>
      </div>

      <div className="px-4 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-display text-2xl md:text-3xl text-white mb-2">
            {tClaim('title')}
          </h1>
          <p className="text-white/60">
            {hasVariants ? tClaim('subtitleWithVariants') : tClaim('subtitleShipping')}
          </p>
        </div>

        {/* Product Summary */}
        {product && (
          <div
            className={cn(
              'rounded-xl p-4 mb-6 border',
              rarityStyles.bgColor,
              rarityStyles.borderColor
            )}
          >
            <div className="flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-bg-secondary">
                {product.image ? (
                  <Image
                    src={product.image.url}
                    alt={product.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Package className="w-8 h-8 text-white/20" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-xs font-bold uppercase"
                    style={{ color: rarityConfig.color }}
                  >
                    {rarityConfig.displayName}
                  </span>
                </div>
                <p className="text-white font-medium line-clamp-2">{product.title}</p>
                <p className="text-neon-cyan font-mono text-sm">
                  {formatPrice(product.price.amount, product.price.currencyCode)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Shipping Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Variant Selection */}
          {hasVariants && (
            <div>
              <label className="block text-sm text-white/60 mb-2">{tClaim('selectSize')} *</label>
              <div className="grid grid-cols-4 gap-2">
                {variants.map((variant: ProductVariant) => (
                  <button
                    key={variant.id}
                    type="button"
                    disabled={!variant.availableForSale}
                    onClick={() => handleVariantSelect(variant.id)}
                    className={cn(
                      'py-3 px-4 rounded-lg text-sm font-medium transition-all border',
                      !variant.availableForSale && 'opacity-40 cursor-not-allowed line-through',
                      selectedVariantId === variant.id
                        ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan'
                        : 'border-white/20 text-white/70 hover:border-white/40'
                    )}
                  >
                    {variant.title === 'Default Title' ? tClaim('oneSize') : variant.title}
                  </button>
                ))}
              </div>
              {variantError && (
                <p className="text-red-400 text-xs mt-2">{variantError}</p>
              )}
            </div>
          )}

          {/* Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="claim-firstName" className="block text-sm text-white/60 mb-1">{tClaim('firstName')} *</label>
              <input
                id="claim-firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-bg-card border text-white',
                  'focus:outline-none focus:border-neon-cyan transition-colors',
                  formErrors.firstName ? 'border-red-500' : 'border-border-subtle'
                )}
              />
              {formErrors.firstName && (
                <p className="text-red-400 text-xs mt-1">{formErrors.firstName}</p>
              )}
            </div>
            <div>
              <label htmlFor="claim-lastName" className="block text-sm text-white/60 mb-1">{tClaim('lastName')} *</label>
              <input
                id="claim-lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-bg-card border text-white',
                  'focus:outline-none focus:border-neon-cyan transition-colors',
                  formErrors.lastName ? 'border-red-500' : 'border-border-subtle'
                )}
              />
              {formErrors.lastName && (
                <p className="text-red-400 text-xs mt-1">{formErrors.lastName}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label htmlFor="claim-address1" className="block text-sm text-white/60 mb-1">{tClaim('address')} *</label>
            <input
              id="claim-address1"
              type="text"
              value={formData.address1}
              onChange={(e) => handleInputChange('address1', e.target.value)}
              placeholder={tClaim('addressPlaceholder')}
              className={cn(
                'w-full px-4 py-3 rounded-lg bg-bg-card border text-white',
                'placeholder:text-white/30',
                'focus:outline-none focus:border-neon-cyan transition-colors',
                formErrors.address1 ? 'border-red-500' : 'border-border-subtle'
              )}
            />
            {formErrors.address1 && (
              <p className="text-red-400 text-xs mt-1">{formErrors.address1}</p>
            )}
          </div>

          <div>
            <label htmlFor="claim-address2" className="block text-sm text-white/60 mb-1">{tClaim('apartment')}</label>
            <input
              id="claim-address2"
              type="text"
              value={formData.address2 || ''}
              onChange={(e) => handleInputChange('address2', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border-subtle text-white focus:outline-none focus:border-neon-cyan transition-colors"
            />
          </div>

          {/* City & Postal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="claim-city" className="block text-sm text-white/60 mb-1">{tClaim('city')} *</label>
              <input
                id="claim-city"
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-bg-card border text-white',
                  'focus:outline-none focus:border-neon-cyan transition-colors',
                  formErrors.city ? 'border-red-500' : 'border-border-subtle'
                )}
              />
              {formErrors.city && <p className="text-red-400 text-xs mt-1">{formErrors.city}</p>}
            </div>
            <div>
              <label htmlFor="claim-zip" className="block text-sm text-white/60 mb-1">{tClaim('postalCode')} *</label>
              <input
                id="claim-zip"
                type="text"
                value={formData.zip}
                onChange={(e) => handleInputChange('zip', e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-bg-card border text-white',
                  'focus:outline-none focus:border-neon-cyan transition-colors',
                  formErrors.zip ? 'border-red-500' : 'border-border-subtle'
                )}
              />
              {formErrors.zip && <p className="text-red-400 text-xs mt-1">{formErrors.zip}</p>}
            </div>
          </div>

          {/* Province & Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="claim-province" className="block text-sm text-white/60 mb-1">{tClaim('stateProvince')}</label>
              <input
                id="claim-province"
                type="text"
                value={formData.province || ''}
                onChange={(e) => handleInputChange('province', e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border-subtle text-white focus:outline-none focus:border-neon-cyan transition-colors"
              />
            </div>
            <div>
              <label htmlFor="claim-country" className="block text-sm text-white/60 mb-1">{tClaim('country')} *</label>
              <select
                id="claim-country"
                value={formData.countryCode}
                onChange={(e) => handleCountryChange(e.target.value)}
                className={cn(
                  'w-full px-4 py-3 rounded-lg bg-bg-card border text-white',
                  'focus:outline-none focus:border-neon-cyan transition-colors',
                  formErrors.country ? 'border-red-500' : 'border-border-subtle'
                )}
              >
                <option value="">{tClaim('selectCountry')}</option>
                {COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              {formErrors.country && (
                <p className="text-red-400 text-xs mt-1">{formErrors.country}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="claim-phone" className="block text-sm text-white/60 mb-1">{tClaim('phone')}</label>
            <input
              id="claim-phone"
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-bg-card border border-border-subtle text-white focus:outline-none focus:border-neon-cyan transition-colors"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={pageState === 'submitting'}
            className={cn(
              'w-full py-4 rounded-xl font-medium text-lg',
              'flex items-center justify-center gap-2',
              'transition-all',
              pageState === 'submitting'
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-neon-cyan text-black hover:bg-neon-cyan/90'
            )}
          >
            {pageState === 'submitting' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {tClaim('processing')}
              </>
            ) : (
              <>
                <Truck className="w-5 h-5" />
                {tClaim('submitButton')}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
