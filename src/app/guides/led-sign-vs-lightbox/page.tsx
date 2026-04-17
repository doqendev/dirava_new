import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { SITE_URL } from '@/lib/utils/siteUrl'

const URL_PATH = '/guides/led-sign-vs-lightbox'
const TITLE = 'LED Sign vs Lightbox: Which Anime Sign Should You Buy?'
const DESCRIPTION =
  'Side-by-side comparison of LED acrylic edge-lit signs and back-lit lightbox signs for anime décor. Light output, mounting, power, price, and which to choose for your room.'
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
  author: {
    '@type': 'Organization',
    name: 'Mizoke',
    url: SITE_URL,
  },
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
      name: 'Which is brighter — an LED edge-lit sign or a lightbox sign?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lightbox signs are brighter overall because they back-light the entire acrylic panel, producing even, room-filling illumination. LED edge-lit signs glow from the etched edges of the acrylic and look sharper close up but illuminate a smaller area.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can LED signs and lightboxes be used as a nightlight?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Both support dimming via the included remote. Lightboxes produce more even diffuse light suitable for a nightlight; edge-lit LED signs work better as an accent light on a shelf or desk.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are these signs USB-powered?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Mizoke LED signs and lightboxes ship with a USB-C power cable. Any standard 5V USB wall adapter, USB hub, or power bank will work.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I wall-mount them?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'LED edge-lit signs are designed to sit on a base and are not intended for wall-mounting. Lightbox signs can be wall-mounted using included adhesive strips or a picture hook on the back.',
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
    { label: 'LED Sign vs Lightbox', href: URL_PATH },
  ]

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <ContentPageLayout
        title={TITLE}
        description="A practical comparison of the two most popular types of illuminated anime signs, updated April 2026."
        breadcrumbs={breadcrumbs}
        glowColor="cyan"
      >
        <article className="space-y-8 text-white/75 leading-relaxed">
          <p className="text-white/60 text-sm">
            Last updated: April 17, 2026 · 6 min read
          </p>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Short answer
            </h2>
            <p>
              <strong className="text-white">Choose a lightbox sign</strong> if
              you want a bright, even glow that can light a room or act as a
              nightlight — it back-lights the full acrylic panel.{' '}
              <strong className="text-white">Choose an LED edge-lit sign</strong>{' '}
              if you want sharper, neon-style line art on a shelf or desk and
              don&apos;t need room-filling brightness.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              What is an LED edge-lit sign?
            </h2>
            <p>
              An LED edge-lit sign is a clear acrylic panel with etched artwork.
              LEDs are embedded in the base and shine light into the edge of the
              acrylic. The etched lines scatter that light, so the design glows
              against a transparent background. Popular for anime name signs and
              character silhouettes.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              What is a lightbox sign?
            </h2>
            <p>
              A lightbox sign is a shallow, frame-shaped enclosure with LEDs
              behind a printed or translucent acrylic panel. The entire surface
              is lit from behind, giving an even, poster-like glow. Common for
              anime logos, full-colour character art, and room décor pieces.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Head-to-head comparison
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border-subtle text-left">
                    <th className="py-3 pr-4 font-display text-white uppercase tracking-wider">Factor</th>
                    <th className="py-3 pr-4 font-display text-white uppercase tracking-wider">LED edge-lit sign</th>
                    <th className="py-3 font-display text-white uppercase tracking-wider">Lightbox sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Overall brightness</td>
                    <td className="py-3 pr-4">Moderate — glows along etched lines</td>
                    <td className="py-3">Bright — full back-lit panel</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Art style</td>
                    <td className="py-3 pr-4">Line art, silhouettes, names</td>
                    <td className="py-3">Full-colour art, logos, character scenes</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Typical size</td>
                    <td className="py-3 pr-4">15–25 cm tall, desk-sized</td>
                    <td className="py-3">20–40 cm, wall or shelf</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Mounting</td>
                    <td className="py-3 pr-4">Free-standing base</td>
                    <td className="py-3">Wall-mount or stand</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Power</td>
                    <td className="py-3 pr-4">USB-C, 5V</td>
                    <td className="py-3">USB-C, 5V</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Colour options</td>
                    <td className="py-3 pr-4">16 colours + modes via remote</td>
                    <td className="py-3">16 colours + modes via remote</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Works as nightlight</td>
                    <td className="py-3 pr-4">Accent only</td>
                    <td className="py-3">Yes, dimmable</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Starts at</td>
                    <td className="py-3 pr-4">€24.90</td>
                    <td className="py-3">€39.90</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              When to pick an LED edge-lit sign
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li>You want a <strong className="text-white">custom name</strong> on the sign in anime-styled lettering.</li>
              <li>The sign will sit on a <strong className="text-white">desk or shelf</strong>, not be wall-mounted.</li>
              <li>You prefer a <strong className="text-white">minimalist, neon-line look</strong>.</li>
              <li>You&apos;re buying <strong className="text-white">under €30</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              When to pick a lightbox sign
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li>You want a <strong className="text-white">room-filling glow</strong> or nightlight.</li>
              <li>You prefer <strong className="text-white">full-colour character art</strong> over line work.</li>
              <li>You plan to <strong className="text-white">wall-mount</strong> the sign.</li>
              <li>You&apos;re buying as a <strong className="text-white">gift or centerpiece</strong>.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-1">Which is brighter — an LED edge-lit sign or a lightbox sign?</h3>
                <p>Lightbox signs are brighter overall because they back-light the entire acrylic panel. LED edge-lit signs glow from the etched edges and illuminate a smaller area.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Can LED signs and lightboxes be used as a nightlight?</h3>
                <p>Yes. Both support dimming via the included remote. Lightboxes produce more even diffuse light suitable for a nightlight.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Are these signs USB-powered?</h3>
                <p>Yes. Both ship with a USB-C cable and work with any standard 5V USB wall adapter or power bank.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Can I wall-mount them?</h3>
                <p>LED edge-lit signs sit on a base and aren&apos;t intended for wall-mounting. Lightbox signs can be wall-mounted.</p>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-border-subtle">
            <h2 className="font-display text-lg text-white uppercase tracking-wider mb-3">
              Related
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href="/shop/name-signs" className="text-neon-cyan hover:underline">
                  Browse custom LED name signs →
                </Link>
              </li>
              <li>
                <Link href="/worlds" className="text-neon-cyan hover:underline">
                  Shop by anime world →
                </Link>
              </li>
              <li>
                <Link href="/guides/custom-anime-sign-care-guide" className="text-neon-cyan hover:underline">
                  How to clean and care for an acrylic sign →
                </Link>
              </li>
            </ul>
          </section>
        </article>
      </ContentPageLayout>
    </>
  )
}
