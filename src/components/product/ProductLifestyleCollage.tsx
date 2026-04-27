import Image from 'next/image'

export interface LifestyleScene {
  url: string
  width: number
  height: number
  alt?: string
}

interface ProductLifestyleCollageProps {
  scenes: LifestyleScene[]
}

/**
 * Pinterest-style masonry of lifestyle photos for the product. Sourced
 * per-product from a Shopify metafield (`custom.lifestyle_scenes`,
 * JSON array of `{url, width, height, alt?}`). Renders nothing when
 * the product has no scenes set so empty products don't show an
 * empty section.
 *
 * Layout strategy: CSS multi-column. Each tile keeps its native aspect
 * ratio via `next/image`'s width/height attrs, and `break-inside-avoid`
 * stops a tile from being split across columns. No JS, no resize
 * observers, no library — the browser does the layout.
 */
export function ProductLifestyleCollage({ scenes }: ProductLifestyleCollageProps) {
  if (!scenes.length) return null

  return (
    <section className="relative px-4 pb-12 max-w-7xl mx-auto w-full">
      <div className="columns-2 gap-3 sm:gap-4 md:columns-3">
        {scenes.map((scene, i) => (
          <div key={`${scene.url}-${i}`} className="mb-3 sm:mb-4 break-inside-avoid">
            <Image
              src={scene.url}
              width={scene.width}
              height={scene.height}
              alt={scene.alt ?? ''}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="block w-full h-auto rounded-xl border border-white/[0.05] transition-all duration-300 hover:border-[color:var(--accent,#00f5ff)]/40 hover:shadow-[0_0_18px_rgba(var(--accent-rgb,0,245,255),0.15)]"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
