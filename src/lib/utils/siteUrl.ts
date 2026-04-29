/**
 * Centralized site URL — single source of truth for canonical URLs, OG tags, sitemaps, etc.
 */
function normalizeSiteUrl(value: string | undefined): string {
  const fallback = 'https://www.mizoke.com'
  const rawValue = value?.trim() || fallback

  try {
    const url = new URL(rawValue)
    if (url.hostname !== 'mizoke.com' && url.hostname !== 'www.mizoke.com') {
      return fallback
    }
    url.protocol = 'https:'
    if (url.hostname === 'mizoke.com') {
      url.hostname = 'www.mizoke.com'
    }
    url.pathname = ''
    url.search = ''
    url.hash = ''
    return url.toString().replace(/\/$/, '')
  } catch {
    return fallback
  }
}

export const SITE_URL = normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)
