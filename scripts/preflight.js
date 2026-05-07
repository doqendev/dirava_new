const DEFAULT_API_VERSION = '2026-04'
const DEFAULT_REQUIRED_ADMIN_SCOPES = [
  'read_customers',
  'write_customers',
  'read_files',
  'write_files',
  'read_metaobject_definitions',
  'write_metaobject_definitions',
  'read_metaobjects',
  'write_metaobjects',
]
const fs = require('fs')
const path = require('path')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return
  }

  const content = fs.readFileSync(filePath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) {
      continue
    }

    const separatorIndex = line.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    const key = line.slice(0, separatorIndex).trim()
    if (!key || process.env[key] !== undefined) {
      continue
    }

    let value = line.slice(separatorIndex + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    process.env[key] = value.replace(/\\n/g, '\n')
  }
}

function loadLocalEnv() {
  const envName = process.env.NODE_ENV || 'production'
  const rootDir = process.cwd()
  const envFiles = [
    `.env.${envName}.local`,
    '.env.local',
    `.env.${envName}`,
    '.env',
  ]

  for (const envFile of envFiles) {
    loadEnvFile(path.join(rootDir, envFile))
  }
}

function getRequiredEnv(name) {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} is required`)
  }

  return value
}

function getOptionalEnv(name) {
  const value = process.env[name]
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function getCsvEnv(name, fallback) {
  const value = getOptionalEnv(name)
  if (!value) return fallback
  return value
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean)
}

async function postGraphql(endpoint, headers, query, variables = {}) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(
      `Request to ${endpoint} failed with ${response.status}: ${JSON.stringify(payload)}`
    )
  }

  if (!payload || typeof payload !== 'object') {
    throw new Error(`Invalid GraphQL response from ${endpoint}`)
  }

  if (Array.isArray(payload.errors) && payload.errors.length > 0) {
    throw new Error(`GraphQL errors from ${endpoint}: ${JSON.stringify(payload.errors)}`)
  }

  return payload.data
}

async function getAdminAccessToken(domain) {
  const staticToken = getOptionalEnv('SHOPIFY_ADMIN_ACCESS_TOKEN')
  if (staticToken) {
    return staticToken
  }

  const clientId = getOptionalEnv('SHOPIFY_ADMIN_CLIENT_ID')
  const clientSecret = getOptionalEnv('SHOPIFY_ADMIN_CLIENT_SECRET')

  if (!clientId || !clientSecret) {
    throw new Error(
      'Set SHOPIFY_ADMIN_ACCESS_TOKEN or both SHOPIFY_ADMIN_CLIENT_ID and SHOPIFY_ADMIN_CLIENT_SECRET'
    )
  }

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok || !payload?.access_token) {
    throw new Error(
      `Failed to obtain Shopify Admin access token (${response.status}): ${JSON.stringify(payload)}`
    )
  }

  return payload.access_token
}

async function run() {
  loadLocalEnv()

  const apiVersion = process.env.NEXT_PUBLIC_SHOPIFY_API_VERSION || DEFAULT_API_VERSION
  const domain = getRequiredEnv('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN')
  const storefrontToken = getRequiredEnv('NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN')

  if (!getOptionalEnv('SESSION_SECRET')) {
    console.warn(
      '[preflight] SESSION_SECRET is not set. Cookie encryption will fall back to existing admin secrets.'
    )
  }

  const storefrontData = await postGraphql(
    `https://${domain}/api/${apiVersion}/graphql.json`,
    {
      'X-Shopify-Storefront-Access-Token': storefrontToken,
    },
    `
      query StorefrontPreflight {
        collections(first: 1) {
          edges {
            node {
              id
              handle
              metafield(namespace: "custom", key: "universe") {
                value
              }
            }
          }
        }
        products(first: 1) {
          edges {
            node {
              id
              handle
              updatedAt
            }
          }
          pageInfo {
            hasNextPage
          }
        }
      }
    `
  )

  const universeCount = storefrontData?.collections?.edges?.length ?? 0
  const productCount = storefrontData?.products?.edges?.length ?? 0

  if (universeCount === 0) {
    throw new Error('Storefront preflight returned zero universe collections')
  }

  if (productCount === 0) {
    throw new Error('Storefront preflight returned zero products')
  }

  const adminToken = await getAdminAccessToken(domain)
  const adminData = await postGraphql(
    `https://${domain}/admin/api/${apiVersion}/graphql.json`,
    {
      'X-Shopify-Access-Token': adminToken,
    },
    `
      query AdminPreflight {
        shop {
          id
          name
        }
        currentAppInstallation {
          accessScopes {
            handle
          }
        }
      }
    `
  )

  if (!adminData?.shop?.id) {
    throw new Error('Admin preflight did not return shop data')
  }

  const installedScopes = new Set(
    (adminData.currentAppInstallation?.accessScopes || [])
      .map((scope) => scope.handle)
      .filter(Boolean)
  )
  const requiredScopes = getCsvEnv('SHOPIFY_ADMIN_REQUIRED_SCOPES', DEFAULT_REQUIRED_ADMIN_SCOPES)
  const allowedScopes = new Set(getCsvEnv('SHOPIFY_ADMIN_ALLOWED_SCOPES', requiredScopes))
  const missingScopes = requiredScopes.filter((scope) => !installedScopes.has(scope))
  const extraScopes = Array.from(installedScopes).filter((scope) => !allowedScopes.has(scope)).sort()

  if (missingScopes.length > 0) {
    throw new Error(`Shopify Admin token is missing required scopes: ${missingScopes.join(', ')}`)
  }

  if (extraScopes.length > 0) {
    const message = `[preflight] Shopify Admin token has scopes outside the allowed list: ${extraScopes.join(', ')}`
    if (process.env.SHOPIFY_ADMIN_ENFORCE_SCOPES === 'true') {
      throw new Error(message)
    }
    console.warn(message)
  }

  console.log(
    `[preflight] Shopify connectivity OK for ${domain} (${adminData.shop.name}); collections=${universeCount}, products=${productCount}`
  )
}

run().catch((error) => {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[preflight] ${message}`)
  process.exit(1)
})
