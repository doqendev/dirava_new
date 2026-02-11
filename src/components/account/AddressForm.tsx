'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { ShopifyCustomerAddress, AddressFormData } from '@/types/customer'

interface AddressFormProps {
  initialData?: ShopifyCustomerAddress | null
  onSubmit: (data: AddressFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: AddressFormProps) {
  const t = useTranslations('address')
  const tCommon = useTranslations('common')

  // Common countries for the select
  const COUNTRIES = [
    { value: 'US', label: t('unitedStates') },
    { value: 'CA', label: t('canada') },
    { value: 'GB', label: t('unitedKingdom') },
    { value: 'AU', label: t('australia') },
    { value: 'DE', label: t('germany') },
    { value: 'FR', label: t('france') },
    { value: 'JP', label: t('japan') },
    { value: 'MX', label: t('mexico') },
    { value: 'ES', label: t('spain') },
    { value: 'PT', label: t('portugal') },
  ]
  const [formData, setFormData] = useState<AddressFormData>({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    company: initialData?.company || '',
    address1: initialData?.address1 || '',
    address2: initialData?.address2 || '',
    city: initialData?.city || '',
    province: initialData?.province || '',
    country: initialData?.countryCodeV2 || 'US',
    zip: initialData?.zip || '',
    phone: initialData?.phone || '',
  })

  const [errors, setErrors] = useState<Partial<AddressFormData>>({})

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof AddressFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: Partial<AddressFormData> = {}

    if (!formData.firstName.trim()) newErrors.firstName = t('firstNameRequired')
    if (!formData.lastName.trim()) newErrors.lastName = t('lastNameRequired')
    if (!formData.address1.trim()) newErrors.address1 = t('addressRequired')
    if (!formData.city.trim()) newErrors.city = t('cityRequired')
    if (!formData.country) newErrors.country = t('countryRequired')
    if (!formData.zip.trim()) newErrors.zip = t('zipRequired')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    await onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('firstName')}
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          disabled={isSubmitting}
          autoComplete="given-name"
        />
        <Input
          label={t('lastName')}
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          disabled={isSubmitting}
          autoComplete="family-name"
        />
      </div>

      <Input
        label={t('company')}
        name="company"
        value={formData.company}
        onChange={handleChange}
        disabled={isSubmitting}
        autoComplete="organization"
      />

      <Input
        label={t('address')}
        name="address1"
        value={formData.address1}
        onChange={handleChange}
        error={errors.address1}
        disabled={isSubmitting}
        autoComplete="address-line1"
      />

      <Input
        label={t('address2')}
        name="address2"
        value={formData.address2}
        onChange={handleChange}
        disabled={isSubmitting}
        autoComplete="address-line2"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('city')}
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={errors.city}
          disabled={isSubmitting}
          autoComplete="address-level2"
        />
        <Input
          label={t('province')}
          name="province"
          value={formData.province}
          onChange={handleChange}
          disabled={isSubmitting}
          autoComplete="address-level1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label={t('country')}
          name="country"
          value={formData.country}
          onChange={handleChange}
          options={COUNTRIES}
          error={errors.country}
          disabled={isSubmitting}
        />
        <Input
          label={t('zip')}
          name="zip"
          value={formData.zip}
          onChange={handleChange}
          error={errors.zip}
          disabled={isSubmitting}
          autoComplete="postal-code"
        />
      </div>

      <Input
        label={t('phone')}
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        disabled={isSubmitting}
        autoComplete="tel"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          {tCommon('cancel')}
        </Button>
        <Button type="submit" variant="primary" glow="cyan" isLoading={isSubmitting}>
          {initialData ? t('updateAddress') : t('addAddress')}
        </Button>
      </div>
    </form>
  )
}
