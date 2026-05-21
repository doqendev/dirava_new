import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { captureClickIds, clearClickIds, getClickIds } from '../clickIds'

const THIRTY_ONE_DAYS_MS = 31 * 24 * 60 * 60 * 1000

function replaceUrl(path: string): void {
  window.history.replaceState(null, '', path)
}

describe('clickIds', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-21T12:00:00.000Z'))
    clearClickIds()
    replaceUrl('/')
  })

  afterEach(() => {
    clearClickIds()
    vi.useRealTimers()
  })

  it('captures ad click IDs and campaign attribution params', () => {
    replaceUrl(
      '/?fbclid=FB123&gclid=G123&gbraid=GB123&wbraid=WB123&ttclid=TT123' +
        '&rdt_cid=RD123&epik=EP123&utm_source=meta&utm_medium=paid_social' +
        '&utm_campaign=tracking_test&utm_content=creative_a&utm_term=luffy'
    )

    captureClickIds()

    expect(getClickIds()).toEqual(expect.objectContaining({
      fbclid: 'FB123',
      gclid: 'G123',
      gbraid: 'GB123',
      wbraid: 'WB123',
      ttclid: 'TT123',
      rdt_cid: 'RD123',
      epik: 'EP123',
      utm_source: 'meta',
      utm_medium: 'paid_social',
      utm_campaign: 'tracking_test',
      utm_content: 'creative_a',
      utm_term: 'luffy',
    }))
  })

  it('expires stored attribution after the existing 30-day TTL', () => {
    replaceUrl('/?fbclid=FB123&utm_source=meta')
    captureClickIds()
    expect(getClickIds().fbclid).toBe('FB123')

    vi.setSystemTime(Date.now() + THIRTY_ONE_DAYS_MS)

    expect(getClickIds()).toEqual({})
  })
})
