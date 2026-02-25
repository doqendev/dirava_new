import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Locale, Currency } from '@/i18n/config'
import { defaultLocale, defaultCurrency, locales, currencies } from '@/i18n/config'

interface LocaleState {
  locale: Locale
  currency: Currency
  isInitialized: boolean

  // Actions
  setLocale: (locale: Locale) => void
  setCurrency: (currency: Currency) => void
  initialize: (locale: Locale, currency: Currency) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      currency: defaultCurrency,
      isInitialized: false,

      setLocale: (locale) => {
        if (locales.includes(locale)) {
          set({ locale })
          // Also set cookie for server-side access
          document.cookie = `mizoke-locale=${locale};path=/;max-age=31536000;SameSite=Lax`
        }
      },

      setCurrency: (currency) => {
        if (currencies.includes(currency)) {
          set({ currency })
          // Also set cookie for server-side access
          document.cookie = `mizoke-currency=${currency};path=/;max-age=31536000;SameSite=Lax`
        }
      },

      initialize: (locale, currency) => {
        set({
          locale,
          currency,
          isInitialized: true,
        })
      },
    }),
    {
      name: 'mizoke-locale',
      partialize: (state) => ({
        locale: state.locale,
        currency: state.currency,
      }),
    }
  )
)

// Exchange rates (approximate - in production these should come from an API)
// Base currency is EUR
const exchangeRates: Record<Currency, number> = {
  EUR: 1,
  GBP: 0.86,
  CAD: 1.47,
  AUD: 1.65,
  USD: 1.08,
}

// Convert price from EUR to target currency
export function convertPrice(priceInEur: number, targetCurrency: Currency): number {
  const rate = exchangeRates[targetCurrency] || 1
  return priceInEur * rate
}

// Format price in the target currency
export function formatPriceWithCurrency(
  amount: string | number,
  sourceCurrency: string,
  targetCurrency: Currency
): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  // If source is already target currency, just format
  if (sourceCurrency === targetCurrency) {
    return formatCurrency(numAmount, targetCurrency)
  }

  // Convert from source to EUR first, then to target
  const sourceRate = exchangeRates[sourceCurrency as Currency] || 1
  const amountInEur = numAmount / sourceRate
  const convertedAmount = convertPrice(amountInEur, targetCurrency)

  return formatCurrency(convertedAmount, targetCurrency)
}

// Format a number as currency
export function formatCurrency(amount: number, currency: Currency): string {
  const formatter = new Intl.NumberFormat(getLocaleForCurrency(currency), {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  return formatter.format(amount)
}

// Get the appropriate locale for formatting a currency
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
