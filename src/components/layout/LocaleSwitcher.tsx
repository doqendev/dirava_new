'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Globe, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { useLocaleStore } from '@/stores/localeStore'
import {
  locales,
  localeNames,
  currencies,
  currencyConfig,
  type Locale,
  type Currency,
} from '@/i18n/config'

export function LocaleSwitcher() {
  const router = useRouter()
  const { locale, currency, setLocale, setCurrency } = useLocaleStore()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLocaleChange = (newLocale: Locale) => {
    setLocale(newLocale)
    // Refresh the page to get new translations
    router.refresh()
  }

  const handleCurrencyChange = (newCurrency: Currency) => {
    setCurrency(newCurrency)
  }

  const getCurrencyDisplay = (curr: Currency) => {
    const config = currencyConfig[curr]
    return `${config.symbol} ${curr}`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg',
          'bg-white/5 border border-white/10',
          'text-white/70 text-sm',
          'hover:bg-white/10 hover:text-white',
          'transition-colors duration-200'
        )}
        aria-label="Change language and currency"
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <span className="text-white/40">|</span>
        <span>{getCurrencyDisplay(currency)}</span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform duration-200',
          isOpen && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute bottom-full left-0 mb-2 z-50',
              'w-64 p-4 rounded-xl',
              'bg-bg-card border border-border-subtle',
              'shadow-xl'
            )}
          >
            {/* Language Selection */}
            <div className="mb-4">
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">
                Language
              </p>
              <div className="grid grid-cols-2 gap-1">
                {locales.map((loc) => (
                  <button
                    key={loc}
                    onClick={() => handleLocaleChange(loc)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm text-left',
                      'transition-colors duration-150',
                      loc === locale
                        ? 'bg-neon-cyan/20 text-neon-cyan'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {localeNames[loc]}
                  </button>
                ))}
              </div>
            </div>

            {/* Currency Selection */}
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">
                Currency
              </p>
              <div className="grid grid-cols-2 gap-1">
                {currencies.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => handleCurrencyChange(curr)}
                    className={cn(
                      'px-3 py-2 rounded-lg text-sm text-left',
                      'transition-colors duration-150',
                      curr === currency
                        ? 'bg-neon-cyan/20 text-neon-cyan'
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {getCurrencyDisplay(curr)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
