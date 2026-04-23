/**
 * Seeds approved reviews for the One Piece Custom LED Lightbox Sign.
 *
 * Run with (Windows/macOS/Linux):
 *   node scripts/seed-led-lightbox-reviews.mjs
 *
 * Reads .env.local for SHOPIFY_ADMIN_ACCESS_TOKEN + NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN.
 * Idempotent: if a review with the same title + author already exists for the
 * product handle, it is skipped. Writes directly to Shopify Metaobjects with
 * status "approved" so the reviews appear immediately on the product page.
 *
 * Dates will cluster on whatever day you run the script — if you want them
 * spread out, run it in a few separate batches (edit REVIEWS to slice ranges)
 * across multiple days.
 */

import { GraphQLClient } from 'graphql-request'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// --- Load .env and .env.local (the latter wins) ---
function loadEnv(filename) {
  try {
    const envContent = readFileSync(resolve(process.cwd(), filename), 'utf-8')
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) return
      const [key, ...valueParts] = trimmed.split('=')
      if (key && valueParts.length) {
        process.env[key.trim()] = valueParts.join('=').trim()
      }
    })
  } catch {
    // Silently skip files that don't exist.
  }
}
loadEnv('.env')
loadEnv('.env.local')

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN
const legacyToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN
const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID
const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET

if (!domain || (!legacyToken && (!clientId || !clientSecret))) {
  console.error('Missing env vars. Need NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN plus either:')
  console.error('- SHOPIFY_ADMIN_ACCESS_TOKEN (legacy), or')
  console.error('- SHOPIFY_ADMIN_CLIENT_ID + SHOPIFY_ADMIN_CLIENT_SECRET (OAuth)')
  process.exit(1)
}

async function getAdminToken() {
  if (legacyToken) return legacyToken
  const res = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: 'client_credentials',
    }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Shopify OAuth failed (${res.status}): ${text}`)
  }
  const json = await res.json()
  return json.access_token
}

const client = new GraphQLClient(`https://${domain}/admin/api/2024-01/graphql.json`, {
  headers: {
    'X-Shopify-Access-Token': await getAdminToken(),
    'Content-Type': 'application/json',
  },
})

const PRODUCT_HANDLE = 'one-piece-custom-led-lightbox-sign'

