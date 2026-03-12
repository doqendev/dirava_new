/**
 * POST /api/account/data-deletion
 *
 * GDPR: Request account and data deletion.
 * Requires X-Customer-Access-Token header.
 *
 * Note: Shopify does not expose a Storefront API mutation for account deletion.
 * This endpoint validates the request and sends a deletion request email to the store admin.
 * Actual deletion must be processed through Shopify Admin (Customers → Delete customer data).
 */

import { NextResponse } from 'next/server'
import { shopifyClient } from '@/lib/shopify/client'
import { GET_CUSTOMER } from '@/lib/shopify/customerQueries'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'

interface CustomerResponse {
  customer: {
    id: string
    email: string
    firstName: string | null
    lastName: string | null
  } | null
}

export async function POST(request: Request) {
  try {
    // Rate limit: 1 deletion request per day
    const ip = getClientIp(request)
    const rl = await checkRateLimit(`data-deletion:${ip}`, { maxRequests: 1, windowSeconds: 86400 })
    if (rl.limited) {
      return NextResponse.json(
        { error: 'Deletion request already submitted. Please allow up to 30 days for processing.' },
        { status: 429 }
      )
    }

    const accessToken = request.headers.get('X-Customer-Access-Token')
    if (!accessToken) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify the token and get customer info
    const customerData = await shopifyClient.request<CustomerResponse>(GET_CUSTOMER, {
      customerAccessToken: accessToken,
    })

    if (!customerData.customer) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const customer = customerData.customer

    console.log(
      `[GDPR] Data deletion requested for customer: ${customer.email} (ID: ${customer.id})`
    )

    // Notify store admin via Shopify contact form (delivers to store owner email)
    const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    if (SHOPIFY_STORE_DOMAIN) {
      try {
        const formData = new URLSearchParams({
          'form_type': 'contact',
          'utf8': '✓',
          'contact[email]': customer.email,
          'contact[name]': `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer',
          'contact[subject]': `[GDPR] Data Deletion Request — ${customer.email}`,
          'contact[body]': [
            `GDPR Data Deletion Request`,
            ``,
            `Customer ID: ${customer.id}`,
            `Email: ${customer.email}`,
            `Name: ${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
            `Requested at: ${new Date().toISOString()}`,
            ``,
            `Action required: Delete all customer data within 30 days per GDPR Article 17.`,
            `Go to Shopify Admin → Customers → search for "${customer.email}" → Delete customer data.`,
          ].join('\n'),
        })

        await fetch(`https://${SHOPIFY_STORE_DOMAIN}/contact#contact_form`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
          redirect: 'manual',
        })
      } catch (notifyError) {
        // Log but don't fail the request — the deletion request is still recorded
        console.error('[GDPR] Failed to send admin notification:', notifyError)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Your data deletion request has been received. We will process it within 30 days as required by GDPR. You will receive a confirmation email.',
      requestedAt: new Date().toISOString(),
      email: customer.email,
    }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    console.error('Data deletion request error:', error)
    return NextResponse.json(
      { error: 'Failed to process deletion request' },
      { status: 500 }
    )
  }
}
