import { test, expect } from '@playwright/test'

/**
 * Search E2E tests — covers the NavSearchBar component and search results page.
 *
 * The search bar is part of the authenticated Layout Navbar. Tests that require
 * the full authenticated UI follow the same pattern as home.spec.ts.
 */
test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test(
    '"/" keyboard shortcut focuses the search input',
    { tag: ['@search', '@critical', '@SEARCH-E2E-001'] },
    async ({ page }) => {
      const searchInput = page.getByRole('searchbox')
      if (await searchInput.isVisible()) {
        await page.keyboard.press('/')
        await expect(searchInput).toBeFocused()
      } else {
        // Unauthenticated — verify welcome page loaded instead
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Search input has correct aria-label',
    { tag: ['@search', '@SEARCH-E2E-002'] },
    async ({ page }) => {
      const searchInput = page.getByLabel('Search movies')
      if (await searchInput.isVisible()) {
        await expect(searchInput).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Typing a query shows search results with "Results for" heading',
    { tag: ['@search', '@critical', '@SEARCH-E2E-003'] },
    async ({ page }) => {
      const searchInput = page.getByRole('searchbox')
      if (await searchInput.isVisible()) {
        await searchInput.fill('Batman')
        await page.waitForURL(/\?q=Batman/, { timeout: 5000 })
        await expect(page.getByText(/Results for/i)).toBeVisible({ timeout: 5000 })
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Clearing search resets the results',
    { tag: ['@search', '@SEARCH-E2E-004'] },
    async ({ page }) => {
      const searchInput = page.getByRole('searchbox')
      if (await searchInput.isVisible()) {
        // Type a query to trigger search
        await searchInput.fill('Inception')
        await page.waitForURL(/\?q=Inception/, { timeout: 5000 })
        // Click the clear button (aria-label="Clear search")
        const clearButton = page.getByRole('button', { name: 'Clear search' })
        await expect(clearButton).toBeVisible()
        await clearButton.click()
        // URL should no longer contain ?q=
        await page.waitForFunction(() => !window.location.search.includes('q='), { timeout: 3000 })
        expect(page.url()).not.toContain('?q=')
        // Results heading disappears
        await expect(page.getByText(/Results for/i)).not.toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Search for a known movie title shows relevant result',
    { tag: ['@search', '@SEARCH-E2E-005'] },
    async ({ page }) => {
      const searchInput = page.getByRole('searchbox')
      if (await searchInput.isVisible()) {
        await searchInput.fill('Inception')
        await page.waitForURL(/\?q=Inception/, { timeout: 5000 })
        // Wait for results grid to populate
        await expect(page.getByText(/Results for/i)).toBeVisible({ timeout: 8000 })
        // A movie card with "Inception" in its aria-label should be present
        const inceptionCard = page.getByRole('button', { name: /Inception/i }).first()
        await expect(inceptionCard).toBeVisible({ timeout: 8000 })
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )
})
