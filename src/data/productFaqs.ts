import type { FAQItem } from '@/types/content'

/**
 * Product-specific FAQ entries keyed by product handle.
 * These are merged with selected general FAQs on the product page.
 */
export const productFaqs: Record<string, FAQItem[]> = {
  'one-piece-custom-sign': [
    {
      question: 'How is the name displayed on the sign?',
      answer:
        'Your custom name is rendered in a neon-style LED effect on the acrylic base, paired with the Straw Hat Jolly Roger design. You can preview exactly how it looks using the 3D preview on the product page before ordering.',
    },
    {
      question: 'Can I change the name after ordering?',
      answer:
        'Since each sign is made to order with your personalization, we cannot change the name after the order is placed. Please double-check the spelling in the 3D preview before adding to cart.',
    },
  ],
  'demon-slayer-custom-sign': [
    {
      question: 'How is the name displayed on the sign?',
      answer:
        'Your custom name is rendered in a neon-style LED effect on the acrylic base with a Demon Slayer themed design. Preview it in 3D before ordering.',
    },
    {
      question: 'Can I change the name after ordering?',
      answer:
        'Since each sign is made to order with your personalization, we cannot change the name after the order is placed. Please double-check the spelling in the 3D preview before adding to cart.',
    },
  ],
  'dragon-ball-custom-sign': [
    {
      question: 'How is the name displayed on the sign?',
      answer:
        'Your custom name is rendered in a neon-style LED effect on the acrylic base with a Dragon Ball themed design. Preview it in 3D before ordering.',
    },
    {
      question: 'Can I change the name after ordering?',
      answer:
        'Since each sign is made to order with your personalization, we cannot change the name after the order is placed. Please double-check the spelling in the 3D preview before adding to cart.',
    },
  ],
}

/** General FAQ indices (from src/data/faq.ts) to show on product pages */
export const generalFaqIndices = [0, 2, 4, 10] // shipping, returns, licensing, damaged items

export function getProductFaqs(handle: string): FAQItem[] | null {
  return productFaqs[handle] ?? null
}
