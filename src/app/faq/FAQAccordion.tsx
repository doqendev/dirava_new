import type { FAQItem } from '@/types/content'

interface FAQAccordionProps {
  faqs: FAQItem[]
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => (
        <details
          key={index}
          className="group overflow-hidden rounded-lg border border-border-subtle bg-bg-card/50 backdrop-blur-sm open:border-neon-cyan/30"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 text-left font-medium text-white transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-cyan focus-visible:ring-inset [&::-webkit-details-marker]:hidden">
            <span className="flex-1">{faq.question}</span>
            <span
              aria-hidden
              className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-neon-cyan transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <div className="px-4 pb-4 text-white/70">
            {faq.answer}
          </div>
        </details>
      ))}
    </div>
  )
}
