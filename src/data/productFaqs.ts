import type { FAQItem } from '@/types/content'

type ProductFaqKey = 'changeName' | 'nameLimit'

const ENGLISH_PRODUCT_FAQS: Record<ProductFaqKey, FAQItem> = {
  changeName: {
    question: 'Can I change the name after ordering?',
    answer:
      'Yes, you can change the name as long as you contact us before production starts. Production typically begins within 1-3 business days, so email support@mizoke.com as soon as possible. Once production has begun, changes are no longer possible.',
  },
  nameLimit: {
    question: 'What is the character limit for the custom name?',
    answer:
      'The custom name is limited to 12 characters. If you need a longer name for a specific design, contact support@mizoke.com before ordering — in some cases we can accommodate more characters depending on the product size and layout.',
  },
}

/**
 * Per-product FAQ key mappings. Keyed by Shopify product handle.
 * Each key references a question/answer pair translated in each locale
 * under `messages.productFaq.{key}`, with English fallback in
 * `ENGLISH_PRODUCT_FAQS` above.
 */
const productFaqKeys: Record<string, ProductFaqKey[]> = {
  'one-piece-custom-sign': ['changeName', 'nameLimit'],
  'demon-slayer-custom-sign': ['changeName', 'nameLimit'],
  'dragon-ball-custom-sign': ['changeName', 'nameLimit'],
  'one-piece-custom-led-lightbox-sign': ['changeName', 'nameLimit'],
  'one-piece-custom-keychain': ['nameLimit'],
}

/** General FAQ indices (from src/data/faq.ts) to show on product pages */
export const generalFaqIndices = [0, 2, 10] // shipping, returns, damaged items

export function getLocalizedProductFaqs(
  handle: string,
  messages: unknown
): FAQItem[] {
  const keys = productFaqKeys[handle]
  if (!keys) return []
  const localised = (
    messages as {
      productFaq?: Partial<Record<ProductFaqKey, { question?: string; answer?: string }>>
    }
  )?.productFaq
  return keys.map((key) => {
    const fallback = ENGLISH_PRODUCT_FAQS[key]
    const translated = localised?.[key]
    return {
      question: translated?.question ?? fallback.question,
      answer: translated?.answer ?? fallback.answer,
    }
  })
}
