export const POLICY_SLUGS = [
  'privacy',
  'terms',
  'shipping',
  'returns',
  'accessibility',
  'imprint',
] as const

export type PolicySlug = (typeof POLICY_SLUGS)[number]

export function getAllPolicySlugs(): string[] {
  return [...POLICY_SLUGS]
}
