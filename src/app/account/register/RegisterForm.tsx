'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { UserPlus, AlertCircle, CheckCircle, Mail } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import type { RegisterFormData } from '@/types/customer'

interface FormErrors {
  firstName?: string
  lastName?: string
  email?: string
  password?: string
  acceptTerms?: string
}

export function RegisterForm() {
  const t = useTranslations('auth')
  const router = useRouter()
  const { register, isLoading, error: storeError } = useAuthStore()

  const [formData, setFormData] = useState<RegisterFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [requiresActivation, setRequiresActivation] = useState(false)

  function validateForm(data: RegisterFormData): FormErrors {
    const errors: FormErrors = {}
    if (!data.firstName.trim()) {
      errors.firstName = t('firstNameRequired')
    } else if (data.firstName.trim().length < 2) {
      errors.firstName = t('firstNameMinLength')
    }
    if (!data.lastName.trim()) {
      errors.lastName = t('lastNameRequired')
    } else if (data.lastName.trim().length < 2) {
      errors.lastName = t('lastNameMinLength')
    }
    if (!data.email.trim()) {
      errors.email = t('emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = t('emailInvalid')
    }
    if (!data.password) {
      errors.password = t('passwordRequired')
    } else if (data.password.length < 8) {
      errors.password = t('passwordMinLength')
    }
    return errors
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    if (!acceptTerms) {
      setErrors((prev) => ({ ...prev, acceptTerms: t('acceptTermsRequired') }))
      return
    }

    const result = await register(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName
    )

    if (result.success) {
      if (result.requiresActivation) {
        // Account created but needs email activation
        setRequiresActivation(true)
      } else {
        // Auto-login succeeded, redirect to dashboard
        router.push('/account/dashboard')
      }
    }
  }

  // Show activation required message
  if (requiresActivation) {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-neon-green" />
        </div>
        <h3 className="font-display text-lg text-white mb-2">{t('accountCreated')}</h3>
        <p className="text-white/60 text-sm mb-4">
          {t('activationEmailSent', { email: formData.email })}
        </p>
        <div className="flex items-center justify-center gap-2 text-white/50 text-sm mb-6">
          <Mail className="w-4 h-4" />
          <span>{t('checkSpamFolder')}</span>
        </div>
        <Link
          href="/account/login"
          className="text-neon-cyan hover:underline text-sm"
        >
          {t('goToSignIn')}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label={t('firstName')}
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder={t('firstNamePlaceholder')}
          error={errors.firstName}
          disabled={isLoading}
          autoComplete="given-name"
        />
        <Input
          label={t('lastName')}
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder={t('lastNamePlaceholder')}
          error={errors.lastName}
          disabled={isLoading}
          autoComplete="family-name"
        />
      </div>

      <Input
        label={t('email')}
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder={t('emailPlaceholder')}
        error={errors.email}
        disabled={isLoading}
        autoComplete="email"
      />

      <Input
        label={t('password')}
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder={t('newPasswordPlaceholder')}
        error={errors.password}
        disabled={isLoading}
        autoComplete="new-password"
      />

      {/* Terms Consent */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => {
            setAcceptTerms(e.target.checked)
            if (errors.acceptTerms) {
              setErrors((prev) => ({ ...prev, acceptTerms: undefined }))
            }
          }}
          className="mt-1 rounded border-white/20 bg-white/5 text-neon-cyan focus:ring-neon-cyan focus:ring-offset-0"
          disabled={isLoading}
        />
        <span className="text-sm text-white/60">
          {t('iAgreeToThe')}{' '}
          <Link href="/policies/terms" className="text-neon-cyan hover:underline" target="_blank">
            {t('termsOfService')}
          </Link>{' '}
          {t('and')}{' '}
          <Link href="/policies/privacy" className="text-neon-cyan hover:underline" target="_blank">
            {t('privacyPolicy')}
          </Link>
        </span>
      </label>
      {errors.acceptTerms && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {errors.acceptTerms}
        </p>
      )}

      {/* Store Error */}
      {storeError && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{storeError}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        glow="cyan"
        isLoading={isLoading}
        className="w-full"
      >
        <UserPlus className="w-4 h-4 mr-2" />
        {t('signUp')}
      </Button>
    </form>
  )
}
