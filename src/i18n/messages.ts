import type { Locale } from './config'

// Import all message files statically
import en from './messages/en.json'
import de from './messages/de.json'
import fr from './messages/fr.json'
import es from './messages/es.json'
import pt from './messages/pt.json'

const messages: Record<Locale, typeof en> = {
  en,
  de,
  fr,
  es,
  pt,
}

export function getMessages(locale: Locale) {
  return messages[locale] || messages.en
}

export type Messages = typeof en
