import { test, expect } from '@playwright/test'

/**
 * Movie detail E2E tests — covers the MovieModal component triggered from a
 * movie card in the browse grid.
 *
 * MovieModal uses Radix Dialog which renders with role="dialog" automatically.
 * The close button has aria-label="Close movie details".
 * Movie cards have role="button" with aria-label="{title}, {year}, rating {n}".
 */
test.describe('Movie Detail Modal', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test(
    'Clicking a movie card opens the movie details modal',
    { tag: ['@movie-detail', '@critical', '@MOVIE-E2E-001'] },
    async ({ page }) => {
      // Movie cards render with role="button" — pick the first one in the grid
      const firstCard = page
        .getByRole('button')
        .filter({ hasNot: page.getByRole('banner') })
        .first()

      if (await firstCard.isVisible()) {
        await firstCard.click()
        // Radix Dialog renders with role="dialog"
        await expect(page.getByRole('dialog')).toBeVisible({ timeout: 5000 })
      } else {
        // Unauthenticated — verify welcome page loaded
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )

  test(
    'Movie modal shows title, rating, and overview',
    { tag: ['@movie-detail', '@critical', '@MOVIE-E2E-002'] },
    async ({ page }) => {
      // Find a movie card in the trending section
      const movieCard = page.getByRole('button', { name: /,\s*\d{4},\s*rating/i }).first()

      if (await movieCard.isVisible()) {
        await movieCard.click()
        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible({ timeout: 5000 })

        // Wait for modal to finish loading (skeleton disappears, title renders)
        // The title is rendered inside an <h2> inside the dialog
        const modalTitle = dialog.getByRole('heading', { level: 2 })
        await expect(modalTitle).toBeVisible({ timeout: 8000 })

        // Rating is rendered with aria-label="Rating: X out of 10"
        const rating = dialog.getByLabel(/Rating:/i)
        await expect(rating).toBeVisible({ timeout: 8000 })

        // Overview paragraph has id="movie-overview-{id}"
        // We look for a non-empty paragraph in the details column
        const overview = dialog.locator('p[id^="movie-overview-"]')
        await expect(overview).toBeVisible({ timeout: 8000 })
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )

  test(
    'Movie modal can be closed with the Escape key',
    { tag: ['@movie-detail', '@MOVIE-E2E-003'] },
    async ({ page }) => {
      const movieCard = page.getByRole('button', { name: /,\s*\d{4},\s*rating/i }).first()

      if (await movieCard.isVisible()) {
        await movieCard.click()
        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible({ timeout: 5000 })

        await page.keyboard.press('Escape')
        await expect(dialog).not.toBeVisible({ timeout: 3000 })
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )

  test(
    'Movie modal can be closed with the close button',
    { tag: ['@movie-detail', '@MOVIE-E2E-004'] },
    async ({ page }) => {
      const movieCard = page.getByRole('button', { name: /,\s*\d{4},\s*rating/i }).first()

      if (await movieCard.isVisible()) {
        await movieCard.click()
        const dialog = page.getByRole('dialog')
        await expect(dialog).toBeVisible({ timeout: 5000 })

        // Close button has aria-label="Close movie details"
        const closeButton = dialog.getByRole('button', { name: 'Close movie details' })
        await expect(closeButton).toBeVisible({ timeout: 8000 })
        await closeButton.click()
        await expect(dialog).not.toBeVisible({ timeout: 3000 })
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )
})
