import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { ContentPageLayout } from '@/components/content/ContentPageLayout'
import { getAllPolicySlugs, POLICY_SLUGS } from '@/data/policies'
import { getLocale } from '@/i18n/request'
import { getMessages } from '@/i18n/messages'
import { SITE_URL } from '@/lib/utils/siteUrl'
import type { Metadata } from 'next'

type PolicySlug = (typeof POLICY_SLUGS)[number]

interface PolicySection {
  heading: string
  content: string
}

interface PolicyData {
  title: string
  description: string
  lastUpdated: string
  sections: Record<string, PolicySection>
}

interface Props {
  params: Promise<{ slug: string }>
}

function getPolicyFromMessages(
  messages: ReturnType<typeof getMessages>,
  slug: string
): PolicyData | undefined {
  const policies = messages.policies as
    | Record<string, PolicyData>
    | undefined
  if (!policies) return undefined
  return policies[slug]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const locale = await getLocale()
  const messages = getMessages(locale)
  const policy = getPolicyFromMessages(messages, slug)

  if (!policy) {
    return {
      title: 'Policy Not Found',
    }
  }

  return {
    title: policy.title,
    description: policy.description,
    alternates: {
      canonical: `${SITE_URL}/policies/${slug}`,
    },
  }
}

export async function generateStaticParams() {
  const slugs = getAllPolicySlugs()
  return slugs.map((slug) => ({ slug }))
}

function renderContent(content: string) {
  const lines = content.split('\n')

  if (lines.length > 1) {
    return (
      <ul className="list-disc list-inside space-y-2 text-white/70">
        {lines.map((item, index) => (
          <li key={index} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    )
  }

  return <p className="text-white/70 leading-relaxed">{content}</p>
}

export default async function PolicyPage({ params }: Props) {
  const { slug } = await params

  if (!POLICY_SLUGS.includes(slug as PolicySlug)) {
    notFound()
  }

  const locale = await getLocale()
  const messages = getMessages(locale)
  const policy = getPolicyFromMessages(messages, slug)
  const tPolicies = await getTranslations('policyPage')

  if (!policy) {
    notFound()
  }

  const sections = Object.keys(policy.sections)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => policy.sections[key]!)

  const breadcrumbs = [
    { label: policy.title, href: `/policies/${slug}` },
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
        {tPolicies('lastUpdated', { date: new Date(policy.lastUpdated).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) })}
      </p>

      {/* Policy Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
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
          {tPolicies('questionsPrefix')}{' '}
          <Link href="/contact" className="text-neon-cyan hover:underline">
            {tPolicies('contactUs')}
          </Link>
          .
        </p>
      </div>
    </ContentPageLayout>
  )
}
