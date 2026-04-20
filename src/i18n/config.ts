export const locales = ['en', 'de', 'fr', 'es', 'pt'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

/**
 * Default country used when no geo / cookie / header signal exists.
 * Drives currency and Shopify Markets presentment until a real signal arrives.
 */
export const defaultCountry = 'PT'

// Map locales to their display names
export const localeNames: Record<Locale, string> = {
  en: 'English',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pt: 'Português',
}

// Map countries to locales (for auto-detection)
export const countryToLocale: Record<string, Locale> = {
  // English
  GB: 'en',
  IE: 'en',
  AU: 'en',
  NZ: 'en',
  CA: 'en', // Canada defaults to English, could be French
  // German
  DE: 'de',
  AT: 'de',
  CH: 'de', // Switzerland - could also be French/Italian
  LI: 'de',
  // French
  FR: 'fr',
  BE: 'fr', // Belgium - could also be Dutch
  LU: 'fr',
  MC: 'fr',
  // Spanish
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CL: 'es',
  CO: 'es',
  PE: 'es',
  // Portuguese
  PT: 'pt',
  BR: 'pt',
}

// Supported currencies
export const currencies = ['EUR', 'GBP', 'CAD', 'AUD', 'USD'] as const
export type Currency = (typeof currencies)[number]

export const defaultCurrency: Currency = 'EUR'

// Map countries to currencies
export const countryToCurrency: Record<string, Currency> = {
  // EUR
  DE: 'EUR',
  FR: 'EUR',
  ES: 'EUR',
  PT: 'EUR',
  IT: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IE: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  LU: 'EUR',
  // GBP
  GB: 'GBP',
  // CAD
  CA: 'CAD',
  // AUD
  AU: 'AUD',
  NZ: 'AUD', // NZ uses NZD but we'll show AUD for now
  // USD (for display purposes even though shipping is suspended)
  US: 'USD',
}

// Currency symbols and formatting
export const currencyConfig: Record<Currency, { symbol: string; position: 'before' | 'after' }> = {
  EUR: { symbol: '€', position: 'after' },
  GBP: { symbol: '£', position: 'before' },
  CAD: { symbol: '$', position: 'before' },
  AUD: { symbol: '$', position: 'before' },
  USD: { symbol: '$', position: 'before' },
}
