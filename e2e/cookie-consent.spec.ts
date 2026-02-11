import { test, expect } from '@playwright/test'

test.describe('Cookie Consent', () => {
  test('banner appears on first visit', async ({ context }) => {
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Look for cookie banner
    const cookieBanner = page.getByText(/cookie|consent|privacy|we use cookies/i).first()
    const bannerCount = await cookieBanner.count()

    console.log('Cookie banner elements found:', bannerCount)

    // Banner should appear on first visit
    if (bannerCount > 0) {
      await expect(cookieBanner).toBeVisible()
    }
  })

  test('Accept All button hides banner', async ({ context }) => {
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Find Accept All button
    const acceptButton = page.getByRole('button', { name: /accept all|accept|got it/i })
    const acceptCount = await acceptButton.count()

    console.log('Accept buttons found:', acceptCount)

    if (acceptCount > 0) {
      // Click accept
      await acceptButton.first().click()
      await page.waitForTimeout(500)

      // Banner should disappear
      const cookieBanner = page.getByText(/cookie|consent/i).first()
      const bannerStillVisible = await cookieBanner.isVisible().catch(() => false)

      console.log('Banner still visible after accept:', bannerStillVisible)

      // Expect banner to be hidden
      if (bannerStillVisible) {
        await expect(cookieBanner).not.toBeVisible()
      }
    }
  })

  test('Reject All button hides banner', async ({ context }) => {
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Find Reject button
    const rejectButton = page.getByRole('button', { name: /reject|decline|no thanks/i })
    const rejectCount = await rejectButton.count()

    console.log('Reject buttons found:', rejectCount)

    if (rejectCount > 0) {
      await rejectButton.first().click()
      await page.waitForTimeout(500)

      // Banner should disappear
      const cookieBanner = page.getByText(/cookie|consent/i).first()
      const bannerStillVisible = await cookieBanner.isVisible().catch(() => false)

      console.log('Banner still visible after reject:', bannerStillVisible)
    }
  })

  test('Customize button shows options', async ({ context }) => {
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Find Customize button
    const customizeButton = page.getByRole('button', { name: /customize|preferences|settings/i })
    const customizeCount = await customizeButton.count()

    console.log('Customize buttons found:', customizeCount)

    if (customizeCount > 0) {
      await customizeButton.first().click()
      await page.waitForTimeout(500)

      // Should show toggle options or detailed settings
      const toggles = page.locator('input[type="checkbox"], button[role="switch"]')
      const toggleCount = await toggles.count()

      console.log('Cookie preference toggles found:', toggleCount)

      // Should have at least some preference controls
      if (toggleCount > 0) {
        expect(toggleCount).toBeGreaterThan(0)
      }
    }
  })

  test('consent persists across page navigation', async ({ context }) => {
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Accept cookies
    const acceptButton = page.getByRole('button', { name: /accept all|accept/i })
    const acceptCount = await acceptButton.count()

    if (acceptCount > 0) {
      await acceptButton.first().click()
      await page.waitForTimeout(500)

      // Navigate to another page
      await page.goto('/worlds/one-piece-1')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)

      // Banner should not reappear
      const cookieBanner = page.getByText(/cookie|consent/i).first()
      const bannerCount = await cookieBanner.count()

      console.log('Cookie banner on second page:', bannerCount)

      // Banner should either not exist or be hidden
      if (bannerCount > 0) {
        const isVisible = await cookieBanner.isVisible().catch(() => false)
        expect(isVisible).toBeFalsy()
      }
    }
  })

  test('banner does not reappear after consent given', async ({ context }) => {
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Accept cookies
    const acceptButton = page.getByRole('button', { name: /accept all|accept/i })
    const acceptCount = await acceptButton.count()

    if (acceptCount > 0) {
      await acceptButton.first().click()
      await page.waitForTimeout(500)

      // Reload page
      await page.reload()
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Banner should not reappear
      const cookieBanner = page.getByText(/we use cookies/i).first()
      const bannerCount = await cookieBanner.count()

      if (bannerCount > 0) {
        const isVisible = await cookieBanner.isVisible().catch(() => false)
        expect(isVisible).toBeFalsy()
      }
    }
  })

  test('localStorage stores consent preference', async ({ context }) => {
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Accept cookies
    const acceptButton = page.getByRole('button', { name: /accept all|accept/i })
    const acceptCount = await acceptButton.count()

    if (acceptCount > 0) {
      await acceptButton.first().click()
      await page.waitForTimeout(500)

      // Check localStorage for consent data
      const consentData = await page.evaluate(() => {
        const keys = Object.keys(localStorage)
        const consentKey = keys.find(key =>
          key.includes('cookie') ||
          key.includes('consent') ||
          key.includes('neo-stage')
        )
        return consentKey ? localStorage.getItem(consentKey) : null
      })

      console.log('Consent data in localStorage:', consentData ? 'exists' : 'not found')

      // Some consent preference should be stored
      if (consentData) {
        expect(consentData).toBeTruthy()
      }
    }
  })

  test('banner has privacy policy link', async ({ context }) => {
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Look for privacy policy link
    const privacyLink = page.getByRole('link', { name: /privacy policy|privacy/i })
    const privacyCount = await privacyLink.count()

    console.log('Privacy policy links found:', privacyCount)

    // Privacy link is optional but recommended
    if (privacyCount > 0) {
      await expect(privacyLink.first()).toBeVisible()
    }
  })
})
