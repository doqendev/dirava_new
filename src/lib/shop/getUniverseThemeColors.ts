import { shopifyFetch } from '@/lib/shopify/client'
import { GET_UNIVERSES } from '@/lib/shopify/queries'

interface UniverseThemeNode {
  handle: string
  metafield: { value: string } | null
  themeColor: { value: string } | null
}

interface UniversesResponse {
  collections: {
    edges: Array<{ node: UniverseThemeNode }>
  }
}

/**
 * Fetch theme_color metafield for each universe collection.
 * Returns a Map of universe slug → hex color string.
 * Missing/unset metafields yield no entry (caller should fall back to static config).
 */
export async function getUniverseThemeColors(): Promise<Map<string, string>> {
  const colors = new Map<string, string>()

  try {
    const data = await shopifyFetch<UniversesResponse>(GET_UNIVERSES)

    data.collections.edges.forEach(({ node }) => {
      // custom.universe metafield holds the universe slug (e.g. "bleach"),
      // not a boolean. Any collection with a non-empty universe value + theme_color
      // gets registered.
      if (node.metafield?.value && node.themeColor?.value) {
        colors.set(node.handle, node.themeColor.value)
      }
    })
  } catch (error) {
    console.error('Failed to fetch universe theme colors:', error)
  }

  return colors
}
