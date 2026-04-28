// Bulk i18n key insertion helper. Run with: node scripts/add-i18n-keys.mjs
// Edit `keys` below to extend; existing keys are never overwritten so it's
// safe to re-run.
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = process.cwd()
const locales = ['en', 'de', 'fr', 'es', 'pt']

const keys = {
  account: {
    wishlistDescription: {
      en: "Items you've saved for later",
      de: 'Artikel, die du gespeichert hast',
      fr: 'Articles que vous avez enregistrés',
      es: 'Artículos que has guardado',
      pt: 'Artigos que guardaste',
    },
    profileInformation: {
      en: 'Profile Information',
      de: 'Profilinformationen',
      fr: 'Informations du profil',
      es: 'Información del perfil',
      pt: 'Informações do perfil',
    },
    emailPreferences: {
      en: 'Email Preferences',
      de: 'E-Mail-Einstellungen',
      fr: 'Préférences e-mail',
      es: 'Preferencias de correo',
      pt: 'Preferências de e-mail',
    },
    profileUpdated: {
      en: 'Profile updated successfully',
      de: 'Profil erfolgreich aktualisiert',
      fr: 'Profil mis à jour avec succès',
      es: 'Perfil actualizado correctamente',
      pt: 'Perfil atualizado com sucesso',
    },
    marketingEmails: {
      en: 'Marketing emails',
      de: 'Marketing-E-Mails',
      fr: 'E-mails marketing',
      es: 'Correos de marketing',
      pt: 'E-mails de marketing',
    },
    noAddressesYet: {
      en: 'No Addresses Yet',
      de: 'Noch keine Adressen',
      fr: 'Pas encore d’adresses',
      es: 'Aún no hay direcciones',
      pt: 'Ainda sem endereços',
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
      if (json[ns][key] !== undefined) continue
      const val = keys[ns][key][locale]
      if (val === undefined) {
        console.warn(`[${locale}] no value for ${ns}.${key} — skipping`)
        continue
      }
      json[ns][key] = val
      touched++
    }
  }
  writeFileSync(path, JSON.stringify(json, null, 2) + '\n', 'utf8')
  console.log(`[${locale}] added ${touched} keys`)
}
