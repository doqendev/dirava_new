import { getTranslations } from 'next-intl/server'
import CartContent from './CartContent'

export async function generateMetadata() {
  const t = await getTranslations('seo')
  return {
    title: t('cartTitle'),
    description: t('cartDescription'),
  }
}

export default function CartPage() {
  return <CartContent />
}
