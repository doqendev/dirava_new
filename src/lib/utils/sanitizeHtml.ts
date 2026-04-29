import sanitize from 'sanitize-html'

/**
 * Sanitize HTML from trusted sources (e.g. Shopify product descriptions).
 * Uses a server-safe allowlist so product pages can render during SSR.
 */
export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li',
      'a', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'hr', 'img',
    ],
    allowedAttributes: {
      '*': ['class', 'id'],
      a: ['href', 'target', 'rel'],
      img: ['src', 'alt', 'width', 'height'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: {
      img: ['http', 'https', 'data'],
    },
    transformTags: {
      a: sanitize.simpleTransform('a', { rel: 'noopener noreferrer' }, true),
    },
  })
}
