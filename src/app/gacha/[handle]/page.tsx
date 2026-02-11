import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Package, Sparkles } from 'lucide-react'
import { shopifyFetch } from '@/lib/shopify/client'
import { AddToCartButton } from '@/components/product/AddToCartButton'
import { OddsDisplay } from '@/components/gacha/OddsDisplay'
import { formatPrice } from '@/lib/utils/formatPrice'
import { RARITY_CONFIG, RARITY_ORDER } from '@/lib/gacha/constants'
import {
  GET_MYSTERY_BOX,
  GET_PRODUCTS_BY_HANDLES,
  type MysteryBoxQueryResponse,
} from '@/lib/gacha/queries'
import type { LootPool, MysteryBoxTheme, Rarity } from '@/types/gacha'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ handle: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params

  try {
    const data = await shopifyFetch<MysteryBoxQueryResponse>(GET_MYSTERY_BOX, { handle })

    if (!data.product) {
      return { title: 'Mystery Box Not Found' }
    }

    let theme: MysteryBoxTheme | null = null
    if (data.product.theme?.value) {
      try {
        theme = JSON.parse(data.product.theme.value)
      } catch {
        // ignore
      }
    }

    return {
      title: `${theme?.displayName || data.product.title} | Mystery Box`,
      description:
        theme?.description ||
        data.product.description ||
        'Discover what awaits inside this mystery box!',
      openGraph: {
        images: data.product.featuredImage
          ? [{ url: data.product.featuredImage.url }]
          : undefined,
      },
    }
  } catch {
    return { title: 'Mystery Box' }
  }
}

export const revalidate = 60

interface LootPoolProduct {
  handle: string
  title: string
  image: { url: string; altText: string | null } | null
  rarity: Rarity
}

async function getBoxWithItems(handle: string) {
  const data = await shopifyFetch<MysteryBoxQueryResponse>(GET_MYSTERY_BOX, { handle })

  if (!data.product) {
    return null
  }

  let lootPool: LootPool | null = null
  let theme: MysteryBoxTheme | null = null

  if (data.product.lootPool?.value) {
    try {
      lootPool = JSON.parse(data.product.lootPool.value)
    } catch {
      // ignore
    }
  }

  if (data.product.theme?.value) {
    try {
      theme = JSON.parse(data.product.theme.value)
    } catch {
      // ignore
    }
  }

  // Fetch product details for loot pool items
  let lootProducts: LootPoolProduct[] = []

  if (lootPool?.items && lootPool.items.length > 0) {
    // Build query for products
    const handles = Array.from(new Set(lootPool.items.map((item) => item.productHandle)))
    const queryString = handles.map((h) => `handle:${h}`).join(' OR ')

    try {
      const productsData = await shopifyFetch<{
        products: {
          edges: Array<{
            node: {
              handle: string
              title: string
              featuredImage: { url: string; altText: string | null } | null
            }
          }>
        }
      }>(GET_PRODUCTS_BY_HANDLES, { handles: queryString })

      // Map products to loot items with rarity
      const productMap = new Map(
        productsData.products.edges.map(({ node }) => [node.handle, node])
      )

      lootProducts = lootPool.items
        .map((item) => {
          const product = productMap.get(item.productHandle)
          if (!product) return null
          return {
            handle: product.handle,
            title: product.title,
            image: product.featuredImage,
            rarity: item.rarity,
          }
        })
        .filter((p): p is LootPoolProduct => p !== null)
    } catch (error) {
      console.error('Failed to fetch loot pool products:', error)
    }
  }

  const firstVariant = data.product.variants.edges[0]?.node

  return {
    id: data.product.id,
    handle: data.product.handle,
    title: data.product.title,
    description: data.product.description,
    image: data.product.featuredImage,
    price: firstVariant?.price || data.product.priceRange.minVariantPrice,
    variantId: firstVariant?.id,
    lootPool,
    theme,
    lootProducts,
  }
}

