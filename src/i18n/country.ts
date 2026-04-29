import { cookies, headers } from 'next/headers'
import { countryToCurrency, defaultCountry, defaultCurrency, type Currency } from './config'
import { isCrawlerUserAgent } from '@/lib/utils/bot'

export const COUNTRY_COOKIE = 'mizoke-country'

async function getCountryFromHeaders(): Promise<string | null> {
  const h = await headers()
  const cf = h.get('cf-ipcountry')
  if (cf) return cf
  const vercel = h.get('x-vercel-ip-country')
  if (vercel) return vercel
  const geo = h.get('x-geo-country')
  if (geo) return geo
  return null
}

/**
 * Resolve the shopper's country (ISO 3166-1 alpha-2 uppercase).
 * Priority: explicit cookie -> edge geo header -> default.
 * Drives @inContext(country:) in Storefront queries and cart buyerIdentity.
 */
export async function getCountry(): Promise<string> {
  const cookieStore = await cookies()
  const cookieValue = cookieStore.get(COUNTRY_COOKIE)?.value
  if (cookieValue && /^[A-Z]{2}$/.test(cookieValue)) {
    return cookieValue
  }
  const h = await headers()
  if (isCrawlerUserAgent(h.get('user-agent'))) {
    return defaultCountry
  }
  const geo = await getCountryFromHeaders()
  if (geo && /^[A-Z]{2}$/.test(geo.toUpperCase())) {
    return geo.toUpperCase()
  }
  return defaultCountry
}

/** Derive the presentment currency for a country, with EUR fallback. */
export function currencyForCountry(country: string): Currency {
  return countryToCurrency[country] ?? defaultCurrency
}
