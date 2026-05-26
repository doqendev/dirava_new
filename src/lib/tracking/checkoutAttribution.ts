import { syncCartClickIds } from './syncCartClickIds'

const CHECKOUT_ATTRIBUTION_WAIT_MS = 750

export function continueToCheckoutWithAttribution(
  cartId: string,
  checkoutUrl: string
): void {
  if (typeof window === 'undefined') return

  let didRedirect = false
  const redirect = () => {
    if (didRedirect) return
    didRedirect = true
    window.location.assign(checkoutUrl)
  }

  const timeoutId = window.setTimeout(redirect, CHECKOUT_ATTRIBUTION_WAIT_MS)

  void syncCartClickIds(cartId)
    .catch((error) => {
      if (typeof console !== 'undefined') {
        console.warn('[continueToCheckoutWithAttribution]', error)
      }
    })
    .finally(() => {
      window.clearTimeout(timeoutId)
      redirect()
    })
}
