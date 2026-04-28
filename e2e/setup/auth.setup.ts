import { test as setup, expect } from '@playwright/test'
import path from 'node:path'

/**
 * One-shot setup that lands on the homepage, plants a "consent already
 * given" record into localStorage under the key the cookieConsentStore
 * persists to ('mizoke-cookie-consent'), and saves the resulting
 * storage state to disk. Every other test project loads that storage
 * state, so the cookie banner never appears in tests that aren't
 * specifically about it.
 *
 * Without this, the bottom-of-screen consent banner fixed-positions
 * over the mobile sticky CTA / cart drawer / search modal and
 * intercepts pointer events for ~20 of our specs.
 */

const storageStatePath = path.resolve(__dirname, '../.playwright-state.json')

setup('seed cookie consent', async ({ page }) => {
  await page.goto('/')

  // Match the exact shape Zustand's `persist` middleware writes for
  // `mizoke-cookie-consent`. Mirrors the rejectAll() action — necessary
  // cookies only, analytics + marketing off — so we don't accidentally
  // enable tracking pixels in CI.
  const consentRecord = {
    state: {
      consentGiven: true,
      preferences: {
        necessary: true,
        analytics: false,
        marketing: false,
      },
      consentDate: new Date().toISOString(),
    },
    version: 0,
  }

  await page.evaluate((record) => {
    window.localStorage.setItem('mizoke-cookie-consent', JSON.stringify(record))
  }, consentRecord)

  // Sanity check — reload and confirm the banner doesn't show.
  await page.reload()
  await expect(
    page.getByRole('button', { name: /accept all/i })
  ).toHaveCount(0)

  await page.context().storageState({ path: storageStatePath })
})
