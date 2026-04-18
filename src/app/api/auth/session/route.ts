import { NextResponse } from 'next/server'
import { getCustomerFromAccessToken } from '@/lib/auth/customer'
import {
  clearCustomerSessionCookie,
  getCustomerSessionFromRequest,
} from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const session = await getCustomerSessionFromRequest(request)
  if (!session) {
    return NextResponse.json(
      { authenticated: false, customer: null },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  if (session.mode === 'mock') {
    return NextResponse.json(
      { authenticated: true, customer: session.customer },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  }

  try {
    const customer = await getCustomerFromAccessToken(session.accessToken)
    if (!customer) {
      return clearCustomerSessionCookie(
        NextResponse.json(
          { authenticated: false, customer: null },
          { headers: { 'Cache-Control': 'no-store' } }
        )
      )
    }

    return NextResponse.json(
      { authenticated: true, customer },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Failed to restore customer session:', error)
    return clearCustomerSessionCookie(
      NextResponse.json(
        { authenticated: false, customer: null },
        { headers: { 'Cache-Control': 'no-store' } }
      )
    )
  }
}
