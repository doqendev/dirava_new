import { defineConfig, devices } from '@playwright/test'

/**
 * Production E2E config — hits live mizoke.com directly.
 * No local dev server, no Shopify preflight, no env deps.
 * Used for pre-launch smoke tests on the deployed site.
 */

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 4,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report-prod' }]],
  use: {
    baseURL: 'https://www.mizoke.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ignoreHTTPSErrors: false,
    // Force English locale — tests assert English UI strings.
    // Without this, geo-detection serves PT and tests fail on locale-dependent text.
    locale: 'en-US',
    extraHTTPHeaders: {
      'Accept-Language': 'en-US,en;q=0.9',
    },
    storageState: {
      cookies: [
        {
          name: 'mizoke-locale',
          value: 'en',
          domain: '.mizoke.com',
          path: '/',
          expires: -1,
          httpOnly: false,
          secure: true,
          sameSite: 'Lax',
        },
      ],
      origins: [],
    },
  },
  timeout: 30_000,
  expect: { timeout: 10_000 },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // No webServer — testing against production.
})
