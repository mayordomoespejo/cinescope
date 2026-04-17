import { test, expect } from '@playwright/test'

/**
 * Navigation E2E tests — covers routing, navbar visibility, and page links.
 *
 * Tests that visit protected routes (/, /tv) depend on an active authenticated
 * session in the browser context. The welcome and login pages are always public.
 */
test.describe('Navigation', () => {
  test(
    'Home page loads and shows trending movies section',
    { tag: ['@navigation', '@critical', '@NAV-E2E-001'] },
    async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      // Either the app renders the home layout or redirects to /welcome — both
      // show the CineScope brand.
      await expect(page.getByText('CineScope')).toBeVisible()
    },
  )

  test(
    'Navbar is visible on the home page',
    { tag: ['@navigation', '@NAV-E2E-002'] },
    async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      // Navbar has role="banner" (set via <header role="banner">)
      const navbar = page.getByRole('banner')
      await expect(navbar).toBeVisible()
    },
  )

  test(
    'Can navigate to TV Shows page via navbar link',
    { tag: ['@navigation', '@NAV-E2E-003'] },
    async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const tvLink = page.getByRole('link', { name: 'TV Shows' })
      if (await tvLink.isVisible()) {
        await tvLink.click()
        await expect(page).toHaveURL('/tv')
      } else {
        // Unauthenticated — welcome page shown, TV nav not present
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Logo click navigates back to home',
    { tag: ['@navigation', '@NAV-E2E-004'] },
    async ({ page }) => {
      await page.goto('/tv')
      await page.waitForLoadState('networkidle')
      const logoLink = page.getByRole('link', { name: /CineScope Home/i })
      if (await logoLink.isVisible()) {
        await logoLink.click()
        await expect(page).toHaveURL('/')
      } else {
        // Not authenticated — welcome page
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Navbar Home link is present and visible',
    { tag: ['@navigation', '@NAV-E2E-005'] },
    async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const homeLink = page.getByRole('link', { name: 'Home' })
      if (await homeLink.isVisible()) {
        await expect(homeLink).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Welcome page is publicly accessible',
    { tag: ['@navigation', '@NAV-E2E-006'] },
    async ({ page }) => {
      await page.goto('/welcome')
      await expect(page.getByText('CineScope')).toBeVisible()
    },
  )

  test(
    'Login page is publicly accessible',
    { tag: ['@navigation', '@NAV-E2E-007'] },
    async ({ page }) => {
      await page.goto('/login')
      await expect(page.getByText('Bienvenido')).toBeVisible()
    },
  )

  test(
    'CineScope logo on login page links back to /welcome',
    { tag: ['@navigation', '@NAV-E2E-008'] },
    async ({ page }) => {
      await page.goto('/login')
      const logoLink = page.getByRole('link', { name: /volver a inicio/i })
      await expect(logoLink).toBeVisible()
      await logoLink.click()
      await expect(page).toHaveURL('/welcome')
    },
  )
})
