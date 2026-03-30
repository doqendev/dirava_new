import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML from trusted sources (e.g. Shopify product descriptions).
 * Uses DOMPurify with an allowlist of safe tags and attributes.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'b', 'em', 'i', 'u',
      'ul', 'ol', 'li',
      'a', 'span', 'div',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'table', 'thead', 'tbody', 'tr', 'th', 'td',
      'blockquote', 'hr', 'img',
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'id', 'src', 'alt', 'width', 'height'],
  })
}
