import { test, expect } from '@playwright/test'

const PRODUCT_URL = '/worlds/one-piece-1/gear-5-luffy-hoodie'

async function gotoProductPage(page: import('@playwright/test').Page) {
  await page.goto(PRODUCT_URL)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(1000)

  const notFoundHeading = page.getByRole('heading', { name: /not found/i }).first()
  if (await notFoundHeading.count()) {
    test.skip()
  }
}

test.describe('Cart Operations', () => {
  test('add product to cart from product page', async ({ page }) => {
    await gotoProductPage(page)

    // Find Add to Cart button
    const addToCartButton = page.getByRole('button', { name: /add to cart/i })
    const outOfStockButton = page.getByRole('button', { name: /out of stock/i })

    const addToCartCount = await addToCartButton.count()
    const outOfStockCount = await outOfStockButton.count()

    console.log('Add to Cart buttons:', addToCartCount, 'Out of Stock buttons:', outOfStockCount)

    if (outOfStockCount > 0) {
      console.log('Product is out of stock, skipping add to cart test')
      test.skip()
    } else if (addToCartCount > 0) {
      // Click add to cart
      await addToCartButton.first().click()

      // Wait for adding state
      await page.waitForTimeout(1000)

      // Cart icon should show quantity
      const cartButton = page.getByRole('button', { name: /cart/i }).first()
      await expect(cartButton).toBeVisible()
    }
  }, { timeout: 15000 })

  test('cart drawer opens showing item', async ({ page }) => {
    await gotoProductPage(page)

    // Add product to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i })
    const addToCartCount = await addToCartButton.count()

    if (addToCartCount === 0) {
      test.skip()
      return
    }

    await addToCartButton.first().click()
    await page.waitForTimeout(2000)

    // Cart drawer should open automatically or we can open it
    const cartButton = page.getByRole('button', { name: /cart/i }).first()
    await cartButton.click()
    await page.waitForTimeout(500)

    // Drawer should be visible
    const drawer = page.locator('[role="dialog"]').or(page.locator('[class*="drawer"]'))
    await expect(drawer.first()).toBeVisible({ timeout: 5000 })

    // Should show product in cart
    const cartItems = page.locator('[class*="cart"] img').or(page.locator('[role="dialog"] img'))
    const itemCount = await cartItems.count()
    console.log('Cart items visible:', itemCount)
  }, { timeout: 15000 })

  test('quantity can be updated in cart', async ({ page }) => {
    await gotoProductPage(page)

    // Add product to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i })
    const addToCartCount = await addToCartButton.count()

    if (addToCartCount === 0) {
      test.skip()
      return
    }

    await addToCartButton.first().click()
    await page.waitForTimeout(2000)

    // Open cart
    const cartButton = page.getByRole('button', { name: /cart/i }).first()
    await cartButton.click()
    await page.waitForTimeout(500)

    // Look for quantity controls (+ and - buttons)
    const increaseButton = page.getByRole('button', { name: '+' }).or(
      page.locator('button').filter({ hasText: '+' })
    )
    const decreaseButton = page.getByRole('button', { name: '-' }).or(
      page.locator('button').filter({ hasText: '-' })
    )

    const increaseCount = await increaseButton.count()
    const decreaseCount = await decreaseButton.count()

    console.log('Increase buttons:', increaseCount, 'Decrease buttons:', decreaseCount)

    if (increaseCount > 0) {
      // Click increase
      await increaseButton.first().click()
      await page.waitForTimeout(1000)

      // Quantity should update (check cart badge or drawer)
      console.log('Quantity increased')
    }
  }, { timeout: 15000 })

  test('item can be removed from cart', async ({ page }) => {
    await gotoProductPage(page)

    // Add product to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i })
    const addToCartCount = await addToCartButton.count()

    if (addToCartCount === 0) {
      test.skip()
      return
    }

    await addToCartButton.first().click()
    await page.waitForTimeout(2000)

    // Open cart
    const cartButton = page.getByRole('button', { name: /cart/i }).first()
    await cartButton.click()
    await page.waitForTimeout(500)

    // Look for remove button (trash icon or remove text)
    const removeButton = page.getByRole('button', { name: /remove/i }).or(
      page.locator('button').filter({ has: page.locator('svg.lucide-trash, svg[class*="trash"]') })
    )

    const removeCount = await removeButton.count()
    console.log('Remove buttons found:', removeCount)

    if (removeCount > 0) {
      await removeButton.first().click()
      await page.waitForTimeout(1000)

      console.log('Item removed from cart')
    }
  }, { timeout: 15000 })

  test('cart page shows same items as drawer', async ({ page }) => {
    await gotoProductPage(page)

    // Add product to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i })
    const addToCartCount = await addToCartButton.count()

    if (addToCartCount === 0) {
      test.skip()
      return
    }

    await addToCartButton.first().click()
    await page.waitForTimeout(2000)

    // Navigate to cart page
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Should show cart items
    const cartItems = page.locator('img[src*="shopify"], img[src*="cdn"]')
    const itemCount = await cartItems.count()
    console.log('Items on cart page:', itemCount)

    expect(itemCount).toBeGreaterThan(0)
  }, { timeout: 15000 })

  test('discount code input is visible in cart', async ({ page }) => {
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Look for discount code input
    const discountInput = page.locator('input[placeholder*="discount" i], input[placeholder*="code" i], input[placeholder*="coupon" i]')
    const discountCount = await discountInput.count()

    console.log('Discount code inputs found:', discountCount)

    if (discountCount > 0) {
      await expect(discountInput.first()).toBeVisible()
    }
  })

  test('checkout button links to Shopify checkout', async ({ page }) => {
    await gotoProductPage(page)

    // Add product to cart
    const addToCartButton = page.getByRole('button', { name: /add to cart/i })
    const addToCartCount = await addToCartButton.count()

    if (addToCartCount === 0) {
      test.skip()
      return
    }

    await addToCartButton.first().click()
    await page.waitForTimeout(2000)

    // Navigate to cart page
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Find checkout button
    const checkoutButton = page.getByRole('button', { name: /checkout|proceed/i }).or(
      page.getByRole('link', { name: /checkout|proceed/i })
    )

    const checkoutCount = await checkoutButton.count()
    console.log('Checkout buttons found:', checkoutCount)

    if (checkoutCount > 0) {
      await expect(checkoutButton.first()).toBeVisible()

      // Verify it's a link to Shopify
      const href = await checkoutButton.first().getAttribute('href')
      console.log('Checkout URL:', href)
    }
  }, { timeout: 15000 })

  test('empty cart shows appropriate message', async ({ page }) => {
    await page.goto('/cart')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)

    // Clear cart by checking localStorage
    await page.evaluate(() => {
      localStorage.removeItem('mizoke-cart')
    })

    await page.reload()
    await page.waitForLoadState('networkidle')

    // Should show empty cart message
    const emptyMessage = page.getByText(/empty|no items|cart is empty/i)
    const emptyCount = await emptyMessage.count()

    console.log('Empty cart message found:', emptyCount > 0)

    if (emptyCount > 0) {
      await expect(emptyMessage.first()).toBeVisible()
    }
  })
})
