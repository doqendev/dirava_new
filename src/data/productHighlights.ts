import type { LucideIcon } from 'lucide-react'
import { Lightbulb, Layers, Usb, Ruler, Skull } from 'lucide-react'

export interface ProductHighlight {
  icon: LucideIcon
  textKey: string
}

/**
 * Product-specific highlights keyed by product handle.
 * If a product has no entry here, the "What You Get" section is hidden.
 */
export const productHighlights: Record<string, ProductHighlight[]> = {
  'one-piece-custom-sign': [
    { icon: Lightbulb, textKey: 'highlightLedSign' },
    { icon: Layers, textKey: 'highlightAcrylicBase' },
    { icon: Usb, textKey: 'highlightUsbPowered' },
    { icon: Ruler, textKey: 'highlightDimensions' },
    { icon: Skull, textKey: 'highlightJollyRoger' },
  ],
  'demon-slayer-custom-sign': [
    { icon: Lightbulb, textKey: 'highlightLedSign' },
    { icon: Layers, textKey: 'highlightAcrylicBase' },
    { icon: Usb, textKey: 'highlightUsbPowered' },
    { icon: Ruler, textKey: 'highlightDimensions' },
  ],
  'dragon-ball-custom-sign': [
    { icon: Lightbulb, textKey: 'highlightLedSign' },
    { icon: Layers, textKey: 'highlightAcrylicBase' },
    { icon: Usb, textKey: 'highlightUsbPowered' },
    { icon: Ruler, textKey: 'highlightDimensions' },
  ],
  'hunter-x-hunter-custom-sign': [
    { icon: Lightbulb, textKey: 'highlightLedSign' },
    { icon: Layers, textKey: 'highlightAcrylicBase' },
    { icon: Usb, textKey: 'highlightUsbPowered' },
    { icon: Ruler, textKey: 'highlightDimensions' },
  ],
  'attack-on-titan-custom-sign': [
    { icon: Lightbulb, textKey: 'highlightLedSign' },
    { icon: Layers, textKey: 'highlightAcrylicBase' },
    { icon: Usb, textKey: 'highlightUsbPowered' },
    { icon: Ruler, textKey: 'highlightDimensions' },
  ],
  'digimon-custom-sign': [
    { icon: Lightbulb, textKey: 'highlightLedSign' },
    { icon: Layers, textKey: 'highlightAcrylicBase' },
    { icon: Usb, textKey: 'highlightUsbPowered' },
    { icon: Ruler, textKey: 'highlightDimensions' },
  ],
}

export function getProductHighlights(handle: string): ProductHighlight[] | null {
  return productHighlights[handle] ?? null
}
