import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { SITE_URL } from '@/lib/utils/siteUrl'

const URL_PATH = '/guides/anime-gift-guide'
const TITLE = 'The Best Custom Anime Gifts for Fans in 2026'
const DESCRIPTION =
  'Gift ideas for anime fans, organised by price tier and by series. Custom LED signs, desk signs, keychains, magnets, and apparel — and how to personalise them.'
const PUBLISHED = '2026-04-10'
const UPDATED = '2026-04-17'

export const metadata: Metadata = {
  title: `${TITLE} | Mizoke`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${URL_PATH}` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: 'article',
    publishedTime: PUBLISHED,
    modifiedTime: UPDATED,
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  dateModified: UPDATED,
  author: { '@type': 'Organization', name: 'Mizoke', url: SITE_URL },
  publisher: {
    '@type': 'Organization',
    name: 'Mizoke',
    url: SITE_URL,
    logo: { '@type': 'ImageObject', url: `${SITE_URL}/opengraph-image` },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE_URL}${URL_PATH}` },
  image: `${SITE_URL}/opengraph-image`,
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is the best anime gift under €20?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Custom anime keychains (€12–€15) are the best sub-€20 gifts. They can be personalised with the recipient\'s favourite character and fit easily into a card or stocking. Non-custom t-shirts start around €20 if you prefer apparel.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does a custom anime gift take to arrive?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Custom products (LED signs, desk signs, custom keychains, custom apparel) are made to order in 1–3 business days. EU and UK shipping then adds 5–10 business days. Canada adds 7–14 days; Australia 10–20 days. Plan for roughly 2 weeks total in Europe, 3 weeks further afield.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I add a personal message to an anime gift?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Custom signs accept a name of up to 12 characters rendered in the anime-themed display font. Mizoke does not currently include a printed gift card at checkout.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Mizoke ship to the United States?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Shipping to the United States is currently suspended due to ongoing tariff changes. Mizoke ships to the rest of the world, including UK, Canada, Australia, and most of Europe and Asia.',
      },
    },
  ],
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
    { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
    { '@type': 'ListItem', position: 3, name: TITLE, item: `${SITE_URL}${URL_PATH}` },
  ],
}

