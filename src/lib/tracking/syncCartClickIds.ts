/**
 * Write captured marketing click IDs onto the Shopify cart as attributes
 * (prefixed with `_` so they are not visible to the customer but survive the
 * handoff to Shopify's hosted checkout). Track Clear reads the cart
 * attributes on the order webhook and attributes the purchase back to the
 * originating click.
 */

import { shopifyClient } from '@/lib/shopify/client'
import { gql } from 'graphql-request'
import { getClickIds } from './clickIds'

const CART_ATTRIBUTES_UPDATE = gql`
  mutation CartAttributesUpdate($cartId: ID!, $attributes: [AttributeInput!]!) {
    cartAttributesUpdate(cartId: $cartId, attributes: $attributes) {
      cart {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`

export async function syncCartClickIds(cartId: string): Promise<void> {
  const ids = getClickIds()
  const keys = Object.keys(ids)
  if (keys.length === 0) return

  try {
    const attributes = keys
      .map((key) => {
        const value = ids[key]
        if (!value) return null
        return { key: `_${key}`, value }
      })
      .filter((a): a is { key: string; value: string } => a !== null)

    if (attributes.length === 0) return

    await shopifyClient.request(CART_ATTRIBUTES_UPDATE, { cartId, attributes })
  } catch (err) {
    if (typeof console !== 'undefined') {
      console.warn('[syncCartClickIds]', err)
    }
  }
}
