import { getTranslations } from 'next-intl/server'
import ClaimContent from './ClaimContent'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  return {
    title: t('gachaClaimTitle'),
    description: t('gachaClaimDescription'),
    robots: { index: false, follow: false },
  }
}

export default function ClaimPage() {
  return <ClaimContent />
}
