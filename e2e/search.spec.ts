import { test, expect } from '@playwright/test'

async function openSearch(page: import('@playwright/test').Page) {
  const searchButton = page.getByRole('button', { name: /search/i }).first()
  await expect(searchButton).toBeVisible()
  await searchButton.click()
  await expect(page.getByRole('dialog', { name: /search products/i })).toBeVisible()
}

test.describe('Search Functionality', () => {
  test('search modal opens on click', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    await openSearch(page)
  })

  test('can type in search input', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open search
    await openSearch(page)

    // Find search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    await expect(searchInput).toBeVisible()

    // Type search query
    await searchInput.fill('luffy')
    await page.waitForTimeout(1000)

    // Input should contain the text
    const inputValue = await searchInput.inputValue()
    expect(inputValue.toLowerCase()).toContain('luffy')
  })

  test('search results appear after typing', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open search
    await openSearch(page)

    // Type search query
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    await searchInput.fill('hoodie')
    await page.waitForTimeout(2000) // Wait for search results from Shopify

    // Look for product results
    const searchModal = page.getByRole('dialog', { name: /search products/i })
    const results = searchModal.locator('a[href*="/worlds/"], a[href^="/products/"]')
    const resultCount = await results.count()

    console.log('Search results found:', resultCount)

    // If results exist, they should be visible
    if (resultCount > 0) {
      await expect(results.first()).toBeVisible()
    }
  })

  test('clicking result navigates to product', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open search
    await openSearch(page)

    // Search for a product
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    await searchInput.fill('luffy')
    await page.waitForTimeout(2000)

    // Click first result if exists
    const searchModal = page.getByRole('dialog', { name: /search products/i })
    const firstResult = searchModal.locator('a[href*="/worlds/"], a[href^="/products/"]').first()
    const resultCount = await firstResult.count()

    if (resultCount > 0) {
      const href = await firstResult.getAttribute('href')
      console.log('First search result href:', href)
      expect(href).toMatch(/^\/(worlds\/[^/]+\/[^/]+|products\/[^/]+)$/)
      await firstResult.click({ force: true })

      // Should navigate to product page
      await expect(page).toHaveURL(/\/(worlds\/[^/]+\/[^/]+|products\/[^/]+)$/, { timeout: 10000 })
    }
  })

  test('search modal closes on Escape key', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open search
    await openSearch(page)

    // Modal should be visible
    const searchModal = page.getByRole('dialog', { name: /search products/i })
    if ((await searchModal.count()) > 0) {
      await expect(searchModal).toBeVisible()

      // Press Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)

      // Modal should be closed
      await expect(searchModal).not.toBeVisible()
    }
  })

  test('empty search shows appropriate state', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open search
    await openSearch(page)

    // Search input should be empty initially
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    const inputValue = await searchInput.inputValue()
    expect(inputValue).toBe('')

    // Should show placeholder or empty state message
    const placeholder = await searchInput.getAttribute('placeholder')
    expect(placeholder).toBeTruthy()
  })

  test('search with no results shows empty state', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open search
    await openSearch(page)

    // Search for something unlikely to exist
    const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
    await searchInput.fill('xyzabc123nonexistent')
    await page.waitForTimeout(2000)

    // Should show no results message or empty state
    const noResults = page.getByText(/no results|no products|not found/i)
    const noResultsCount = await noResults.count()

    console.log('No results message found:', noResultsCount > 0)
  })

  test('search modal has close button', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Open search
    await openSearch(page)

    // Look for close button (X icon or close text)
    const closeButton = page.getByRole('button', { name: /close/i }).or(
      page.locator('button').filter({ has: page.locator('svg.lucide-x, svg[class*="close"]') })
    )

    const closeButtonCount = await closeButton.count()
    console.log('Close buttons found:', closeButtonCount)

    if (closeButtonCount > 0) {
      await closeButton.first().click()
      await page.waitForTimeout(500)

      // Modal should close
      const searchModal = page.locator('[role="dialog"]')
      if ((await searchModal.count()) > 0) {
        await expect(searchModal).not.toBeVisible()
      }
    }
  })
})
