import { getTranslations } from 'next-intl/server'
import ContactContent from './ContactContent'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  return {
    title: t('contactTitle'),
    description: t('contactDescription'),
  }
}

export default function ContactPage() {
  return <ContactContent />
}
