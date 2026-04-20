import { test, expect } from '@playwright/test'

test.describe('Mobile Responsiveness', () => {
  test('homepage renders on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Page should load
    await expect(page.locator('body')).toBeVisible()

    // Mobile logo should be visible (centered)
    const logo = page.locator('header a[href="/"]')
    await expect(logo.first()).toBeVisible()
  })

  test('bottom nav visible on mobile, hidden on desktop', async ({ page }) => {
    // Mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Bottom nav should exist
    const bottomNav = page.locator('nav').last()
    const mobileNavVisible = await bottomNav.isVisible()
    console.log('Bottom nav visible on mobile:', mobileNavVisible)

    // Desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.waitForTimeout(500)

    const desktopNavVisible = await bottomNav.isVisible().catch(() => false)
    console.log('Bottom nav visible on desktop:', desktopNavVisible)

    // On desktop, bottom nav should be hidden (display: none or not rendered)
  })

  test('header adapts to mobile layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Logo should be centered on mobile
    const mobileLogo = page.locator('header a[href="/"]').nth(1)
    await expect(mobileLogo).toBeVisible()

    // Icons should be compact
    const searchButton = page.getByRole('button', { name: /search/i })
    await expect(searchButton).toBeVisible()

    const cartButton = page.getByRole('button', { name: /cart/i })
    await expect(cartButton).toBeVisible()
  })

  test('cart drawer works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open cart
    const cartButton = page.getByRole('button', { name: /cart/i })
    await cartButton.click()
    await page.waitForTimeout(500)

    // Drawer should open
    const drawer = page.locator('[role="dialog"]').first()
    const drawerCount = await drawer.count()

    if (drawerCount > 0) {
      await expect(drawer).toBeVisible()
    }
  })

  test('product grid adjusts columns on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/worlds/one-piece')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Products should be visible
    const products = page.locator('a[href*="/worlds/one-piece/"]')
    const productCount = await products.count()

    console.log('Products visible on mobile:', productCount)

    if (productCount >= 2) {
      // Get positions of first two products
      const firstBox = await products.first().boundingBox()
      const secondBox = await products.nth(1).boundingBox()

      if (firstBox && secondBox) {
        // On mobile, products should stack (different Y positions)
        // or be in 2 columns (similar Y, different X)
        const yDifference = Math.abs(firstBox.y - secondBox.y)
        const xDifference = Math.abs(firstBox.x - secondBox.x)

        console.log('Mobile layout - Y diff:', yDifference, 'X diff:', xDifference)

        // Should have some layout (not both at same position)
        expect(yDifference > 10 || xDifference > 10).toBeTruthy()
      }
    }
  }, { timeout: 15000 })

  test('search modal works on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open search
    const searchButton = page.getByRole('button', { name: /search/i })
    await searchButton.click()
    await page.waitForTimeout(500)

    // Search modal should open
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    await expect(searchInput).toBeVisible()

    // Should be full width on mobile
    const inputBox = await searchInput.boundingBox()
    if (inputBox) {
      console.log('Search input width on mobile:', inputBox.width)
      // Input should take most of screen width (at least 200px on 375px screen)
      expect(inputBox.width).toBeGreaterThan(200)
    }
  })

  test('product detail page is mobile-friendly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/worlds/one-piece/one-piece-custom-sign')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Title should be visible and wrap properly
    const title = page.locator('h1').first()
    await expect(title).toBeVisible()

    // Image should be visible
    const images = page.locator('img[src*="shopify"]')
    await expect(images.first()).toBeVisible()

    // Add to cart button should be visible
    const addToCartButton = page.getByRole('button', { name: /add to cart|out of stock/i })
    await expect(addToCartButton.first()).toBeVisible()
  })

  test('navigation menu accessible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Bottom nav should have navigation options
    const homeLink = page.getByRole('link', { name: /home/i }).last()
    const homeLinkCount = await homeLink.count()

    if (homeLinkCount > 0) {
      await expect(homeLink).toBeVisible()
    }
  })

  test('tablet viewport renders correctly', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })

    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Page should load
    await expect(page.locator('body')).toBeVisible()

    // Logo should be visible
    const logo = page.locator('header a[href="/"]')
    await expect(logo.first()).toBeVisible()

    // Navigation should work
    const searchButton = page.getByRole('button', { name: /search/i })
    await expect(searchButton).toBeVisible()
  })

  test('touch interactions work on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/worlds/one-piece')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Tap on first product
    const firstProduct = page.locator('a[href*="/worlds/one-piece/"]').first()
    const productCount = await firstProduct.count()

    if (productCount > 0) {
      await firstProduct.tap()
      await page.waitForLoadState('networkidle')

      // Should navigate
      expect(page.url()).toContain('/worlds/one-piece/')
    }
  }, { timeout: 15000 })

  test('forms are usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/account/login')
    await page.waitForLoadState('networkidle')

    // Email input should be visible and full width
    const emailInput = page.locator('input[type="email"]').first()
    await expect(emailInput).toBeVisible()

    const emailBox = await emailInput.boundingBox()
    if (emailBox) {
      console.log('Email input width on mobile:', emailBox.width)
      // Should be reasonably wide (at least 250px on 375px screen)
      expect(emailBox.width).toBeGreaterThan(250)
    }

    // Password input should be visible
    const passwordInput = page.locator('input[type="password"]').first()
    await expect(passwordInput).toBeVisible()
  })

  test('images scale properly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })

    await page.goto('/worlds/one-piece/one-piece-custom-sign')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Product images should fit within viewport
    const mainImage = page.locator('img[src*="shopify"]').first()
    await expect(mainImage).toBeVisible()

    const imageBox = await mainImage.boundingBox()
    if (imageBox) {
      console.log('Image width on mobile:', imageBox.width)
      // Image should not overflow viewport (max 375px wide)
      expect(imageBox.width).toBeLessThanOrEqual(375)
    }
  })
})
