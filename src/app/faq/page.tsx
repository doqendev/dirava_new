import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { faqs } from '@/data/faq'
import { FAQAccordion } from './FAQAccordion'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  return {
    title: t('faqTitle'),
    description: t('faqDescription'),
  }
}

export default function FAQPage() {
  const breadcrumbs = [{ label: 'FAQ', href: '/faq' }]

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mizoke.com'

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'FAQ',
        item: `${siteUrl}/faq`,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ContentPageLayout
        title="Frequently Asked Questions"
        description="Find answers to common questions about orders, shipping, returns, and more."
        breadcrumbs={breadcrumbs}
        glowColor="cyan"
      >
        <FAQAccordion faqs={faqs} />

        {/* Still have questions */}
        <div className="mt-12 pt-8 border-t border-border-subtle text-center">
          <h3 className="font-display text-lg text-white mb-2">
            Still have questions?
          </h3>
          <p className="text-white/50 text-sm mb-4">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-neon-cyan text-black font-display font-semibold uppercase tracking-wider rounded-lg hover:bg-neon-cyan/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </ContentPageLayout>
    </>
  )
}
