'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Globe, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { useLocaleStore } from '@/stores/localeStore'
import {
  locales,
  localeNames,
  countryToCurrency,
  currencyConfig,
  type Locale,
} from '@/i18n/config'

interface ShoppingCountry {
  code: string
  name: string
  flag: string
}

// Countries surfaced in the switcher. Any country with an entry in
// countryToCurrency will also be honoured if set via cookie / geo-header —
// this list just controls the picker UI.
const SHOPPING_COUNTRIES: ShoppingCountry[] = [
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'ES', name: 'Spain', flag: '🇪🇸' },
  { code: 'IT', name: 'Italy', flag: '🇮🇹' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
  { code: 'IE', name: 'Ireland', flag: '🇮🇪' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
]

export function LocaleSwitcher() {
  const router = useRouter()
  const tHeader = useTranslations('header')
  const locale = useLocaleStore((s) => s.locale)
  const currency = useLocaleStore((s) => s.currency)
  const country = useLocaleStore((s) => s.country)
  const setLocale = useLocaleStore((s) => s.setLocale)
  const setCountry = useLocaleStore((s) => s.setCountry)

  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

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
    setIsOpen(false)
    router.refresh()
  }

  const handleCountryChange = (newCountry: string) => {
    setCountry(newCountry)
    setIsOpen(false)
    // Refresh so server-rendered price fragments re-fetch in the new market.
    router.refresh()
  }

  const currencySymbol = currencyConfig[currency]?.symbol ?? ''
  const selectedCountry =
    SHOPPING_COUNTRIES.find((c) => c.code === country)?.flag ?? '🌐'

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
        aria-label={tHeader('changeLanguage')}
        aria-expanded={isOpen}
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <span className="text-white/40">|</span>
        <span className="flex items-center gap-1">
          <span aria-hidden>{selectedCountry}</span>
          <span>{currencySymbol} {currency}</span>
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
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
              'w-72 p-4 rounded-xl',
              'bg-bg-card border border-border-subtle',
              'shadow-xl'
            )}
          >
            {/* Language */}
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

            {/* Ship-to country (drives currency + checkout) */}
            <div>
              <p className="text-xs text-white/50 uppercase tracking-wider mb-2">
                Ship to
              </p>
              <div className="max-h-60 overflow-y-auto pr-1 -mr-1 space-y-0.5">
                {SHOPPING_COUNTRIES.map((c) => {
                  const curr = countryToCurrency[c.code]
                  const symbol = curr ? currencyConfig[curr]?.symbol ?? '' : ''
                  const active = c.code === country
                  return (
                    <button
                      key={c.code}
                      onClick={() => handleCountryChange(c.code)}
                      className={cn(
                        'w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg text-sm text-left',
                        'transition-colors duration-150',
                        active
                          ? 'bg-neon-cyan/20 text-neon-cyan'
                          : 'text-white/70 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span aria-hidden className="text-base leading-none">{c.flag}</span>
                        <span className="truncate">{c.name}</span>
                      </span>
                      {curr && (
                        <span className="font-mono text-[11px] text-white/45 shrink-0">
                          {symbol}{curr}
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
