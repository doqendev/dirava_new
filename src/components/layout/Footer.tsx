'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Send, CheckCircle } from 'lucide-react'
import { FaInstagram, FaXTwitter, FaTiktok, FaDiscord, FaCcVisa, FaCcMastercard, FaCcPaypal, FaApplePay, FaGooglePay } from 'react-icons/fa6'
import type { IconType } from 'react-icons'
import { cn } from '@/lib/utils/cn'
import { MizokeLogo } from '@/components/ui/MizokeLogo'
import { Button } from '@/components/ui/Button'
import { SOCIAL_LINKS } from '@/lib/utils/constants'
import { LocaleSwitcher } from './LocaleSwitcher'

const socialIcons: Record<string, IconType> = {
  Instagram: FaInstagram,
  Twitter: FaXTwitter,
  TikTok: FaTiktok,
  Discord: FaDiscord,
}

const socialLinks = SOCIAL_LINKS.map((link) => ({
  ...link,
  icon: socialIcons[link.label] || FaDiscord,
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
    { label: t('about'), href: '/about' },
    { label: t('guides'), href: '/guides' },
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
            <Link href="/" className="flex justify-center">
              <MizokeLogo className="h-8 w-auto" />
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
              className="flex items-center gap-4"
              role="list"
              aria-labelledby="payment-methods-label"
            >
              <div role="listitem" aria-label="Visa" title="Visa" className="text-white/40 hover:text-white/70 transition-colors duration-200">
                <FaCcVisa className="h-8 w-auto" />
              </div>
              <div role="listitem" aria-label="Mastercard" title="Mastercard" className="text-white/40 hover:text-white/70 transition-colors duration-200">
                <FaCcMastercard className="h-8 w-auto" />
              </div>
              <div role="listitem" aria-label="PayPal" title="PayPal" className="text-white/40 hover:text-white/70 transition-colors duration-200">
                <FaCcPaypal className="h-8 w-auto" />
              </div>
              <div role="listitem" aria-label="Apple Pay" title="Apple Pay" className="text-white/40 hover:text-white/70 transition-colors duration-200">
                <FaApplePay className="h-8 w-auto" />
              </div>
              <div role="listitem" aria-label="Google Pay" title="Google Pay" className="text-white/40 hover:text-white/70 transition-colors duration-200">
                <FaGooglePay className="h-8 w-auto" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
