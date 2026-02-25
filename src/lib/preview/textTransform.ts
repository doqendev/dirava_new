import type { PreviewConfig } from './types'

/**
 * For 3D previews, enforce only first-letter capitalization.
 * Remaining characters keep the user's casing.
 */
export function normalizePreviewText(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

export function getPreviewDisplayText(
  text: string | undefined,
  config: PreviewConfig,
  fallback: string,
): string {
  const normalized = normalizePreviewText(text ?? '')
  const resolved = normalized || fallback
  if (config.maxChars) return resolved.slice(0, config.maxChars)
  return resolved
}

