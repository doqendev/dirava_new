'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Instagram, Twitter, Music2, MessageCircle, Send, CheckCircle, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'
import { SOCIAL_LINKS } from '@/lib/utils/constants'
import { LocaleSwitcher } from './LocaleSwitcher'

const socialIcons: Record<string, LucideIcon> = {
  Instagram,
  Twitter,
  TikTok: Music2,
  Discord: MessageCircle,
}

const socialLinks = SOCIAL_LINKS.map((link) => ({
  ...link,
  icon: socialIcons[link.label] || MessageCircle,
}))

// Footer link column component
function FooterLinkColumn({
  title,
  links,
}: {
  title: string
  links: Array<{ label: string; href: string }>
}) {
  return (
    <nav aria-label={`${title} links`}>
      <h3 className="font-display text-sm uppercase tracking-wider text-white mb-4">
        {title}
      </h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-white/50 hover:text-neon-cyan transition-colors duration-200"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}

// Newsletter form component
function NewsletterForm() {
  const t = useTranslations('footer')
  const tErrors = useTranslations('errors')
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Consent check
    if (!consent) {
      setStatus('error')
      setErrorMessage(t('consentRequired'))
      return
    }

    // Basic email validation
    if (!email.trim()) {
      setStatus('error')
      setErrorMessage(tErrors('invalidEmail'))
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || tErrors('generic'))
      }

      setStatus('success')
      setEmail('')
      setConsent(false)

      // Reset after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : tErrors('generic'))
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 max-w-md">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value)
              if (status === 'error') setStatus('idle')
            }}
            placeholder={t('emailPlaceholder')}
            disabled={status === 'loading' || status === 'success'}
            className={cn(
              'w-full px-4 py-3',
              'bg-black/40 border border-white/20 rounded-lg',
              'text-white placeholder:text-white/30',
              'transition-all duration-200',
              'focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              status === 'error' && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
            aria-label={t('emailPlaceholder')}
          />
        </div>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          glow="cyan"
          isLoading={status === 'loading'}
          disabled={status === 'success'}
          className="whitespace-nowrap"
        >
          {status === 'success' ? (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {t('subscribed')}
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {t('subscribe')}
            </>
          )}
        </Button>
      </div>
      <label className="flex items-start gap-2 text-xs text-white/50 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => {
            setConsent(e.target.checked)
            if (status === 'error') setStatus('idle')
          }}
          className="mt-0.5 rounded border-white/20 bg-black/40 text-neon-cyan focus:ring-neon-cyan"
          disabled={status === 'loading' || status === 'success'}
        />
        <span>
          {t('newsletterConsent')}{' '}
          <Link href="/policies/privacy" className="text-neon-cyan hover:underline">
            {t('privacyPolicy')}
          </Link>
        </span>
      </label>
      {status === 'error' && (
        <p className="text-xs text-red-500">
          {errorMessage}
        </p>
      )}
    </form>
  )
}

