'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { ShopifyCustomerAddress, AddressFormData } from '@/types/customer'

// Common countries for the select
const COUNTRIES = [
  { value: 'US', label: 'United States' },
  { value: 'CA', label: 'Canada' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'AU', label: 'Australia' },
  { value: 'DE', label: 'Germany' },
  { value: 'FR', label: 'France' },
  { value: 'JP', label: 'Japan' },
  { value: 'MX', label: 'Mexico' },
]

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

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'
    if (!formData.address1.trim()) newErrors.address1 = 'Address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.country) newErrors.country = 'Country is required'
    if (!formData.zip.trim()) newErrors.zip = 'ZIP code is required'

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
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          error={errors.firstName}
          disabled={isSubmitting}
          autoComplete="given-name"
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          error={errors.lastName}
          disabled={isSubmitting}
          autoComplete="family-name"
        />
      </div>

      <Input
        label="Company (Optional)"
        name="company"
        value={formData.company}
        onChange={handleChange}
        disabled={isSubmitting}
        autoComplete="organization"
      />

      <Input
        label="Address"
        name="address1"
        value={formData.address1}
        onChange={handleChange}
        error={errors.address1}
        disabled={isSubmitting}
        autoComplete="address-line1"
      />

      <Input
        label="Apartment, suite, etc. (Optional)"
        name="address2"
        value={formData.address2}
        onChange={handleChange}
        disabled={isSubmitting}
        autoComplete="address-line2"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="City"
          name="city"
          value={formData.city}
          onChange={handleChange}
          error={errors.city}
          disabled={isSubmitting}
          autoComplete="address-level2"
        />
        <Input
          label="State / Province"
          name="province"
          value={formData.province}
          onChange={handleChange}
          disabled={isSubmitting}
          autoComplete="address-level1"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Country"
          name="country"
          value={formData.country}
          onChange={handleChange}
          options={COUNTRIES}
          error={errors.country}
          disabled={isSubmitting}
        />
        <Input
          label="ZIP / Postal Code"
          name="zip"
          value={formData.zip}
          onChange={handleChange}
          error={errors.zip}
          disabled={isSubmitting}
          autoComplete="postal-code"
        />
      </div>

      <Input
        label="Phone (Optional)"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        disabled={isSubmitting}
        autoComplete="tel"
      />

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" glow="cyan" isLoading={isSubmitting}>
          {initialData ? 'Update Address' : 'Add Address'}
        </Button>
      </div>
    </form>
  )
}
