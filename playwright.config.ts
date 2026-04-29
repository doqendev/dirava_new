import { defineConfig, devices } from '@playwright/test'
import path from 'node:path'

const storageStatePath = path.resolve(__dirname, 'e2e/.playwright-state.json')

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: 'html',
  use: {
    baseURL: 'http://127.0.0.1:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Runs once before everything else; seeds localStorage so the
    // cookie-consent banner never appears in regular specs (it would
    // otherwise sit fixed at the bottom of the viewport and intercept
    // pointer events on the mobile sticky CTA, search modal results,
    // and product cards in scroll-based interactions).
    {
      name: 'setup',
      testMatch: /setup[\\/].*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: storageStatePath,
      },
      dependencies: ['setup'],
      testIgnore: [/setup[\\/]/, /cookie-consent\.spec\.ts/],
    },
    // Cookie-consent spec needs the fresh-visit experience, so it gets
    // its own project with no storageState.
    {
      name: 'chromium-no-consent',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /cookie-consent\.spec\.ts/,
    },
  ],
  webServer: {
    command: 'pnpm exec next dev -p 3001 -H 127.0.0.1',
    url: 'http://127.0.0.1:3001',
    reuseExistingServer: false,
  },
})
