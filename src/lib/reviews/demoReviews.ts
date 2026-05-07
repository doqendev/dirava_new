import type { Review, ReviewRating } from '@/types/reviews'

type RatingBreakdown = NonNullable<ReviewRating['ratingBreakdown']>

interface DemoReviewDraft {
  author: string
  rating: 1 | 2 | 3 | 4 | 5
  title?: string
  content: string
  countryCode: string
  daysAgo: number
  verified?: boolean
}

const SIGN_REVIEWS: DemoReviewDraft[] = [
  {
    author: 'Daniel M.',
    rating: 5,
    title: 'Looks clean on the desk',
    content:
      'Picked Luffy with my gamer tag and it came out sharper than I expected. The letters are raised nicely and the whole thing feels more solid than the photos made it look.',
    countryCode: 'PT',
    daysAgo: 9,
    verified: true,
  },
  {
    author: 'Megan T.',
    rating: 5,
    title: 'Gift went down very well',
    content:
      'Bought it for my brother because he is impossible to buy for. He opened it, laughed, then immediately put it next to his monitor. Name spelling was exactly right.',
    countryCode: 'GB',
    daysAgo: 18,
    verified: true,
  },
  {
    author: 'Luca R.',
    rating: 4,
    title: 'Good quality, smaller than I imagined',
    content:
      'The finish is really nice and the print has no blurry edges. I thought it would be a little larger, but after placing it on my shelf the size actually makes sense.',
    countryCode: 'IT',
    daysAgo: 26,
    verified: true,
  },
  {
    author: 'Sofia L.',
    rating: 5,
    content:
      'The preview was very close to the real thing. I was worried the name would look squeezed, but it is centered and readable.',
    countryCode: 'ES',
    daysAgo: 34,
    verified: true,
  },
  {
    author: 'Noah B.',
    rating: 5,
    title: 'Better than normal anime merch',
    content:
      'Most stuff like this feels like cheap plastic. This does not. The black base has a nice weight and the One Piece logo details look crisp.',
    countryCode: 'DE',
    daysAgo: 43,
    verified: true,
  },
  {
    author: 'Rui F.',
    rating: 5,
    title: 'Fast and exactly as ordered',
    content:
      'Ordered on a Monday and it shipped before the weekend. The name was correct, the colors were clean, and the package was protected well.',
    countryCode: 'PT',
    daysAgo: 51,
    verified: true,
  },
  {
    author: 'Emma K.',
    rating: 4,
    title: 'Nice custom piece',
    content:
      'Really happy with it overall. I would love a bigger size option someday, but for a desk or shelf it looks premium.',
    countryCode: 'IE',
    daysAgo: 63,
    verified: true,
  },
  {
    author: 'Jordi P.',
    rating: 5,
    content:
      'Zoro version looks great. The name plate is straight, no weird spacing, and the finish is smoother than expected.',
    countryCode: 'ES',
    daysAgo: 71,
    verified: true,
  },
  {
    author: 'Amelie D.',
    rating: 5,
    title: 'My boyfriend loved it',
    content:
      'I ordered it as a surprise and chose the character he always uses as his profile picture. It looks personal without feeling homemade.',
    countryCode: 'FR',
    daysAgo: 86,
    verified: true,
  },
  {
    author: 'Chris H.',
    rating: 5,
    title: 'Solid little sign',
    content:
      'The edges are clean and it stands flat without wobbling. Looks better in person than on my phone screen.',
    countryCode: 'GB',
    daysAgo: 99,
    verified: true,
  },
  {
    author: 'Marta S.',
    rating: 4,
    title: 'Packaging was good',
    content:
      'The outer box had a small dent from shipping but the sign inside was fine. The product itself is exactly what I wanted.',
    countryCode: 'PL',
    daysAgo: 112,
    verified: true,
  },
  {
    author: 'Felix A.',
    rating: 5,
    content:
      'Simple order process and the live preview helped a lot. I could see the name before buying, which is what convinced me.',
    countryCode: 'NL',
    daysAgo: 128,
    verified: true,
  },
]

