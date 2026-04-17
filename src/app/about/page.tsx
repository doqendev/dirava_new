import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { SITE_URL } from '@/lib/utils/siteUrl'

export const metadata: Metadata = {
  title: 'About Mizoke — Custom Anime Merchandise Store',
  description:
    'Mizoke is an online store for custom, personalized anime merchandise. Learn about our mission, catalogue, and how our made-to-order LED signs, lightboxes, keychains, and apparel are produced.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About Mizoke — Custom Anime Merchandise Store',
    description:
      'Mizoke is an online store for custom, personalized anime merchandise, built by Neo Stage Collective.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const aboutSchema = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: 'About Mizoke',
  url: `${SITE_URL}/about`,
  mainEntity: {
    '@type': 'Organization',
    name: 'Mizoke',
    alternateName: 'Mizoke Anime Store',
    url: SITE_URL,
    logo: `${SITE_URL}/opengraph-image`,
    foundingDate: '2024',
    founder: {
      '@type': 'Organization',
      name: 'Neo Stage Collective',
    },
    description:
      'Mizoke is an online store for custom, personalized anime merchandise. We produce LED signs, lightbox signs, keychains, magnets, and apparel featuring characters from eight anime universes, including One Piece, Demon Slayer, Dragon Ball, Attack on Titan, Hunter x Hunter, Jujutsu Kaisen, Bleach, and Digimon.',
    areaServed: 'Worldwide',
    knowsAbout: [
      'Anime merchandise',
      'Custom LED signs',
      'Personalized lightbox signs',
      'Custom keychains',
      'Anime apparel',
      'Made-to-order products',
    ],
  },
}

export default function AboutPage() {
  const breadcrumbs = [{ label: 'About', href: '/about' }]

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/about` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ContentPageLayout
        title="About Mizoke"
        description="Custom, personalized anime merchandise — made to order."
        breadcrumbs={breadcrumbs}
        glowColor="cyan"
      >
        <div className="space-y-10 text-white/75 leading-relaxed">
          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-4">
              What is Mizoke?
            </h2>
            <p className="mb-4">
              Mizoke is an online store for custom, personalized anime merchandise.
              We design and produce LED signs, lightbox signs, keychains, magnets,
              and apparel featuring characters from eight anime universes: One
              Piece, Demon Slayer, Dragon Ball, Attack on Titan, Hunter x Hunter,
              Jujutsu Kaisen, Bleach, and Digimon. Every customisable product is
              made to order based on the character and name you choose at
              checkout.
            </p>
            <p>
              The store is built and operated by Neo Stage Collective. We ship
              to over 30 countries, with free shipping across Europe on orders
              above €45.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-4">
              How our custom signs are made
            </h2>
            <p className="mb-4">
              Our signature custom signs and LED lightboxes start in a 3D
              configurator: you pick the anime world, select a character, and
              optionally add a name. The live preview renders the exact geometry
              that will be manufactured, so what you see is what you get.
            </p>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li>
                <strong className="text-white">Character selection:</strong>{' '}
                visual tile picker with 25+ One Piece characters and a curated
                roster for each other world.
              </li>
              <li>
                <strong className="text-white">Personalised text:</strong> add a
                name in the anime-themed display font. Supported on Custom Sign
                and Custom LED Lightbox products.
              </li>
              <li>
                <strong className="text-white">Production:</strong>{' '}
                made-to-order in 3–7 business days. LED lightboxes include a
                USB-C power cable and remote.
              </li>
              <li>
                <strong className="text-white">Shipping:</strong> tracked
                worldwide delivery. Free on EU orders over €45. Typical transit
                5–12 business days in Europe, 5–10 days in the UK, 7–14 days in
                North America.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-4">
              Anime worlds we cover
            </h2>
            <p className="mb-4">
              The catalogue is organised into anime <em>worlds</em>. Each world
              has its own colour theme and curated character roster:
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 list-disc list-outside ml-6">
              <li>
                <Link href="/worlds/one-piece" className="text-neon-cyan hover:underline">
                  One Piece
                </Link>
                {' '}— 25+ characters
              </li>
              <li>
                <Link href="/worlds/demon-slayer" className="text-neon-cyan hover:underline">
                  Demon Slayer
                </Link>
              </li>
              <li>
                <Link href="/worlds/dragon-ball" className="text-neon-cyan hover:underline">
                  Dragon Ball
                </Link>
              </li>
              <li>
                <Link href="/worlds/attack-on-titan" className="text-neon-cyan hover:underline">
                  Attack on Titan
                </Link>
              </li>
              <li>
                <Link href="/worlds/hunter-hunter" className="text-neon-cyan hover:underline">
                  Hunter x Hunter
                </Link>
              </li>
              <li>
                <Link href="/worlds/jujutsu-kaisen" className="text-neon-cyan hover:underline">
                  Jujutsu Kaisen
                </Link>
              </li>
              <li>
                <Link href="/worlds/bleach" className="text-neon-cyan hover:underline">
                  Bleach
                </Link>
              </li>
              <li>
                <Link href="/worlds/digimon" className="text-neon-cyan hover:underline">
                  Digimon
                </Link>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-4">
              Product categories
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <dt className="font-display text-white mb-1">Custom signs</dt>
                <dd>3D-printed acrylic name signs with character motifs. Desk or shelf-sized.</dd>
              </div>
              <div>
                <dt className="font-display text-white mb-1">LED lightbox signs</dt>
                <dd>Back-lit acrylic panels with USB-C power and remote-controlled RGB.</dd>
              </div>
              <div>
                <dt className="font-display text-white mb-1">Keychains</dt>
                <dd>Double-sided acrylic keychains with metal clasp.</dd>
              </div>
              <div>
                <dt className="font-display text-white mb-1">Magnets</dt>
                <dd>Printed fridge magnets with fan-favourite character art.</dd>
              </div>
              <div>
                <dt className="font-display text-white mb-1">Apparel</dt>
                <dd>Hoodies and t-shirts with original anime-themed designs.</dd>
              </div>
              <div>
                <dt className="font-display text-white mb-1">Mystery boxes</dt>
                <dd>Gacha-style reveal boxes containing 1 of 4 tiered products (common → legendary).</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-4">
              Quick facts
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[120px]">Founded</dt>
                <dd>2024, by Neo Stage Collective</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[120px]">Ships to</dt>
                <dd>30+ countries worldwide</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[120px]">Languages</dt>
                <dd>English, German, French, Spanish, Portuguese</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[120px]">Free shipping</dt>
                <dd>EU orders over €45</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[120px]">Returns</dt>
                <dd>30 days on non-custom items</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[120px]">Contact</dt>
                <dd>
                  <a href="mailto:support@mizoke.com" className="text-neon-cyan hover:underline">
                    support@mizoke.com
                  </a>
                </dd>
              </div>
            </dl>
          </section>

          <section className="pt-6 border-t border-border-subtle">
            <p className="text-white/60">
              Questions? Read our{' '}
              <Link href="/faq" className="text-neon-cyan hover:underline">
                FAQ
              </Link>{' '}
              or{' '}
              <Link href="/contact" className="text-neon-cyan hover:underline">
                contact us
              </Link>
              .
            </p>
          </section>
        </div>
      </ContentPageLayout>
    </>
  )
}
