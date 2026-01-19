'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Instagram, Twitter, Music2, MessageCircle, Send, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/Button'

// Footer link sections
const shopLinks = [
  { label: 'Worlds', href: '/worlds' },
  { label: 'Drops', href: '/drops' },
  { label: 'New Arrivals', href: '/new' },
  { label: 'Sale', href: '/sale' },
]

const accountLinks = [
  { label: 'My Account', href: '/account' },
  { label: 'Order Tracking', href: '/account/orders' },
  { label: 'Wishlist', href: '/wishlist' },
]

const policyLinks = [
  { label: 'Privacy Policy', href: '/policies/privacy' },
  { label: 'Terms of Service', href: '/policies/terms' },
  { label: 'Shipping Policy', href: '/policies/shipping' },
  { label: 'Returns & Refunds', href: '/policies/returns' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Accessibility', href: '/policies/accessibility' },
]

const socialLinks = [
  { label: 'Instagram', href: 'https://instagram.com', icon: Instagram },
  { label: 'Twitter', href: 'https://twitter.com', icon: Twitter },
  { label: 'TikTok', href: 'https://tiktok.com', icon: Music2 },
  { label: 'Discord', href: 'https://discord.com', icon: MessageCircle },
]

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
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Basic email validation
    if (!email.trim()) {
      setStatus('error')
      setErrorMessage('Please enter an email address')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      // Simulate API call (replace with actual newsletter integration)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setStatus('success')
      setEmail('')

      // Reset after 3 seconds
      setTimeout(() => setStatus('idle'), 3000)
    } catch {
      setStatus('error')
      setErrorMessage('Failed to subscribe. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col sm:flex-row gap-3 max-w-md">
      <div className="flex-1 relative">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (status === 'error') setStatus('idle')
          }}
          placeholder="Enter your email"
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
          aria-label="Email address for newsletter"
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
            Subscribed
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Subscribe
          </>
        )}
      </Button>
      {status === 'error' && (
        <p className="absolute -bottom-6 left-0 text-xs text-red-500">
          {errorMessage}
        </p>
      )}
    </form>
  )
}

export function Footer() {
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
              JOIN THE COLLECTIVE
            </motion.h2>
            <p className="text-white/60 mb-6">
              Get exclusive drops, early access, and special offers delivered to your inbox.
            </p>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Shop Links */}
          <FooterLinkColumn title="Shop" links={shopLinks} />

          {/* Account Links */}
          <FooterLinkColumn title="Account" links={accountLinks} />

          {/* Policy Links */}
          <FooterLinkColumn title="Policies" links={policyLinks} />

          {/* Connect Section */}
          <div>
            <h3 className="font-display text-sm uppercase tracking-wider text-white mb-4">
              Connect
            </h3>
            <p className="text-sm text-white/50 mb-4">
              Follow us for the latest drops and anime culture.
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
      <div className="border-t border-border-subtle">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <p className="text-sm text-white/40">
              © {new Date().getFullYear()} Neo-Stage Collective. All rights reserved.
            </p>

            {/* Logo */}
            <Link href="/" className="flex flex-col items-center">
              <span
                className="font-display text-lg font-bold text-white/60 tracking-wider"
                style={{
                  textShadow: '0 0 10px rgba(255, 255, 255, 0.2)',
                }}
              >
                NEO-STAGE
              </span>
              <span className="font-display text-[8px] text-white/30 tracking-[3px]">
                COLLECTIVE
              </span>
            </Link>

            {/* Payment/Trust badges placeholder */}
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <span>Secure Checkout</span>
              <span>•</span>
              <span>Worldwide Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
