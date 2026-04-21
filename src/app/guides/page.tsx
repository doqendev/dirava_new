import type { Metadata } from 'next'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { SITE_URL } from '@/lib/utils/siteUrl'

export const metadata: Metadata = {
  title: 'Anime Merch Guides — Buying, Customising & Caring for Anime Decor',
  description:
    'Practical guides to buying and customising anime merchandise: LED signs vs lightboxes, care guides for acrylic signs, and gift guides for anime fans.',
  alternates: {
    canonical: `${SITE_URL}/guides`,
  },
  openGraph: {
    title: 'Anime Merch Guides | Mizoke',
    description:
      'Guides for choosing, customising and caring for anime merchandise.',
    images: [`${SITE_URL}/opengraph-image`],
  },
}

const guides = [
  {
    slug: 'led-vs-desk-sign',
    title: 'Custom Anime Name Plates: LED vs Non-Illuminated Desk Signs',
    description:
      'Side-by-side comparison of Mizoke\'s two sign formats: illuminated LED signs and non-illuminated desk signs. Materials, production time, mounting, power, price, and which to pick.',
    readTime: '5 min read',
  },
  {
    slug: 'custom-anime-sign-care-guide',
    title: 'How to Clean and Care for a Custom Anime Sign (Acrylic & PLA)',
    description:
      'Step-by-step care guide for both acrylic LED signs and painted PLA desk signs. Cleaning, mounting, storage, and what to avoid.',
    readTime: '4 min read',
  },
  {
    slug: 'anime-gift-guide',
    title: 'The Best Custom Anime Gifts for Fans in 2026',
    description:
      'Gift ideas for anime fans by price and series. Custom LED signs, desk signs, keychains, magnets, apparel — and how to personalise them.',
    readTime: '6 min read',
  },
]

export default function GuidesIndexPage() {
  const breadcrumbs = [{ label: 'Guides', href: '/guides' }]

  const collectionSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Anime Merch Guides',
    url: `${SITE_URL}/guides`,
    description:
      'Practical guides to buying and customising anime merchandise: LED signs vs lightboxes, care guides for acrylic signs, and gift guides for anime fans.',
    hasPart: guides.map((g) => ({
      '@type': 'Article',
      headline: g.title,
      url: `${SITE_URL}/guides/${g.slug}`,
      description: g.description,
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/guides` },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <ContentPageLayout
        title="Guides"
        description="Practical guides to buying, customising and caring for anime merchandise."
        breadcrumbs={breadcrumbs}
        glowColor="cyan"
      >
        <ul className="space-y-6">
          {guides.map((guide) => (
            <li
              key={guide.slug}
              className="border border-border-subtle rounded-lg p-6 hover:border-[color:var(--accent,#00f5ff)]/50 transition-colors"
            >
              <Link href={`/guides/${guide.slug}`} className="block group">
                <h2 className="font-display text-xl md:text-2xl text-white mb-2 group-hover:text-[color:var(--accent,#00f5ff)] transition-colors">
                  {guide.title}
                </h2>
                <p className="text-white/60 mb-2">{guide.description}</p>
                <p className="text-xs text-white/40 uppercase tracking-wider">
                  {guide.readTime}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </ContentPageLayout>
    </>
  )
}
