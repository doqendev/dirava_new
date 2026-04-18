import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { SITE_URL } from '@/lib/utils/siteUrl'

export const metadata: Metadata = {
  title: 'About Mizoke — Custom Anime Merchandise Store',
  description:
    'Mizoke is an online store for custom, personalized anime merchandise, built by Neo Stage Collective in Portugal. Learn about our catalogue, how our custom LED signs are made, and how we ship worldwide.',
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: 'About Mizoke — Custom Anime Merchandise Store',
    description:
      'Mizoke is an online store for custom, personalized anime merchandise, built by Neo Stage Collective in Portugal.',
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
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'PT',
    },
    description:
      'Mizoke is an online store for custom, personalized anime merchandise. We produce custom LED signs, desk signs, keychains, magnets, and apparel featuring characters from eight anime universes, including One Piece, Demon Slayer, Dragon Ball, Attack on Titan, Hunter x Hunter, Jujutsu Kaisen, Bleach, and Digimon.',
    areaServed: 'Worldwide excluding United States',
    knowsAbout: [
      'Custom anime LED signs',
      'Personalized anime desk signs',
      'Custom anime keychains',
      'Anime magnets',
      'Anime apparel',
      'Made-to-order anime merchandise',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@mizoke.com',
      availableLanguage: ['English', 'German', 'French', 'Spanish', 'Portuguese'],
    },
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
        description="Custom, personalized anime merchandise — made to order in Portugal."
        breadcrumbs={breadcrumbs}
        glowColor="cyan"
      >
        <div className="space-y-10 text-white/75 leading-relaxed">
          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-4">
              What is Mizoke?
            </h2>
            <p className="mb-4">
              Mizoke is an online store for custom, personalized anime
              merchandise. We design and produce custom LED signs, desk signs,
              keychains, magnets, and apparel featuring characters from eight
              anime universes: One Piece, Demon Slayer, Dragon Ball, Attack on
              Titan, Hunter x Hunter, Jujutsu Kaisen, Bleach, and Digimon. We
              add new worlds and products to the catalogue regularly.
            </p>
            <p>
              Mizoke is built and operated by Neo Stage Collective in Portugal.
              We ship worldwide (except the United States) with free shipping on
              orders above the local-currency equivalent of €45.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-4">
              How our custom signs are made
            </h2>
            <p className="mb-4">
              Our signature custom LED signs are made to order. You choose the
              anime world, select a character, and optionally add a name of up
              to 12 characters. On select products, a live 3D preview shows you
              the exact geometry that will be manufactured.
            </p>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li>
                <strong className="text-white">Character selection:</strong>{' '}
                visual tile picker with 25+ One Piece characters and a curated
                roster for each other world.
              </li>
              <li>
                <strong className="text-white">Personalised text:</strong> add a
                name up to 12 characters in the anime-themed display font on
                Custom Sign products.
              </li>
              <li>
                <strong className="text-white">Production:</strong>{' '}
                made-to-order in 1–3 business days. LED signs ship with a
                USB-A power cable with an in-line switch; no wall adapter or
                remote is included.
              </li>
              <li>
                <strong className="text-white">Mounting:</strong> all LED signs
                stand on their own. If you want to wall-mount, you&apos;ll need
                mounting tape (not included).
              </li>
              <li>
                <strong className="text-white">Shipping:</strong> tracked
                worldwide delivery. Free above €45 equivalent. Typical transit
                5–10 business days in Europe and the UK, 7–14 days in Canada,
                10–20 days in Australia. Shipping to the United States is
                currently suspended due to tariff changes.
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
            <p className="mt-4 text-white/60">
              New worlds are added regularly — check back or sign up to the
              newsletter for updates.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-4">
              Product categories
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <dt className="font-display text-white mb-1">Custom LED signs</dt>
                <dd>Illuminated acrylic or PLA signs with character motifs. Personalised by character and optional name. USB-powered with in-line switch.</dd>
              </div>
              <div>
                <dt className="font-display text-white mb-1">Desk signs</dt>
                <dd>Non-illuminated acrylic or PLA signs for desk or wall. Painted or UV-printed finishes.</dd>
              </div>
              <div>
                <dt className="font-display text-white mb-1">Keychains</dt>
                <dd>Acrylic or PLA single-sided keychains, custom variants available.</dd>
              </div>
              <div>
                <dt className="font-display text-white mb-1">Magnets</dt>
                <dd>Printed character magnets. Custom and non-custom variants.</dd>
              </div>
              <div>
                <dt className="font-display text-white mb-1">Apparel</dt>
                <dd>T-shirts and hoodies with anime-themed DTF prints. Custom variants available.</dd>
              </div>
              <div>
                <dt className="font-display text-white mb-1">New categories</dt>
                <dd>We add new product types regularly as the catalogue expands.</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-4">
              Materials and finishes
            </h2>
            <p className="mb-3">
              Depending on the product, Mizoke uses:
            </p>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li><strong className="text-white">Acrylic</strong> — for edge-lit LED signs and some keychains.</li>
              <li><strong className="text-white">PLA (3D-printed plastic)</strong> — for desk signs, some keychains, and structural parts.</li>
              <li><strong className="text-white">Painted PLA or UV-printed PLA</strong> — for coloured character finishes.</li>
              <li><strong className="text-white">DTF (direct-to-film) printing</strong> — on t-shirts and hoodies.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-4">
              Quick facts
            </h2>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[140px]">Founded</dt>
                <dd>2024, by Neo Stage Collective</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[140px]">Based in</dt>
                <dd>Portugal</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[140px]">Ships to</dt>
                <dd>Worldwide except United States</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[140px]">Languages</dt>
                <dd>English, German, French, Spanish, Portuguese</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[140px]">Production</dt>
                <dd>1–3 business days for custom items</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[140px]">Free shipping</dt>
                <dd>Over €45 equivalent in local currency</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[140px]">Returns</dt>
                <dd>30 days on non-custom items</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[140px]">Guarantee</dt>
                <dd>Broken or defective items replaced free of charge</dd>
              </div>
              <div className="flex gap-3">
                <dt className="text-neon-cyan font-display min-w-[140px]">Contact</dt>
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
              </Link>
              {', see '}
              <Link href="/policies/shipping" className="text-neon-cyan hover:underline">
                shipping details
              </Link>
              {', or '}
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
