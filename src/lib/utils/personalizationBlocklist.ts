/**
 * Personalization input blocklist. Used by the PersonalizeCard to
 * prevent customers from putting slurs / offensive content on a
 * physical product we'll have to manufacture and ship.
 *
 * Substring match on a normalized (lowercased, non-letters stripped)
 * version of the input — catches obvious leet-speak / spacing tricks
 * like "n_word" or "n.i.g". The list is intentionally short; the goal
 * isn't a perfect filter, it's a reasonable speed-bump backed by a
 * human review at fulfilment.
 */
const BLOCKED_TERMS: readonly string[] = [
  // Racial / ethnic slurs
  'nigger',
  'nigga',
  'chink',
  'spic',
  'kike',
  'gook',
  'wetback',
  'beaner',
  'paki',
  // Anti-LGBTQ slurs
  'faggot',
  'tranny',
  'dyke',
  // Misc hate / extremist
  'hitler',
  'nazi',
  'kkk',
  // Generic profanity that doesn't belong on a custom sign
  'cunt',
  'whore',
  'rapist',
  'pedo',
]

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]/g, '')
}

export function isBlockedName(input: string): boolean {
  if (!input.trim()) return false
  const normalized = normalize(input)
  if (!normalized) return false
  return BLOCKED_TERMS.some((term) => normalized.includes(term))
}
