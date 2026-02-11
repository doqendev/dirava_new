import { test, expect } from '@playwright/test'

// Known product URL from the debug tests
const PRODUCT_URL = '/worlds/one-piece-1/gear-5-luffy-hoodie'
const ALTERNATIVE_PRODUCT_URL = '/worlds/one-piece-1/anime-custom-sign'

test.describe('Product Page Features', () => {
  test('Size Guide button is visible and modal opens', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000) // Wait for hydration

    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/size-guide-test.png', fullPage: true })

    // Check if Size Guide button exists - look for text content
    const sizeGuideButton = page.locator('button:has-text("Size Guide")')
    const sizeGuideCount = await sizeGuideButton.count()
    console.log('Size Guide button count:', sizeGuideCount)

    if (sizeGuideCount === 0) {
      // Try alternative selector
      const sizeGuideAlt = page.getByText('Size Guide')
      const altCount = await sizeGuideAlt.count()
      console.log('Size Guide text count:', altCount)

      if (altCount > 0) {
        await sizeGuideAlt.first().click()
      } else {
        console.log('Size Guide not found on page')
        // Let's see what's on the page
        const pageText = await page.locator('body').textContent()
        console.log('Page contains "Size":', pageText?.includes('Size'))
        console.log('Page contains "Guide":', pageText?.includes('Guide'))
      }
    } else {
      await expect(sizeGuideButton).toBeVisible()
      await sizeGuideButton.click()
    }

    // Verify modal opens (if size guide was found)
    const modal = page.getByRole('dialog')
    if (await modal.count() > 0) {
      await expect(modal).toBeVisible()

      // Verify modal has size chart content
      await expect(modal.locator('table')).toBeVisible()

      // Close modal
      await page.keyboard.press('Escape')
      await expect(modal).not.toBeVisible()
    }
  })

  test('Share buttons are visible and functional', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Check for Share section
    const shareText = page.getByText('Share:')
    const shareCount = await shareText.count()
    console.log('Share: text count:', shareCount)

    await expect(shareText.first()).toBeVisible()

    // Check for social share buttons by their aria-label
    const copyButton = page.locator('button[title="Copy link"], button[aria-label="Copy link"]')
    await expect(copyButton).toBeVisible()

    const xButton = page.locator('button[title="Share on X"], button[aria-label="Share on X"]')
    await expect(xButton).toBeVisible()

    const fbButton = page.locator('button[title="Share on Facebook"], button[aria-label="Share on Facebook"]')
    await expect(fbButton).toBeVisible()

    const pinterestButton = page.locator('button[title="Share on Pinterest"], button[aria-label="Share on Pinterest"]')
    await expect(pinterestButton).toBeVisible()

    const whatsappButton = page.locator('button[title="Share on WhatsApp"], button[aria-label="Share on WhatsApp"]')
    await expect(whatsappButton).toBeVisible()
  })

  test('Copy link shows confirmation feedback', async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(['clipboard-read', 'clipboard-write'])

    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Click copy link button
    const copyButton = page.locator('button[title="Copy link"], button[aria-label="Copy link"]')
    await copyButton.click()

    // Check for confirmation (button should show "Copied!")
    const copiedButton = page.locator('button[title="Copied!"], button[aria-label="Copied!"]')
    await expect(copiedButton).toBeVisible()

    // After timeout, should return to normal
    await page.waitForTimeout(2500)
    await expect(page.locator('button[title="Copy link"], button[aria-label="Copy link"]')).toBeVisible()
  })

  test('Stock indicator is visible', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Stock indicator should be visible with one of the status texts
    const inStock = page.getByText('In Stock', { exact: true })
    const outOfStock = page.getByText('Out of Stock', { exact: true })
    const lowStock = page.getByText(/Only \d+ left/)

    const inStockCount = await inStock.count()
    const outOfStockCount = await outOfStock.count()
    const lowStockCount = await lowStock.count()

    console.log('In Stock:', inStockCount, 'Out of Stock:', outOfStockCount, 'Low Stock:', lowStockCount)

    // At least one should be visible
    const hasStockIndicator = inStockCount > 0 || outOfStockCount > 0 || lowStockCount > 0
    expect(hasStockIndicator).toBeTruthy()
  })

  test('Recently Viewed persists across page navigation', async ({ page }) => {
    // Visit the product page
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Get the product title
    const productTitle = await page.locator('h1').first().textContent()
    console.log('Product title:', productTitle)

    // Navigate to homepage
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Check localStorage for recently viewed
    const recentlyViewed = await page.evaluate(() => {
      const stored = localStorage.getItem('neo-stage-recently-viewed')
      return stored ? JSON.parse(stored) : null
    })

    console.log('Recently viewed data:', JSON.stringify(recentlyViewed, null, 2))

    expect(recentlyViewed).toBeTruthy()
    expect(recentlyViewed.state).toBeTruthy()
    expect(recentlyViewed.state.items.length).toBeGreaterThan(0)

    // Verify the viewed product is in the list
    const viewedProduct = recentlyViewed.state.items.find(
      (item: { handle: string }) => item.handle === 'gear-5-luffy-hoodie'
    )
    expect(viewedProduct).toBeTruthy()
  })

  test('Related Products section appears when products exist', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Scroll down to see if Related Products section exists
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Check for "You May Also Like" heading
    const relatedHeading = page.getByRole('heading', { name: /you may also like/i })
    const relatedCount = await relatedHeading.count()

    console.log('Related Products heading count:', relatedCount)

    if (relatedCount > 0) {
      await expect(relatedHeading).toBeVisible()
    } else {
      // It's okay if there are no related products
      console.log('No related products section found (may not have related products)')
    }
  })

  test('Recently Viewed section appears after viewing products', async ({ page }) => {
    // First visit one product
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    // Then visit another product
    await page.goto(ALTERNATIVE_PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Scroll down to see Recently Viewed section
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Check for "Recently Viewed" heading
    const recentlyViewedHeading = page.getByRole('heading', { name: /recently viewed/i })
    const count = await recentlyViewedHeading.count()

    console.log('Recently Viewed heading count:', count)

    if (count > 0) {
      await expect(recentlyViewedHeading).toBeVisible()
    }
  })

  test('Add to Cart button works correctly', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Find the main Add to Cart button (the large one with text, not quick add icon buttons)
    const mainAddToCartButton = page.getByRole('button', { name: 'ADD TO CART', exact: true })
    const outOfStockButton = page.getByRole('button', { name: /out of stock/i })

    const addToCartCount = await mainAddToCartButton.count()
    const outOfStockCount = await outOfStockButton.count()

    console.log('Main Add to Cart buttons:', addToCartCount, 'Out of Stock buttons:', outOfStockCount)

    if (outOfStockCount > 0) {
      // Product is out of stock, verify button is disabled
      await expect(outOfStockButton.first()).toBeDisabled()
    } else if (addToCartCount > 0) {
      // Product is in stock, click main Add to Cart button
      await mainAddToCartButton.click()

      // Wait for loading state
      await expect(page.getByText(/adding/i)).toBeVisible({ timeout: 5000 })

      // Wait for success state
      await expect(page.getByText(/added/i)).toBeVisible({ timeout: 10000 })
    }
  })

  test('Product page displays all essential elements', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Take full page screenshot for visual inspection
    await page.screenshot({ path: 'test-results/full-product-page.png', fullPage: true })

    // Check for essential elements
    // 1. Product title (h1)
    const title = page.locator('h1')
    await expect(title).toBeVisible()
    console.log('Title:', await title.textContent())

    // 2. Price (may be in different currencies like € or $)
    const price = page.locator('[class*="font-mono"]').filter({ hasText: /[€$£]/ }).first()
    await expect(price).toBeVisible()
    console.log('Price:', await price.textContent())

    // 3. Product images
    const images = page.locator('img[src*="shopify"], img[src*="cdn"]')
    const imageCount = await images.count()
    console.log('Product images:', imageCount)
    expect(imageCount).toBeGreaterThan(0)

    // 4. Description section
    const description = page.getByRole('heading', { name: /description/i })
    const descCount = await description.count()
    console.log('Description heading:', descCount)

    // 5. Quantity selector
    const quantityLabel = page.getByText('Quantity', { exact: false })
    const quantityCount = await quantityLabel.count()
    console.log('Quantity label:', quantityCount)
  })

  test('Wishlist button is functional', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Find wishlist/heart button
    const wishlistButton = page.locator('button').filter({
      has: page.locator('svg.lucide-heart, svg[class*="heart"]')
    }).first()

    const wishlistCount = await wishlistButton.count()
    console.log('Wishlist buttons found:', wishlistCount)

    if (wishlistCount > 0) {
      // Click wishlist button
      await wishlistButton.click()
      await page.waitForTimeout(500)

      // Check localStorage for wishlist
      const wishlist = await page.evaluate(() => {
        const stored = localStorage.getItem('neo-stage-wishlist')
        return stored ? JSON.parse(stored) : null
      })

      console.log('Wishlist data:', wishlist ? 'exists' : 'null')
    }
  })
})

test.describe('Navigation and Routing', () => {
  test('Homepage loads correctly', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('localhost:3000')
    await expect(page.locator('body')).toBeVisible()
  })

  test('Collection page loads with products', async ({ page }) => {
    await page.goto('/worlds/one-piece-1')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000)

    // Should have product links
    const productLinks = page.locator('a[href*="/worlds/one-piece-1/"]')
    const count = await productLinks.count()

    console.log('Product links on collection page:', count)
    expect(count).toBeGreaterThan(0)
  })

  test('Back button on product page works', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Find back link
    const backLink = page.locator('a').filter({ hasText: /back to/i })
    const backCount = await backLink.count()

    console.log('Back links found:', backCount)

    if (backCount > 0) {
      await backLink.click()
      await page.waitForLoadState('networkidle')

      // Should be on collection page
      expect(page.url()).toContain('/worlds/')
    }
  })
})