export default async function BoxDetailPage({ params }: PageProps) {
  const { handle } = await params
  const box = await getBoxWithItems(handle)

  if (!box) {
    notFound()
  }

  const themeColor = box.theme?.color || '#00f5ff'

  // Group products by rarity
  const productsByRarity = RARITY_ORDER.reduce(
    (acc, rarity) => {
      acc[rarity] = box.lootProducts.filter((p) => p.rarity === rarity)
      return acc
    },
    {} as Record<Rarity, LootPoolProduct[]>
  )

  return (
    <div className="min-h-screen pb-32">
      {/* Back button */}
      <div className="px-4 py-4 max-w-7xl mx-auto">
        <Link
          href="/gacha"
          className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Mystery Boxes</span>
        </Link>
      </div>

      {/* Hero Section */}
      <section className="relative px-4 py-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image */}
          <div className="relative">
            <div
              className="relative aspect-square rounded-2xl overflow-hidden border-2"
              style={{
                borderColor: themeColor,
                boxShadow: `0 0 60px ${themeColor}30`,
              }}
            >
              {box.image ? (
                <Image
                  src={box.image.url}
                  alt={box.image.altText || box.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-bg-secondary">
                  <Package className="w-32 h-32" style={{ color: themeColor }} />
                </div>
              )}

              {/* Theme badge */}
              {box.theme && (
                <div
                  className="absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor} 0%, ${box.theme.secondaryColor || themeColor}80 100%)`,
                    color: '#fff',
                  }}
                >
                  {box.theme.displayName}
                </div>
              )}
            </div>

            {/* Glow effect */}
            <div
              className="absolute -inset-4 -z-10 rounded-3xl blur-3xl opacity-20"
              style={{ backgroundColor: themeColor }}
            />
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-white">
              {box.title}
            </h1>

            {box.theme?.description && (
              <p className="mt-4 text-white/60 text-lg">{box.theme.description}</p>
            )}

            {box.description && !box.theme?.description && (
              <p className="mt-4 text-white/60">{box.description}</p>
            )}

            {/* Price */}
            <div className="mt-6">
              <span className="font-mono text-4xl font-bold" style={{ color: themeColor }}>
                {formatPrice(box.price.amount, box.price.currencyCode)}
              </span>
            </div>

            {/* Odds */}
            {box.lootPool && (
              <div className="mt-8 p-4 rounded-xl bg-bg-card border border-border-subtle">
                <OddsDisplay odds={box.lootPool.odds} />
              </div>
            )}

            {/* Info note */}
            <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-neon-yellow flex-shrink-0 mt-0.5" />
                <div className="text-sm text-white/60">
                  <p>
                    After purchase, you&apos;ll receive a redemption code. Use it to reveal your
                    mystery item and claim your prize!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loot Pool Contents */}
      {box.lootProducts.length > 0 && (
        <section className="px-4 py-12 max-w-7xl mx-auto border-t border-white/10">
          <h2 className="font-display text-2xl md:text-3xl text-white mb-8 text-center">
            Possible Items
          </h2>

          <div className="space-y-12">
            {/* Display from legendary to common */}
            {[...RARITY_ORDER].reverse().map((rarity) => {
              const products = productsByRarity[rarity]
              if (!products || products.length === 0) return null

              const config = RARITY_CONFIG[rarity]

              return (
                <div key={rarity}>
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-4 h-4 rounded"
                      style={{
                        backgroundColor: config.color,
                        boxShadow: `0 0 10px ${config.glowColor}`,
                      }}
                    />
                    <h3
                      className="font-display text-xl uppercase tracking-wider"
                      style={{ color: config.color }}
                    >
                      {config.displayName}
                    </h3>
                    {box.lootPool && (
                      <span className="text-white/40 text-sm ml-auto">
                        {box.lootPool.odds[rarity]}% chance
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {products.map((product, idx) => (
                      <div
                        key={`${product.handle}-${idx}`}
                        className="group relative rounded-xl overflow-hidden bg-bg-card border transition-all hover:scale-[1.02]"
                        style={{
                          borderColor: `${config.color}30`,
                        }}
                      >
                        <div className="relative aspect-square bg-bg-secondary">
                          {product.image ? (
                            <Image
                              src={product.image.url}
                              alt={product.image.altText || product.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Package className="w-12 h-12 text-white/20" />
                            </div>
                          )}

                          {/* Rarity indicator */}
                          <div
                            className="absolute top-2 right-2 w-3 h-3 rounded-full"
                            style={{
                              backgroundColor: config.color,
                              boxShadow: `0 0 8px ${config.glowColor}`,
                            }}
                          />
                        </div>

                        <div className="p-3">
                          <p className="text-sm text-white/80 line-clamp-2">{product.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Fixed Buy Button */}
      {box.variantId && (
        <div className="fixed bottom-[70px] lg:bottom-0 left-0 right-0 z-40 p-4 bg-gradient-to-t from-bg-primary via-bg-primary to-transparent">
          <div className="max-w-xl mx-auto">
            <AddToCartButton
              variantId={box.variantId}
              className="w-full py-4 text-lg"
              available={true}
              attributes={[{ key: '_mystery_box', value: box.handle }]}
            />
          </div>
        </div>
      )}
    </div>
  )
}
