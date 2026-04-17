import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { SITE_URL } from '@/lib/utils/siteUrl'

const URL_PATH = '/guides/custom-anime-sign-care-guide'
const TITLE = 'How to Clean and Care for a Custom Anime Acrylic Sign'
const DESCRIPTION =
  'A step-by-step care guide for custom anime LED signs and acrylic lightboxes. How to clean, mount, store, and what to avoid so your sign stays scratch-free and bright.'
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

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to clean an acrylic anime LED sign',
  description:
    'Safely clean an acrylic LED or lightbox sign without scratching it or damaging the LEDs.',
  totalTime: 'PT5M',
  tool: [
    { '@type': 'HowToTool', name: 'Microfiber cloth' },
    { '@type': 'HowToTool', name: 'Distilled water or mild soap solution' },
  ],
  supply: [{ '@type': 'HowToSupply', name: 'Soft microfiber cloth' }],
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Unplug the sign',
      text: 'Disconnect the USB-C cable and let the sign cool for 2–3 minutes if it was on.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Dry dust first',
      text: 'Use a dry microfiber cloth to wipe off loose dust with gentle circular motions. Never use paper towels — they can scratch acrylic.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Damp wipe if needed',
      text: 'Lightly dampen the cloth with distilled water or a mild soap solution. Wring it so no liquid drips. Never spray cleaner directly onto the sign.',
    },
    {
      '@type': 'HowToStep',
      position: 4,
      name: 'Dry and reconnect',
      text: 'Dry with a second microfiber cloth. Wait 5 minutes before reconnecting power.',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I use glass cleaner on an acrylic anime sign?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Ammonia-based glass cleaners (like Windex) cause acrylic to cloud and crack over time. Use distilled water or a mild soap solution with a microfiber cloth.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I remove fingerprints from an acrylic LED sign?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lightly dampen a microfiber cloth with distilled water, wipe in one direction, then dry with a second microfiber cloth. Avoid circular scrubbing on fingerprints — it can leave swirl marks on the acrylic.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I leave my LED sign on 24/7?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. The 5V USB LEDs are low-wattage and rated for continuous use. To extend bulb life, dim to 30–50% when used as a nightlight.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the sign waterproof?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Acrylic LED signs and lightboxes are not waterproof. Keep them indoors and away from sinks, bathrooms, and open windows.',
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
    { label: 'Sign care guide', href: URL_PATH },
  ]

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <ContentPageLayout
        title={TITLE}
        description="Cleaning, mounting, and daily care for acrylic LED signs and lightboxes."
        breadcrumbs={breadcrumbs}
        glowColor="cyan"
      >
        <article className="space-y-8 text-white/75 leading-relaxed">
          <p className="text-white/60 text-sm">Last updated: April 17, 2026 · 4 min read</p>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Quick rules
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li><strong className="text-white">Do</strong> use a microfiber cloth and distilled water.</li>
              <li><strong className="text-white">Don&apos;t</strong> use paper towels, ammonia, or alcohol-based cleaners.</li>
              <li><strong className="text-white">Do</strong> unplug before cleaning.</li>
              <li><strong className="text-white">Don&apos;t</strong> spray liquid directly on the sign.</li>
              <li><strong className="text-white">Don&apos;t</strong> place near water, steam, or direct sunlight.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Cleaning your acrylic sign
            </h2>
            <ol className="list-decimal list-outside ml-6 space-y-3">
              <li>
                <strong className="text-white">Unplug</strong> the USB-C cable and let the sign cool for 2–3 minutes if it was on.
              </li>
              <li>
                <strong className="text-white">Dry dust first.</strong> Use a dry microfiber cloth to wipe off loose dust with gentle circular motions. Paper towels can leave micro-scratches on acrylic — avoid them.
              </li>
              <li>
                <strong className="text-white">Damp wipe if needed.</strong> Lightly dampen the cloth with distilled water (or a drop of dish soap in water). Wring out excess so nothing drips onto the LEDs.
              </li>
              <li>
                <strong className="text-white">Dry with a second cloth.</strong> Wait 5 minutes before reconnecting power.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              What to avoid
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li><strong className="text-white">Ammonia-based cleaners</strong> (Windex etc.) — they cloud and craze acrylic.</li>
              <li><strong className="text-white">Isopropyl alcohol</strong> — causes stress fractures on acrylic.</li>
              <li><strong className="text-white">Abrasive sponges or scouring pads</strong> — will scratch permanently.</li>
              <li><strong className="text-white">Direct sunlight</strong> — UV yellows acrylic over months of exposure.</li>
              <li><strong className="text-white">Bathrooms or kitchens near steam</strong> — moisture can damage the LEDs.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Mounting and placement
            </h2>
            <p className="mb-3">
              LED edge-lit signs sit on an included base — no mounting required. Place on a flat, dry surface with at least 5 cm of clearance behind the base for cable routing.
            </p>
            <p>
              Lightbox signs can be wall-mounted using the adhesive strips on the back, or hung from a single picture hook. Weight is under 1 kg. For painted or wallpapered surfaces, test the adhesive on an inconspicuous spot first.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Storing your sign
            </h2>
            <p>
              If you&apos;re moving or storing the sign, wrap it in the original foam insert or a microfiber cloth. Store flat, away from heat sources, and keep the USB cable loosely coiled — never kink or wrap tightly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Troubleshooting
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-white font-medium">The sign flickers when first plugged in.</dt>
                <dd>Usually a low-current USB port. Use a 5V/2A wall adapter or the port on your phone charger.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">One colour is missing on the remote.</dt>
                <dd>Replace the CR2025 coin-cell battery in the remote. Check polarity.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">The sign stopped lighting up.</dt>
                <dd>Try a different USB cable and port first. If still dead after 48 hours, contact support within your warranty period.</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-1">Can I use glass cleaner on an acrylic anime sign?</h3>
                <p>No. Ammonia-based glass cleaners cloud and crack acrylic over time. Use distilled water or mild soap solution with a microfiber cloth.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How do I remove fingerprints?</h3>
                <p>Lightly dampen a microfiber cloth with distilled water, wipe in one direction, then dry with a second cloth. Avoid circular scrubbing.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Can I leave my LED sign on 24/7?</h3>
                <p>Yes. Dim to 30–50% to extend bulb life when using as a nightlight.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Is the sign waterproof?</h3>
                <p>No. Keep indoors and away from sinks, bathrooms, and open windows.</p>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-border-subtle">
            <h2 className="font-display text-lg text-white uppercase tracking-wider mb-3">Related</h2>
            <ul className="space-y-2">
              <li><Link href="/guides/led-sign-vs-lightbox" className="text-neon-cyan hover:underline">LED sign vs lightbox: which to buy →</Link></li>
              <li><Link href="/policies/returns" className="text-neon-cyan hover:underline">Returns policy →</Link></li>
              <li><Link href="/contact" className="text-neon-cyan hover:underline">Contact support →</Link></li>
            </ul>
          </section>
        </article>
      </ContentPageLayout>
    </>
  )
}
