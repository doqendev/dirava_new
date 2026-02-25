'use client'

import { useEffect } from 'react'
import { useLocaleStore } from '@/stores/localeStore'
import type { Locale, Currency } from '@/i18n/config'

interface LocaleProviderProps {
  children: React.ReactNode
  initialLocale: Locale
  initialCurrency: Currency
}

export function LocaleProvider({
  children,
  initialLocale,
  initialCurrency,
}: LocaleProviderProps) {
  const { initialize, isInitialized, locale, currency } = useLocaleStore()

  useEffect(() => {
    // Initialize store with server-detected values if not already initialized
    if (!isInitialized) {
      initialize(initialLocale, initialCurrency)
    }
  }, [initialLocale, initialCurrency, initialize, isInitialized])

  // If we have stored preferences that differ from server, we might need to reload
  // For now, just use what we have
  useEffect(() => {
    if (isInitialized && locale !== initialLocale) {
      // User has a different locale preference stored - set cookie and reload might be needed
      document.cookie = `mizoke-locale=${locale};path=/;max-age=31536000;SameSite=Lax`
    }
    if (isInitialized && currency !== initialCurrency) {
      document.cookie = `mizoke-currency=${currency};path=/;max-age=31536000;SameSite=Lax`
    }
  }, [isInitialized, locale, currency, initialLocale, initialCurrency])

  return <>{children}</>
}
