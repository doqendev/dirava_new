import { notFound } from 'next/navigation'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_PRODUCT } from '@/lib/shopify/queries'
import { getProductRarity } from '@/lib/shopify/utils'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import type { ShopifyProduct } from '@/types/shopify'

// Revalidate every 60 seconds
export const revalidate = 60

interface ProductPageProps {
  params: Promise<{
    universe: string
    product: string
  }>
}

interface ProductQueryResponse {
  product: ShopifyProduct | null
}

async function getProduct(handle: string) {
  try {
    const data = await shopifyFetch<ProductQueryResponse>(GET_PRODUCT, { handle })

    if (!data.product) {
      return null
    }

    const product = data.product

    // Extract images from edges
    const images = product.images?.edges
      ? product.images.edges.map((edge) => ({
          url: edge.node.url,
          altText: edge.node.altText,
        }))
      : product.featuredImage
        ? [{ url: product.featuredImage.url, altText: product.featuredImage.altText }]
        : []

    // Extract variants from edges
    const variants = product.variants?.edges
      ? product.variants.edges.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
          availableForSale: edge.node.availableForSale,
          price: edge.node.price,
          compareAtPrice: edge.node.compareAtPrice,
          selectedOptions: edge.node.selectedOptions,
        }))
      : []

    // Get rarity from metafields
    const rarity = getProductRarity(product)

    // Get personalization flag from metafields
    const personalizationMetafield = product.metafields?.find(
      (mf) => mf?.key === 'personalization'
    )
    const personalization = personalizationMetafield?.value === 'true'

    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description,
      descriptionHtml: product.descriptionHtml || `<p>${product.description}</p>`,
      priceRange: product.priceRange,
      compareAtPriceRange: product.compareAtPriceRange,
      images,
      variants,
      rarity,
      personalization,
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { universe, product: productHandle } = await params

  const product = await getProduct(productHandle)

  if (!product) {
    notFound()
  }

  return <ProductDetailClient universe={universe} product={product} />
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps) {
  const { product: productHandle } = await params
  const product = await getProduct(productHandle)

  if (!product) {
    return {
      title: 'Product Not Found',
    }
  }

  return {
    title: `${product.title} | Neo-Stage Collective`,
    description: product.description,
  }
}
