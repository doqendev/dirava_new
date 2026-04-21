'use client'

import { useEffect } from 'react'

interface AccentThemeProps {
  /** Hex color (#rrggbb) of the active universe accent. */
  themeColor: string
}

function hexToRgb(hex: string): string | null {
  const m = hex.replace('#', '').match(/.{2}/g)
  if (!m || m.length < 3) return null
  return `${parseInt(m[0]!, 16)}, ${parseInt(m[1]!, 16)}, ${parseInt(m[2]!, 16)}`
}

/**
 * Publishes the current universe accent as CSS custom properties on the
 * document root so elements outside the page tree (Footer, CartDrawer,
 * etc.) can tint themselves to match. Cleans up on unmount so the next
 * page reverts to the default cyan.
 */
export function AccentTheme({ themeColor }: AccentThemeProps) {
  useEffect(() => {
    const root = document.documentElement
    const rgb = hexToRgb(themeColor)
    root.style.setProperty('--accent', themeColor)
    if (rgb) root.style.setProperty('--accent-rgb', rgb)
    return () => {
      root.style.removeProperty('--accent')
      root.style.removeProperty('--accent-rgb')
    }
  }, [themeColor])

  return null
}