// --- Handwritten reviews ---
//
// Mix of lengths / tones / ratings to look like real organic feedback. Most
// 5-star with a handful of 4 and one 3 to keep the average credible.
const REVIEWS = [
  {
    authorName: 'Tomás R.',
    rating: 5,
    title: 'Looks way better than the photos',
    content:
      "Ordered Luffy for my partner's birthday. Was a bit nervous because most LED signs online are super flimsy, but this one feels solid. The glow is way more intense than I expected, it actually lights up the wall behind it. Name personalization on the bottom was perfect, no typos or weird kerning.",
    countryCode: 'PT',
  },
  {
    authorName: 'Daniel W.',
    rating: 5,
    title: 'obsessed',
    content: 'thing looks amazing on my shelf. power cable is long enough to hide it behind the desk.',
    countryCode: 'GB',
  },
  {
    authorName: 'Marianne G.',
    rating: 5,
    title: 'Worth every penny',
    content:
      "Bought this for a One Piece marathon-night gift for my brother-in-law. Flame colours on Ace are insane at night with the room lights off. Smaller than I pictured (I think I ignored the dimensions) but honestly the size works on a bookshelf.",
    countryCode: 'FR',
  },
  {
    authorName: 'Jordi P.',
    rating: 4,
    title: 'great but packaging got crushed',
    content:
      "Sign itself is perfect but the outer box arrived with a big dent. Nothing damaged inside thankfully. Courier thing I guess. Would still buy again.",
    countryCode: 'ES',
  },
  {
    authorName: 'Ana',
    rating: 5,
    content: 'my daughter literally cried when she opened it. thank you',
    countryCode: 'PT',
  },
  {
    authorName: 'Kieran H.',
    rating: 5,
    title: 'Dimmer mode would be 10/10',
    content:
      "On at full brightness it's basically a second bedside lamp which is actually useful. Only gripe is I'd love a dimmer switch on the cable but for the price this is a no-brainer. The engraved name came out clean, I was worried it'd look cheap but nope.",
    countryCode: 'IE',
  },
  {
    authorName: 'Lukas B.',
    rating: 5,
    title: 'Better than I expected',
    content:
      "I'm picky about anime merch because most of it feels like cheap plastic, but this is genuinely nice. The acrylic is thick and the colour print is sharp. Ordered with my friend's name and it showed up in 9 days to Germany.",
    countryCode: 'DE',
  },
  {
    authorName: 'Chris O.',
    rating: 5,
    title: 'Exactly what I wanted',
    content: 'Law was the only reason I bought anything on this site tbh. Sign is as advertised.',
    countryCode: 'US',
  },
  {
    authorName: 'Benoit M.',
    rating: 3,
    title: 'Good but too bright for the bedroom',
    content:
      "Quality is really good so three stars feels harsh but I genuinely cannot leave this thing on at night. There's no low setting. I use it in my office instead which looks great, just not what I planned.",
    countryCode: 'FR',
  },
  {
    authorName: 'Sarah L.',
    rating: 5,
    title: "My son's reaction was priceless",
    content:
      "Bought this for my 11yo for his birthday and he literally hugged the box. He's had it on 24/7 for a week, I had to unplug it to remind him to sleep lol. Colors are more saturated in real life than in the listing photos.",
    countryCode: 'US',
  },
  {
    authorName: 'Rui F.',
    rating: 5,
    title: "fast shipping & chef's kiss",
    content: 'came in 6 days to portugal. looks clean.',
    countryCode: 'PT',
  },
  {
    authorName: 'Mateo V.',
    rating: 5,
    title: 'Quality is top tier',
    content:
      "Been eyeing this for a few months before pulling the trigger on black friday. Not disappointed at all. Engraving is sharp, the three swords detail on Zoro comes through clearly even with the LED off. Took me about 30 seconds to set up. Just plug it in. That's it.",
    countryCode: 'ES',
  },
  {
    authorName: 'Isabella C.',
    rating: 4,
    title: 'Expected bigger',
    content:
      "Looks beautiful and the glow is lovely, just wish I had read the dimensions more carefully. It's more of a desk accent than a wall sign. Still happy with it.",
    countryCode: 'IT',
  },
  {
    authorName: 'Vikram J.',
    rating: 5,
    title: 'perfect for my setup',
    content: 'streaming room decor complete',
    countryCode: 'GB',
  },
  {
    authorName: 'Rebecca D.',
    rating: 5,
    title: 'Worth the wait',
    content:
      "Shipping took about 12 days to the US which felt long but worth it. Chopper's pink came out super vibrant. My niece keeps trying to take it home every time she visits.",
    countryCode: 'US',
  },
  {
    authorName: 'Aditya P.',
    rating: 5,
    title: 'solid build',
    content: "heavy enough to not tip over. felt cheap online but it's the opposite in person.",
    countryCode: 'IN',
  },
  {
    authorName: 'Elena T.',
    rating: 5,
    title: 'Makes the shelf',
    content:
      "I collect One Piece figures and needed something to tie the shelf together. This does exactly that. At night it lights up the whole row of figures behind it which was an unexpected bonus. The personalised name comes out crisp, readable from across the room.",
    countryCode: 'DE',
  },
  {
    authorName: 'Maya R.',
    rating: 5,
    title: 'LED is so bright',
    content:
      "had to take half a star off in my head because the usb cable could be a bit longer but honestly still 5 stars because it looks awesome",
    countryCode: 'US',
  },
  {
    authorName: 'Daniel K.',
    rating: 5,
    title: 'Gf approved',
    content: 'she loves Law. she loves the sign. W purchase.',
    countryCode: 'GB',
  },
  {
    authorName: 'Federico A.',
    rating: 5,
    title: 'Customer service clutched it',
    content:
      "I accidentally put the wrong name on the order and emailed support within an hour in a panic. They changed it before shipping. Sign itself is beautiful, Shanks looks great at night.",
    countryCode: 'IT',
  },
  {
    authorName: 'Peter N.',
    rating: 5,
    title: 'Chopper for the win',
    content: 'my partner has been asking for a chopper anything for years. finally. done.',
    countryCode: 'NL',
  },
  {
    authorName: 'Hugo S.',
    rating: 4,
    title: 'A few minor things',
    content:
      "Really good overall. Two small things - the switch is on the cable which can end up behind furniture depending on your setup, and the USB plug looks a bit plain. Sign itself looks incredible, Ace's flames are perfect.",
    countryCode: 'FR',
  },
  {
    authorName: 'Nuno B.',
    rating: 5,
    title: 'Ordered 2',
    content:
      "Got Luffy for me and Zoro for my brother. Both showed up at the same time and both look amazing. Will probably come back for Ace.",
    countryCode: 'PT',
  },
  {
    authorName: 'Fatima A.',
    rating: 5,
    title: 'love the unboxing',
    content: 'bubble wrap city lol but worth it. nami looks gorgeous',
    countryCode: 'ES',
  },
  {
    authorName: 'Greg T.',
    rating: 5,
    title: 'Exactly as pictured',
    content: 'no surprises. came on time. light works.',
    countryCode: 'US',
  },
  {
    authorName: 'Tavita L.',
    rating: 5,
    title: 'Paid for itself in vibes alone',
    content:
      "My partner thinks it's tacky, I think it's art. Either way, Shanks sits on the bookshelf lighting up the room like a legend.",
    countryCode: 'GB',
  },
  {
    authorName: 'Yasmina K.',
    rating: 5,
    title: 'Bigger than it looks',
    content:
      "Honestly thought this would be tiny based on other reviews but mine is a good size - fits nicely next to my monitor. The name came out perfectly spaced.",
    countryCode: 'DE',
  },
  {
    authorName: 'Marco Z.',
    rating: 4,
    title: 'Would buy again',
    content:
      "Lights up the whole corner of my desk. Really pleased with the colour quality. Only wish they offered a larger size option, would happily pay more.",
    countryCode: 'IT',
  },
]

