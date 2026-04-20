'use client'

import { useEffect, useRef } from 'react'
import { useLocaleStore } from '@/stores/localeStore'
import { useCartStore } from '@/stores/cartStore'
import type { Locale, Currency } from '@/i18n/config'

interface LocaleProviderProps {
  children: React.ReactNode
  initialLocale: Locale
  initialCurrency: Currency
  initialCountry: string
}

export function LocaleProvider({
  children,
  initialLocale,
  initialCurrency,
  initialCountry,
}: LocaleProviderProps) {
  const initialize = useLocaleStore((s) => s.initialize)
  const country = useLocaleStore((s) => s.country)
  const previousCountry = useRef<string | null>(null)

  useEffect(() => {
    initialize(initialLocale, initialCurrency, initialCountry)
    previousCountry.current = initialCountry.toUpperCase()
  }, [initialLocale, initialCurrency, initialCountry, initialize])

  // When the shopper switches country after the initial hydration, push the
  // new country into Shopify so checkout stays in the matching currency.
  useEffect(() => {
    if (previousCountry.current === null) return
    if (country === previousCountry.current) return
    previousCountry.current = country
    void useCartStore.getState().syncBuyerCountry(country)
  }, [country])

  return <>{children}</>
}
