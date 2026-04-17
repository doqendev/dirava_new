import type { FAQItem } from '@/types/content'

const changeNameFaq: FAQItem = {
  question: 'Can I change the name after ordering?',
  answer:
    'Yes, you can change the name as long as you contact us before production starts. Production typically begins within 1-3 business days, so email support@mizoke.com as soon as possible. Once production has begun, changes are no longer possible.',
}

const nameLimitFaq: FAQItem = {
  question: 'What is the character limit for the custom name?',
  answer:
    'The custom name is limited to 12 characters. If you need a longer name for a specific design, contact support@mizoke.com before ordering — in some cases we can accommodate more characters depending on the product size and layout.',
}

const customSignFaqs: FAQItem[] = [changeNameFaq, nameLimitFaq]

/**
 * Product-specific FAQ entries keyed by product handle.
 * These are merged with selected general FAQs on the product page.
 */
export const productFaqs: Record<string, FAQItem[]> = {
  'one-piece-custom-sign': customSignFaqs,
  'demon-slayer-custom-sign': customSignFaqs,
  'dragon-ball-custom-sign': customSignFaqs,
  'one-piece-custom-led-lightbox-sign': customSignFaqs,
  'one-piece-custom-keychain': [nameLimitFaq],
}

/** General FAQ indices (from src/data/faq.ts) to show on product pages */
export const generalFaqIndices = [0, 2, 10] // shipping, returns, damaged items

export function getProductFaqs(handle: string): FAQItem[] | null {
  return productFaqs[handle] ?? null
}
