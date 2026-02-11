import type { MetadataRoute } from 'next'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_UNIVERSES, GET_SITEMAP_PRODUCTS } from '@/lib/shopify/queries'
import { locales } from '@/i18n/config'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tamashii.store'

interface UniverseNode {
  handle: string
  metafield: {
    value: string
  } | null
}

interface ProductNode {
  handle: string
  updatedAt: string
  collections: {
    edges: Array<{
      node: {
        handle: string
        metafield: {
          value: string
        } | null
      }
    }>
  }
}

interface UniversesResponse {
  collections: {
    edges: Array<{
      node: UniverseNode
    }>
  }
}

interface ProductsResponse {
  products: {
    pageInfo: {
      hasNextPage: boolean
      endCursor: string | null
    }
    edges: Array<{
      node: ProductNode
    }>
  }
}

async function getAllProducts(): Promise<ProductNode[]> {
  const allProducts: ProductNode[] = []
  let hasNextPage = true
  let after: string | null = null

  while (hasNextPage) {
    const data: ProductsResponse = await shopifyFetch<ProductsResponse>(GET_SITEMAP_PRODUCTS, {
      first: 250,
      after,
    })

    const products = data.products.edges.map((edge: { node: ProductNode }) => edge.node)
    allProducts.push(...products)

    hasNextPage = data.products.pageInfo.hasNextPage
    after = data.products.pageInfo.endCursor
  }

  return allProducts
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Create locale alternates helper
  const createAlternates = (path: string) => {
    const languages: Record<string, string> = {}
    locales.forEach((locale) => {
      languages[locale] = `${siteUrl}/${locale}${path}`
    })
    return { languages }
  }

  const routes: MetadataRoute.Sitemap = []

  // Static pages
  const staticPages = [
    { path: '', priority: 1.0, changeFrequency: 'daily' as const },
    { path: '/drops', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/sale', priority: 0.9, changeFrequency: 'daily' as const },
    { path: '/new', priority: 0.9, changeFrequency: 'daily' as const },
{ path: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { path: '/search', priority: 0.7, changeFrequency: 'weekly' as const },
  ]

  staticPages.forEach(({ path, priority, changeFrequency }) => {
    routes.push({
      url: `${siteUrl}${path}`,
      lastModified: now,
      changeFrequency,
      priority,
      alternates: createAlternates(path),
    })
  })

  try {
    // Fetch universes (collections with universe metafield)
    const universesData = await shopifyFetch<UniversesResponse>(GET_UNIVERSES)
    const universes = universesData.collections.edges
      .map((edge) => edge.node)
      .filter((collection) => collection.metafield?.value === 'true')

    // Add universe pages
    universes.forEach((universe) => {
      routes.push({
        url: `${siteUrl}/worlds/${universe.handle}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
        alternates: createAlternates(`/worlds/${universe.handle}`),
      })
    })

    // Fetch all products
    const products = await getAllProducts()

    // Add product pages
    products.forEach((product) => {
      // Find the universe collection for this product
      const universeCollection = product.collections.edges.find(
        (edge) => edge.node.metafield?.value === 'true'
      )

      if (universeCollection) {
        const collectionHandle = universeCollection.node.handle
        const productPath = `/worlds/${collectionHandle}/${product.handle}`

        routes.push({
          url: `${siteUrl}${productPath}`,
          lastModified: new Date(product.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.8,
          alternates: createAlternates(productPath),
        })
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}
