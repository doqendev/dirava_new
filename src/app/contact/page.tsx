import { getTranslations } from 'next-intl/server'
import ContactContent from './ContactContent'
import { SITE_URL } from '@/lib/utils/siteUrl'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
    alternates: {
      canonical: `${SITE_URL}/contact`,
    },
    openGraph: {
      title: t('contactTitle'),
      description: t('contactDescription'),
      images: [`${SITE_URL}/opengraph-image`],
    },
  }
}

export default function ContactPage() {
  return <ContactContent />
}
