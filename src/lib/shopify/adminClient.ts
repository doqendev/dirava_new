import { GraphQLClient } from 'graphql-request'

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const adminAccessToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN

if (!domain) {
  throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not defined')
}

// Admin client is only available server-side
const endpoint = `https://${domain}/admin/api/2024-01/graphql.json`

export function getAdminClient() {
  if (!adminAccessToken) {
    throw new Error('SHOPIFY_ADMIN_ACCESS_TOKEN is not defined')
  }

  return new GraphQLClient(endpoint, {
    headers: {
      'X-Shopify-Access-Token': adminAccessToken,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Execute a Shopify Admin API query with type safety
 */
export async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const client = getAdminClient()
  try {
    const data = await client.request<T>(query, variables)
    return data
  } catch (error) {
    console.error('Shopify Admin API Error:', error)
    throw error
  }
}
