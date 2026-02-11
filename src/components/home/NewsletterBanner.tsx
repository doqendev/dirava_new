'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Mail, Check, Loader2, Zap } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/utils/cn'

export function NewsletterBanner() {
  const t = useTranslations('newsletter')
  const tFooter = useTranslations('footer')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus('success')
        setMessage(t('successMessage'))
        setEmail('')
      } else {
        const data = await res.json()
        setStatus('error')
        setMessage(data.error || t('errorMessage'))
      }
    } catch (error) {
      console.error('Newsletter subscription failed:', error)
      setStatus('error')
      setMessage(t('errorMessage'))
    }
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (status === 'error') {
      setStatus('idle')
      setMessage('')
    }
  }

  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      {/* Dark background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-transparent" />

      {/* Animated neon lines */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-cyan to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-neon-pink to-transparent"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
      </div>

      {/* Floating glow orbs */}
      <motion.div
        className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-neon-cyan/15 rounded-full blur-[100px]"
        animate={{
          x: [0, 30, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-neon-pink/15 rounded-full blur-[100px]"
        animate={{
          x: [0, -30, 0],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />

      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          {/* Pre-headline */}
          <motion.div
            className="flex items-center justify-center gap-2 mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Zap className="w-4 h-4 text-neon-cyan" />
            <span className="text-sm font-medium tracking-widest text-neon-cyan uppercase">
              {t('exclusiveAccess')}
            </span>
            <Zap className="w-4 h-4 text-neon-cyan" />
          </motion.div>

          {/* Main headline with neon glow */}
          <h2 className="relative text-4xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6">
            <span className={cn(
              'relative inline-block',
              'bg-gradient-to-r from-neon-cyan via-white to-neon-pink bg-clip-text text-transparent',
              'drop-shadow-[0_0_25px_rgba(0,245,255,0.5)]'
            )}>
              {t('dontMiss')}
            </span>
            <br />
            <span className={cn(
              'relative inline-block',
              'bg-gradient-to-r from-neon-pink via-white to-neon-cyan bg-clip-text text-transparent',
              'drop-shadow-[0_0_25px_rgba(255,45,106,0.5)]'
            )}>
              {t('theDrop')}
            </span>
          </h2>

          {/* Subtext */}
          <p className="text-base md:text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
            {t('description')}
          </p>

          {/* Form */}
          {status === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={cn(
                'inline-flex items-center gap-3 px-8 py-5 rounded-xl',
                'bg-neon-cyan/10 border border-neon-cyan/30',
                'shadow-[0_0_30px_rgba(0,245,255,0.2)]'
              )}
            >
              <Check className="w-6 h-6 text-neon-cyan" />
              <span className="text-neon-cyan font-semibold">{message}</span>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30 group-focus-within:text-neon-cyan transition-colors" />
                <Input
                  type="email"
                  placeholder={tFooter('emailPlaceholder')}
                  value={email}
                  onChange={handleEmailChange}
                  className={cn(
                    'pl-12 h-14 text-base',
                    'bg-white/5 border-white/10',
                    'focus:border-neon-cyan/50 focus:shadow-[0_0_20px_rgba(0,245,255,0.15)]',
                    'transition-shadow duration-300'
                  )}
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={status === 'loading'}
                className={cn(
                  'h-14 px-10 text-base font-bold',
                  'shadow-[0_0_20px_rgba(0,245,255,0.3)]',
                  'hover:shadow-[0_0_30px_rgba(0,245,255,0.5)]',
                  'transition-shadow duration-300'
                )}
                variant="primary"
              >
                {status === 'loading' ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  t('joinNow')
                )}
              </Button>
            </form>
          )}

          {status === 'error' && (
            <p className="mt-4 text-red-400 text-sm">{message}</p>
          )}

          {/* Privacy note */}
          <p className="mt-8 text-xs text-white/30">
            {t('noSpam')}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
