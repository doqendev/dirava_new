import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { SITE_URL } from '@/lib/utils/siteUrl'

const URL_PATH = '/guides/led-vs-desk-sign'
const TITLE = 'Custom Anime Name Plates: LED vs Non-Illuminated Desk Signs'
const DESCRIPTION =
  'Head-to-head comparison of Mizoke\'s two sign formats: illuminated LED signs and non-illuminated desk signs. Materials, production time, mounting, power, price, and which to pick.'
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
      name: 'What is the difference between a custom LED sign and a desk sign?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A custom LED sign is illuminated — it has LEDs inside an acrylic or PLA body powered by a USB cable with an in-line switch. A desk sign uses the same materials and finishes but has no lighting; it\'s a painted or UV-printed character and name piece for a desk or shelf.',
      },
    },
    {
      '@type': 'Question',
      name: 'Are LED signs and desk signs made from the same materials?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Both are made from acrylic or PLA depending on the product. LED signs use an edge-lit acrylic panel or a lit PLA body; desk signs use painted PLA or UV-printed PLA without any lighting components.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I personalise a desk sign with a name like the LED signs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Desk signs accept the same 12-character custom name as LED signs, in the anime-themed display font.',
      },
    },
    {
      '@type': 'Question',
      name: 'Do desk signs ship faster than LED signs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Both are made to order in 1–3 business days. Desk signs occasionally ship slightly faster because there are no electronics to assemble, but in practice the production window is the same.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I wall-mount either type?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'All Mizoke signs stand on their own, so wall-mounting is optional. Both formats are light enough to mount with double-sided mounting tape, which is not included.',
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
    { label: 'LED vs desk sign', href: URL_PATH },
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
        description="A practical comparison of Mizoke's two sign formats, updated April 2026."
        breadcrumbs={breadcrumbs}
        glowColor="cyan"
      >
        <article className="space-y-8 text-white/75 leading-relaxed">
          <p className="text-white/60 text-sm">
            Last updated: April 17, 2026 · 5 min read
          </p>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Short answer
            </h2>
            <p>
              <strong className="text-white">Pick a custom LED sign</strong> if
              you want the character + name to glow on a desk or shelf, and
              you&apos;re happy with a USB cable running to it.{' '}
              <strong className="text-white">Pick a desk sign</strong> if you
              want a painted character piece without cables — cleaner on a
              bookshelf and a few euros cheaper.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              What is a custom LED sign?
            </h2>
            <p>
              A custom LED sign is an illuminated sign with a character motif
              and your personalised name. The body is acrylic or PLA; LEDs
              inside glow through the design when powered. All Mizoke LED signs
              include a USB-A cable with an in-line on/off switch, so you can
              plug into any USB-A port (wall adapter, power bank, computer,
              monitor hub). There is no remote and no colour-changing — each
              sign has a single fixed LED colour matched to the design.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              What is a desk sign?
            </h2>
            <p>
              A desk sign is the same kind of character-and-name sign without
              any lighting. It&apos;s typically a painted PLA or UV-printed PLA
              piece designed to sit on a desk, shelf, or wall. No cables, no
              power. Lighter to pack, easier to place, usually a bit cheaper
              than the LED version.
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
                    <th className="py-3 pr-4 font-display text-white uppercase tracking-wider">Custom LED sign</th>
                    <th className="py-3 font-display text-white uppercase tracking-wider">Desk sign</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle">
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Illuminated</td>
                    <td className="py-3 pr-4">Yes — fixed colour LED</td>
                    <td className="py-3">No</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Material</td>
                    <td className="py-3 pr-4">Acrylic or PLA</td>
                    <td className="py-3">Painted PLA or UV-printed PLA</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Power</td>
                    <td className="py-3 pr-4">USB-A cable with in-line switch</td>
                    <td className="py-3">None</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Remote / colour changing</td>
                    <td className="py-3 pr-4">No</td>
                    <td className="py-3">N/A</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Custom name</td>
                    <td className="py-3 pr-4">Up to 12 characters</td>
                    <td className="py-3">Up to 12 characters</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Mounting</td>
                    <td className="py-3 pr-4">Stands on its own · mounting tape (not included)</td>
                    <td className="py-3">Stands on its own · mounting tape (not included)</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Production time</td>
                    <td className="py-3 pr-4">1–3 business days</td>
                    <td className="py-3">1–3 business days</td>
                  </tr>
                  <tr>
                    <td className="py-3 pr-4 text-white font-medium">Starting price</td>
                    <td className="py-3 pr-4">€35–€50</td>
                    <td className="py-3">Lower than the equivalent LED sign</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              When to pick a custom LED sign
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li>You want the character and name to <strong className="text-white">glow</strong> on a desk or shelf, especially in low light.</li>
              <li>You have a USB-A port nearby (wall adapter, power strip, monitor hub, etc.).</li>
              <li>You want a <strong className="text-white">centerpiece for a gaming or streaming setup</strong>.</li>
              <li>You&apos;re buying it as a gift and want maximum visual impact.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              When to pick a desk sign
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li>You want <strong className="text-white">no cables</strong> — clean on a bookshelf or mantle.</li>
              <li>You prefer a <strong className="text-white">painted, solid-colour look</strong> to a lit one.</li>
              <li>You&apos;re buying a <strong className="text-white">lighter, cheaper gift</strong>.</li>
              <li>The piece will live somewhere with no accessible power outlet.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-1">What is the difference between a custom LED sign and a desk sign?</h3>
                <p>LED signs are illuminated (USB-A cable + in-line switch); desk signs are painted or UV-printed character pieces with no lighting and no cables.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Are they made from the same materials?</h3>
                <p>Both use acrylic or PLA depending on the product. Desk signs use painted or UV-printed PLA.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Can I personalise a desk sign with a name?</h3>
                <p>Yes — same 12-character custom name option as LED signs.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Do desk signs ship faster?</h3>
                <p>Both are 1–3 business days. In practice the window is the same.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Can I wall-mount either?</h3>
                <p>Yes, both are light enough for double-sided mounting tape. Tape is not included.</p>
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
                  Browse custom signs →
                </Link>
              </li>
              <li>
                <Link href="/worlds" className="text-neon-cyan hover:underline">
                  Shop by anime world →
                </Link>
              </li>
              <li>
                <Link href="/guides/custom-anime-sign-care-guide" className="text-neon-cyan hover:underline">
                  How to clean and care for an acrylic or PLA sign →
                </Link>
              </li>
            </ul>
          </section>
        </article>
      </ContentPageLayout>
    </>
  )
}
