const BOT_USER_AGENT_PATTERN =
  /bot|crawler|spider|crawling|googlebot|bingbot|duckduckbot|baiduspider|yandexbot|slurp|facebookexternalhit|twitterbot|linkedinbot|pinterestbot|whatsapp|telegrambot|gptbot|chatgpt-user|oai-searchbot|perplexitybot|claudebot|anthropic-ai|claude-web|applebot/i

export function isCrawlerUserAgent(userAgent: string | null | undefined): boolean {
  return !!userAgent && BOT_USER_AGENT_PATTERN.test(userAgent)
}
