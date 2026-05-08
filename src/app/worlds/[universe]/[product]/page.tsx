import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { shopifyFetch } from '@/lib/shopify/client'
import { GET_PRODUCT, GET_PRODUCT_RECOMMENDATIONS, GET_RELATED_PRODUCTS } from '@/lib/shopify/queries'
import { getCountry } from '@/i18n/country'
import { getProductRarity } from '@/lib/shopify/utils'
import { ProductDetailClient } from '@/components/product/ProductDetailClient'
import { YouMightAlsoLike } from '@/components/product/YouMightAlsoLike'
import { RecentlyViewed } from '@/components/product/RecentlyViewed'
import ReviewList from '@/components/product/ReviewList'
import { ProductLifestyleCollage, type LifestyleScene } from '@/components/product/ProductLifestyleCollage'
import { ProductFAQ } from '@/components/product/ProductFAQ'
import { getLocalizedFaqs } from '@/data/faq'
import { getLocalizedProductFaqs, generalFaqIndices } from '@/data/productFaqs'
import { getLocale } from '@/i18n/request'
import { getMessages } from '@/i18n/messages'
import { getPublicReviewData } from '@/lib/reviews/metaobjects'
import type { ShopifyProduct } from '@/types/shopify'
import type { Review } from '@/types/reviews'
import { SITE_URL } from '@/lib/utils/siteUrl'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'
import { sanitizeHtml } from '@/lib/utils/sanitizeHtml'

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

interface RecommendedProductNode {
  id: string
  handle: string
  title: string
  priceRange: { minVariantPrice: { amount: string; currencyCode: string } }
  compareAtPriceRange?: { minVariantPrice: { amount: string; currencyCode: string } } | null
  featuredImage: { url: string; altText: string | null } | null
  variants?: { edges: Array<{ node: { id: string } }> }
  collections?: { edges: Array<{ node: { handle: string; metafield?: { value: string } | null } }> }
}

const VALID_UNIVERSE_SLUGS = new Set(Object.keys(UNIVERSE_CONFIG))

async function getProduct(handle: string) {
  try {
    const country = await getCountry()
    const data = await shopifyFetch<ProductQueryResponse>(GET_PRODUCT, { handle, country })

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
          image: edge.node.image ?? null,
        }))
      : []

    // Get rarity from metafields
    const rarity = getProductRarity(product)

    // Get personalization flag from metafields
    const personalizationMetafield = product.metafields?.find(
      (mf) => mf?.key === 'personalization'
    )
    const personalization = personalizationMetafield?.value === 'true'

    // Get optional features tagline override from metafields
    const featuresOverride = product.metafields?.find(
      (mf) => mf?.key === 'features'
    )?.value || null

    // Parse the per-product lifestyle scenes metafield. Schema is a
    // JSON array of either bare URL strings or `{url, alt?}` objects:
    //   ["https://.../desk.jpg", { "url": "https://.../wall.jpg", "alt": "Wall" }]
    // Anything malformed becomes an empty array so the collage simply
    // doesn't render.
    const lifestyleScenesRaw = product.metafields?.find(
      (mf) => mf?.key === 'lifestyle_scenes'
    )?.value
    const lifestyleScenes: LifestyleScene[] = (() => {
      if (!lifestyleScenesRaw) return []
      try {
        const parsed = JSON.parse(lifestyleScenesRaw)
        if (!Array.isArray(parsed)) return []
        return parsed.flatMap((s): LifestyleScene[] => {
          if (typeof s === 'string' && s.length > 0) return [{ url: s }]
          if (s && typeof s === 'object' && typeof s.url === 'string' && s.url.length > 0) {
            return [{ url: s.url, ...(typeof s.alt === 'string' ? { alt: s.alt } : {}) }]
          }
          return []
        })
      } catch {
        return []
      }
    })()

    // Get the product's true universe from its own metafield/collections, so
    // theming always matches the product itself rather than the URL segment
    // (a shopper may land here from a cross-universe recommended card).
    const universeFromMetafield = product.metafields?.find(
      (mf) => mf?.key === 'universe'
    )?.value
    const universeFromCollection = product.collections?.edges
      ?.map((edge) => edge.node.metafield?.value)
      .find((v): v is string => !!v && v !== 'true' && v !== 'false')
    const productUniverse = universeFromMetafield || universeFromCollection || null

    const universeCollection = product.collections?.edges?.find((edge) => {
      const value = edge.node.metafield?.value
      if (productUniverse && value === productUniverse) return true
      return Boolean(value && VALID_UNIVERSE_SLUGS.has(value))
    })

    const collectionHandle =
      universeCollection?.node.handle ||
      product.collections?.edges?.find((edge) => productUniverse && edge.node.handle === productUniverse)
        ?.node.handle ||
      product.collections?.edges?.[0]?.node.handle

    return {
      id: product.id,
      handle: product.handle,
      title: product.title,
      description: product.description,
      descriptionHtml: sanitizeHtml(product.descriptionHtml || product.description),
      productType: product.productType || '',
      priceRange: product.priceRange,
      compareAtPriceRange: product.compareAtPriceRange,
      images,
      variants,
      rarity,
      personalization,
      collectionHandle,
      productUniverse,
      featuresOverride,
      lifestyleScenes,
      tags: product.tags || [],
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
    return null
  }
}

