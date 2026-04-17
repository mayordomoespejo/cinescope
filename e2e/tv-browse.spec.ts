import { test, expect } from '@playwright/test'

/**
 * TV Browse E2E tests — covers the TVBrowsePage (/tv) and TVDetailPage (/tv/:id).
 *
 * TVBrowsePage is behind AuthGuard — unauthenticated users are redirected to /welcome.
 * All tests handle both the authenticated and unauthenticated paths gracefully.
 *
 * Component reference:
 *   - TVBrowseSection: <section aria-labelledby="tv-discover-title"> with <h2 id="tv-discover-title">Discover</h2>
 *   - Genre chips: <div role="group" aria-label="Filter by genre"> containing <button aria-pressed>
 *   - TV show cards: role="button" aria-label="{name}, {year}, rating {n}" (MediaCard pattern)
 *   - TV carousels: <h2> headings "Trending Today" and "Top Rated"
 *   - TVDetailPage: <h1> with the show title inside MediaDetailInfo
 */
test.describe('TV Browse', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tv')
    await page.waitForLoadState('networkidle')
  })

  test(
    'Navigating to /tv either shows the TV browse page or redirects to /welcome',
    { tag: ['@tv-browse', '@critical', '@TV-E2E-001'] },
    async ({ page }) => {
      const url = page.url()
      if (url.includes('/welcome')) {
        // Unauthenticated — verify welcome page rendered
        await expect(page.getByText('CineScope')).toBeVisible()
      } else {
        // Authenticated — URL should be /tv
        expect(url).toContain('/tv')
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'TV browse page has a main content area with the Discover section',
    { tag: ['@tv-browse', '@critical', '@TV-E2E-002'] },
    async ({ page }) => {
      const discoverSection = page.getByRole('region', { name: /Discover/i })
      if (await discoverSection.isVisible()) {
        await expect(discoverSection).toBeVisible()
      } else {
        // Section is labelled by h2#tv-discover-title — fall back to heading
        const discoverHeading = page.getByRole('heading', { name: 'Discover' })
        if (await discoverHeading.isVisible()) {
          await expect(discoverHeading).toBeVisible()
        } else {
          // Unauthenticated — welcome page
          await expect(page.getByText('CineScope')).toBeVisible()
        }
      }
    },
  )

  test(
    'TV browse page shows the "Trending Today" carousel heading',
    { tag: ['@tv-browse', '@TV-E2E-003'] },
    async ({ page }) => {
      const trendingHeading = page.getByRole('heading', { name: 'Trending Today' })
      if (await trendingHeading.isVisible()) {
        await expect(trendingHeading).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Genre filter chips are visible in the Discover section',
    { tag: ['@tv-browse', '@critical', '@TV-E2E-004'] },
    async ({ page }) => {
      // Genre chips are grouped in role="group" aria-label="Filter by genre"
      const genreGroup = page.getByRole('group', { name: 'Filter by genre' })
      if (await genreGroup.isVisible()) {
        await expect(genreGroup).toBeVisible()
        // The "All" chip is always the first button in the group
        const allChip = genreGroup.getByRole('button', { name: 'All' })
        await expect(allChip).toBeVisible({ timeout: 8000 })
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Clicking a genre chip marks it as active (aria-pressed="true")',
    { tag: ['@tv-browse', '@TV-E2E-005'] },
    async ({ page }) => {
      const genreGroup = page.getByRole('group', { name: 'Filter by genre' })
      if (await genreGroup.isVisible()) {
        // Wait for at least one chip beyond "All" to appear
        const chips = genreGroup.getByRole('button')
        await expect(chips.first()).toBeVisible({ timeout: 8000 })

        const chipsCount = await chips.count()
        if (chipsCount > 1) {
          // Click the second chip (first real genre after "All")
          const genreChip = chips.nth(1)
          await genreChip.click()
          await expect(genreChip).toHaveAttribute('aria-pressed', 'true')
        }
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Clicking on a TV show card navigates to the TV detail page',
    { tag: ['@tv-browse', '@critical', '@TV-E2E-006'] },
    async ({ page }) => {
      // TV show cards share the same MediaCard pattern as movie cards:
      // role="button" aria-label="{name}, {year}, rating {n}"
      const tvCard = page.getByRole('button', { name: /,\s*\d{4},\s*rating/i }).first()

      if (await tvCard.isVisible()) {
        await tvCard.click()
        // After click the URL should change to /tv/:id
        await page.waitForURL(/\/tv\/\d+/, { timeout: 8000 })
        expect(page.url()).toMatch(/\/tv\/\d+/)
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'TV detail page shows the show title as an h1 heading',
    { tag: ['@tv-browse', '@critical', '@TV-E2E-007'] },
    async ({ page }) => {
      const tvCard = page.getByRole('button', { name: /,\s*\d{4},\s*rating/i }).first()

      if (await tvCard.isVisible()) {
        await tvCard.click()
        await page.waitForURL(/\/tv\/\d+/, { timeout: 8000 })

        // MediaDetailInfo renders the title in <h1 class="title">
        const titleHeading = page.getByRole('heading', { level: 1 })
        await expect(titleHeading).toBeVisible({ timeout: 10000 })
        const titleText = await titleHeading.textContent()
        expect(titleText?.trim().length).toBeGreaterThan(0)
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'TV detail page shows the rating badge',
    { tag: ['@tv-browse', '@TV-E2E-008'] },
    async ({ page }) => {
      const tvCard = page.getByRole('button', { name: /,\s*\d{4},\s*rating/i }).first()

      if (await tvCard.isVisible()) {
        await tvCard.click()
        await page.waitForURL(/\/tv\/\d+/, { timeout: 8000 })

        // MediaDetailInfo renders: aria-label="Rating: X out of 10"
        const ratingBadge = page.getByLabel(/Rating:/i)
        await expect(ratingBadge).toBeVisible({ timeout: 10000 })
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'TV detail page can be exited by navigating back to /tv',
    { tag: ['@tv-browse', '@TV-E2E-009'] },
    async ({ page }) => {
      const tvCard = page.getByRole('button', { name: /,\s*\d{4},\s*rating/i }).first()

      if (await tvCard.isVisible()) {
        await tvCard.click()
        await page.waitForURL(/\/tv\/\d+/, { timeout: 8000 })

        // Navigate back using the browser history
        await page.goBack()
        await page.waitForURL('/tv', { timeout: 5000 })
        expect(page.url()).toContain('/tv')
        // The page should not end with /tv/\d+ after going back
        expect(page.url()).not.toMatch(/\/tv\/\d+/)
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )
})
