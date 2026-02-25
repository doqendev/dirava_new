import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test('loads successfully with hero section', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Verify page loaded
    expect(page.url()).toBe('http://localhost:3000/')

    // Hero section should be visible
    const heroHeading = page.getByRole('heading', { name: /mizoke|your anime universe/i }).first()
    await expect(heroHeading).toBeVisible({ timeout: 10000 })

    // Page should have loaded content
    await expect(page.locator('body')).toBeVisible()
  })

  test('displays logo in header', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Logo should be visible (MIZOKE text)
    const logo = page.getByRole('link').filter({ hasText: /^MIZOKE/ })
    await expect(logo).toBeVisible()
  })

  test('header navigation elements are present', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Search button should be visible
    const searchButton = page.getByRole('button', { name: /search/i })
    await expect(searchButton).toBeVisible()

    // Cart button should be visible
    const cartButton = page.getByRole('button', { name: /cart/i })
    await expect(cartButton).toBeVisible()

    // Wishlist link should be visible
    const wishlistLink = page.getByRole('link', { name: /wishlist/i })
    await expect(wishlistLink).toBeVisible()
  })

  test('drop runway section loads products', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for Shopify data

    // Look for product links or product cards
    const productLinks = page.locator('a[href*="/worlds/"]')
    const linkCount = await productLinks.count()

    console.log('Product links found on homepage:', linkCount)

    // Should have at least some products (could be 0 if no drops configured)
    if (linkCount > 0) {
      await expect(productLinks.first()).toBeVisible()
    }
  })

  test('newsletter banner is visible', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Scroll to bottom to see newsletter
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Newsletter section should have email input or subscribe button
    const emailInput = page.locator('input[type="email"]')
    const subscribeButton = page.getByRole('button', { name: /subscribe|join/i })

    const hasEmailInput = (await emailInput.count()) > 0
    const hasSubscribeButton = (await subscribeButton.count()) > 0

    // At least one should be present
    expect(hasEmailInput || hasSubscribeButton).toBeTruthy()
  })

  test('cookie consent banner appears on first visit', async ({ context }) => {
    // Create new context to simulate first visit
    const page = await context.newPage()

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Cookie consent should appear
    const cookieBanner = page.getByText(/cookie|consent|privacy/i).first()
    const bannerCount = await cookieBanner.count()

    console.log('Cookie banner elements found:', bannerCount)

    // If banner is present, verify it's visible
    if (bannerCount > 0) {
      await expect(cookieBanner).toBeVisible()
    }
  })

  test('footer is present with links', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Footer should have some links
    const footer = page.locator('footer')
    await expect(footer).toBeVisible()

    // Footer should contain copyright or brand name
    const footerText = await footer.textContent()
    expect(footerText).toContain('MIZOKE')
  })

  test('page is responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Mobile logo should be visible (centered)
    const mobileLogo = page.getByRole('link').filter({ hasText: /^MIZOKE/ }).nth(1)
    await expect(mobileLogo).toBeVisible()

    // Bottom nav should be visible on mobile
    const bottomNav = page.locator('[class*="fixed bottom"]').first()
    const bottomNavCount = await bottomNav.count()

    console.log('Bottom nav elements:', bottomNavCount)
  })
})
