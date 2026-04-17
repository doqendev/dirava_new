import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { getLocalizedFaqs } from '@/data/faq'
import { FAQAccordion } from './FAQAccordion'
import { getTranslations } from 'next-intl/server'
import { getLocale } from '@/i18n/request'
import { getMessages } from '@/i18n/messages'
import { SITE_URL } from '@/lib/utils/siteUrl'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  return {
    title: t('faqTitle'),
    description: t('faqDescription'),
    alternates: {
      canonical: `${SITE_URL}/faq`,
    },
    openGraph: {
      title: t('faqTitle'),
      description: t('faqDescription'),
      images: [`${SITE_URL}/opengraph-image`],
    },
  }
}

export default async function FAQPage() {
  const t = await getTranslations('faq')
  const tCommon = await getTranslations('common')
  const locale = await getLocale()
  const messages = getMessages(locale)
  const faqs = getLocalizedFaqs(messages)
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

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: tCommon('home'),
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'FAQ',
        item: `${SITE_URL}/faq`,
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
        title={t('title')}
        description={t('subtitle')}
        breadcrumbs={breadcrumbs}
        glowColor="cyan"
      >
        <FAQAccordion faqs={faqs} />

        {/* Still have questions */}
        <div className="mt-12 pt-8 border-t border-border-subtle text-center">
          <h3 className="font-display text-lg text-white mb-2">
            {t('stillHaveQuestions')}
          </h3>
          <p className="text-white/50 text-sm mb-4">
            {t('supportDescription')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-neon-cyan text-black font-display font-semibold uppercase tracking-wider rounded-lg hover:bg-neon-cyan/90 transition-colors"
          >
            {t('contactSupport')}
          </Link>
        </div>
      </ContentPageLayout>
    </>
  )
}
