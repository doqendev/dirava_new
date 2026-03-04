'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
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

function validateForm(data: RegisterFormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.firstName.trim()) {
    errors.firstName = 'First name is required'
  } else if (data.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters'
  }

  if (!data.lastName.trim()) {
    errors.lastName = 'Last name is required'
  } else if (data.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters'
  }

  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  } else if (data.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }

  return errors
}

export function RegisterForm() {
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
      setErrors((prev) => ({ ...prev, acceptTerms: 'You must agree to the terms to create an account' }))
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
        <h3 className="font-display text-lg text-white mb-2">Account Created!</h3>
        <p className="text-white/60 text-sm mb-4">
          We&apos;ve sent an activation email to <span className="text-neon-cyan">{formData.email}</span>.
          Please check your inbox and click the activation link to complete your registration.
        </p>
        <div className="flex items-center justify-center gap-2 text-white/50 text-sm mb-6">
          <Mail className="w-4 h-4" />
          <span>Check your spam folder if you don&apos;t see it</span>
        </div>
        <Link
          href="/account/login"
          className="text-neon-cyan hover:underline text-sm"
        >
          Go to Sign In
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="John"
          error={errors.firstName}
          disabled={isLoading}
          autoComplete="given-name"
        />
        <Input
          label="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Doe"
          error={errors.lastName}
          disabled={isLoading}
          autoComplete="family-name"
        />
      </div>

      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="your@email.com"
        error={errors.email}
        disabled={isLoading}
        autoComplete="email"
      />

      <Input
        label="Password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        placeholder="At least 8 characters"
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
          I have read and agree to the{' '}
          <Link href="/policies/terms" className="text-neon-cyan hover:underline" target="_blank">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/policies/privacy" className="text-neon-cyan hover:underline" target="_blank">
            Privacy Policy
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
        Create Account
      </Button>
    </form>
  )
}
