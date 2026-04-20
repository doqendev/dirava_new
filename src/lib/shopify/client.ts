import { GraphQLClient } from 'graphql-request'

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN

if (!domain) {
  throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not defined')
}

if (!storefrontAccessToken) {
  throw new Error('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not defined')
}

const endpoint = `https://${domain}/api/2024-01/graphql.json`

export const shopifyClient = new GraphQLClient(endpoint, {
  headers: {
    'X-Shopify-Storefront-Access-Token': storefrontAccessToken,
    'Content-Type': 'application/json',
  },
})

/**
 * Execute a Shopify Storefront API query with type safety.
 *
 * When the query declares a `$country` variable (see queries/mutations that
 * use `@inContext(country: $country)`), the caller should pass
 * `variables.country`. On the server this is typically
 * `await getCountry()` from `@/i18n/country`; on the client it's
 * `useLocaleStore.getState().country`. If omitted, Shopify falls back to the
 * default declared in the query (`CountryCode = PT`).
 */
export async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  try {
    const data = await shopifyClient.request<T>(query, variables)
    return data
  } catch (error) {
    console.error('Shopify API Error:', error)
    throw error
  }
}
