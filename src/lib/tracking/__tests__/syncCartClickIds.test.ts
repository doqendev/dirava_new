import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest'
import { shopifyClient } from '@/lib/shopify/client'
import { captureClickIds, clearClickIds } from '../clickIds'
import { ensureTrackClearSessionId } from '../trackClearSession'
import { syncCartClickIds } from '../syncCartClickIds'

vi.mock('@/lib/shopify/client', () => ({
  shopifyClient: {
    request: vi.fn(),
  },
}))

function replaceUrl(path: string): void {
  window.history.replaceState(null, '', path)
}

function clearCookies(): void {
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0]?.trim()
    if (name) {
      document.cookie = `${name}=; Max-Age=0; Path=/`
    }
  }
}

describe('syncCartClickIds', () => {
  const requestMock = shopifyClient.request as unknown as Mock

  beforeEach(() => {
    clearClickIds()
    clearCookies()
    replaceUrl('/')
    requestMock.mockResolvedValue({})
  })

  afterEach(() => {
    clearClickIds()
    clearCookies()
    vi.clearAllMocks()
  })

  it('writes click IDs, Meta cookies, and UTMs to Shopify cart attributes', async () => {
    replaceUrl(
      '/?fbclid=FB123&gclid=G123&gbraid=GB123&wbraid=WB123&ttclid=TT123' +
        '&rdt_cid=RD123&epik=EP123&utm_source=meta&utm_medium=paid_social' +
        '&utm_campaign=tracking_test&utm_content=creative_a&utm_term=luffy'
    )
    captureClickIds()
    document.cookie = '_fbp=fb.1.1.1234567890; Path=/'
    document.cookie = '_fbc=fb.1.1.FB123; Path=/'
    const sessionId = ensureTrackClearSessionId()

    await syncCartClickIds('gid://shopify/Cart/test')

    expect(requestMock).toHaveBeenCalledTimes(1)
    const variables = requestMock.mock.calls[0]?.[1] as
      | { attributes?: Array<{ key: string; value: string }> }
      | undefined

    expect(variables?.attributes).toEqual(expect.arrayContaining([
      { key: '_trackclear_session_id', value: sessionId },
      { key: '_fbp', value: 'fb.1.1.1234567890' },
      { key: '_fbc', value: 'fb.1.1.FB123' },
      { key: '_fbclid', value: 'FB123' },
      { key: '_gclid', value: 'G123' },
      { key: '_gbraid', value: 'GB123' },
      { key: '_wbraid', value: 'WB123' },
      { key: '_ttclid', value: 'TT123' },
      { key: '_rdt_cid', value: 'RD123' },
      { key: '_epik', value: 'EP123' },
      { key: '_utm_source', value: 'meta' },
      { key: '_utm_medium', value: 'paid_social' },
      { key: '_utm_campaign', value: 'tracking_test' },
      { key: '_utm_content', value: 'creative_a' },
      { key: '_utm_term', value: 'luffy' },
    ]))
    expect(variables?.attributes).toEqual(expect.arrayContaining([
      expect.objectContaining({
        key: '_landing_page',
        value: expect.stringContaining('fbclid=FB123'),
      }),
    ]))
  })
})