const LED_REVIEWS: DemoReviewDraft[] = [
  {
    author: 'Tom R.',
    rating: 5,
    title: 'The glow is the best part',
    content:
      'Ordered the Luffy lightbox for my setup and it honestly looks better with the room lights off. The name area is bright without being unreadable.',
    countryCode: 'PT',
    daysAgo: 7,
    verified: true,
  },
  {
    author: 'Kieran H.',
    rating: 4,
    title: 'Would love a dimmer',
    content:
      'Quality is great and the LED color is strong. Only thing I would add is a dimmer option because it is bright enough to work as a small lamp.',
    countryCode: 'IE',
    daysAgo: 15,
    verified: true,
  },
  {
    author: 'Marianne G.',
    rating: 5,
    title: 'Ace looks insane at night',
    content:
      'Bought Ace as a birthday gift and the red/yellow light looks so good in a dark room. The cable was easy to hide behind the shelf.',
    countryCode: 'FR',
    daysAgo: 22,
    verified: true,
  },
  {
    author: 'Mateo V.',
    rating: 5,
    title: 'Feels more expensive than it is',
    content:
      'The black body, glossy colors and light all work together. It does not look like a random cheap LED sign from a marketplace.',
    countryCode: 'ES',
    daysAgo: 31,
    verified: true,
  },
  {
    author: 'Elena T.',
    rating: 5,
    title: 'Perfect shelf light',
    content:
      'I collect figures and this lights the row behind it. The custom name is readable from across the room and the One Piece design is clear.',
    countryCode: 'DE',
    daysAgo: 47,
    verified: true,
  },
  {
    author: 'Peter N.',
    rating: 5,
    content:
      'Chopper version is adorable. Pink glow on the base looks clean and the sign feels sturdy enough for a desk.',
    countryCode: 'NL',
    daysAgo: 58,
    verified: true,
  },
  {
    author: 'Hugo S.',
    rating: 4,
    title: 'Small cable note',
    content:
      'The sign itself looks incredible. The switch being on the cable can be awkward depending on where you put it, but once placed it looks perfect.',
    countryCode: 'FR',
    daysAgo: 74,
    verified: true,
  },
  {
    author: 'Fatima A.',
    rating: 5,
    title: 'Nami looks gorgeous',
    content:
      'The blue light around the name makes the whole piece feel custom. It was packed really well and arrived without scratches.',
    countryCode: 'ES',
    daysAgo: 93,
    verified: true,
  },
]

const KEYCHAIN_REVIEWS: DemoReviewDraft[] = [
  {
    author: 'Ben C.',
    rating: 5,
    title: 'Great little add-on gift',
    content:
      'Added this to my order last minute and it ended up being the thing my friend uses every day. The print is small but very sharp.',
    countryCode: 'GB',
    daysAgo: 11,
    verified: true,
  },
  {
    author: 'Ines M.',
    rating: 5,
    content:
      'Cute, light, and the colors are strong. The custom name was readable even though the keychain is small.',
    countryCode: 'PT',
    daysAgo: 20,
    verified: true,
  },
  {
    author: 'Nadia B.',
    rating: 4,
    title: 'Looks good on my bag',
    content:
      'Nice quality and not too heavy. I wish the ring was slightly thicker, but the actual character piece looks great.',
    countryCode: 'DE',
    daysAgo: 37,
    verified: true,
  },
  {
    author: 'Leo S.',
    rating: 5,
    title: 'Clean print',
    content:
      'The lines are crisp and the colors did not come out dull. Good size for keys without feeling bulky.',
    countryCode: 'ES',
    daysAgo: 54,
    verified: true,
  },
  {
    author: 'Hannah P.',
    rating: 5,
    content:
      'Bought two matching ones and both names came out right. Nice small gift for anime friends.',
    countryCode: 'IE',
    daysAgo: 77,
    verified: true,
  },
  {
    author: 'Marco L.',
    rating: 5,
    title: 'Good for the price',
    content:
      'No scratches, no weird smell, and the print has held up in my backpack for a few weeks.',
    countryCode: 'IT',
    daysAgo: 102,
    verified: true,
  },
]

