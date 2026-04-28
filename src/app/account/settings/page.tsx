'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Save, AlertCircle, CheckCircle } from 'lucide-react'
import { AccountLayout } from '@/components/account/AccountLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useAuthStore } from '@/stores/authStore'

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function SettingsPage() {
  const tAccount = useTranslations('account')
  const tAuth = useTranslations('auth')
  const { customer } = useRequireAuth()
  const { updateCustomer } = useAuthStore()

  const [formData, setFormData] = useState({
    firstName: customer?.firstName || '',
    lastName: customer?.lastName || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
  })
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setStatus('idle')
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setError(null)

    const result = await updateCustomer({
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone || undefined,
    })

    if (result.success) {
      setStatus('success')
      setTimeout(() => setStatus('idle'), 3000)
    } else {
      setStatus('error')
      setError(result.errors?.[0]?.message || 'Failed to update profile')
    }
  }

  return (
    <AccountLayout title={tAccount('settings')} description={tAccount('accountSettingsDescription')}>
      {/* Profile Settings */}
      <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6 mb-6">
        <h2 className="font-display text-lg text-white mb-4">{tAccount('profileInformation')}</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={status === 'loading'}
            />
            <Input
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={status === 'loading'}
            />
          </div>

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            disabled
            className="opacity-50"
          />
          <p className="text-xs text-white/40 -mt-2">
            Email cannot be changed. Contact support if you need to update your email.
          </p>

          <Input
            label="Phone (Optional)"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={status === 'loading'}
          />

          {status === 'error' && error && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="flex items-center gap-2 text-neon-green text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>{tAccount('profileUpdated')}</span>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            glow="cyan"
            isLoading={status === 'loading'}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6">
        <h2 className="font-display text-lg text-white mb-4">{tAuth('password')}</h2>
        <p className="text-white/60 text-sm mb-4">
          To change your password, use the forgot password flow.
        </p>
        <Button as="a" href="/account/forgot-password" variant="outline">
          Reset Password
        </Button>
      </div>

      {/* Marketing Preferences - Optional */}
      <div className="bg-bg-card/50 backdrop-blur-sm border border-border-subtle rounded-xl p-6 mt-6">
        <h2 className="font-display text-lg text-white mb-4">{tAccount('emailPreferences')}</h2>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={customer?.acceptsMarketing || false}
            className="mt-1 w-4 h-4 rounded border-border-subtle bg-bg-secondary text-neon-cyan focus:ring-neon-cyan"
            onChange={() => {
              updateCustomer({ acceptsMarketing: !customer?.acceptsMarketing })
            }}
          />
          <div>
            <span className="text-white">{tAccount('marketingEmails')}</span>
            <p className="text-sm text-white/50">
              Receive updates about new drops, exclusive offers, and anime culture.
            </p>
          </div>
        </label>
      </div>
    </AccountLayout>
  )
}
