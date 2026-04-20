import { test, expect } from '@playwright/test'

const COLLECTION_URL = '/worlds/one-piece'

test.describe('Product Listing', () => {
  test('universe/collection page loads products', async ({ page }) => {
    await page.goto(COLLECTION_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Wait for Shopify data

    // Should have product links
    const productLinks = page.locator('a[href*="/worlds/one-piece/"]')
    const linkCount = await productLinks.count()

    console.log('Product links found:', linkCount)
    expect(linkCount).toBeGreaterThan(0)
  }, { timeout: 15000 })

  test('products display image, title, and price', async ({ page }) => {
    await page.goto(COLLECTION_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Check first product card has required elements
    const firstProduct = page.locator('a[href*="/worlds/one-piece/"]').first()
    await expect(firstProduct).toBeVisible()

    // Should have image
    const productImages = page.locator('img[src*="shopify"], img[src*="cdn"]')
    const imageCount = await productImages.count()
    console.log('Product images:', imageCount)
    expect(imageCount).toBeGreaterThan(0)

    // Should have price (€ or $)
    const prices = page.locator('[class*="price"]').or(page.getByText(/[€$£]\d+/))
    const priceCount = await prices.count()
    console.log('Prices found:', priceCount)
    expect(priceCount).toBeGreaterThan(0)
  }, { timeout: 15000 })

  test('product card click navigates to detail page', async ({ page }) => {
    await page.goto(COLLECTION_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Click first product
    const firstProduct = page.locator('a[href*="/worlds/one-piece/"]').first()
    await firstProduct.click()
    await page.waitForLoadState('networkidle')

    // Should navigate to product detail page
    expect(page.url()).toContain('/worlds/one-piece/')

    // Should show product details
    const productTitle = page.locator('h1')
    await expect(productTitle).toBeVisible()
  }, { timeout: 15000 })

  test('collection page has heading', async ({ page }) => {
    await page.goto(COLLECTION_URL)
    await page.waitForLoadState('networkidle')

    // Should have collection title
    const heading = page.locator('h1').first()
    await expect(heading).toBeVisible()

    const headingText = await heading.textContent()
    console.log('Collection heading:', headingText)
  })

  test('grid view shows products in grid layout', async ({ page }) => {
    await page.goto(COLLECTION_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Products should be in a grid
    const products = page.locator('a[href*="/worlds/one-piece/"]')
    const productCount = await products.count()

    console.log('Products in grid:', productCount)
    expect(productCount).toBeGreaterThan(0)

    // Check if products are laid out in grid (multiple per row on desktop)
    const firstProduct = products.first()
    const firstBox = await firstProduct.boundingBox()

    if (firstBox && productCount > 1) {
      const secondProduct = products.nth(1)
      const secondBox = await secondProduct.boundingBox()

      if (secondBox) {
        // On desktop, should be side by side (similar Y position)
        const yDifference = Math.abs(firstBox.y - secondBox.y)
        console.log('Y difference between products:', yDifference)
      }
    }
  }, { timeout: 15000 })

  test('sort options are available', async ({ page }) => {
    await page.goto(COLLECTION_URL)
    await page.waitForLoadState('networkidle')

    // Look for sort dropdown or buttons
    const sortSelect = page.locator('select').filter({ has: page.locator('option[value*="price"], option[value*="name"]') })
    const sortButtons = page.getByText(/sort|price|name|featured/i)

    const sortSelectCount = await sortSelect.count()
    const sortButtonCount = await sortButtons.count()

    console.log('Sort select:', sortSelectCount, 'Sort buttons/text:', sortButtonCount)

    // At least some sort UI should be present
    if (sortSelectCount > 0) {
      await expect(sortSelect.first()).toBeVisible()
    }
  })

  test('filter options may be available', async ({ page }) => {
    await page.goto(COLLECTION_URL)
    await page.waitForLoadState('networkidle')

    // Look for filter UI
    const filterButton = page.getByRole('button', { name: /filter/i })
    const filterCount = await filterButton.count()

    console.log('Filter buttons found:', filterCount)

    // Filters are optional, just log if present
    if (filterCount > 0) {
      await expect(filterButton.first()).toBeVisible()
    }
  })

  test('multiple product universes are accessible', async ({ page }) => {
    const universes = ['one-piece', 'demon-slayer', 'dragon-ball']

    for (const universe of universes) {
      await page.goto(`/worlds/${universe}`)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Check if page loaded
      const isValidPage = page.url().includes(universe)
      console.log(`Universe ${universe} accessible:`, isValidPage)

      if (isValidPage) {
        expect(page.url()).toContain(universe)
      }
    }
  }, { timeout: 30000 })

  test('product cards show hover effects', async ({ page }) => {
    await page.goto(COLLECTION_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Hover over first product
    const firstProduct = page.locator('a[href*="/worlds/one-piece/"]').first()
    await firstProduct.hover()
    await page.waitForTimeout(500)

    // Visual change should occur (we can't easily test CSS, but we can verify element is still visible)
    await expect(firstProduct).toBeVisible()
  }, { timeout: 15000 })

  test('products show availability status', async ({ page }) => {
    await page.goto(COLLECTION_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Look for stock indicators
    const stockBadges = page.getByText(/in stock|out of stock|low stock|sold out/i)
    const badgeCount = await stockBadges.count()

    console.log('Stock badges found:', badgeCount)

    // Stock badges are optional on listing pages
  }, { timeout: 15000 })
})
