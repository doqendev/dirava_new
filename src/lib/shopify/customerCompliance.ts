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