export function Footer() {
  const t = useTranslations('footer')
  const tCommon = useTranslations('common')
  const tHeader = useTranslations('header')

  // Footer link sections with translations
  const shopLinks = [
    { label: tCommon('worlds'), href: '/worlds' },
    { label: tCommon('drops'), href: '/drops' },
    { label: tCommon('newArrivals'), href: '/new' },
    { label: tCommon('sale'), href: '/sale' },
  ]

  const accountLinks = [
    { label: tCommon('account'), href: '/account' },
    { label: tCommon('orders'), href: '/account/orders' },
    { label: tCommon('wishlist'), href: '/account/wishlist' },
  ]

  const policyLinks = [
    { label: t('privacyPolicy'), href: '/policies/privacy' },
    { label: t('termsOfService'), href: '/policies/terms' },
    { label: t('shippingPolicy'), href: '/policies/shipping' },
    { label: t('returnsRefunds'), href: '/policies/returns' },
    { label: t('imprint'), href: '/policies/imprint' },
    { label: t('faq'), href: '/faq' },
    { label: t('contactUs'), href: '/contact' },
  ]

  return (
    <footer className="bg-bg-primary border-t border-border-subtle" aria-label="Site footer">
      {/* Newsletter Section */}
      <div
        className="relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 245, 255, 0.1) 0%, transparent 50%, rgba(0, 245, 255, 0.05) 100%)',
        }}
      >
        {/* Decorative glow */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ backgroundColor: '#00f5ff' }}
        />

        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-2xl md:text-3xl font-bold text-white mb-2"
              style={{
                textShadow: '0 0 20px rgba(0, 245, 255, 0.5)',
              }}
            >
              {t('joinSpirit')}
            </motion.h2>
            <p className="text-white/60 mb-6">
              {t('newsletterDescription')}
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Shop Links */}
          <FooterLinkColumn title={t('shop')} links={shopLinks} />

          {/* Account Links */}
          <FooterLinkColumn title={t('account')} links={accountLinks} />

          {/* Policy Links */}
          <FooterLinkColumn title={t('policies')} links={policyLinks} />

          {/* Connect Section */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-wider text-white mb-4">
              {t('connect')}
            </h3>
            <p className="text-sm text-white/50 mb-4">
              {t('followUs')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    'w-10 h-10 rounded-lg',
                    'bg-white/5 border border-white/10',
                    'flex items-center justify-center',
                    'text-white/50 hover:text-neon-cyan hover:border-neon-cyan/50',
                    'transition-colors duration-200'
                  )}
                  aria-label={`${social.label} (opens in new window)`}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border-subtle pb-20 lg:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-white/50">
              {t('copyright', { year: new Date().getFullYear() })}
            </p>

            {/* Logo */}
            <Link href="/" className="flex flex-col items-center">
              <span
                className="font-display text-xl font-bold text-white tracking-wider"
                style={{
                  textShadow: '0 0 15px rgba(0, 245, 255, 0.4)',
                }}
              >
                MIZOKE
              </span>
              <span className="text-[9px] text-neon-cyan/60 tracking-[2px]">
                {tHeader('tagline')}
              </span>
            </Link>

            {/* Language/Currency Switcher and Trust badges */}
            <div className="flex items-center gap-4">
              <LocaleSwitcher />
              <div className="hidden sm:flex items-center gap-2 text-white/30 text-xs">
                <span>{t('secureCheckout')}</span>
                <span>•</span>
                <span>{t('worldwideShipping')}</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 border-t border-white/5 pt-4">
            <span className="text-xs text-white/30 sr-only" id="payment-methods-label">
              Accepted payment methods
            </span>
            <div
              className="flex items-center gap-3"
              role="list"
              aria-labelledby="payment-methods-label"
            >
              {/* Visa */}
              <div role="listitem" aria-label="Visa" title="Visa" className="text-white/40 hover:text-white/70 transition-colors duration-200">
                <svg className="h-7 w-auto" viewBox="0 0 48 16" fill="currentColor" aria-hidden="true">
                  <path d="M18.72 0 13.8 15.8h-3.47L5.43 3.48c-.27-.73-.5-.97-1.06-1.27C3.36 1.74 1.68 1.24 0 .97L.07 0h5.57c.75 0 1.43.5 1.6 1.37l1.46 7.77L12.04 0h3.48l3.2 0zm5.7 0-2.8 15.8H18.3L21.1 0h3.32zm10.3 10.63c.01-3.06-4.24-3.23-4.21-4.6.01-.41.41-.86 1.27-.97.43-.06 1.61-.1 2.95.52l.52-2.44A8.06 8.06 0 0 0 32.97 2.5c-3.27 0-5.57 1.74-5.59 4.22-.02 1.84 1.64 2.86 2.89 3.47 1.29.63 1.72 1.03 1.71 1.59-.01.86-1.02 1.24-1.97 1.25-1.65.03-2.61-.44-3.37-.8l-.6 2.79c.77.35 2.18.66 3.65.67 3.45 0 5.71-1.71 5.73-4.36zM48 15.8h-3.04l-.48-2.32h-4.22l-.72 2.32H36.2L40.83 0h3.04L48 15.8zm-4.1-5.14-1.34-6.57-1.88 6.57h3.22z"/>
                </svg>
              </div>

              {/* Mastercard */}
              <div role="listitem" aria-label="Mastercard" title="Mastercard" className="text-white/40 hover:text-white/70 transition-colors duration-200">
                <svg className="h-7 w-auto" viewBox="0 0 38 24" fill="currentColor" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" opacity="0.8"/>
                  <circle cx="26" cy="12" r="10" opacity="0.5"/>
                  <path d="M19 5.26a10 10 0 0 1 0 13.48A10 10 0 0 1 19 5.26z" opacity="0.7"/>
                </svg>
              </div>

              {/* PayPal */}
              <div role="listitem" aria-label="PayPal" title="PayPal" className="text-white/40 hover:text-white/70 transition-colors duration-200">
                <svg className="h-7 w-auto" viewBox="0 0 60 20" fill="currentColor" aria-hidden="true">
                  <path d="M10.5 0C6.8 0 4.5 1.9 3.8 5.1L1 18.6h4.2l.8-4.3h2.8c4.4 0 7.1-2.1 7.8-5.9.6-3.3-1.3-5.3-4.4-5.7L10.5 0zm.3 3.6c1.7.2 2.5 1.3 2.1 3.3-.4 2.2-1.9 3.4-4 3.4H7L8.5 3.7l2.3-.1zM22 5.4c-1.1 0-2 .2-2.9.5l-.5 2.6c.8-.4 1.7-.6 2.7-.6 1.1 0 1.7.4 1.5 1.3l-.1.4h-1.4c-2.9 0-4.6 1.2-5 3.4-.3 1.7.7 2.8 2.4 2.8 1.2 0 2.1-.4 2.9-1.1l-.2.9h3.5l1.4-7.2C26.9 6.3 25 5.4 22 5.4zm.3 6.5c-.2 1-.9 1.6-1.9 1.6-.7 0-1.1-.4-1-1 .2-.9.9-1.4 2.1-1.4h1.1l-.3.8zM33.2 5.6h-3.6L27 15.8h3.6l1.6-7.2 2.2 7.2h3.5l4.2-10.2h-3.6l-2.2 6.8-1.1-6.8z"/>
                </svg>
              </div>

              {/* Apple Pay */}
              <div role="listitem" aria-label="Apple Pay" title="Apple Pay" className="text-white/40 hover:text-white/70 transition-colors duration-200">
                <svg className="h-7 w-auto" viewBox="0 0 50 20" fill="currentColor" aria-hidden="true">
                  <path d="M9.8 3.4c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.6 1.4-.6.7-1.1 1.8-.9 2.8 1 .1 2-.5 2.6-1.3zM10.7 5c-1.4-.1-2.7.8-3.4.8-.7 0-1.8-.8-3-.7C2.8 5.2 1.4 6.3.7 7.9c-1.4 2.9-.4 7.2.9 9.5.6 1.1 1.4 2.3 2.4 2.3 1 0 1.3-.6 2.5-.6 1.2 0 1.5.6 2.5.6 1 0 1.7-1.1 2.3-2.2.7-1.2 1-2.5 1-2.5-1.9-.7-3.2-2.7-3.2-5 0-2 1-3.7 2.6-4.7-.9-.8-2-.9-2.8-.9zm9.7-.6h-2.7L13.9 18h2.2l1-3.1h3.8l1 3.1H24L19.4 4.4zm-2 8.4 1.5-4.7 1.5 4.7h-3zm11.7-8.6c-2.1 0-3.5 1.2-3.5 3 0 1.3.8 2.3 2.1 2.7l1.6.5c.8.3 1.2.7 1.2 1.3 0 .7-.7 1.2-1.7 1.2-1.1 0-1.8-.5-1.9-1.4h-2.1c.1 2 1.5 3.2 4 3.2 2.2 0 3.8-1.2 3.8-3 0-1.4-.8-2.3-2.4-2.8l-1.5-.5c-.8-.2-1.1-.6-1.1-1.2 0-.7.6-1.2 1.5-1.2s1.6.5 1.7 1.3h2c-.1-1.8-1.5-3.1-3.7-3.1zm9 0c-2.1 0-3.5 1.2-3.5 3 0 1.3.8 2.3 2.1 2.7l1.6.5c.8.3 1.2.7 1.2 1.3 0 .7-.7 1.2-1.7 1.2-1.1 0-1.8-.5-1.9-1.4h-2.1c.1 2 1.5 3.2 4 3.2 2.2 0 3.8-1.2 3.8-3 0-1.4-.8-2.3-2.4-2.8l-1.5-.5c-.8-.2-1.1-.6-1.1-1.2 0-.7.6-1.2 1.5-1.2s1.6.5 1.7 1.3h2c-.1-1.8-1.5-3.1-3.7-3.1z"/>
                </svg>
              </div>

              {/* Google Pay */}
              <div role="listitem" aria-label="Google Pay" title="Google Pay" className="text-white/40 hover:text-white/70 transition-colors duration-200">
                <svg className="h-7 w-auto" viewBox="0 0 56 20" fill="currentColor" aria-hidden="true">
                  <path d="M26.1 9.7v4.9h-1.5V3h4.1c1 0 1.9.4 2.6 1 .7.7 1.1 1.5 1.1 2.5s-.4 1.8-1.1 2.5c-.7.7-1.6 1-2.6 1l-2.6-.3zm0-5.4v4.1h2.6c.6 0 1.1-.2 1.5-.6.4-.4.6-.9.6-1.5 0-.5-.2-1-.6-1.4-.4-.4-.9-.6-1.5-.6h-2.6zm9.4 2.3c1.1 0 2 .3 2.6.9.6.6.9 1.4.9 2.5v5h-1.4v-1.1c-.6.9-1.4 1.3-2.5 1.3-.9 0-1.7-.3-2.3-.8-.6-.5-.9-1.2-.9-2 0-.9.3-1.5 1-2 .6-.5 1.5-.7 2.5-.7 1 0 1.7.2 2.3.5v-.3c0-.7-.2-1.3-.7-1.7-.5-.4-1-.6-1.7-.6-.5 0-1 .1-1.4.4-.4.2-.7.6-.9 1l-1.3-.5c.3-.7.8-1.3 1.4-1.7.6-.4 1.4-.6 2.4-.6zm-.3 7.8c.7 0 1.2-.2 1.7-.7.5-.5.7-1 .7-1.6v-.8c-.5-.3-1.2-.5-2-.5-.7 0-1.3.2-1.7.5-.4.3-.6.7-.6 1.3 0 .5.2.9.5 1.2.4.4.9.6 1.4.6zm6.6 3.7-1.4-.5 2-4.8-3.7-8.3h1.5l2.8 6.7 2.7-6.7h1.5l-5.4 13.6z"/>
                  <path d="M15.2 9.4c0-.5 0-.9-.1-1.4H8v2.6h4.1c-.2.9-.7 1.7-1.4 2.2v1.8h2.3c1.4-1.2 2.2-3 2.2-5.2zM8 17c2 0 3.7-.7 5-1.8l-2.3-1.8c-.7.5-1.6.7-2.7.7-2 0-3.8-1.4-4.4-3.3H1.2v1.9C2.5 15.1 5.1 17 8 17zM3.6 10.8c-.2-.5-.3-1-.3-1.5s.1-1 .3-1.5V5.9H1.2C.4 7.5 0 9.2 0 11s.4 3.5 1.2 5.1l2.4-2 .0-3.3zM8 4.6c1.1 0 2.1.4 2.9 1.2L13 3.7C11.7 2.5 10 1.8 8 1.8 5.1 1.8 2.5 3.7 1.2 6.4l2.4 1.9C4.2 6 6 4.6 8 4.6z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
