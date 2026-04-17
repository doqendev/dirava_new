import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { SITE_URL } from '@/lib/utils/siteUrl'

const URL_PATH = '/guides/custom-anime-sign-care-guide'
const TITLE = 'How to Clean and Care for a Custom Anime Sign (Acrylic & PLA)'
const DESCRIPTION =
  'A step-by-step care guide for custom anime signs — LED and non-illuminated. How to clean acrylic and PLA signs, mount them, store them, and what to avoid.'
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
  name: 'How to clean a custom anime sign (acrylic or PLA)',
  description:
    'Safely clean a custom anime sign — acrylic or PLA, LED or non-illuminated — without scratching it or damaging the LEDs or paint.',
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
      name: 'Unplug LED signs',
      text: 'If the sign is an LED sign, flip the in-line switch off and unplug the USB cable. Let the sign cool for 2–3 minutes if it was on.',
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Dry dust first',
      text: 'Use a dry microfiber cloth to wipe off loose dust with gentle circular motions. Never use paper towels — they can scratch acrylic and dull painted PLA.',
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
      text: 'Dry with a second microfiber cloth. Wait 5 minutes before reconnecting power on LED signs.',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Can I use glass cleaner on an acrylic or PLA sign?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Ammonia-based glass cleaners (like Windex) cloud and crack acrylic over time and can strip paint on PLA. Use distilled water or a mild soap solution with a microfiber cloth.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I remove fingerprints from an acrylic sign?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Lightly dampen a microfiber cloth with distilled water, wipe in one direction, then dry with a second microfiber cloth. Avoid circular scrubbing — it can leave swirl marks on the acrylic surface.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I leave my LED sign on 24/7?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Mizoke LED signs are low-wattage USB-powered and rated for continuous use. Flip the in-line switch off when not in use to save energy and extend LED life.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the sign waterproof?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Neither acrylic nor PLA signs are waterproof. Keep them indoors and away from sinks, bathrooms, humidifiers, and open windows. Painted PLA can also fade if repeatedly exposed to moisture.',
      },
    },
    {
      '@type': 'Question',
      name: 'What warranty applies if my sign arrives broken or stops working?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Mizoke replaces any item that arrives broken or develops a defect, free of charge. Contact support at support@mizoke.com with photos of the issue.',
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
        description="Cleaning, mounting, and daily care for custom acrylic and PLA signs."
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
              <li><strong className="text-white">Do</strong> flip the in-line switch off and unplug LED signs before cleaning.</li>
              <li><strong className="text-white">Don&apos;t</strong> spray liquid directly on the sign.</li>
              <li><strong className="text-white">Don&apos;t</strong> place near water, steam, or direct sunlight.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Cleaning your sign
            </h2>
            <p className="mb-3 text-white/60">
              These steps apply to both acrylic LED signs and painted or
              UV-printed PLA desk signs. The only extra step for LED signs is
              switching off power first.
            </p>
            <ol className="list-decimal list-outside ml-6 space-y-3">
              <li>
                <strong className="text-white">For LED signs, unplug first.</strong>{' '}
                Flip the in-line switch off, disconnect the USB cable, and let
                the sign cool for 2–3 minutes if it was on.
              </li>
              <li>
                <strong className="text-white">Dry dust first.</strong> Use a
                dry microfiber cloth to wipe off loose dust with gentle
                circular motions. Paper towels leave micro-scratches on acrylic
                and can dull painted PLA — avoid them.
              </li>
              <li>
                <strong className="text-white">Damp wipe if needed.</strong>{' '}
                Lightly dampen the cloth with distilled water (or a drop of dish
                soap in water). Wring out excess so nothing drips onto the LEDs
                or through seams.
              </li>
              <li>
                <strong className="text-white">Dry with a second cloth.</strong>{' '}
                For LED signs, wait 5 minutes before plugging back in.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              What to avoid
            </h2>
            <ul className="list-disc list-outside ml-6 space-y-2">
              <li><strong className="text-white">Ammonia-based cleaners</strong> (Windex etc.) — they cloud and craze acrylic and can strip paint on PLA.</li>
              <li><strong className="text-white">Isopropyl alcohol</strong> — causes stress fractures on acrylic and dulls painted finishes.</li>
              <li><strong className="text-white">Abrasive sponges or scouring pads</strong> — scratch permanently.</li>
              <li><strong className="text-white">Direct sunlight</strong> — UV yellows acrylic and fades painted PLA over months of exposure.</li>
              <li><strong className="text-white">Bathrooms, kitchens, or humid rooms</strong> — moisture can damage LEDs and degrade paint.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Mounting and placement
            </h2>
            <p className="mb-3">
              All Mizoke signs — LED and non-illuminated — stand on their own.
              Place on a flat, dry surface with at least 5 cm of clearance
              behind the base for cable routing (LED signs only).
            </p>
            <p>
              If you want to wall-mount, signs are light enough for
              double-sided mounting tape or a Command strip. Mounting tape is{' '}
              <strong className="text-white">not included</strong> with any
              product. For painted or wallpapered surfaces, test the adhesive
              on an inconspicuous spot first.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Storing your sign
            </h2>
            <p>
              If you&apos;re moving or storing the sign, wrap it in the
              original foam insert or a microfiber cloth. Store flat, away from
              heat sources, and keep the USB cable loosely coiled — never kink
              or wrap tightly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Troubleshooting LED signs
            </h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-white font-medium">The sign flickers when first plugged in.</dt>
                <dd>Usually a low-current USB port. Try a 5V/1A or higher wall adapter, or the port on a phone charger.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">The sign won&apos;t turn on at all.</dt>
                <dd>Check the in-line switch position first. Then try a different USB cable and a different USB port. If still dead, contact support — we replace defective items free of charge.</dd>
              </div>
              <div>
                <dt className="text-white font-medium">Paint on a PLA sign starts to lift after wet-cleaning.</dt>
                <dd>Stop wet-cleaning and dry-dust only from that point on. Contact support if the damage was present from day one.</dd>
              </div>
            </dl>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Warranty and replacements
            </h2>
            <p>
              Mizoke replaces any item that arrives broken or develops a
              defect, free of charge. Email{' '}
              <a href="mailto:support@mizoke.com" className="text-neon-cyan hover:underline">
                support@mizoke.com
              </a>{' '}
              with your order number and photos of the issue and we&apos;ll send
              a replacement. Non-custom items also carry a 30-day return window
              — see the{' '}
              <Link href="/policies/returns" className="text-neon-cyan hover:underline">
                returns policy
              </Link>{' '}
              for details.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl md:text-2xl text-white uppercase tracking-wider mb-3">
              Frequently asked questions
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-white font-medium mb-1">Can I use glass cleaner on an acrylic or PLA sign?</h3>
                <p>No. Ammonia-based glass cleaners cloud and crack acrylic and can strip paint on PLA. Use distilled water or mild soap solution with a microfiber cloth.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">How do I remove fingerprints?</h3>
                <p>Lightly dampen a microfiber cloth with distilled water, wipe in one direction, then dry with a second cloth. Avoid circular scrubbing.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Can I leave my LED sign on 24/7?</h3>
                <p>Yes — flip the in-line switch off when not in use to extend LED life.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">Is the sign waterproof?</h3>
                <p>No. Keep indoors and away from sinks, bathrooms, and humid rooms.</p>
              </div>
              <div>
                <h3 className="text-white font-medium mb-1">What if my sign arrives broken?</h3>
                <p>Mizoke replaces broken or defective items free of charge. Email support@mizoke.com with photos.</p>
              </div>
            </div>
          </section>

          <section className="pt-6 border-t border-border-subtle">
            <h2 className="font-display text-lg text-white uppercase tracking-wider mb-3">Related</h2>
            <ul className="space-y-2">
              <li><Link href="/guides/led-vs-desk-sign" className="text-neon-cyan hover:underline">LED vs desk sign: which to buy →</Link></li>
              <li><Link href="/policies/returns" className="text-neon-cyan hover:underline">Returns policy →</Link></li>
              <li><Link href="/contact" className="text-neon-cyan hover:underline">Contact support →</Link></li>
            </ul>
          </section>
        </article>
      </ContentPageLayout>
    </>
  )
}
