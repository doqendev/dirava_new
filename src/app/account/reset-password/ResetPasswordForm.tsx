'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { KeyRound, CheckCircle, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'

type Status = 'idle' | 'loading' | 'success' | 'error' | 'invalid'

interface FormErrors {
  password?: string
  confirmPassword?: string
}

export function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { resetPassword } = useAuthStore()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [apiError, setApiError] = useState<string | null>(null)

  // Get the reset URL from searchParams
  // Shopify sends a URL like: https://yourstore.myshopify.com/account/reset/customerId/token
  const resetUrlParam = searchParams.get('reset_url') || ''

  // Validate that the URL is a valid Shopify reset URL
  const isValidResetUrl = (url: string) => {
    if (!url) return false
    try {
      const parsed = new URL(url)
      // Must be HTTPS and a Shopify domain with reset path
      return (
        parsed.protocol === 'https:' &&
        (parsed.hostname.endsWith('.myshopify.com') || parsed.hostname.endsWith('.shopify.com')) &&
        parsed.pathname.includes('/account/reset/')
      )
    } catch {
      return false
    }
  }

  const resetUrl = isValidResetUrl(resetUrlParam) ? resetUrlParam : ''

  useEffect(() => {
    if (!resetUrl) {
      setStatus('invalid')
    }
  }, [resetUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors: FormErrors = {}

    if (!password) {
      newErrors.password = 'Password is required'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setStatus('loading')
    setApiError(null)

    const result = await resetPassword(resetUrl, password)

    if (result.success) {
      setStatus('success')
      // Redirect to dashboard after 2 seconds (user is auto-logged in)
      setTimeout(() => {
        router.push('/account/dashboard')
      }, 2000)
    } else {
      setStatus('error')
      setApiError(result.errors?.[0]?.message || 'Failed to reset password')
    }
  }

  if (status === 'invalid') {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="font-display text-lg text-white mb-2">Invalid Reset Link</h3>
        <p className="text-white/60 text-sm mb-4">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/account/forgot-password"
          className="text-neon-cyan hover:underline text-sm"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-neon-green" />
        </div>
        <h3 className="font-display text-lg text-white mb-2">Password Reset!</h3>
        <p className="text-white/60 text-sm">
          Your password has been updated. Redirecting to your dashboard...
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="New Password"
        name="password"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value)
          setErrors((prev) => ({ ...prev, password: undefined }))
        }}
        placeholder="At least 8 characters"
        error={errors.password}
        disabled={status === 'loading'}
        autoComplete="new-password"
      />

      <Input
        label="Confirm Password"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value)
          setErrors((prev) => ({ ...prev, confirmPassword: undefined }))
        }}
        placeholder="Confirm your password"
        error={errors.confirmPassword}
        disabled={status === 'loading'}
        autoComplete="new-password"
      />

      {apiError && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{apiError}</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        glow="cyan"
        isLoading={status === 'loading'}
        className="w-full"
      >
        <KeyRound className="w-4 h-4 mr-2" />
        Reset Password
      </Button>
    </form>
  )
}