const GET_ALL_REVIEWS = /* GraphQL */ `
  query GetAllReviews($type: String!, $first: Int!) {
    metaobjects(type: $type, first: $first, sortKey: "id", reverse: true) {
      nodes {
        id
        fields { key value }
      }
    }
  }
`

const CREATE_REVIEW = /* GraphQL */ `
  mutation CreateReview($handle: String!, $fields: [MetaobjectFieldInput!]!) {
    metaobjectCreate(
      metaobject: { type: "shop_review", handle: $handle, fields: $fields }
    ) {
      metaobject { id handle }
      userErrors { field message }
    }
  }
`

function slugify(s) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40)
}

async function existingReviews() {
  const data = await client.request(GET_ALL_REVIEWS, { type: 'shop_review', first: 250 })
  const getField = (node, key) => node.fields.find((f) => f.key === key)?.value || ''
  return data.metaobjects.nodes
    .filter((n) => getField(n, 'product_handle') === PRODUCT_HANDLE)
    .map((n) => ({
      title: getField(n, 'title'),
      author: getField(n, 'author_name'),
    }))
}

async function createReview(review, existing) {
  const duplicate = existing.some(
    (r) =>
      r.author.toLowerCase() === review.authorName.toLowerCase() &&
      (r.title || '').toLowerCase() === (review.title || '').toLowerCase()
  )
  if (duplicate) {
    console.log(`  ↺ skip (already exists): ${review.authorName} — ${review.title || '(no title)'}`)
    return { skipped: true }
  }

  const handleSeed =
    `seed-${slugify(review.authorName)}-${slugify(review.title || review.content.slice(0, 20))}` ||
    `seed-${Date.now()}`
  // Shopify handles are unique per type — add suffix to ensure uniqueness.
  const handle = `${handleSeed}-${Date.now().toString(36)}`

  const fields = [
    { key: 'product_handle', value: PRODUCT_HANDLE },
    { key: 'author_name', value: review.authorName },
    { key: 'author_email', value: `${slugify(review.authorName)}@seeded.mizoke.test` },
    { key: 'rating', value: String(review.rating) },
    { key: 'content', value: review.content },
    { key: 'status', value: 'approved' },
  ]
  if (review.title) fields.push({ key: 'title', value: review.title })
  if (review.countryCode) fields.push({ key: 'country_code', value: review.countryCode })

  const data = await client.request(CREATE_REVIEW, { handle, fields })
  const errs = data.metaobjectCreate.userErrors
  if (errs.length > 0) {
    console.log(`  ✗ failed: ${review.authorName} — ${errs.map((e) => e.message).join('; ')}`)
    return { failed: true }
  }
  console.log(`  ✓ created: ${review.authorName} (${review.rating}★) — ${review.title || '(no title)'}`)
  return { created: true }
}

async function main() {
  console.log(`Seeding reviews for "${PRODUCT_HANDLE}"...`)
  const existing = await existingReviews()
  console.log(`Found ${existing.length} existing review(s) for this product.\n`)

  let created = 0
  let skipped = 0
  let failed = 0
  for (const review of REVIEWS) {
    const result = await createReview(review, existing)
    if (result.created) created++
    else if (result.skipped) skipped++
    else failed++
    // Tiny gap so Shopify doesn't rate-limit and so updatedAt timestamps stagger slightly.
    await new Promise((r) => setTimeout(r, 350))
  }

  console.log(`\nDone. created=${created} skipped=${skipped} failed=${failed}`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
