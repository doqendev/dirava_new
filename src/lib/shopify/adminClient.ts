import { GraphQLClient } from 'graphql-request'

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN

if (!domain) {
  throw new Error('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN is not defined')
}

const endpoint = `https://${domain}/admin/api/2024-01/graphql.json`

// --- Token cache (in-memory, per-process) ---

let cachedToken: string | null = null
let tokenExpiresAt = 0 // unix ms

const REFRESH_MARGIN_MS = 5 * 60 * 1000 // refresh 5 min before expiry

/**
 * Fetch an access token using Shopify's client credentials OAuth flow.
 * https://shopify.dev/docs/apps/build/authentication-authorization/client-credentials
 */
async function fetchClientCredentialsToken(): Promise<{
  token: string
  expiresInMs: number
}> {
  const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID
  const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error(
      'SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET must be set for OAuth flow'
    )
  }

  const res = await fetch(
    `https://${domain}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'client_credentials',
      }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    throw new Error(
      `Failed to fetch Shopify OAuth token (${res.status}): ${text}`
    )
  }

  const json = (await res.json()) as {
    access_token: string
    expires_in: number // seconds
  }

  return {
    token: json.access_token,
    expiresInMs: json.expires_in * 1000,
  }
}

/**
 * Returns a valid Admin API access token.
 * - If SHOPIFY_ADMIN_ACCESS_TOKEN is set (legacy), returns it directly.
 * - Otherwise uses client credentials OAuth with in-memory caching.
 */
async function getAccessToken(forceRefresh = false): Promise<string> {
  // Legacy static token — use directly if set
  const legacyToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
  if (legacyToken) {
    return legacyToken
  }

  // Check cache
  if (!forceRefresh && cachedToken && Date.now() < tokenExpiresAt - REFRESH_MARGIN_MS) {
    return cachedToken
  }

  const { token, expiresInMs } = await fetchClientCredentialsToken()
  cachedToken = token
  tokenExpiresAt = Date.now() + expiresInMs
  return token
}

/**
 * Build an authenticated GraphQL client for the Shopify Admin API.
 */
async function getAdminClient(): Promise<GraphQLClient> {
  const token = await getAccessToken()

  return new GraphQLClient(endpoint, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Execute a Shopify Admin API query with type safety.
 * Includes automatic 401 retry with token refresh.
 */
export async function adminFetch<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const client = await getAdminClient()

  try {
    return await client.request<T>(query, variables)
  } catch (error: unknown) {
    // On 401, force-refresh the token and retry once
    const status =
      error instanceof Error && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : undefined

    if (status === 401) {
      const freshToken = await getAccessToken(true)
      const retryClient = new GraphQLClient(endpoint, {
        headers: {
          'X-Shopify-Access-Token': freshToken,
          'Content-Type': 'application/json',
        },
      })
      return retryClient.request<T>(query, variables)
    }

    console.error('Shopify Admin API Error:', error)
    throw error
  }
}

// Re-export for rare cases where callers need the client directly
export { getAdminClient }
