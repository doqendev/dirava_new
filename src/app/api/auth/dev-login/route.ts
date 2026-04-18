import { NextResponse } from 'next/server'
import { MOCK_CUSTOMER } from '@/lib/auth/mockCustomer'
import { setCustomerSessionCookie } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function POST() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const expiresAt = new Date()
  expiresAt.setFullYear(expiresAt.getFullYear() + 1)

  const response = NextResponse.json(
    { success: true, customer: MOCK_CUSTOMER },
    { headers: { 'Cache-Control': 'no-store' } }
  )

  return setCustomerSessionCookie(response, {
    version: 1,
    mode: 'mock',
    customer: MOCK_CUSTOMER,
    expiresAt: expiresAt.toISOString(),
  })
}
