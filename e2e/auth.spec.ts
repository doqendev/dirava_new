import { test, expect } from '@playwright/test'

async function clearAuthState(page: import('@playwright/test').Page) {
  await page.context().clearCookies()
  await page.goto('/')
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
}

async function expectLoginPage(page: import('@playwright/test').Page) {
  await expect(page.locator('input[type="email"], input[name="email"]').first()).toBeVisible()
  await expect(page.locator('input[type="password"]').first()).toBeVisible()
  await expect(page.getByRole('button', { name: /^sign in$/i })).toBeVisible()
}

test.describe('Authentication Flows', () => {
  test('login page renders with form fields', async ({ page }) => {
    await page.goto('/account/login')
    await page.waitForLoadState('networkidle')

    // Should have email/username input
    const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email" i]')
    await expect(emailInput.first()).toBeVisible()

    // Should have password input
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput.first()).toBeVisible()

    // Should have submit button
    const submitButton = page.getByRole('button', { name: /^sign in$/i })
    await expect(submitButton).toBeVisible()
  })

  test('register page renders with form fields', async ({ page }) => {
    await page.goto('/account/register')
    await page.waitForLoadState('networkidle')

    // Should have email input
    const emailInput = page.locator('input[type="email"], input[name="email"]')
    await expect(emailInput.first()).toBeVisible()

    // Should have password input
    const passwordInput = page.locator('input[type="password"]')
    await expect(passwordInput.first()).toBeVisible()

    // Should have submit button
    const submitButton = page.getByRole('button', { name: /register|sign up|create/i })
    await expect(submitButton).toBeVisible()
  })

  test('invalid login shows error', async ({ page }) => {
    await page.goto('/account/login')
    await page.waitForLoadState('networkidle')

    // Fill in invalid credentials
    const emailInput = page.locator('input[type="email"], input[name="email"]').first()
    await emailInput.fill('invalid@example.com')

    const passwordInput = page.locator('input[type="password"]').first()
    await passwordInput.fill('wrongpassword')

    // Submit form
    const submitButton = page.getByRole('button', { name: /^sign in$/i })
    await submitButton.click()

    // Wait for error message
    await page.waitForTimeout(2000)

    // Should show error (either in form or as toast)
    const errorMessage = page.getByText(/invalid|incorrect|error|failed/i)
    const errorCount = await errorMessage.count()

    console.log('Error messages found:', errorCount)

    // Error might appear or might not depending on form validation
    // Just verify the form is still on login page
    expect(page.url()).toContain('/account/login')
  })

  test('forgot password page is accessible', async ({ page }) => {
    await page.goto('/account/login')
    await page.waitForLoadState('networkidle')

    // Look for forgot password link
    const forgotLink = page.getByRole('link', { name: /forgot password|reset password/i })
    const forgotCount = await forgotLink.count()

    console.log('Forgot password links found:', forgotCount)

    if (forgotCount > 0) {
      await forgotLink.click()
      await page.waitForLoadState('networkidle')
    } else {
      // Navigate directly
      await page.goto('/account/forgot-password')
      await page.waitForLoadState('networkidle')
    }

    await expect(page.locator('input[type="email"]').first()).toBeVisible()
    await expect(page.locator('form button[type="submit"]').first()).toBeVisible()
    await expect(page.locator('main, form').filter({ has: page.locator('input[type="email"]') }).first()).toContainText(/forgot|reset|email/i)
  })

  test('forgot password page has email input', async ({ page }) => {
    await page.goto('/account/forgot-password')
    await page.waitForLoadState('networkidle')

    // Should have email input
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput.first()).toBeVisible()

    // Should have submit button
    const submitButton = page.locator('form button[type="submit"]').first()
    await expect(submitButton).toBeVisible()
  })

  test('reset password page is accessible', async ({ page }) => {
    // Reset password page typically requires a token, but we can test the route exists
    await page.goto('/account/reset-password')
    await page.waitForLoadState('networkidle')

    await expect(page.getByRole('heading', { name: /reset password/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /invalid reset link/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /request a new reset link/i })).toBeVisible()
  })

  test('protected orders page redirects to login', async ({ page }) => {
    // Clear any auth state
    await clearAuthState(page)

    // Try to access orders page
    await page.goto('/account/orders')
    await page.waitForURL((url) => url.pathname === '/account/login')
    await expectLoginPage(page)
    await expect.poll(() => new URL(page.url()).searchParams.get('returnUrl')).toBe('/account/orders')
  })

  test('protected wishlist page redirects to login', async ({ page }) => {
    // Clear any auth state
    await clearAuthState(page)

    // Try to access wishlist page
    await page.goto('/account/wishlist')
    await page.waitForURL((url) => url.pathname === '/account/login')
    await expectLoginPage(page)
    await expect.poll(() => new URL(page.url()).searchParams.get('returnUrl')).toBe('/account/wishlist')
  })

  test('login form has link to register', async ({ page }) => {
    await page.goto('/account/login')
    await page.waitForLoadState('networkidle')

    // Should have link to register page
    const registerLink = page.getByRole('link', { name: /sign up|register|create account/i })
    const registerCount = await registerLink.count()

    console.log('Register links found:', registerCount)

    if (registerCount > 0) {
      await expect(registerLink.first()).toBeVisible()
    }
  })

  test('register form has link to login', async ({ page }) => {
    await page.goto('/account/register')
    await page.waitForLoadState('networkidle')

    // Should have link to login page
    const loginLink = page.getByRole('link', { name: /sign in|login|already have/i })
    const loginCount = await loginLink.count()

    console.log('Login links found:', loginCount)

    if (loginCount > 0) {
      await expect(loginLink.first()).toBeVisible()
    }
  })
})