function mapRecommendedProduct(product: RecommendedProductNode) {
  const universe = product.collections?.edges?.[0]?.node?.metafield?.value || null
  return {
    id: product.id,
    handle: product.handle,
    title: product.title,
    price: product.priceRange.minVariantPrice,
    compareAtPrice: product.compareAtPriceRange?.minVariantPrice,
    image: product.featuredImage,
    variantId: product.variants?.edges?.[0]?.node?.id,
    universe,
  }
}

async function getRecommendedProducts(productId: string, collectionHandle: string | null, currentUniverse?: string) {
  const TARGET = 10

  // 1. Fetch Shopify ML recommendations
  let recommendations: ReturnType<typeof mapRecommendedProduct>[] = []
  const country = await getCountry()
  try {
    const data = await shopifyFetch<{
      productRecommendations: RecommendedProductNode[] | null
    }>(GET_PRODUCT_RECOMMENDATIONS, { productId, country })

    if (data.productRecommendations) {
      recommendations = data.productRecommendations
        .filter((p) => p.id !== productId)
        .slice(0, TARGET)
        .map(mapRecommendedProduct)
    }
  } catch (error) {
    console.error('Failed to fetch product recommendations:', error)
  }

  // 2. If fewer than 10, pad with same-collection products
  if (recommendations.length < TARGET && collectionHandle) {
    try {
      const data = await shopifyFetch<{
        collection: { products?: { edges: Array<{ node: RecommendedProductNode }> } } | null
      }>(GET_RELATED_PRODUCTS, { collectionHandle, first: TARGET + 5, country })

      if (data.collection?.products?.edges) {
        const existingIds = new Set([productId, ...recommendations.map((r) => r.id)])
        const filler = data.collection.products.edges
          .filter((edge) => !existingIds.has(edge.node.id))
          .slice(0, TARGET - recommendations.length)
          .map((edge) => {
            const mapped = mapRecommendedProduct(edge.node)
            return { ...mapped, universe: mapped.universe || currentUniverse || null }
          })

        recommendations = [...recommendations, ...filler]
      }
    } catch (error) {
      console.error('Failed to fetch filler products:', error)
    }
  }

  return recommendations.slice(0, TARGET)
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { universe, product: productHandle } = await params

  const product = await getProduct(productHandle)

  if (!product) {
    notFound()
  }

  const tCommon = await getTranslations('common')

  // Fetch recommendations and review data in parallel
  const [recommendations, reviewData] = await Promise.all([
    getRecommendedProducts(product.id, product.collectionHandle || null, universe),
    getPublicReviewData(productHandle),
  ])
  const { stats: reviewStats, reviews: approvedReviews } = reviewData

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
      availability: product.personalization || product.variants.some((v) => v.availableForSale)
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: `${SITE_URL}/worlds/${universe}/${product.handle}`,
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

  // FAQPage JSON-LD schema — mirrors the FAQ list rendered by ProductFAQ
  const locale = await getLocale()
  const messages = getMessages(locale)
  const productSpecificFaqs = getLocalizedProductFaqs(productHandle, messages)
  const localisedGeneralFaqs = getLocalizedFaqs(messages)
  const generalProductFaqs = generalFaqIndices
    .map((i) => localisedGeneralFaqs[i])
    .filter((f): f is NonNullable<typeof f> => f !== undefined)
  const faqList = [...productSpecificFaqs, ...generalProductFaqs]
  const faqSchema = faqList.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqList.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      }
    : null

  // BreadcrumbList JSON-LD schema
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: tCommon('home'),
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: universe.charAt(0).toUpperCase() + universe.slice(1),
        item: `${SITE_URL}/worlds/${universe}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.title,
        item: `${SITE_URL}/worlds/${universe}/${product.handle}`,
      },
    ],
  }

  const themeColor =
    UNIVERSE_CONFIG[
      (product.productUniverse || universe) as keyof typeof UNIVERSE_CONFIG
    ]?.color

  return (
    <div style={themeColor ? ({ ['--accent' as string]: themeColor } as React.CSSProperties) : undefined}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <ProductDetailClient
        universe={product.productUniverse || universe}
        product={{ ...product, rating: reviewStats }}
      />

      {/* Lifestyle collage — masonry of per-product scene photos sourced
          from the `custom.lifestyle_scenes` Shopify metafield. Renders
          nothing when the product has no scenes set. */}
      <ProductLifestyleCollage scenes={product.lifestyleScenes} />

      {/* Recently Viewed */}
      <div className="px-4 py-12 max-w-7xl mx-auto border-t border-border-subtle">
        <RecentlyViewed
          excludeProductId={product.id}
          maxItems={4}
          themeColor={
            UNIVERSE_CONFIG[
              (product.productUniverse || universe) as keyof typeof UNIVERSE_CONFIG
            ]?.color
          }
        />
      </div>

      {/* Reviews */}
      <div id="reviews" className="px-4 py-12 max-w-7xl mx-auto border-t border-border-subtle">
        <ReviewList
          productHandle={product.handle}
          initialReviews={approvedReviews}
          initialStats={reviewStats}
          color={
            UNIVERSE_CONFIG[
              (product.productUniverse || universe) as keyof typeof UNIVERSE_CONFIG
            ]?.color
          }
        />
      </div>

      {/* Product FAQ */}
      <div className="px-4 py-12 max-w-7xl mx-auto border-t border-border-subtle">
        <ProductFAQ productHandle={product.handle} />
      </div>

      {/* You Might Also Like — pushed to the bottom of the product page
          so the customer stays focused on the main product through
          gallery → reviews → FAQ before alternative products surface. */}
      {recommendations.length > 0 && (
        <div className="px-4 py-12 max-w-7xl mx-auto border-t border-border-subtle">
          <YouMightAlsoLike
            products={recommendations}
            themeColor={
              UNIVERSE_CONFIG[
                (product.productUniverse || universe) as keyof typeof UNIVERSE_CONFIG
              ]?.color
            }
          />
        </div>
      )}
    </div>
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

  const title = `${product.title} | Mizoke`
  const description = product.description
    ? product.description.slice(0, 160)
    : `Shop ${product.title} at Mizoke. Premium anime merchandise.`

  return {
    title,
    description,
    alternates: {
      canonical: `${SITE_URL}/worlds/${universe}/${product.handle}`,
    },
    openGraph: {
      title,
      description,
      images: product.images.length > 0 && product.images[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  }
}
