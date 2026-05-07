import { NextRequest, NextResponse } from 'next/server'
import { gql } from 'graphql-request'
import { adminFetch, hasAdminApiCredentials } from '@/lib/shopify/adminClient'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'
import { requireSameOrigin } from '@/lib/utils/csrf'
import { appendCustomerComplianceEvent } from '@/lib/shopify/customerCompliance'

export const dynamic = 'force-dynamic'
const CONSENT_VERSION = 'newsletter-marketing-v1'
const MARKETING_OPT_IN_LEVEL = 'SINGLE_OPT_IN'

const CREATE_MARKETING_SUBSCRIBER = gql`
  mutation customerCreate($input: CustomerInput!) {
    customerCreate(input: $input) {
      customer {
        id
        email
        emailMarketingConsent {
          marketingState
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const UPDATE_MARKETING_CONSENT = gql`
  mutation customerEmailMarketingConsentUpdate($input: CustomerEmailMarketingConsentUpdateInput!) {
    customerEmailMarketingConsentUpdate(input: $input) {
      customer {
        id
        emailMarketingConsent {
          marketingState
        }
      }
      userErrors {
        field
        message
      }
    }
  }
`

const FIND_CUSTOMER_BY_EMAIL = gql`
  query findCustomerByEmail($query: String!) {
    customers(first: 1, query: $query) {
      edges {
        node {
          id
          email
          emailMarketingConsent {
            marketingState
          }
        }
      }
    }
  }
`

interface CustomerCreateResponse {
  customerCreate: {
    customer: {
      id: string
      email: string
      emailMarketingConsent: { marketingState: string } | null
    } | null
    userErrors: Array<{ field: string[]; message: string }>
  }
}

interface CustomerUpdateResponse {
  customerEmailMarketingConsentUpdate: {
    customer: {
      id: string
      emailMarketingConsent: { marketingState: string } | null
    } | null
    userErrors: Array<{ field: string[]; message: string }>
  }
}

interface CustomerSearchResponse {
  customers: {
    edges: Array<{
      node: {
        id: string
        email: string
        emailMarketingConsent: { marketingState: string } | null
      }
    }>
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

async function recordNewsletterConsent(input: {
  customerId: string
  ip: string
  userAgent: string | null
  source: string | null
}) {
  try {
    await appendCustomerComplianceEvent(input.customerId, 'newsletter_consent', {
      type: 'newsletter_marketing_opt_in',
      version: CONSENT_VERSION,
      occurredAt: new Date().toISOString(),
      ip: input.ip,
      userAgent: input.userAgent,
      source: input.source,
    })
  } catch (error) {
    console.error(
      'Failed to record newsletter consent audit event:',
      error instanceof Error ? error.message : error
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const csrfReject = requireSameOrigin(request)
    if (csrfReject) return csrfReject

    const ip = getClientIp(request)
    const rl = await checkRateLimit(`newsletter:${ip}`, {
      maxRequests: 5,
      windowSeconds: 600,
      failClosed: true,
    })
    if (rl.limited) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429, headers: { 'Retry-After': String(rl.retryAfter) } }
      )
    }

    if (!hasAdminApiCredentials()) {
      console.error('Newsletter subscription unavailable: Shopify Admin API credentials are missing')
      return NextResponse.json(
        { error: 'Newsletter signups are temporarily unavailable' },
        { status: 503 }
      )
    }

    const body = await request.json()
    if (!isRecord(body)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { email, marketingConsent, website } = body

    if (typeof website === 'string' && website.trim().length > 0) {
      console.warn(`[Newsletter] Honeypot triggered (ip=${ip})`)
      return NextResponse.json({ success: true, message: 'Successfully subscribed to the newsletter!' })
    }

    if (marketingConsent !== true) {
      return NextResponse.json(
        { error: 'Marketing consent is required' },
        { status: 400 }
      )
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const normalizedEmail = email.toLowerCase().trim()
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    const searchResponse = await adminFetch<CustomerSearchResponse>(
      FIND_CUSTOMER_BY_EMAIL,
      { query: `email:${normalizedEmail}` }
    )

    const existingCustomer = searchResponse.customers.edges[0]?.node

    if (existingCustomer) {
      if (existingCustomer.emailMarketingConsent?.marketingState === 'SUBSCRIBED') {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed!",
          alreadySubscribed: true,
        })
      }

      const updateResponse = await adminFetch<CustomerUpdateResponse>(
        UPDATE_MARKETING_CONSENT,
        {
          input: {
            customerId: existingCustomer.id,
            emailMarketingConsent: {
              marketingState: 'SUBSCRIBED',
              marketingOptInLevel: MARKETING_OPT_IN_LEVEL,
            },
          },
        }
      )

      const updateErrors = updateResponse.customerEmailMarketingConsentUpdate.userErrors
      if (updateErrors.length > 0) {
        console.error('Marketing consent update errors:', updateErrors)
        return NextResponse.json(
          { error: updateErrors[0]?.message || 'Failed to subscribe' },
          { status: 400 }
        )
      }

      if (updateResponse.customerEmailMarketingConsentUpdate.customer) {
        await recordNewsletterConsent({
          customerId: updateResponse.customerEmailMarketingConsentUpdate.customer.id,
          ip,
          userAgent: request.headers.get('user-agent'),
          source: request.headers.get('referer'),
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully subscribed to the newsletter!',
      })
    }

    const createResponse = await adminFetch<CustomerCreateResponse>(
      CREATE_MARKETING_SUBSCRIBER,
      {
        input: {
          email: normalizedEmail,
          emailMarketingConsent: {
            marketingState: 'SUBSCRIBED',
            marketingOptInLevel: MARKETING_OPT_IN_LEVEL,
          },
        },
      }
    )

    const { customer, userErrors } = createResponse.customerCreate

    if (userErrors.length > 0) {
      console.error('Customer create errors:', userErrors)
      return NextResponse.json(
        { error: userErrors[0]?.message || 'Failed to subscribe' },
        { status: 400 }
      )
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      )
    }

    await recordNewsletterConsent({
      customerId: customer.id,
      ip,
      userAgent: request.headers.get('user-agent'),
      source: request.headers.get('referer'),
    })

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to the newsletter!',
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
