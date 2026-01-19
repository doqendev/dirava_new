import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { getPolicyBySlug, getAllPolicySlugs } from '@/data/policies'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const policy = getPolicyBySlug(slug)

  if (!policy) {
    return {
      title: 'Policy Not Found',
    }
  }

  return {
    title: policy.title,
    description: policy.description,
  }
}

export async function generateStaticParams() {
  const slugs = getAllPolicySlugs()
  return slugs.map((slug) => ({ slug }))
}

function renderContent(content: string | string[]) {
  if (typeof content === 'string') {
    return <p className="text-white/70 leading-relaxed">{content}</p>
  }

  return (
    <ul className="list-disc list-inside space-y-2 text-white/70">
      {content.map((item, index) => (
        <li key={index} className="leading-relaxed">
          {item}
        </li>
      ))}
    </ul>
  )
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params
  const policy = getPolicyBySlug(slug)

  if (!policy) {
    notFound()
  }

  const breadcrumbs = [
    { label: policy.title, href: `/policies/${policy.slug}` },
  ]

  return (
    <ContentPageLayout
      title={policy.title}
      description={policy.description}
      breadcrumbs={breadcrumbs}
      glowColor="cyan"
    >
      {/* Last Updated */}
      <p className="text-white/40 text-sm mb-8">
        Last updated: {new Date(policy.lastUpdated).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </p>

      {/* Policy Sections */}
      <div className="space-y-8">
        {policy.sections.map((section, index) => (
          <section key={index}>
            <h2 className="font-display text-xl font-semibold text-white mb-4">
              {section.heading}
            </h2>
            {renderContent(section.content)}
          </section>
        ))}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-12 pt-8 border-t border-border-subtle">
        <p className="text-white/50 text-sm">
          If you have questions about this policy, please{' '}
          <Link href="/contact" className="text-neon-cyan hover:underline">
            contact us
          </Link>
          .
        </p>
      </div>
    </ContentPageLayout>
  )
}
