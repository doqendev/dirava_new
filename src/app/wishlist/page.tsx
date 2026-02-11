import { redirect } from 'next/navigation'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Wishlist',
  description: 'View and manage your saved items.',
}

export default function WishlistRedirectPage() {
  redirect('/account/wishlist')
}
