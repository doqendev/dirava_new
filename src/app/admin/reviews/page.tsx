import type { Metadata } from 'next'
import AdminReviewsContent from './AdminReviewsContent'

export const metadata: Metadata = {
  title: 'Review Moderation | Admin | Mizoke',
  robots: { index: false, follow: false },
}

export default function AdminReviewsPage() {
  return <AdminReviewsContent />
}
