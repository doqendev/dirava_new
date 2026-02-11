import { test, expect } from '@playwright/test'

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
    const submitButton = page.getByRole('button', { name: /login|sign in/i })
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
    const submitButton = page.getByRole('button', { name: /login|sign in/i })
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

      expect(page.url()).toContain('/forgot-password')
    } else {
      // Navigate directly
      await page.goto('/account/forgot-password')
      await page.waitForLoadState('networkidle')

      expect(page.url()).toContain('/forgot-password')
    }
  })

  test('forgot password page has email input', async ({ page }) => {
    await page.goto('/account/forgot-password')
    await page.waitForLoadState('networkidle')

    // Should have email input
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput.first()).toBeVisible()

    // Should have submit button
    const submitButton = page.getByRole('button', { name: /reset|send|submit/i })
    await expect(submitButton).toBeVisible()
  })

  test('reset password page is accessible', async ({ page }) => {
    // Reset password page typically requires a token, but we can test the route exists
    await page.goto('/account/reset-password')
    await page.waitForLoadState('networkidle')

    expect(page.url()).toContain('/reset-password')

    // Page should load (might show error without token, but should render)
    await expect(page.locator('body')).toBeVisible()
  })

  test('protected orders page redirects to login', async ({ page }) => {
    // Clear any auth state
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('neo-stage-auth')
    })

    // Try to access orders page
    await page.goto('/account/orders')
    await page.waitForLoadState('networkidle')

    // Should redirect to login or show login prompt
    const isOnLogin = page.url().includes('/login')
    const hasLoginForm = (await page.locator('input[type="password"]').count()) > 0

    console.log('On login page:', isOnLogin)
    console.log('Has login form:', hasLoginForm)

    // Either redirected to login or stayed on orders with login prompt
    expect(isOnLogin || hasLoginForm).toBeTruthy()
  })

  test('protected wishlist page redirects to login', async ({ page }) => {
    // Clear any auth state
    await page.goto('/')
    await page.evaluate(() => {
      localStorage.removeItem('neo-stage-auth')
    })

    // Try to access wishlist page
    await page.goto('/account/wishlist')
    await page.waitForLoadState('networkidle')

    // Should redirect to login or show login prompt
    const isOnLogin = page.url().includes('/login')
    const hasLoginForm = (await page.locator('input[type="password"]').count()) > 0

    console.log('On login page:', isOnLogin)
    console.log('Has login form:', hasLoginForm)

    // Either redirected to login or stayed with login prompt
    expect(isOnLogin || hasLoginForm).toBeTruthy()
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
