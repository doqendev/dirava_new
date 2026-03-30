'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'

type Status = 'idle' | 'loading' | 'success' | 'error'

export function ForgotPasswordForm() {
  const t = useTranslations('auth')
  const { recoverPassword } = useAuthStore()

  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError(t('emailRequired'))
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t('emailInvalid'))
      return
    }

    setStatus('loading')
    setError(null)

    const result = await recoverPassword(email)

    if (result.success) {
      setStatus('success')
    } else {
      setStatus('error')
      setError(result.errors?.[0]?.message || t('failedToSendReset'))
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-4">
        <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-neon-green" />
        </div>
        <h3 className="font-display text-lg text-white mb-2">{t('checkYourEmail')}</h3>
        <p className="text-white/60 text-sm">
          {t('resetEmailSent', { email })}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label={t('emailAddress')}
        name="email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value)
          setError(null)
        }}
        placeholder={t('emailPlaceholder')}
        error={error || undefined}
        disabled={status === 'loading'}
        autoComplete="email"
      />

      {status === 'error' && !error && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{t('failedToSendReset')}</span>
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
        {t('sendResetLink')}
      </Button>
    </form>
  )
}
