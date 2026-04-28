/**
 * POST /api/account/data-deletion
 *
 * GDPR: Request account and data deletion.
 *
 * Note: Shopify does not expose a Storefront API mutation for account deletion.
 * This endpoint validates the request, records the request on the customer,
 * and notifies the store admin through Shopify's contact form endpoint.
 */

import { NextResponse } from 'next/server'
import {
  appendCustomerComplianceEvent,
  redactCustomerPII,
} from '@/lib/shopify/customerCompliance'
import { getAuthenticatedCustomer, getCustomerAccessToken } from '@/lib/auth/customer'
import { shopifyClient } from '@/lib/shopify/client'
import { GET_CUSTOMER } from '@/lib/shopify/customerQueries'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import { requireSameOrigin } from '@/lib/utils/csrf'

export const dynamic = 'force-dynamic'

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
    // Account deletion is a destructive action - require a same-origin
    // POST so a malicious page can't trigger it via a logged-in user
    // hitting a third-party link. Pairs with the existing daily rate
    // limit and authenticated session check below.
    const csrfReject = requireSameOrigin(request)
    if (csrfReject) return csrfReject

    const ip = getClientIp(request)
    const rl = await checkRateLimit(`data-deletion:${ip}`, { maxRequests: 1, windowSeconds: 86400 })
    if (rl.limited) {
      return NextResponse.json(
        { error: 'Deletion request already submitted. Please allow up to 30 days for processing.' },
        { status: 429 }
      )
    }

    const { customer: authenticatedCustomer, response, session } =
      await getAuthenticatedCustomer(request)
    if (response) {
      return response
    }

    if (!authenticatedCustomer || !session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const customer =
      session.mode === 'mock'
        ? authenticatedCustomer
        : (
            await shopifyClient.request<CustomerResponse>(GET_CUSTOMER, {
              customerAccessToken: getCustomerAccessToken(session),
            })
          ).customer

    if (!customer) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 })
    }

    const requestedAt = new Date().toISOString()
    console.log(`[GDPR] Data deletion requested for customer ID: ${customer.id}`)

    try {
      await appendCustomerComplianceEvent(customer.id, 'data_deletion_requests', {
        requestedAt,
        email: customer.email,
      })
    } catch (auditError) {
      console.error('Failed to record data deletion audit event:', auditError)
    }

    // Attempt automatic PII redaction via the Admin API. Anonymising
    // (rather than hard-deleting) is the practical Article 17 path
    // because Shopify keeps order records for financial compliance
    // and won't delete customers tied to orders. After this runs the
    // customer can no longer log in and their PII is unlinked from
    // their identity. We still send the admin notification below as a
    // belt-and-braces fallback for the cases where redaction fails
    // (missing Admin API creds, network error, etc).
    let redactionStatus: 'redacted' | 'manual' = 'manual'
    try {
      await redactCustomerPII({
        customerId: customer.id,
        customerNumericIdHash: customer.id.split('/').pop() ?? requestedAt,
      })
      redactionStatus = 'redacted'
      console.log(`[GDPR] PII redacted for customer ID: ${customer.id}`)
    } catch (redactError) {
      console.error('[GDPR] Automatic redaction failed; falling back to manual workflow:', redactError)
    }

    const shopifyStoreDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
    if (shopifyStoreDomain) {
      try {
        const formData = new URLSearchParams({
          form_type: 'contact',
          utf8: 'yes',
          'contact[email]': customer.email,
          'contact[name]':
            `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Customer',
          'contact[subject]': `[GDPR] Data Deletion Request - ${customer.email}`,
          'contact[body]': [
            'GDPR Data Deletion Request',
            '',
            `Customer ID: ${customer.id}`,
            `Email: ${customer.email}`,
            `Name: ${`${customer.firstName || ''} ${customer.lastName || ''}`.trim()}`,
            `Requested at: ${requestedAt}`,
            '',
            'Action required: Delete all customer data within 30 days per GDPR Article 17.',
            `Go to Shopify Admin -> Customers -> search for "${customer.email}" -> Delete customer data.`,
          ].join('\n'),
        })

        await fetch(`https://${shopifyStoreDomain}/contact#contact_form`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
          redirect: 'manual',
        })
      } catch (notifyError) {
        console.error('[GDPR] Failed to send admin notification:', notifyError)
      }
    }

    return NextResponse.json(
      {
        success: true,
        message:
          redactionStatus === 'redacted'
            ? 'Your account has been deleted. Your personal data has been removed from our systems immediately. Order records are kept anonymously for tax and financial compliance only.'
            : 'Your data deletion request has been received. We will process it within 30 days as required by GDPR. You will receive a confirmation email.',
        requestedAt,
        email: customer.email,
        status: redactionStatus,
      },
      {
        headers: { 'Cache-Control': 'no-store' },
      }
    )
  } catch (error) {
    console.error('Data deletion request error:', error)
    return NextResponse.json(
      { error: 'Failed to process deletion request' },
      { status: 500 }
    )
  }
}
