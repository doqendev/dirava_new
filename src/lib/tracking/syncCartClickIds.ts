/**
 * Write captured marketing click IDs onto the Shopify cart as attributes
 * (prefixed with `_` so they are not visible to the customer but survive the
 * handoff to Shopify's hosted checkout). Track Clear reads the cart
 * attributes on the order webhook and attributes the purchase back to the
 * originating click.
 */

import { shopifyClient } from '@/lib/shopify/client'
import { gql } from 'graphql-request'
import { useCookieConsentStore } from '@/stores/cookieConsentStore'
import { getClickIds, getStoredLandingPage } from './clickIds'
import { getMetaAttributionCookies } from './metaAttribution'
import { ensureTrackClearSessionId } from './trackClearSession'

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
  const metaCookies = getMetaAttributionCookies()
  const trackclearSessionId = ensureTrackClearSessionId()
  const consent = useCookieConsentStore.getState()
  const idsWithCookies: Record<string, string> = { ...ids }

  if (trackclearSessionId) {
    idsWithCookies.trackclear_session_id = trackclearSessionId
  }
  if (metaCookies.fbp) {
    idsWithCookies.fbp = metaCookies.fbp
  }
  if (metaCookies.fbc) {
    idsWithCookies.fbc = metaCookies.fbc
  }
  if (typeof window !== 'undefined') {
    idsWithCookies.landing_page = getStoredLandingPage() || window.location.href
  }
  if (consent.consentGiven) {
    idsWithCookies.tc_consent_analytics = String(consent.preferences.analytics)
    idsWithCookies.tc_consent_marketing = String(consent.preferences.marketing)
    idsWithCookies.tc_consent_timestamp = consent.consentDate || new Date().toISOString()
    idsWithCookies.tc_consent_source = 'headless_storefront'
  }

  const keys = Object.keys(idsWithCookies)
  if (keys.length === 0) return

  try {
    const attributes = keys
      .map((key) => {
        const value = idsWithCookies[key]
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
