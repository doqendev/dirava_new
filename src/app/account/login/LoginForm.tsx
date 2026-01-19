'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { LogIn, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'
import type { LoginFormData } from '@/types/customer'

interface FormErrors {
  email?: string
  password?: string
}

function validateForm(data: LoginFormData): FormErrors {
  const errors: FormErrors = {}

  if (!data.email.trim()) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email'
  }

  if (!data.password) {
    errors.password = 'Password is required'
  }

  return errors
}

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Validate returnUrl to prevent open redirect attacks
  const returnUrlParam = searchParams.get('returnUrl') || '/account/dashboard'
  const returnUrl = returnUrlParam.startsWith('/') && !returnUrlParam.startsWith('//')
    ? returnUrlParam
    : '/account/dashboard'

  const { login, devLogin, isLoading, error: storeError } = useAuthStore()

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

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

    const result = await login(formData.email, formData.password)

    if (result.success) {
      router.push(decodeURIComponent(returnUrl))
    }
  }

  const handleDevLogin = () => {
    devLogin()
    router.push(decodeURIComponent(returnUrl))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        placeholder="Enter your password"
        error={errors.password}
        disabled={isLoading}
        autoComplete="current-password"
      />

      {/* Forgot Password Link */}
      <div className="text-right">
        <Link
          href="/account/forgot-password"
          className="text-sm text-neon-cyan hover:underline"
        >
          Forgot password?
        </Link>
      </div>

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
        <LogIn className="w-4 h-4 mr-2" />
        Sign In
      </Button>

      {/* Dev Login - for testing */}
      {process.env.NODE_ENV === 'development' && (
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-xs text-white/40 text-center mb-2">Development Only</p>
          <Button
            type="button"
            variant="ghost"
            onClick={handleDevLogin}
            className="w-full text-neon-orange"
          >
            Dev Login (Test Account)
          </Button>
        </div>
      )}
    </form>
  )
}
