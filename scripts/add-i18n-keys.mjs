// One-shot helper to add Phase 3 i18n keys to every locale file.
// Run once: node scripts/add-i18n-keys.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const locales = ['en', 'de', 'fr', 'es', 'pt']

// keys[ns][key][locale] = string
const keys = {
  cart: {
    shoppingCart: {
      en: 'Shopping cart',
      de: 'Einkaufswagen',
      fr: 'Panier',
      es: 'Carrito de compras',
      pt: 'Carrinho de compras',
    },
  },
  header: {
    openMenu: {
      en: 'Open menu',
      de: 'Menü öffnen',
      fr: 'Ouvrir le menu',
      es: 'Abrir menú',
      pt: 'Abrir menu',
    },
    closeMenu: {
      en: 'Close menu',
      de: 'Menü schließen',
      fr: 'Fermer le menu',
      es: 'Cerrar menú',
      pt: 'Fechar menu',
    },
    mobileNavigation: {
      en: 'Mobile navigation',
      de: 'Mobile Navigation',
      fr: 'Navigation mobile',
      es: 'Navegación móvil',
      pt: 'Navegação móvel',
    },
    mainNavigation: {
      en: 'Main navigation',
      de: 'Hauptnavigation',
      fr: 'Navigation principale',
      es: 'Navegación principal',
      pt: 'Navegação principal',
    },
    changeLanguage: {
      en: 'Change language and country',
      de: 'Sprache und Land ändern',
      fr: 'Changer la langue et le pays',
      es: 'Cambiar idioma y país',
      pt: 'Alterar idioma e país',
    },
  },
  footer: {
    siteFooter: {
      en: 'Site footer',
      de: 'Website-Fußzeile',
      fr: 'Pied de page du site',
      es: 'Pie de página del sitio',
      pt: 'Rodapé do site',
    },
  },
  common: {
    closeModal: {
      en: 'Close modal',
      de: 'Modal schließen',
      fr: 'Fermer la fenêtre',
      es: 'Cerrar ventana',
      pt: 'Fechar janela',
    },
    dismiss: {
      en: 'Dismiss',
      de: 'Schließen',
      fr: 'Fermer',
      es: 'Descartar',
      pt: 'Dispensar',
    },
    notifications: {
      en: 'Notifications',
      de: 'Benachrichtigungen',
      fr: 'Notifications',
      es: 'Notificaciones',
      pt: 'Notificações',
    },
    scrollLeft: {
      en: 'Scroll left',
      de: 'Nach links scrollen',
      fr: 'Défiler à gauche',
      es: 'Desplazar a la izquierda',
      pt: 'Deslocar para a esquerda',
    },
    scrollRight: {
      en: 'Scroll right',
      de: 'Nach rechts scrollen',
      fr: 'Défiler à droite',
      es: 'Desplazar a la derecha',
      pt: 'Deslocar para a direita',
    },
  },
  collection: {
    loadingMore: {
      en: 'Loading more...',
      de: 'Lade mehr…',
      fr: 'Chargement…',
      es: 'Cargando más…',
      pt: 'A carregar mais…',
    },
  },
  wishlist: {
    loadingProductDetails: {
      en: 'Loading product details...',
      de: 'Lade Produktdetails…',
      fr: 'Chargement des détails du produit…',
      es: 'Cargando detalles del producto…',
      pt: 'A carregar detalhes do produto…',
    },
    enterNameForPersonalization: {
      en: 'Enter name for personalization',
      de: 'Name für Personalisierung eingeben',
      fr: 'Entrer un nom pour la personnalisation',
      es: 'Ingresa el nombre para la personalización',
      pt: 'Insere o nome para personalização',
    },
  },
}

for (const locale of locales) {
  const path = join(root, 'src/i18n/messages', `${locale}.json`)
  const json = JSON.parse(readFileSync(path, 'utf8'))
  let touched = 0
  for (const ns of Object.keys(keys)) {
    if (!json[ns]) {
      console.warn(`[${locale}] namespace "${ns}" missing — skipping its keys`)
      continue
    }
    for (const key of Object.keys(keys[ns])) {
      if (json[ns][key] !== undefined) {
        // Already present — leave existing value alone.
        continue
      }
      const val = keys[ns][key][locale]
      if (val === undefined) {
        console.warn(`[${locale}] no value for ${ns}.${key} — skipping`)
        continue
      }
      json[ns][key] = val
      touched++
    }
  }
  // Re-serialise with two-space indentation + trailing newline to match
  // the existing files. Insertion order: keys we just appended land at
  // the END of their namespace, which is fine for next-intl resolution.
  writeFileSync(path, JSON.stringify(json, null, 2) + '\n', 'utf8')
  console.log(`[${locale}] added ${touched} keys`)
}
