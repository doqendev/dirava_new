import type { Currency } from '@/i18n/config'

/**
 * Free-shipping thresholds per currency.
 * Source of truth for the amounts surfaced across product page, FAQ, shipping policy.
 */
const THRESHOLDS: Record<Currency, number> = {
  EUR: 45,
  GBP: 40,
  CAD: 65,
  AUD: 75,
  USD: 55, // Display-only: US shipping is currently suspended.
}

export interface FreeShippingThreshold {
  amount: number
  currency: Currency
  /** Formatted with currency symbol, no fractional digits (e.g. "€45", "£40", "CA$65"). */
  display: string
}

const LOCALE_FOR_CURRENCY: Record<Currency, string> = {
  EUR: 'de-DE',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
  USD: 'en-US',
}

export function getFreeShippingThreshold(currency: Currency): FreeShippingThreshold {
  const amount = THRESHOLDS[currency]
  const display = new Intl.NumberFormat(LOCALE_FOR_CURRENCY[currency], {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
  return { amount, currency, display }
}
