import { NextRequest, NextResponse } from 'next/server'
import { gql } from 'graphql-request'
import { adminFetch, hasAdminApiCredentials } from '@/lib/shopify/adminClient'
import { checkRateLimit, getClientIp } from '@/lib/utils/rateLimit'

export const dynamic = 'force-dynamic'

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

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request)
    const rl = await checkRateLimit(`newsletter:${ip}`, { maxRequests: 5, windowSeconds: 600 })
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
    const { email } = body

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
              marketingOptInLevel: 'CONFIRMED_OPT_IN',
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
            marketingOptInLevel: 'CONFIRMED_OPT_IN',
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
