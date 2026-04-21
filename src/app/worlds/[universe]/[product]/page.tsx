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
import { ProductLifestyleGallery } from '@/components/product/ProductLifestyleGallery'
import { ProductFAQ } from '@/components/product/ProductFAQ'
import { getLocalizedFaqs } from '@/data/faq'
import { getLocalizedProductFaqs, generalFaqIndices } from '@/data/productFaqs'
import { getLocale } from '@/i18n/request'
import { getMessages } from '@/i18n/messages'
import { getReviewsByProduct, getReviewStats } from '@/lib/reviews/metaobjects'
import type { ShopifyProduct } from '@/types/shopify'
import type { Review } from '@/types/reviews'
import { SITE_URL } from '@/lib/utils/siteUrl'
import { UNIVERSE_CONFIG } from '@/lib/utils/constants'

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
      productUniverse,
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
  const [recommendations, reviewStats, approvedReviews] = await Promise.all([
    getRecommendedProducts(product.id, product.collectionHandle || null, universe),
    getReviewStats(productHandle),
    getReviewsByProduct(productHandle, 'approved'),
  ])

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

      {/* Lifestyle Gallery */}
      <div className="px-4 py-8 max-w-7xl mx-auto">
        <ProductLifestyleGallery productHandle={product.handle} />
      </div>

      {/* You Might Also Like */}
      {recommendations.length > 0 && (
        <div className="px-4 py-12 max-w-7xl mx-auto">
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