const PRODUCT_REVIEWS: Record<string, DemoReviewDraft[]> = {
  'one-piece-custom-sign': SIGN_REVIEWS,
  'demon-slayer-custom-sign': [
    ...SIGN_REVIEWS.slice(0, 8),
    {
      author: 'Clara V.',
      rating: 5,
      title: 'Tanjiro design came out clean',
      content:
        'The pattern details are sharp and the name looks like it belongs with the design instead of being added later.',
      countryCode: 'FR',
      daysAgo: 118,
      verified: true,
    },
    {
      author: 'Oscar M.',
      rating: 5,
      content:
        'Nice finish, good colors, and it stands properly on my shelf. Bought it as a Demon Slayer gift and it worked perfectly.',
      countryCode: 'SE',
      daysAgo: 137,
      verified: true,
    },
  ],
  'dragon-ball-custom-sign': [
    ...SIGN_REVIEWS.slice(1, 9),
    {
      author: 'Andre P.',
      rating: 5,
      title: 'Dragon Ball font looks perfect',
      content:
        'The name style is exactly what I wanted. It has that anime energy without looking messy or hard to read.',
      countryCode: 'PT',
      daysAgo: 121,
      verified: true,
    },
    {
      author: 'Mika K.',
      rating: 4,
      content:
        'Looks great near my figures. The orange is bright, maybe a little brighter than expected, but still very nice.',
      countryCode: 'FI',
      daysAgo: 149,
      verified: true,
    },
  ],
  'hunter-x-hunter-custom-sign': [
    ...SIGN_REVIEWS.slice(2, 10),
    {
      author: 'Jonas E.',
      rating: 5,
      title: 'Clean Hunter x Hunter gift',
      content:
        'Bought it with a short name and it looks really balanced. The green accent is stronger in person.',
      countryCode: 'DE',
      daysAgo: 117,
      verified: true,
    },
    {
      author: 'Priya N.',
      rating: 5,
      content:
        'Exactly the kind of custom anime decor I was looking for. Not huge, but very polished.',
      countryCode: 'GB',
      daysAgo: 154,
      verified: true,
    },
  ],
  'attack-on-titan-custom-sign': [
    ...SIGN_REVIEWS.slice(0, 7),
    {
      author: 'Simon A.',
      rating: 5,
      title: 'Looks serious, not childish',
      content:
        'The Attack on Titan version has a darker look which I really like. It fits on my desk without screaming merch.',
      countryCode: 'DK',
      daysAgo: 88,
      verified: true,
    },
    {
      author: 'Laura C.',
      rating: 4,
      content:
        'Good quality and the name is centered. Shipping was a bit slower than I hoped, but the item was worth waiting for.',
      countryCode: 'ES',
      daysAgo: 146,
      verified: true,
    },
  ],
  'digimon-custom-sign': [
    ...SIGN_REVIEWS.slice(3, 10),
    {
      author: 'Victor R.',
      rating: 5,
      title: 'Nostalgia hit hard',
      content:
        'Got this for my brother because we watched Digimon as kids. The custom name made it feel way more personal.',
      countryCode: 'PT',
      daysAgo: 84,
      verified: true,
    },
    {
      author: 'Laura J.',
      rating: 5,
      content:
        'Cute design, clean edges, and it arrived ready to gift. No complaints.',
      countryCode: 'GB',
      daysAgo: 131,
      verified: true,
    },
  ],
  'one-piece-custom-led-lightbox-sign': LED_REVIEWS,
  'one-piece-custom-keychain': KEYCHAIN_REVIEWS,
  'dragon-ball-custom-keychain': [
    ...KEYCHAIN_REVIEWS.slice(0, 5),
    {
      author: 'Tiago C.',
      rating: 5,
      title: 'Tiny but detailed',
      content:
        'The Dragon Ball colors pop nicely and it does not feel fragile. Good small gift.',
      countryCode: 'PT',
      daysAgo: 88,
      verified: true,
    },
  ],
  'hunter-x-hunter-custom-keychain': [
    ...KEYCHAIN_REVIEWS.slice(1),
    {
      author: 'Sara D.',
      rating: 5,
      title: 'Exactly as shown',
      content:
        'The Hunter x Hunter keychain came out clean and the name is still readable. Happy with it.',
      countryCode: 'FR',
      daysAgo: 91,
      verified: true,
    },
  ],
}

function demoReviewsEnabled(): boolean {
  if (process.env.VERCEL_ENV === 'production') return false
  if (process.env.MIZOKE_DEMO_REVIEWS === 'false') return false
  if (process.env.MIZOKE_DEMO_REVIEWS === 'true') return true

  return process.env.NODE_ENV === 'development'
}

function dateDaysAgo(daysAgo: number): string {
  const date = new Date()
  date.setUTCHours(10, 0, 0, 0)
  date.setUTCDate(date.getUTCDate() - daysAgo)
  return date.toISOString()
}

function getFallbackReviews(productHandle: string): DemoReviewDraft[] {
  if (productHandle.includes('keychain')) return KEYCHAIN_REVIEWS
  if (productHandle.includes('led') || productHandle.includes('lightbox')) return LED_REVIEWS
  if (productHandle.includes('custom')) return SIGN_REVIEWS.slice(0, 8)
  return []
}

function toReview(productHandle: string, draft: DemoReviewDraft, index: number): Review {
  return {
    id: `demo:${productHandle}:${index + 1}`,
    author: draft.author,
    rating: draft.rating,
    title: draft.title,
    content: draft.content,
    createdAt: dateDaysAgo(draft.daysAgo),
    verified: draft.verified ?? true,
    countryCode: draft.countryCode,
    source: 'demo',
  }
}

export function getDemoReviewsByProduct(productHandle: string): Review[] {
  if (!demoReviewsEnabled()) return []

  const drafts = PRODUCT_REVIEWS[productHandle] ?? getFallbackReviews(productHandle)
  return drafts.map((draft, index) => toReview(productHandle, draft, index))
}

export function mergeDemoReviews(productHandle: string, reviews: Review[]): Review[] {
  const demoReviews = getDemoReviewsByProduct(productHandle)
  if (demoReviews.length === 0) return reviews

  const existingIds = new Set(reviews.map((review) => review.id))
  return [...reviews, ...demoReviews.filter((review) => !existingIds.has(review.id))]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
}

export function calculateReviewStats(reviews: Review[]): ReviewRating {
  if (reviews.length === 0) {
    return {
      averageRating: 0,
      reviewCount: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    }
  }

  const ratingBreakdown: RatingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const totalRating = reviews.reduce((total, review) => {
    const rating = Math.min(5, Math.max(1, review.rating)) as keyof RatingBreakdown
    ratingBreakdown[rating] += 1
    return total + rating
  }, 0)

  return {
    averageRating: totalRating / reviews.length,
    reviewCount: reviews.length,
    ratingBreakdown,
  }
}
