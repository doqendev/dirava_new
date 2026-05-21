import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { captureClickIds, clearClickIds } from '../clickIds'
import {
  ensureMetaAttribution,
  makeFbc,
  makeFbp,
  readTrackingCookie,
} from '../metaAttribution'

const NOW = new Date('2026-05-21T12:00:00.000Z').getTime()

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

describe('metaAttribution', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(NOW)
    clearClickIds()
    clearCookies()
    replaceUrl('/')
  })

  afterEach(() => {
    clearClickIds()
    clearCookies()
    vi.useRealTimers()
  })

  it('builds Meta attribution values with the expected shape', () => {
    expect(makeFbp(123, '456')).toBe('fb.1.123.456')
    expect(makeFbc('CLICK123', 123)).toBe('fb.1.123.CLICK123')
  })

  it('creates _fbp and _fbc from the current fbclid when invoked', () => {
    replaceUrl('/?fbclid=FB123')

    ensureMetaAttribution()

    expect(readTrackingCookie('_fbp')).toMatch(new RegExp(`^fb\\.1\\.${NOW}\\.\\d+$`))
    expect(readTrackingCookie('_fbc')).toBe(`fb.1.${NOW}.FB123`)
  })

  it('uses stored fbclid when the current URL no longer has one', () => {
    replaceUrl('/?fbclid=FB_FROM_STORE')
    captureClickIds()
    replaceUrl('/')

    ensureMetaAttribution()

    expect(readTrackingCookie('_fbc')).toBe(`fb.1.${NOW}.FB_FROM_STORE`)
  })

  it('does not overwrite existing Meta attribution cookies', () => {
    document.cookie = '_fbp=fb.1.1.existing_fbp; Path=/'
    document.cookie = '_fbc=fb.1.1.existing_fbc; Path=/'
    replaceUrl('/?fbclid=FB123')

    ensureMetaAttribution()

    expect(readTrackingCookie('_fbp')).toBe('fb.1.1.existing_fbp')
    expect(readTrackingCookie('_fbc')).toBe('fb.1.1.existing_fbc')
  })
})
