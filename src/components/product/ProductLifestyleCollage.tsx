/* eslint-disable @next/next/no-img-element */
// Plain <img> intentionally — the lifestyle metafield ships URLs only
// (no dimensions), so we let the browser pick up each photo's native
// aspect ratio for the masonry layout. These photos sit far below the
// fold, so the next/image optimisation savings aren't critical.

export interface LifestyleScene {
  url: string
  alt?: string
}

interface ProductLifestyleCollageProps {
  scenes: LifestyleScene[]
}

/**
 * Pinterest-style masonry of lifestyle photos for the product. Sourced
 * per-product from a Shopify metafield (`custom.lifestyle_scenes`,
 * JSON array of either bare URL strings or `{url, alt?}` objects).
 * Renders nothing when the product has no scenes set.
 *
 * Layout strategy: CSS multi-column. Each tile keeps its native aspect
 * ratio — the browser uses the loaded image's intrinsic dimensions —
 * and `break-inside-avoid` stops a tile from being split across
 * columns. No JS, no resize observers, no library.
 */
export function ProductLifestyleCollage({ scenes }: ProductLifestyleCollageProps) {
  if (!scenes.length) return null

  return (
    <section className="relative px-4 pb-12 max-w-7xl mx-auto w-full">
      <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-white/85 sm:mb-5 sm:text-sm">
        Get inspired
      </h2>
      <div className="columns-2 gap-3 sm:gap-4 md:columns-3">
        {scenes.map((scene, i) => (
          <div key={`${scene.url}-${i}`} className="mb-3 sm:mb-4 break-inside-avoid">
            <img
              src={scene.url}
              alt={scene.alt ?? ''}
              loading="lazy"
              decoding="async"
              className="block w-full h-auto rounded-xl border border-white/[0.05] transition-all duration-300 hover:border-[color:var(--accent,#00f5ff)]/40 hover:shadow-[0_0_18px_rgba(var(--accent-rgb,0,245,255),0.15)]"
            />
          </div>
        ))}
      </div>
    </section>
  )
}
