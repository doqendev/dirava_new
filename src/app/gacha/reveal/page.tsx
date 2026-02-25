import { getTranslations } from 'next-intl/server'
import RevealEntryContent from './RevealEntryContent'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  return {
    title: t('gachaRevealTitle'),
    description: t('gachaRevealDescription'),
    robots: { index: false, follow: false },
  }
}

export default function RevealCodeEntryPage() {
  return <RevealEntryContent />
}
