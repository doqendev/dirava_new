import type { Metadata } from 'next'
import GachaTestContent from './GachaTestContent'

export const metadata: Metadata = {
  title: 'Gacha Test | Mizoke',
  robots: { index: false, follow: false },
}

export default function GachaTestPage() {
  return <GachaTestContent />
}
