import type { Metadata } from 'next'
import AdminGachaContent from './AdminGachaContent'

export const metadata: Metadata = {
  title: 'Gacha Admin | Mizoke',
  robots: { index: false, follow: false },
}

export default function AdminGachaPage() {
  return <AdminGachaContent />
}
