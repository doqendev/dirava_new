import { create } from 'zustand'
import type { Locale, Currency } from '@/i18n/config'
import {
  defaultLocale,
  defaultCurrency,
  defaultCountry,
  locales,
  currencies,
  countryToCurrency,
} from '@/i18n/config'

interface LocaleState {
  locale: Locale
  currency: Currency
  /** ISO 3166-1 alpha-2 uppercase. Drives Shopify Markets presentment + currency. */
  country: string
  isInitialized: boolean

  setLocale: (locale: Locale) => void
  setCurrency: (currency: Currency) => void
  /**
   * Set the shopper's country. Persists via cookie (read by SSR on next
   * navigation) and updates the derived currency. Side effects on cart
   * buyerIdentity are handled by cartStore subscribers.
   */
  setCountry: (country: string) => void
  initialize: (locale: Locale, currency: Currency, country: string) => void
}

function writeCookie(name: string, value: string) {
  if (typeof document === 'undefined') return
  document.cookie = `${name}=${value};path=/;max-age=31536000;SameSite=Lax;Secure`
}

export const useLocaleStore = create<LocaleState>()((set, get) => ({
  locale: defaultLocale,
  currency: defaultCurrency,
  country: defaultCountry,
  isInitialized: false,

  setLocale: (locale) => {
    if (locales.includes(locale)) {
      set({ locale })
      writeCookie('mizoke-locale', locale)
    }
  },

  setCurrency: (currency) => {
    if (currencies.includes(currency)) {
      set({ currency })
      writeCookie('mizoke-currency', currency)
    }
  },

  setCountry: (country) => {
    const upper = country.toUpperCase()
    if (!/^[A-Z]{2}$/.test(upper)) return
    if (upper === get().country) return
    const derivedCurrency = countryToCurrency[upper] ?? defaultCurrency
    set({ country: upper, currency: derivedCurrency })
    writeCookie('mizoke-country', upper)
    writeCookie('mizoke-currency', derivedCurrency)
  },

  initialize: (locale, currency, country) => {
    set({
      locale,
      currency,
      country: country.toUpperCase(),
      isInitialized: true,
    })
  },
}))

// Legacy FX helpers kept for components that use them. Prefer showing the
// price returned by Shopify (already localized via @inContext) over any
// client-side conversion.
const exchangeRates: Record<Currency, number> = {
  EUR: 1,
  GBP: 0.86,
  CAD: 1.47,
  AUD: 1.65,
  USD: 1.08,
}

export function convertPrice(priceInEur: number, targetCurrency: Currency): number {
  const rate = exchangeRates[targetCurrency] || 1
  return priceInEur * rate
}

export function formatPriceWithCurrency(
  amount: string | number,
  sourceCurrency: string,
  targetCurrency: Currency
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (sourceCurrency === targetCurrency) {
    return formatCurrency(numAmount, targetCurrency)
  }

  const sourceRate = exchangeRates[sourceCurrency as Currency] || 1
  const amountInEur = numAmount / sourceRate
  const convertedAmount = convertPrice(amountInEur, targetCurrency)

  return formatCurrency(convertedAmount, targetCurrency)
}

export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat(getLocaleForCurrency(currency), {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(amount)
}

function getLocaleForCurrency(currency: Currency): string {
  switch (currency) {
    case 'EUR':
      return 'de-DE'
    case 'GBP':
      return 'en-GB'
    case 'CAD':
      return 'en-CA'
    case 'AUD':
      return 'en-AU'
    case 'USD':
      return 'en-US'
    default:
      return 'en-US'
  }
}
