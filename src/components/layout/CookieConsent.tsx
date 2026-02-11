'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useCookieConsentStore } from '@/stores/cookieConsentStore'

export function CookieConsent() {
  const t = useTranslations('cookies')
  const { consentGiven, preferences, acceptAll, rejectAll, savePreferences } =
    useCookieConsentStore()

  const [showCustomize, setShowCustomize] = useState(false)
  const [localPreferences, setLocalPreferences] = useState({
    analytics: preferences.analytics,
    marketing: preferences.marketing,
  })

  if (consentGiven) return null

  const handleAcceptAll = () => {
    acceptAll()
  }

  const handleRejectAll = () => {
    rejectAll()
  }

  const handleSavePreferences = () => {
    savePreferences(localPreferences)
  }

  const togglePreference = (key: 'analytics' | 'marketing') => {
    setLocalPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'pb-20 lg:pb-0',
          'p-4'
        )}
      >
        <div
          className={cn(
            'max-w-7xl mx-auto',
            'bg-bg-card/95 backdrop-blur-md',
            'border border-white/10 rounded-xl',
            'p-6 shadow-xl'
          )}
        >
          {/* Main Content */}
          <div className="space-y-4">
            {/* Banner Text */}
            <p className="text-sm text-white/80 leading-relaxed">
              {t('banner')}{' '}
              <Link
                href="/policies/privacy"
                className="text-neon-cyan hover:text-neon-cyan/80 underline transition-colors"
              >
                {t('privacyLink')}
              </Link>
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleAcceptAll}
                className={cn(
                  'px-6 py-2.5 rounded-lg font-medium transition-all',
                  'bg-neon-cyan text-bg-primary',
                  'hover:bg-neon-cyan/90',
                  'shadow-glow-sm-cyan hover:shadow-glow-cyan'
                )}
              >
                {t('acceptAll')}
              </button>

              <button
                onClick={handleRejectAll}
                className={cn(
                  'px-6 py-2.5 rounded-lg font-medium transition-all',
                  'bg-white/5 text-white/70 border border-white/10',
                  'hover:bg-white/10 hover:text-white'
                )}
              >
                {t('rejectAll')}
              </button>

              <button
                onClick={() => setShowCustomize(!showCustomize)}
                className={cn(
                  'px-6 py-2.5 rounded-lg font-medium transition-all',
                  'bg-white/5 text-white/70 border border-white/10',
                  'hover:bg-white/10 hover:text-white',
                  'flex items-center justify-center gap-2'
                )}
              >
                {t('customize')}
                {showCustomize ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Customization Panel */}
            <AnimatePresence>
              {showCustomize && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-white/10 space-y-4">
                    {/* Necessary Cookies */}
                    <CookieToggle
                      label={t('necessary')}
                      description={t('necessaryDesc')}
                      enabled={true}
                      disabled={true}
                      onChange={() => {}}
                    />

                    {/* Analytics Cookies */}
                    <CookieToggle
                      label={t('analytics')}
                      description={t('analyticsDesc')}
                      enabled={localPreferences.analytics}
                      onChange={() => togglePreference('analytics')}
                    />

                    {/* Marketing Cookies */}
                    <CookieToggle
                      label={t('marketing')}
                      description={t('marketingDesc')}
                      enabled={localPreferences.marketing}
                      onChange={() => togglePreference('marketing')}
                    />

                    {/* Save Button */}
                    <button
                      onClick={handleSavePreferences}
                      className={cn(
                        'w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium transition-all',
                        'bg-neon-pink text-white',
                        'hover:bg-neon-pink/90',
                        'shadow-glow-sm-pink hover:shadow-glow-pink'
                      )}
                    >
                      {t('save')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

interface CookieToggleProps {
  label: string
  description: string
  enabled: boolean
  disabled?: boolean
  onChange: () => void
}

function CookieToggle({
  label,
  description,
  enabled,
  disabled = false,
  onChange,
}: CookieToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <h4 className="text-sm font-medium text-white mb-1">{label}</h4>
        <p className="text-xs text-white/60">{description}</p>
      </div>

      {/* Custom Toggle Switch */}
      <button
        onClick={disabled ? undefined : onChange}
        disabled={disabled}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-neon-cyan/50 focus:ring-offset-2 focus:ring-offset-bg-primary',
          disabled && 'opacity-50 cursor-not-allowed',
          enabled ? 'bg-neon-cyan' : 'bg-white/20'
        )}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            enabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  )
}
