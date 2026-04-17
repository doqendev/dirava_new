import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/utils/siteUrl'

// Public content is open to all crawlers, including AI search engines, so
// Mizoke can be cited as a source in AI-generated answers (ChatGPT, Perplexity,
// Google AI Overviews, Gemini, Copilot, Claude).
// Private/account/admin paths remain disallowed for everyone.
const AI_SEARCH_CRAWLERS = [
  'GPTBot',        // OpenAI — ChatGPT web browsing + training
  'ChatGPT-User',  // OpenAI — ChatGPT on-demand fetches
  'OAI-SearchBot', // OpenAI — SearchGPT
  'PerplexityBot', // Perplexity
  'Perplexity-User',
  'ClaudeBot',     // Anthropic — Claude training + search
  'anthropic-ai',
  'Claude-Web',
  'Google-Extended', // Google Gemini + AI Overviews training opt-in
  'Applebot-Extended',
  'Bingbot',        // Microsoft — Bing + Copilot
  'DuckAssistBot',
]

export default function robots(): MetadataRoute.Robots {
  const privateDisallow = ['/api/', '/admin/', '/account/', '/search']

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: privateDisallow,
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: privateDisallow,
      },
      ...AI_SEARCH_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: privateDisallow,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
