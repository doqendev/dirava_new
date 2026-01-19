'use client'

import { useState } from 'react'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ForgotPasswordForm() {
  const { recoverPassword } = useAuthStore()

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email')
      return
    }

    setStatus('loading')
    setError(null)

    const result = await recoverPassword(email)

    if (result.success) {
      setStatus('success')
    } else {
      setStatus('error')
      setError(result.errors?.[0]?.message || 'Failed to send reset email')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-neon-green" />
        </div>
        <h3 className="font-display text-lg text-white mb-2">Check Your Email</h3>
        <p className="text-white/60 text-sm">
          If an account exists for {email}, you&apos;ll receive a password reset link shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email Address"
        name="email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setError(null)
        }}
        placeholder="your@email.com"
        error={error || undefined}
        disabled={status === 'loading'}
        autoComplete="email"
      />

      {status === 'error' && !error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to send reset email. Please try again.</span>
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        glow="cyan"
        isLoading={status === 'loading'}
        className="w-full"
      >
        <Send className="w-4 h-4 mr-2" />
        Send Reset Link
      </Button>
    </form>
  )
}
