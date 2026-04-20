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
  const { initialize } = useLocaleStore()

  useEffect(() => {
    initialize(initialLocale, initialCurrency)
  }, [initialLocale, initialCurrency, initialize])

  return <>{children}</>
}
