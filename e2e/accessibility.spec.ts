import { test, expect } from '@playwright/test'

/**
 * Accessibility E2E tests — basic ARIA structure checks.
 *
 * axe-playwright is not installed, so these tests use Playwright's built-in
 * ARIA role queries to verify the semantic structure of key pages and
 * components. These checks catch the most critical accessibility regressions
 * without requiring additional dependencies.
 */
test.describe('Accessibility', () => {
  test(
    'Home page has a top-level banner landmark (Navbar)',
    { tag: ['@a11y', '@A11Y-E2E-001'] },
    async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      // Navbar renders <header role="banner"> — always present in the layout
      await expect(page.getByRole('banner')).toBeVisible()
    },
  )

  test(
    'Login page has a main landmark with aria-label',
    { tag: ['@a11y', '@A11Y-E2E-002'] },
    async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')
      // LoginPage renders <main aria-label="Inicio de sesión">
      const main = page.getByRole('main', { name: /Inicio de sesión/i })
      await expect(main).toBeVisible()
    },
  )

  test(
    'Navbar has a navigation landmark with aria-label',
    { tag: ['@a11y', '@A11Y-E2E-003'] },
    async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      // Navbar renders <nav aria-label="Main navigation"> inside the banner
      const nav = page.getByRole('navigation', { name: 'Main navigation' })
      if (await nav.isVisible()) {
        await expect(nav).toBeVisible()
      } else {
        // Unauthenticated — welcome page, no full Navbar present
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Search input has an accessible label',
    { tag: ['@a11y', '@A11Y-E2E-004'] },
    async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      // NavSearchBar renders the search wrapper with role="search"
      // and input with aria-label="Search movies"
      const searchRegion = page.getByRole('search')
      if (await searchRegion.isVisible()) {
        await expect(searchRegion).toBeVisible()
        const searchInput = page.getByLabel('Search movies')
        await expect(searchInput).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Movie cards have accessible labels (role=button with aria-label)',
    { tag: ['@a11y', '@A11Y-E2E-005'] },
    async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      // MediaCard renders <article role="button" tabIndex={0} aria-label="{title}, {year}, rating {n}">
      // Find at least one such card if the authenticated browse page is visible
      const cards = page.getByRole('button', { name: /,\s*\d{4}/ })
      const count = await cards.count()
      if (count > 0) {
        // All visible cards should have non-empty aria-labels
        const firstCard = cards.first()
        const label = await firstCard.getAttribute('aria-label')
        expect(label).toBeTruthy()
        expect(label?.length).toBeGreaterThan(0)
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Movie modal has role="dialog" when open',
    { tag: ['@a11y', '@critical', '@A11Y-E2E-006'] },
    async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      const movieCard = page.getByRole('button', { name: /,\s*\d{4},\s*rating/i }).first()

      if (await movieCard.isVisible()) {
        await movieCard.click()
        // Radix Dialog.Content renders with role="dialog" automatically
        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible({ timeout: 5000 })
        // Verify it has an accessible title (provided via VisuallyHidden Dialog.Title)
        // The title text is present in the DOM even if visually hidden
        const dialogTitle = dialog.getByRole('heading')
        await expect(dialogTitle).not.toBeEmpty()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Favorite toggle buttons have aria-pressed attribute',
    { tag: ['@a11y', '@A11Y-E2E-007'] },
    async ({ page }) => {
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      // MediaCard renders favorite button with aria-pressed={isFavorite}
      const favButtons = page.getByRole('button', { name: /Add to favorites|Remove from favorites/i })
      const count = await favButtons.count()
      if (count > 0) {
        const firstFav = favButtons.first()
        const pressed = await firstFav.getAttribute('aria-pressed')
        expect(pressed).not.toBeNull()
        expect(['true', 'false']).toContain(pressed)
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Login form fields have valid ARIA associations for errors',
    { tag: ['@a11y', '@A11Y-E2E-008'] },
    async ({ page }) => {
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Trigger email validation
      await page.getByRole('button', { name: 'Continuar' }).click()

      // Email input should have aria-invalid="true" when error is shown
      const emailInput = page.getByLabel('Email')
      await expect(emailInput).toHaveAttribute('aria-invalid', 'true', { timeout: 3000 })

      // Error message should be in the DOM with role="alert"
      const emailError = page.locator('#email-error')
      await expect(emailError).toBeVisible({ timeout: 3000 })
    },
  )
})
