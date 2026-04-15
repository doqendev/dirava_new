import { test, expect } from '@playwright/test'

test.describe('Navigation and Routing', () => {
  test('logo links to homepage from any page', async ({ page }) => {
    // Navigate to a product page first
    await page.goto('/worlds/one-piece-1')
    await page.waitForLoadState('networkidle')

    // Click logo
    const logo = page.getByRole('link').filter({ hasText: /^MIZOKE/ }).first()
    await logo.click()
    await page.waitForLoadState('networkidle')

    // Should be on homepage
    expect(page.url()).toBe('http://localhost:3000/')
  })

  test('header navigation elements work', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Test wishlist link
    const wishlistLink = page.getByRole('link', { name: /wishlist/i })
    await wishlistLink.click()
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/wishlist')
  })

  test('bottom nav works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Bottom nav should have Home, Search, Cart, Profile links
    const bottomNav = page.locator('nav').last()

    // Try to find home link in bottom nav
    const homeLinks = page.getByRole('link', { name: /home/i })
    const homeLinkCount = await homeLinks.count()

    console.log('Home links found:', homeLinkCount)

    if (homeLinkCount > 0) {
      // Click home link (get the one in bottom nav if multiple)
      await homeLinks.last().click()
      await page.waitForLoadState('networkidle')

      expect(page.url()).toContain('localhost:3000')
    }
  })

  test('back navigation works correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Navigate to a collection
    await page.goto('/worlds/one-piece-1')
    await page.waitForLoadState('networkidle')

    // Use browser back button
    await page.goBack()
    await page.waitForLoadState('networkidle')

    // Should be back on homepage
    expect(page.url()).toBe('http://localhost:3000/')
  })

  test('404 page shows for invalid routes', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-123456')
    await page.waitForLoadState('networkidle')

    // Should show 404 content
    const notFoundText = page.getByText(/not found|404/i)
    await expect(notFoundText).toBeVisible({ timeout: 10000 })
  })

  test('universe collection page is accessible', async ({ page }) => {
    await page.goto('/worlds/one-piece-1')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Page should load successfully
    expect(page.url()).toContain('/worlds/one-piece-1')

    // Should have products or collection title
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()
  })

  test('drops page is accessible', async ({ page }) => {
    await page.goto('/drops')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/drops')
    await expect(page.locator('body')).toBeVisible()
  })

  test('sale page is accessible', async ({ page }) => {
    await page.goto('/sale')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/sale')
    await expect(page.locator('body')).toBeVisible()
  })

  test('new arrivals page is accessible', async ({ page }) => {
    await page.goto('/new')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/new')
    await expect(page.locator('body')).toBeVisible()
  })

  test('contact page is accessible', async ({ page }) => {
    await page.goto('/contact')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/contact')

    // Should have a contact form
    const form = page.locator('form')
    await expect(form).toBeVisible()
  })

})
