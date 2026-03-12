import { getTranslations } from 'next-intl/server'
import ContactContent from './ContactContent'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.mizoke.com'
  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
    alternates: {
      canonical: `${siteUrl}/contact`,
    },
    openGraph: {
      title: t('contactTitle'),
      description: t('contactDescription'),
      images: [`${siteUrl}/opengraph-image`],
    },
  }
}

export default function ContactPage() {
  return <ContactContent />
}
