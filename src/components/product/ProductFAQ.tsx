'use client'

import { useState } from 'react'
import { useTranslations, useMessages } from 'next-intl'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { getLocalizedFaqs } from '@/data/faq'
import { getLocalizedProductFaqs, generalFaqIndices } from '@/data/productFaqs'
import type { FAQItem } from '@/types/content'

interface ProductFAQProps {
  productHandle: string
}

export function ProductFAQ({ productHandle }: ProductFAQProps) {
  const t = useTranslations('product')
  const messages = useMessages()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const productSpecificFaqs = getLocalizedProductFaqs(productHandle, messages)
  const localisedGeneralFaqs = getLocalizedFaqs(messages)
  const generalFaqs = generalFaqIndices
    .map((i) => localisedGeneralFaqs[i])
    .filter((faq): faq is FAQItem => faq !== undefined)

  const allFaqs = [...productSpecificFaqs, ...generalFaqs]

  if (allFaqs.length === 0) return null

  return (
    <div>
      <h2 className="font-display text-2xl md:text-3xl font-bold text-white mb-8">
        {t('faqTitle')}
      </h2>
      <div className="space-y-0 divide-y divide-border-subtle">
        {allFaqs.map((faq, index) => (
          <div key={index}>
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between py-4 text-left group"
            >
              <span className="text-white font-medium pr-4">{faq.question}</span>
              <ChevronDown
                className={cn(
                  'w-5 h-5 text-white/50 flex-shrink-0 transition-transform duration-300',
                  openIndex === index && 'rotate-180'
                )}
              />
            </button>
            <div
              className={cn(
                'overflow-hidden transition-all duration-300',
                openIndex === index ? 'max-h-[500px] opacity-100 pb-4' : 'max-h-0 opacity-0'
              )}
            >
              <p className="text-sm text-white/60 leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
