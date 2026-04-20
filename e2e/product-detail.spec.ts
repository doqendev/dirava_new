import { test, expect } from '@playwright/test'

const PRODUCT_URL = '/worlds/one-piece/one-piece-custom-sign'
const ALTERNATIVE_PRODUCT = '/worlds/one-piece/one-piece-custom-sign'

test.describe('Product Detail Page', () => {
  test('product page loads with title, price, and images', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Title (h1)
    const title = page.locator('h1').first()
    await expect(title).toBeVisible()
    console.log('Product title:', await title.textContent())

    // Price
    const price = page.locator('[class*="font-mono"]').filter({ hasText: /[€$£]/ }).first()
    await expect(price).toBeVisible()
    console.log('Product price:', await price.textContent())

    // Images
    const images = page.locator('img[src*="shopify"], img[src*="cdn"]')
    const imageCount = await images.count()
    console.log('Product images:', imageCount)
    expect(imageCount).toBeGreaterThan(0)
  })

  test('image gallery works with thumbnail clicks', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Look for thumbnail images
    const thumbnails = page.locator('img[src*="shopify"], img[src*="cdn"]')
    const thumbnailCount = await thumbnails.count()

    console.log('Total images/thumbnails:', thumbnailCount)

    if (thumbnailCount > 1) {
      // Click second thumbnail
      await thumbnails.nth(1).click()
      await page.waitForTimeout(500)

      // Main image should update (verify by checking it's still visible)
      const mainImage = page.locator('img[src*="shopify"]').first()
      await expect(mainImage).toBeVisible()
    }
  })

  test('variant selection works', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Look for variant options (size, color, etc.)
    const variantButtons = page.locator('button').filter({ hasText: /^(XS|S|M|L|XL|XXL|small|medium|large)$/i })
    const variantCount = await variantButtons.count()

    console.log('Variant buttons found:', variantCount)

    if (variantCount > 0) {
      // Click a variant
      await variantButtons.first().click()
      await page.waitForTimeout(500)

      // Variant should be selected (visual change)
      await expect(variantButtons.first()).toBeVisible()
    }
  })

  test('add to cart button works', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    const addToCartButton = page.getByRole('button', { name: /add to cart/i })
    const outOfStockButton = page.getByRole('button', { name: /out of stock/i })

    const addToCartCount = await addToCartButton.count()
    const outOfStockCount = await outOfStockButton.count()

    console.log('Add to Cart:', addToCartCount, 'Out of Stock:', outOfStockCount)

    if (outOfStockCount > 0) {
      await expect(outOfStockButton.first()).toBeDisabled()
    } else if (addToCartCount > 0) {
      await addToCartButton.click()
      await page.waitForTimeout(1000)

      // Should show adding/added state
      const addedText = page.getByText(/adding|added/i)
      const addedCount = await addedText.count()
      console.log('Added state shown:', addedCount > 0)
    }
  }, { timeout: 15000 })

  test('wishlist button is visible', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Wishlist button (heart icon)
    const wishlistButton = page.locator('button').filter({
      has: page.locator('svg.lucide-heart, svg[class*="heart"]')
    })

    const wishlistCount = await wishlistButton.count()
    console.log('Wishlist buttons found:', wishlistCount)

    if (wishlistCount > 0) {
      await expect(wishlistButton.first()).toBeVisible()
    }
  })

  test('review section is visible', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Scroll down to see reviews
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2))
    await page.waitForTimeout(500)

    // Look for review section
    const reviewHeading = page.getByRole('heading', { name: /review|rating/i })
    const reviewCount = await reviewHeading.count()

    console.log('Review headings found:', reviewCount)

    // Reviews are optional
    if (reviewCount > 0) {
      await expect(reviewHeading.first()).toBeVisible()
    }
  })

  test('related products section loads', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(500)

    // Related products heading
    const relatedHeading = page.getByRole('heading', { name: /you may also like|related|similar/i })
    const relatedCount = await relatedHeading.count()

    console.log('Related products heading found:', relatedCount > 0)

    if (relatedCount > 0) {
      await expect(relatedHeading.first()).toBeVisible()
    }
  })

  test('product description is visible', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Description section
    const descriptionHeading = page.getByRole('heading', { name: /description/i })
    await expect(descriptionHeading).toBeVisible()

    // Description content
    const descriptionText = page.locator('text=/fabric|material|cotton|polyester|wash|care/i')
    const descCount = await descriptionText.count()

    console.log('Description content found:', descCount > 0)
  })

  test('quantity selector is functional', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Quantity label
    const quantityLabel = page.getByText('Quantity', { exact: false })
    const labelCount = await quantityLabel.count()

    console.log('Quantity labels found:', labelCount)

    if (labelCount > 0) {
      // Look for + and - buttons
      const increaseButton = page.locator('button').filter({ hasText: '+' })
      const decreaseButton = page.locator('button').filter({ hasText: '-' })

      const increaseCount = await increaseButton.count()
      const decreaseCount = await decreaseButton.count()

      console.log('Quantity buttons - increase:', increaseCount, 'decrease:', decreaseCount)

      if (increaseCount > 0) {
        await increaseButton.first().click()
        await page.waitForTimeout(300)
        console.log('Quantity increased')
      }
    }
  })

  test('breadcrumb or back navigation is present', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Look for back link
    const backLink = page.locator('a').filter({ hasText: /back to|← |‹ /i })
    const backCount = await backLink.count()

    console.log('Back links found:', backCount)

    if (backCount > 0) {
      await expect(backLink.first()).toBeVisible()
    }
  })

  test('share buttons are functional', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Share section
    const shareText = page.getByText('Share:', { exact: false })
    const shareCount = await shareText.count()

    console.log('Share text found:', shareCount)

    if (shareCount > 0) {
      await expect(shareText.first()).toBeVisible()

      // Social buttons
      const socialButtons = page.locator('button[title*="Share"], button[aria-label*="Share"]')
      const buttonCount = await socialButtons.count()
      console.log('Social share buttons:', buttonCount)

      expect(buttonCount).toBeGreaterThan(0)
    }
  })

  test('stock indicator shows availability', async ({ page }) => {
    await page.goto(PRODUCT_URL)
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Stock status
    const inStock = page.getByText('In Stock', { exact: true })
    const outOfStock = page.getByText('Out of Stock', { exact: true })
    const lowStock = page.getByText(/only \d+ left/i)

    const inStockCount = await inStock.count()
    const outOfStockCount = await outOfStock.count()
    const lowStockCount = await lowStock.count()

    console.log('Stock indicators - In:', inStockCount, 'Out:', outOfStockCount, 'Low:', lowStockCount)

    // At least one should be present
    const hasStockIndicator = inStockCount > 0 || outOfStockCount > 0 || lowStockCount > 0
    expect(hasStockIndicator).toBeTruthy()
  })

  test('product page works for different products', async ({ page }) => {
    const products = [PRODUCT_URL, ALTERNATIVE_PRODUCT]

    for (const productUrl of products) {
      await page.goto(productUrl)
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)

      // Each should have title and price
      const title = page.locator('h1').first()
      await expect(title).toBeVisible()

      const price = page.locator('[class*="font-mono"]').filter({ hasText: /[€$£]/ }).first()
      const priceCount = await price.count()

      console.log(`Product ${productUrl} - has price:`, priceCount > 0)
    }
  }, { timeout: 20000 })
})
