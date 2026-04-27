/**
 * Per-product-type production slot caps. Each product page shows
 * "<available> / <total> slots available" — a fixed urgency signal,
 * not a real inventory count. Visitors looking at any keychain see the
 * same total (50); any sign sees 20; any LED lightbox sees 10. The
 * `available` value is deterministic per handle per day so two
 * visitors loading the same product on the same day see the same
 * count; the next day's seed shifts the number a little to feel alive.
 */

interface SlotBucket {
  /** Display name for the bucket (used in copy when needed). */
  label: string
  /** Fixed total slots for any product matching this bucket. */
  total: number
  /** Lowest fraction of `total` to display as `available` (e.g. 0.2 = 20%). */
  minRatio: number
  /** Highest fraction of `total` to display as `available`. */
  maxRatio: number
  /** Returns true when the handle belongs to this bucket. Buckets are
   *  evaluated top-down — the first match wins. */
  match: (handle: string) => boolean
}

// Order matters — LED-lightbox handles also contain "sign", so they
// must be checked first.
const BUCKETS: SlotBucket[] = [
  {
    label: 'LED lightbox',
    total: 10,
    minRatio: 0.2,
    maxRatio: 0.6,
    match: (h) => /(led|lightbox)/i.test(h),
  },
  {
    label: 'Keychain',
    total: 50,
    minRatio: 0.25,
    maxRatio: 0.7,
    match: (h) => /keychain/i.test(h),
  },
  {
    label: 'Sign',
    total: 20,
    minRatio: 0.2,
    maxRatio: 0.65,
    match: (h) => /sign/i.test(h),
  },
]

const FALLBACK: SlotBucket = {
  label: 'Item',
  total: 20,
  minRatio: 0.25,
  maxRatio: 0.65,
  match: () => true,
}

/** Tiny deterministic PRNG keyed by handle + date — same value all day,
 *  shifts when the date rolls. */
function dailySeed(handle: string): number {
  const day = new Date().toISOString().slice(0, 10) // YYYY-MM-DD (local TZ-ish; close enough)
  const key = `${handle}::${day}`
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export interface ProductSlots {
  total: number
  available: number
  bucketLabel: string
}

export function getProductSlots(handle: string): ProductSlots {
  const bucket = BUCKETS.find((b) => b.match(handle)) ?? FALLBACK
  const seed = dailySeed(handle)
  const lo = Math.max(1, Math.floor(bucket.total * bucket.minRatio))
  const hi = Math.max(lo + 1, Math.floor(bucket.total * bucket.maxRatio))
  const available = lo + (seed % (hi - lo + 1))
  return { total: bucket.total, available, bucketLabel: bucket.label }
}
