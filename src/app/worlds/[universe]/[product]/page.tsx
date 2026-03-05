import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_PRODUCT, GET_RELATED_PRODUCTS } from '@/lib/shopify/queries'
import { getProductRarity } from '@/lib/shopify/utils'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import { RelatedProducts } from '@/components/product/RelatedProducts'
import { RecentlyViewed } from '@/components/product/RecentlyViewed'
import ReviewList from '@/components/product/ReviewList'
import { SocialProofBanner } from '@/components/product/SocialProofBanner'
import { ProductFAQ } from '@/components/product/ProductFAQ'
import { getReviewsByProduct, getReviewStats } from '@/lib/reviews/metaobjects'
import type { ShopifyProduct, ShopifyCollection } from '@/types/shopify'
import type { Rarity } from '@/types/common'
import type { Review } from '@/types/reviews'

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

interface RelatedProductsResponse {
  collection: ShopifyCollection | null
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

    // Extract variants from edges with quantityAvailable
    const variants = product.variants?.edges
      ? product.variants.edges.map((edge) => ({
          id: edge.node.id,
          title: edge.node.title,
          availableForSale: edge.node.availableForSale,
          quantityAvailable: edge.node.quantityAvailable ?? null,
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

    // Get collection handle for related products (first universe collection)
    const collectionHandle = product.collections?.edges?.find(
      (edge) => edge.node.metafield?.value === 'true'
    )?.node.handle || product.collections?.edges?.[0]?.node.handle

    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description,
      descriptionHtml: product.descriptionHtml || `<p>${product.description}</p>`,
      productType: product.productType || '',
      priceRange: product.priceRange,
      compareAtPriceRange: product.compareAtPriceRange,
      images,
      variants,
      rarity,
      personalization,
      collectionHandle,
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}

async function getRelatedProducts(collectionHandle: string, excludeProductId: string) {
  try {
    const data = await shopifyFetch<RelatedProductsResponse>(GET_RELATED_PRODUCTS, {
      collectionHandle,
      first: 9,
    })

    if (!data.collection?.products?.edges) {
      return []
    }

    // Filter out current product and limit to 4
    const products = data.collection.products.edges
      .filter((edge) => edge.node.id !== excludeProductId)
      .slice(0, 4)
      .map((edge) => {
        const product = edge.node
        const rarityValue = (product as { metafield?: { value: string } }).metafield?.value
        let rarity: Rarity | null = null
        if (rarityValue === 'rare' || rarityValue === 'legendary' || rarityValue === 'common') {
          rarity = rarityValue
        }

        return {
          id: product.id,
          handle: product.handle,
          title: product.title,
          price: product.priceRange.minVariantPrice,
          compareAtPrice: product.compareAtPriceRange?.minVariantPrice,
          image: product.featuredImage,
          variantId: (product as { variants?: { edges: Array<{ node: { id: string } }> } }).variants?.edges?.[0]?.node?.id,
          rarity,
        }
      })

    return products
  } catch (error) {
    console.error('Failed to fetch related products:', error)
    return []
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { universe, product: productHandle } = await params

  const product = await getProduct(productHandle)

  if (!product) {
    notFound()
  }

  // Fetch related products and review data in parallel
  const [relatedProducts, reviewStats, approvedReviews] = await Promise.all([
    product.collectionHandle
      ? getRelatedProducts(product.collectionHandle, product.id)
      : Promise.resolve([]),
    getReviewStats(productHandle),
    getReviewsByProduct(productHandle, 'approved'),
  ])

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mizoke.com'

  // Product JSON-LD schema
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.images.length > 0 ? product.images[0]?.url : '',
    brand: {
      '@type': 'Brand',
      name: 'Mizoke',
    },
    offers: {
      '@type': 'Offer',
      price: product.priceRange.minVariantPrice.amount,
      priceCurrency: product.priceRange.minVariantPrice.currencyCode,
      availability: product.variants.some(v => v.availableForSale)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${siteUrl}/worlds/${universe}/${product.handle}`,
    },
    ...(reviewStats.reviewCount > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: reviewStats.averageRating.toFixed(1),
        reviewCount: reviewStats.reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
    ...(approvedReviews.length > 0 && {
      review: approvedReviews.slice(0, 10).map((review: Review) => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author,
        },
        datePublished: review.createdAt,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: review.content,
        ...(review.title && { name: review.title }),
      })),
    }),
  }

  // BreadcrumbList JSON-LD schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: universe.charAt(0).toUpperCase() + universe.slice(1),
        item: `${siteUrl}/worlds/${universe}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${siteUrl}/worlds/${universe}/${product.handle}`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ProductDetailClient universe={universe} product={{ ...product, rating: reviewStats }} />

      {/* Social Proof Banner */}
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <SocialProofBanner
          averageRating={reviewStats.averageRating}
          reviewCount={reviewStats.reviewCount}
        />
      </div>

      {/* Reviews */}
      <div id="reviews" className="px-4 py-12 max-w-7xl mx-auto border-t border-border-subtle">
        <ReviewList productHandle={product.handle} />
      </div>

      {/* Product FAQ */}
      <div className="px-4 py-12 max-w-7xl mx-auto border-t border-border-subtle">
        <ProductFAQ productHandle={product.handle} />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="px-4 py-12 max-w-7xl mx-auto">
          <RelatedProducts
            products={relatedProducts}
            universe={universe}
          />
        </div>
      )}

      {/* Recently Viewed */}
      <div className="px-4 py-12 max-w-7xl mx-auto border-t border-border-subtle">
        <RecentlyViewed excludeProductId={product.id} maxItems={4} />
      </div>
    </>
  )
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { universe, product: productHandle } = await params
  const product = await getProduct(productHandle)

  if (!product) {
    return {
      title: 'Product Not Found | Mizoke',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mizoke.com'
  const title = `${product.title} | Mizoke`
  const description = product.description
    ? product.description.slice(0, 160)
    : `Shop ${product.title} at Mizoke. Premium anime merchandise.`

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/worlds/${universe}/${product.handle}`,
    },
    openGraph: {
      title,
      description,
      images: product.images.length > 0 && product.images[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  }
}
