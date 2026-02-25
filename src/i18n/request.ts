import { getRequestConfig } from 'next-intl/server'
import { cookies, headers } from 'next/headers'
import {
  locales,
  defaultLocale,
  countryToLocale,
  countryToCurrency,
  defaultCurrency,
  type Locale,
  type Currency
} from './config'
import { getMessages } from './messages'

// Cookie names for storing user preferences
export const LOCALE_COOKIE = 'mizoke-locale'
export const CURRENCY_COOKIE = 'mizoke-currency'

// Get country code from Cloudflare or Vercel headers
async function getCountryFromHeaders(): Promise<string | null> {
  const headersList = await headers()

  // Cloudflare
  const cfCountry = headersList.get('cf-ipcountry')
  if (cfCountry) return cfCountry

  // Vercel
  const vercelCountry = headersList.get('x-vercel-ip-country')
  if (vercelCountry) return vercelCountry

  // Generic
  const geoCountry = headersList.get('x-geo-country')
  if (geoCountry) return geoCountry

  return null
}

// Detect locale from browser Accept-Language header
async function getLocaleFromAcceptLanguage(): Promise<Locale | null> {
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')

  if (!acceptLanguage) return null

  // Parse Accept-Language header and find first matching locale
  const languages = acceptLanguage.split(',').map(lang => {
    const [code] = lang.trim().split(';')
    return code?.toLowerCase().split('-')[0]
  })

  for (const lang of languages) {
    if (lang && locales.includes(lang as Locale)) {
      return lang as Locale
    }
  }

  return null
}

// Get the user's preferred locale
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()

  // 1. Check cookie for saved preference
  const savedLocale = cookieStore.get(LOCALE_COOKIE)?.value as Locale | undefined
  if (savedLocale && locales.includes(savedLocale)) {
    return savedLocale
  }

  // 2. Try to detect from country
  const country = await getCountryFromHeaders()
  if (country && countryToLocale[country]) {
    return countryToLocale[country]
  }

  // 3. Try to detect from Accept-Language header
  const browserLocale = await getLocaleFromAcceptLanguage()
  if (browserLocale) {
    return browserLocale
  }

  // 4. Fall back to default
  return defaultLocale
}

// Get the user's preferred currency
export async function getCurrency(): Promise<Currency> {
  const cookieStore = await cookies()

  // 1. Check cookie for saved preference
  const savedCurrency = cookieStore.get(CURRENCY_COOKIE)?.value as Currency | undefined
  if (savedCurrency) {
    return savedCurrency
  }

  // 2. Try to detect from country
  const country = await getCountryFromHeaders()
  if (country && countryToCurrency[country]) {
    return countryToCurrency[country]
  }

  // 3. Fall back to default
  return defaultCurrency
}

export default getRequestConfig(async () => {
  const locale = await getLocale()

  return {
    locale,
    messages: getMessages(locale),
  }
})