export default function Page() {
  const breadcrumbs = [
    { label: 'Guides', href: '/guides' },
    { label: 'Anime gift guide', href: URL_PATH },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <ContentPageLayout
        title={TITLE}
        description="Gift ideas for anime fans by price and series, updated April 2026."
        breadcrumbs={breadcrumbs}
        glowColor="cyan"
      >
        <article className="space-y-8 text-white/75 leading-relaxed">
          <p className="text-white/60 text-sm">Last updated: April 17, 2026 · 6 min read</p>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Quick picks
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li><strong className="text-white">Under €20:</strong> custom anime keychain (personalised) or non-custom t-shirt</li>
              <li><strong className="text-white">€20–€35:</strong> custom t-shirt</li>
              <li><strong className="text-white">€35–€50:</strong> custom LED sign</li>
              <li><strong className="text-white">€40–€50:</strong> anime hoodie</li>
            </ul>
            <p className="mt-3 text-white/60 text-sm">
              Non-custom items ship faster (1–3 business days processing) than custom items (1–3 business days production + courier transit). Plan accordingly for deadlines.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Gifts by budget
            </h2>

            <h3 className="font-display text-lg text-white mt-6 mb-2">Under €20 — pocket-friendly</h3>
            <p className="mb-3">
              <strong className="text-white">Custom anime keychain (€12–€15).</strong>{' '}
              Acrylic or PLA, single-sided print, personalised to the
              recipient&apos;s favourite character. Great stocking-stuffer or
              last-minute gift.
            </p>
            <p className="mb-3">
              <strong className="text-white">Non-custom t-shirt (~€20).</strong>{' '}
              DTF-printed original anime-themed designs. Available in standard
              sizes.
            </p>
            <p>
              <strong className="text-white">Magnets.</strong> Printed
              character magnets — price depends on whether the magnet is custom
              or a pre-made design.
            </p>

            <h3 className="font-display text-lg text-white mt-6 mb-2">€20–€35 — the mid range</h3>
            <p>
              <strong className="text-white">Custom t-shirt (~€30).</strong>{' '}
              Made to order with a character of your choice using DTF printing.
              Produced in 1–3 business days.
            </p>

            <h3 className="font-display text-lg text-white mt-6 mb-2">€35–€50 — the centerpiece</h3>
            <p>
              <strong className="text-white">Custom LED sign (€35–€50).</strong>{' '}
              Personalised with a character and a name (up to 12 characters).
              Acrylic or PLA body with built-in LEDs, powered by a USB-A cable
              with an in-line on/off switch. No remote, no colour-changing —
              one clean fixed colour matched to the design. Mizoke&apos;s
              bestseller and the most popular gift on the site.
            </p>

            <h3 className="font-display text-lg text-white mt-6 mb-2">€40–€50 — apparel upgrade</h3>
            <p>
              <strong className="text-white">Anime hoodie (€40–€50).</strong>{' '}
              Original designs printed with DTF. Custom variants also
              available. Ships in 1–3 business days for non-custom, same for
              custom.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Gifts by series
            </h2>
            <p className="mb-4">
              If you know the recipient&apos;s favourite anime, start from
              their <em>world</em>:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-outside ml-6">
              <li><Link href="/worlds/one-piece" className="text-neon-cyan hover:underline">One Piece</Link> — 25+ characters</li>
              <li><Link href="/worlds/demon-slayer" className="text-neon-cyan hover:underline">Demon Slayer</Link></li>
              <li><Link href="/worlds/dragon-ball" className="text-neon-cyan hover:underline">Dragon Ball</Link></li>
              <li><Link href="/worlds/attack-on-titan" className="text-neon-cyan hover:underline">Attack on Titan</Link></li>
              <li><Link href="/worlds/hunter-hunter" className="text-neon-cyan hover:underline">Hunter x Hunter</Link></li>
              <li><Link href="/worlds/jujutsu-kaisen" className="text-neon-cyan hover:underline">Jujutsu Kaisen</Link></li>
              <li><Link href="/worlds/bleach" className="text-neon-cyan hover:underline">Bleach</Link></li>
              <li><Link href="/worlds/digimon" className="text-neon-cyan hover:underline">Digimon</Link></li>
            </ul>
            <p className="mt-4 text-white/60 text-sm">
              New worlds are added regularly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Gifts by occasion
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-white font-medium">Birthday</dt>
                <dd>Custom LED sign — adds the recipient&apos;s name alongside their favourite character.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">Anniversary or couple&apos;s gift</dt>
                <dd>Pair of custom keychains or two LED signs with each partner&apos;s name.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">Graduation or new apartment</dt>
                <dd>Custom LED sign for the desk or shelf as room décor.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">Convention gift</dt>
                <dd>Keychains or magnets — easy to pack, easy to trade.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">Cable-free setting (shelf / mantle)</dt>
                <dd>A non-illuminated desk sign — same custom character/name workflow, no USB cable.</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Personalisation tips
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li>
                <strong className="text-white">Know their character.</strong>{' '}
                If you&apos;re unsure, pick the protagonist of their favourite
                series (safe default) or ask a mutual friend.
              </li>
              <li>
                <strong className="text-white">Name the sign.</strong> Custom
                signs support up to 12 characters — a first name, nickname, or
                gamertag all work.
              </li>
              <li>
                <strong className="text-white">Allow production time.</strong>{' '}
                Custom items take 1–3 business days before shipping. With EU
                transit (5–10 days), allow ~2 weeks total. For Canada or
                Australia add another 5–10 days.
              </li>
              <li>
                <strong className="text-white">No printed gift card.</strong>{' '}
                Mizoke does not currently include a printed message at
                checkout. If you need one, add it separately.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Shipping notes
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li>Free shipping above €45 equivalent in local currency (€45 EU · £40 UK · CA$65 Canada · AU$75 Australia).</li>
              <li>Shipping to the <strong className="text-white">United States is currently suspended</strong> due to ongoing tariff changes.</li>
              <li>All other countries ship via tracked courier.</li>
              <li>See{' '}
                <Link href="/policies/shipping" className="text-neon-cyan hover:underline">
                  full shipping policy
                </Link>{' '}for per-region transit times.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-1">What is the best anime gift under €20?</h3>
                <p>Custom anime keychains (€12–€15). Personalised to the recipient&apos;s favourite character.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How long does a custom anime gift take to arrive?</h3>
                <p>1–3 days production + 5–10 days EU/UK courier, or 7–14 days Canada, or 10–20 days Australia.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Can I add a personal message?</h3>
                <p>Custom signs accept up to 12 characters. Printed gift cards are not currently offered at checkout.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Does Mizoke ship to the US?</h3>
                <p>No — shipping to the US is currently suspended due to tariff changes.</p>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-border-subtle">
            <h2 className="font-display text-lg text-white uppercase tracking-wider mb-3">Related</h2>
            <ul className="space-y-2">
              <li><Link href="/guides/led-vs-desk-sign" className="text-neon-cyan hover:underline">LED sign vs desk sign: which to buy →</Link></li>
              <li><Link href="/worlds" className="text-neon-cyan hover:underline">Shop by anime world →</Link></li>
              <li><Link href="/policies/shipping" className="text-neon-cyan hover:underline">Shipping policy →</Link></li>
            </ul>
          </section>
        </article>
      </ContentPageLayout>
    </>
  )
}
