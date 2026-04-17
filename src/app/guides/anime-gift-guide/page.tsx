import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { SITE_URL } from '@/lib/utils/siteUrl'

const URL_PATH = '/guides/anime-gift-guide'
const TITLE = 'The Best Anime Gifts for Fans in 2026'
const DESCRIPTION =
  'Curated gift ideas for anime fans, organised by budget (under €15, €15–€50, €50+) and by series. Custom signs, keychains, mystery boxes, apparel, and how to personalise them.'
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
        text: 'Custom anime keychains (€12–€15) are the best sub-€20 gifts. They can be personalised with the recipient\'s favourite character and fit easily into a card or stocking.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is a good anime gift for someone whose favourite series you don\'t know?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'An anime mystery box is the best choice. Each box contains a random product across 4 rarity tiers (common → legendary) and works across any series the recipient likes. Mizoke mystery boxes start at €24.90.',
      },
    },
    {
      '@type': 'Question',
      name: 'How long does custom anime gift delivery take?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Custom signs and lightboxes are made to order in 3–7 business days. With EU shipping (5–12 business days), allow 2–3 weeks total. For urgent gifts, choose non-custom items (keychains, magnets, apparel) which ship within 1–3 business days.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I add a personal message to an anime gift?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Custom signs and lightboxes accept a name of up to 12 characters in the display font. For general gift messages, add a note at checkout and Mizoke will include a printed card free of charge.',
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
        description="Gift ideas for anime fans by budget and series, updated April 2026."
        breadcrumbs={breadcrumbs}
        glowColor="cyan"
      >
        <article className="space-y-8 text-white/75 leading-relaxed">
          <p className="text-white/60 text-sm">Last updated: April 17, 2026 · 7 min read</p>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Quick picks
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li><strong className="text-white">Under €15:</strong> custom anime keychain (personalised)</li>
              <li><strong className="text-white">€15–€30:</strong> anime mystery box or magnet set</li>
              <li><strong className="text-white">€30–€60:</strong> custom LED name sign</li>
              <li><strong className="text-white">€60+:</strong> custom LED lightbox sign or hoodie bundle</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Gifts by budget
            </h2>

            <h3 className="font-display text-lg text-white mt-6 mb-2">Under €15 — pocket-friendly</h3>
            <p className="mb-3">
              <strong className="text-white">Custom anime keychain.</strong> Double-sided acrylic keychain with a metal clasp, personalised to the recipient&apos;s favourite character. Ships in 1–3 days. Best for stocking-stuffers, party favours, and last-minute gifts.
            </p>
            <p>
              <strong className="text-white">Anime fridge magnets.</strong> Printed magnets featuring popular characters. Durable, dishwasher-safe, and collect-worthy.
            </p>

            <h3 className="font-display text-lg text-white mt-6 mb-2">€15–€30 — the sweet spot</h3>
            <p className="mb-3">
              <strong className="text-white">Anime mystery box.</strong> If you don&apos;t know the recipient&apos;s favourite series, this is the safest gift. Each box contains one of four tiered products (common → legendary) revealed through an animated reveal page after purchase.
            </p>
            <p>
              <strong className="text-white">Magnet or keychain bundle.</strong> 3–5 pieces around a theme (e.g. Straw Hat crew, Demon Slayer Hashira). Great for collectors.
            </p>

            <h3 className="font-display text-lg text-white mt-6 mb-2">€30–€60 — the centerpiece</h3>
            <p className="mb-3">
              <strong className="text-white">Custom LED name sign.</strong> Personalised with a character and name. Desk-sized, USB-powered, 16 colours via remote. 3–7 day production time. The most popular gift category on Mizoke.
            </p>
            <p>
              <strong className="text-white">Anime hoodie.</strong> Original designs inspired by popular anime universes. Available in 5 sizes.
            </p>

            <h3 className="font-display text-lg text-white mt-6 mb-2">€60+ — statement gifts</h3>
            <p>
              <strong className="text-white">Custom LED lightbox sign.</strong> Large back-lit acrylic panel — wall-mountable and bright enough to serve as room décor or a nightlight. Ideal for someone redecorating a gaming setup or bedroom.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Gifts by series
            </h2>
            <p className="mb-4">
              If you know the recipient&apos;s favourite anime, start from their <em>world</em>:
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
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Gifts by occasion
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-white font-medium">Birthday</dt>
                <dd>Custom LED name sign — adds the recipient&apos;s name alongside their favourite character.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">Anniversary or couple&apos;s gift</dt>
                <dd>Pair of matching keychains or a shared lightbox with both names.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">Secret Santa / budget gift exchange</dt>
                <dd>Anime mystery box — neutral across series and age groups.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">Graduation or new apartment</dt>
                <dd>Custom LED lightbox sign as room décor.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">Convention gift</dt>
                <dd>Keychain or magnet bundle — easy to pack, easy to trade.</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Personalisation tips
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li>
                <strong className="text-white">Know their character.</strong> If you&apos;re unsure, pick the protagonist of their favourite series (safe default) or ask a mutual friend.
              </li>
              <li>
                <strong className="text-white">Name the sign.</strong> Custom signs support up to 12 characters — their first name, a nickname, or their gamertag all work.
              </li>
              <li>
                <strong className="text-white">Match the colour.</strong> If the recipient has a room colour scheme, pick an LED colour that complements it — most Mizoke signs ship with a remote supporting 16 preset colours.
              </li>
              <li>
                <strong className="text-white">Allow production time.</strong> Custom items take 3–7 business days to manufacture before shipping. For rush gifts under 2 weeks, choose non-custom items.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-1">What is the best anime gift under €20?</h3>
                <p>Custom anime keychains. They can be personalised with the recipient&apos;s favourite character and fit into a card or stocking.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">What&apos;s a good gift if I don&apos;t know their favourite series?</h3>
                <p>An anime mystery box. Each contains a random product across 4 rarity tiers and works across any series.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How long does delivery take?</h3>
                <p>Custom items: 3–7 days production plus 5–12 days EU shipping. Non-custom: 1–3 business days processing plus shipping.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Can I include a gift message?</h3>
                <p>Yes — add a note at checkout and Mizoke will include a printed card at no extra cost.</p>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-border-subtle">
            <h2 className="font-display text-lg text-white uppercase tracking-wider mb-3">Related</h2>
            <ul className="space-y-2">
              <li><Link href="/gacha" className="text-neon-cyan hover:underline">Explore anime mystery boxes →</Link></li>
              <li><Link href="/worlds" className="text-neon-cyan hover:underline">Shop by anime world →</Link></li>
              <li><Link href="/guides/led-sign-vs-lightbox" className="text-neon-cyan hover:underline">LED sign vs lightbox: which to buy →</Link></li>
            </ul>
          </section>
        </article>
      </ContentPageLayout>
    </>
  )
}
