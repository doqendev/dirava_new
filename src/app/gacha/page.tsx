import { Suspense } from 'react'
import { Gift, Sparkles, Info, Ticket, Package, Truck } from 'lucide-react'
import { shopifyFetch } from '@/lib/shopify/client'
import { MysteryBoxCard } from '@/components/gacha/MysteryBoxCard'
import { Badge } from '@/components/ui/Badge'
import { GET_ALL_MYSTERY_BOXES, type AllMysteryBoxesResponse } from '@/lib/gacha/queries'
import type { MysteryBox, LootPool, MysteryBoxTheme } from '@/types/gacha'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Mystery Boxes | Gacha',
  description:
    'Try your luck with our themed mystery boxes! Each box contains a random item from its exclusive collection.',
}

export const revalidate = 60

async function getMysteryBoxes(): Promise<MysteryBox[]> {
  try {
    const data = await shopifyFetch<AllMysteryBoxesResponse>(GET_ALL_MYSTERY_BOXES)

    if (!data.products?.edges) {
      return []
    }

    return data.products.edges
      .map(({ node }) => {
        if (!node) return null

        let lootPool: LootPool | null = null
        let theme: MysteryBoxTheme | null = null

        // Parse loot pool from metafield
        if (node.lootPool?.value) {
          try {
            lootPool = JSON.parse(node.lootPool.value)
          } catch {
            console.error(`Failed to parse loot pool for ${node.handle}`)
          }
        }

        // Parse theme from metafield
        if (node.theme?.value) {
          try {
            theme = JSON.parse(node.theme.value)
          } catch {
            console.error(`Failed to parse theme for ${node.handle}`)
          }
        }

        const firstVariant = node.variants?.edges?.[0]?.node
        if (!firstVariant) return null

        return {
          id: node.id,
          handle: node.handle,
          title: node.title,
          description: node.description,
          image: node.featuredImage,
          price: firstVariant.price,
          variantId: firstVariant.id,
          lootPool,
          theme,
        }
      })
      .filter((box): box is MysteryBox & { variantId: string } => box !== null)
  } catch (error) {
    console.error('Failed to fetch mystery boxes:', error)
    return []
  }
}

function SkeletonMysteryBox() {
  return (
    <div className="rounded-2xl bg-bg-card border border-border-subtle overflow-hidden animate-pulse">
      <div className="aspect-square bg-bg-secondary" />
      <div className="p-5 space-y-3">
        <div className="h-6 bg-white/10 rounded w-3/4" />
        <div className="h-4 bg-white/10 rounded w-full" />
        <div className="h-8 bg-white/10 rounded w-1/2" />
        <div className="h-10 bg-white/10 rounded" />
      </div>
    </div>
  )
}

async function MysteryBoxesContent() {
  const boxes = await getMysteryBoxes()

  if (boxes.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-bg-secondary mb-4">
          <Gift className="w-8 h-8 text-white/30" />
        </div>
        <h2 className="font-display text-xl text-white mb-2">No Mystery Boxes Available</h2>
        <p className="text-white/60 max-w-md mx-auto">
          Mystery boxes are currently not available. Check back soon!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
      {boxes.map((box) => (
        <MysteryBoxCard
          key={box.id}
          box={box}
          variantId={(box as MysteryBox & { variantId: string }).variantId}
        />
      ))}
    </div>
  )
}

export default function GachaPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 lg:py-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[300px] rounded-full blur-[120px] opacity-20 bg-neon-purple" />
        <div className="absolute top-0 right-1/4 w-[500px] h-[300px] rounded-full blur-[120px] opacity-20 bg-neon-yellow" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full blur-[100px] opacity-15 bg-neon-cyan" />

        <div className="relative px-4 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-neon-yellow" />
            <Badge variant="cyan" glow>
              MYSTERY
            </Badge>
          </div>

          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-wider">
            <span className="text-neon-purple">MYSTERY</span>{' '}
            <span className="text-white">BOXES</span>
          </h1>

          <p className="mt-4 text-white/60 max-w-xl mx-auto text-lg">
            Take a chance and discover rare collectibles. Each themed box contains items from its
            exclusive collection.
          </p>
        </div>
      </section>

      {/* Mystery Boxes */}
      <section className="py-8">
        <div className="px-4 max-w-7xl mx-auto">
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {[...Array(3)].map((_, i) => (
                  <SkeletonMysteryBox key={i} />
                ))}
              </div>
            }
          >
            <MysteryBoxesContent />
          </Suspense>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 border-t border-white/10">
        <div className="px-4 max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-display text-2xl md:text-3xl text-white mb-2">How It Works</h2>
            <p className="text-white/60">
              A simple process to discover your mystery item
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-bg-card border border-border-subtle rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-neon-cyan/20 flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-neon-cyan" />
              </div>
              <h3 className="font-display text-lg text-white mb-2">1. Choose a Box</h3>
              <p className="text-sm text-white/60">
                Browse themed mystery boxes and inspect their contents and odds.
              </p>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-neon-purple/20 flex items-center justify-center mx-auto mb-4">
                <Ticket className="w-6 h-6 text-neon-purple" />
              </div>
              <h3 className="font-display text-lg text-white mb-2">2. Get Your Code</h3>
              <p className="text-sm text-white/60">
                After purchase, you&apos;ll receive a unique redemption code.
              </p>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-neon-yellow/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-6 h-6 text-neon-yellow" />
              </div>
              <h3 className="font-display text-lg text-white mb-2">3. Reveal</h3>
              <p className="text-sm text-white/60">
                Use your code to reveal your item with an exciting animation.
              </p>
            </div>

            <div className="bg-bg-card border border-border-subtle rounded-xl p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-neon-green" />
              </div>
              <h3 className="font-display text-lg text-white mb-2">4. Claim & Ship</h3>
              <p className="text-sm text-white/60">
                Enter your shipping address and we&apos;ll send your prize.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Code Gift Feature */}
      <section className="py-12 border-t border-white/10">
        <div className="px-4 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-neon-purple/10 to-neon-cyan/10 border border-white/10 rounded-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-neon-purple" />
                </div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-display text-xl text-white mb-2">Gift a Mystery Box</h3>
                <p className="text-white/60">
                  Share the excitement! You can share your redemption code with friends. They can
                  reveal the mystery and claim the prize themselves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Legal Disclaimer */}
      <section className="py-8 border-t border-white/10">
        <div className="px-4 max-w-4xl mx-auto">
          <div className="flex items-start gap-3 text-white/40 text-xs">
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p>
              Mystery boxes contain random items from their themed collection. All odds are
              displayed for transparency. Results are determined by a cryptographically secure
              random algorithm at the time of reveal. Each box is guaranteed to contain a product.
              Must be 18+ to purchase. Please gamble responsibly.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
