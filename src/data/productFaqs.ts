import type { FAQItem } from '@/types/content'

/**
 * Product-specific FAQ entries keyed by product handle.
 * These are merged with selected general FAQs on the product page.
 */
export const productFaqs: Record<string, FAQItem[]> = {
  'one-piece-custom-sign': [
    {
      question: 'Can I change the name after ordering?',
      answer:
        'Yes, you can change the name as long as you contact us before the sign has been produced. Once production begins, changes are no longer possible.',
    },
  ],
  'demon-slayer-custom-sign': [
    {
      question: 'Can I change the name after ordering?',
      answer:
        'Yes, you can change the name as long as you contact us before the sign has been produced. Once production begins, changes are no longer possible.',
    },
  ],
  'dragon-ball-custom-sign': [
    {
      question: 'Can I change the name after ordering?',
      answer:
        'Yes, you can change the name as long as you contact us before the sign has been produced. Once production begins, changes are no longer possible.',
    },
  ],
}

/** General FAQ indices (from src/data/faq.ts) to show on product pages */
export const generalFaqIndices = [0, 2, 10] // shipping, returns, damaged items

export function getProductFaqs(handle: string): FAQItem[] | null {
  return productFaqs[handle] ?? null
}
