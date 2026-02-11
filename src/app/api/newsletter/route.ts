import { NextRequest, NextResponse } from 'next/server'
import { gql } from 'graphql-request'
import { adminFetch } from '@/lib/shopify/adminClient'

// Admin API mutation to create a marketing subscriber
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

// Admin API mutation to update marketing consent for existing customer
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

// Query to find customer by email
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
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const normalizedEmail = email.toLowerCase().trim()
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // First, check if customer already exists
    const searchResponse = await adminFetch<CustomerSearchResponse>(
      FIND_CUSTOMER_BY_EMAIL,
      { query: `email:${normalizedEmail}` }
    )

    const existingCustomer = searchResponse.customers.edges[0]?.node

    if (existingCustomer) {
      // Customer exists - check if already subscribed
      if (existingCustomer.emailMarketingConsent?.marketingState === 'SUBSCRIBED') {
        return NextResponse.json({
          success: true,
          message: "You're already subscribed!",
          alreadySubscribed: true,
        })
      }

      // Update their marketing consent
      const updateResponse = await adminFetch<CustomerUpdateResponse>(
        UPDATE_MARKETING_CONSENT,
        {
          input: {
            customerId: existingCustomer.id,
            emailMarketingConsent: {
              marketingState: 'SUBSCRIBED',
              marketingOptInLevel: 'SINGLE_OPT_IN',
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

    // Create new marketing subscriber (no password required with Admin API)
    const createResponse = await adminFetch<CustomerCreateResponse>(
      CREATE_MARKETING_SUBSCRIBER,
      {
        input: {
          email: normalizedEmail,
          emailMarketingConsent: {
            marketingState: 'SUBSCRIBED',
            marketingOptInLevel: 'SINGLE_OPT_IN',
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
