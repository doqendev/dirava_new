'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import type { ContactFormData, ContactStatus } from '@/types/content'

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export function ContactForm() {
  const t = useTranslations('contact')
  const tErrors = useTranslations('errors')

  const SUBJECT_OPTIONS = [
    { value: '', label: t('selectSubject') },
    { value: 'order', label: t('subjectOrder') },
    { value: 'product', label: t('subjectProduct') },
    { value: 'shipping', label: t('subjectShipping') },
    { value: 'return', label: t('subjectReturn') },
    { value: 'other', label: t('subjectOther') },
  ]

  const validateForm = (data: ContactFormData): FormErrors => {
    const errors: FormErrors = {}

    if (!data.name.trim()) {
      errors.name = t('nameRequired')
    } else if (data.name.trim().length < 2) {
      errors.name = t('nameMinLength')
    }

    if (!data.email.trim()) {
      errors.email = t('emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.email = t('invalidEmail')
    }

    if (!data.subject) {
      errors.subject = t('subjectRequired')
    }

    if (!data.message.trim()) {
      errors.message = t('messageRequired')
    } else if (data.message.trim().length < 10) {
      errors.message = t('messageMinLength')
    } else if (data.message.trim().length > 1000) {
      errors.message = t('messageMaxLength')
    }

    return errors
  }
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    orderNumber: '',
    message: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [status, setStatus] = useState<ContactStatus>('idle')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const validationErrors = validateForm(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setStatus('loading')
    setErrors({})

    try {
      // Simulate API call (replace with actual API endpoint)
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Success
      setStatus('success')
      setFormData({
        name: '',
        email: '',
        subject: '',
        orderNumber: '',
        message: '',
      })

      // Reset after 5 seconds
      setTimeout(() => setStatus('idle'), 5000)
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 rounded-full bg-neon-green/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-neon-green" />
        </div>
        <h3 className="font-display text-xl text-white mb-2">{t('sent')}</h3>
        <p className="text-white/60">
          {t('sentDescription')}
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name and Email Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Input
          label={t('name')}
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={t('namePlaceholder')}
          error={errors.name}
          disabled={status === 'loading'}
          required
        />
        <Input
          label={t('email')}
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder={t('emailPlaceholder')}
          error={errors.email}
          disabled={status === 'loading'}
          required
        />
      </div>

      {/* Subject and Order Number Row */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Select
          label={t('subject')}
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          options={SUBJECT_OPTIONS}
          error={errors.subject}
          disabled={status === 'loading'}
          required
        />
        <Input
          label={t('orderNumber')}
          name="orderNumber"
          value={formData.orderNumber}
          onChange={handleChange}
          placeholder={t('orderNumberPlaceholder')}
          disabled={status === 'loading'}
        />
      </div>

      {/* Message */}
      <Textarea
        label={t('message')}
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder={t('messagePlaceholder')}
        rows={5}
        error={errors.message}
        disabled={status === 'loading'}
        required
      />

      {/* Error Message */}
      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{tErrors('generic')}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        glow="cyan"
        isLoading={status === 'loading'}
        className="w-full sm:w-auto"
      >
        <Send className="w-4 h-4 mr-2" />
        {t('send')}
      </Button>
    </form>
  )
}
