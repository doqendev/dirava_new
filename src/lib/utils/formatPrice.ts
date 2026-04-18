/**
 * Format a price value for display.
 *
 * @param amount - The price amount as a string or number
 * @param currencyCode - The ISO 4217 currency code (default: USD)
 * @returns Formatted price string (e.g., "$29.99")
 */
const CURRENCY_LOCALE_MAP: Record<string, string> = {
  USD: 'en-US',
  EUR: 'en-IE',
  GBP: 'en-GB',
  CAD: 'en-CA',
  AUD: 'en-AU',
}

export function formatPrice(
  amount: string | number,
  currencyCode = 'USD'
): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  const locale = CURRENCY_LOCALE_MAP[currencyCode] ?? 'en-US'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount)
}

/**
 * Parse a Shopify Money object to a formatted string.
 */
export function formatShopifyPrice(money: {
  amount: string
  currencyCode: string
}): string {
  return formatPrice(money.amount, money.currencyCode)
}
