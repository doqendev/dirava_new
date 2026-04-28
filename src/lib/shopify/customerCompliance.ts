import { gql } from 'graphql-request'
import { adminFetch } from '@/lib/shopify/adminClient'

const COMPLIANCE_NAMESPACE = 'compliance'

const GET_CUSTOMER_METAFIELD = gql`
  query GetCustomerComplianceMetafield($customerId: ID!, $namespace: String!, $key: String!) {
    customer(id: $customerId) {
      metafield(namespace: $namespace, key: $key) {
        value
      }
    }
  }
`

const SET_CUSTOMER_METAFIELD = gql`
  mutation SetCustomerComplianceMetafield($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      userErrors {
        field
        message
      }
    }
  }
`

async function getComplianceLog(
  customerId: string,
  key: string
): Promise<Record<string, unknown>[]> {
  const response = await adminFetch<{
    customer: {
      metafield: { value: string } | null
    } | null
  }>(GET_CUSTOMER_METAFIELD, {
    customerId,
    namespace: COMPLIANCE_NAMESPACE,
    key,
  })

  const rawValue = response.customer?.metafield?.value
  if (!rawValue) {
    return []
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown
    return Array.isArray(parsed) ? (parsed as Record<string, unknown>[]) : []
  } catch {
    return []
  }
}

const ADMIN_CUSTOMER_REDACT = gql`
  mutation AdminCustomerRedact($input: CustomerInput!) {
    customerUpdate(input: $input) {
      customer {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

/**
 * Anonymize a customer's PII via the Admin API. Used to honour GDPR
 * Article 17 deletion requests for customers Shopify won't outright
 * delete (e.g. ones with order history, since order records are kept
 * for tax/financial compliance reasons).
 *
 * After this runs, the customer can no longer log in (their email is
 * replaced with an unrouted placeholder), their name fields are
 * scrubbed, marketing opt-in is cleared, and a `gdpr-erased` tag is
 * added so the merchant can audit erasures from the Shopify Admin.
 *
 * Throws on userErrors so the caller can fall back to a manual
 * workflow (admin notification email) when anonymisation fails.
 */
export async function redactCustomerPII(input: {
  customerId: string
  /** Used to construct the deterministic placeholder email. */
  customerNumericIdHash: string
}): Promise<void> {
  const placeholderEmail = `gdpr-erased-${input.customerNumericIdHash}@anonymous.invalid`

  const response = await adminFetch<{
    customerUpdate: {
      customer: { id: string } | null
      userErrors: Array<{ field: string[] | null; message: string }>
    }
  }>(ADMIN_CUSTOMER_REDACT, {
    input: {
      id: input.customerId,
      email: placeholderEmail,
      firstName: 'Deleted',
      lastName: 'User',
      phone: null,
      tags: ['gdpr-erased'],
      emailMarketingConsent: {
        marketingState: 'NOT_SUBSCRIBED',
        marketingOptInLevel: 'SINGLE_OPT_IN',
      },
    },
  })

  if (response.customerUpdate.userErrors.length > 0) {
    throw new Error(
      response.customerUpdate.userErrors.map((error) => error.message).join(', ')
    )
  }

  if (!response.customerUpdate.customer) {
    throw new Error('Customer update returned no customer')
  }
}

export async function appendCustomerComplianceEvent(
  customerId: string,
  key: string,
  event: Record<string, unknown>
): Promise<void> {
  const existingEvents = await getComplianceLog(customerId, key)
  const nextEvents = [...existingEvents, event].slice(-20)

  const response = await adminFetch<{
    metafieldsSet: {
      userErrors: Array<{ field: string[]; message: string }>
    }
  }>(SET_CUSTOMER_METAFIELD, {
    metafields: [
      {
        ownerId: customerId,
        namespace: COMPLIANCE_NAMESPACE,
        key,
        type: 'json',
        value: JSON.stringify(nextEvents),
      },
    ],
  })

  if (response.metafieldsSet.userErrors.length > 0) {
    throw new Error(
      response.metafieldsSet.userErrors.map((error) => error.message).join(', ')
    )
  }
}
