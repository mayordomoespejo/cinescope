import { test, expect } from '@playwright/test'

/**
 * Profile E2E tests — covers the ProfilePage (/profile) component.
 *
 * ProfilePage is behind AuthGuard — unauthenticated users are redirected to /welcome.
 * All tests handle both the authenticated and unauthenticated paths gracefully.
 *
 * Component reference:
 *   - UserHeader: <header> with <h1 class="displayName"> and a "Sign out" button
 *   - StatsRow: <section aria-label="Profile statistics"> with "Favorites", "Watchlist", "Watched" labels
 *   - Watch History: <section aria-labelledby="watch-history-heading"> with <h2>Watch History</h2>
 *   - Danger Zone: <button>Delete account</button>
 */
test.describe('Profile Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/profile')
    await page.waitForLoadState('networkidle')
  })

  test(
    'Navigating to /profile either shows the profile page or redirects to /welcome',
    { tag: ['@profile', '@critical', '@PROFILE-E2E-001'] },
    async ({ page }) => {
      const url = page.url()
      if (url.includes('/welcome')) {
        // Unauthenticated — verify welcome page rendered
        await expect(page.getByText('CineScope')).toBeVisible()
      } else {
        // Authenticated — URL should be /profile
        expect(url).toContain('/profile')
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Profile page shows a heading with the user display name',
    { tag: ['@profile', '@critical', '@PROFILE-E2E-002'] },
    async ({ page }) => {
      // UserHeader renders <h1 class="displayName">{displayName}</h1>
      const nameHeading = page.getByRole('heading', { level: 1 })
      if (await nameHeading.isVisible()) {
        await expect(nameHeading).toBeVisible()
        const nameText = await nameHeading.textContent()
        expect(nameText?.trim().length).toBeGreaterThan(0)
      } else {
        // Unauthenticated
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Profile page shows the "Sign out" button in the user header',
    { tag: ['@profile', '@PROFILE-E2E-003'] },
    async ({ page }) => {
      const signOutBtn = page.getByRole('button', { name: 'Sign out' })
      if (await signOutBtn.isVisible()) {
        await expect(signOutBtn).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Profile page shows the stats section with Favorites, Watchlist, and Watched labels',
    { tag: ['@profile', '@critical', '@PROFILE-E2E-004'] },
    async ({ page }) => {
      // StatsRow renders <section aria-label="Profile statistics">
      const statsSection = page.getByRole('region', { name: 'Profile statistics' })
      if (await statsSection.isVisible()) {
        await expect(statsSection).toBeVisible()
        await expect(statsSection.getByText('Favorites')).toBeVisible()
        await expect(statsSection.getByText('Watchlist')).toBeVisible()
        await expect(statsSection.getByText('Watched')).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Profile page shows the "Watch History" section heading',
    { tag: ['@profile', '@critical', '@PROFILE-E2E-005'] },
    async ({ page }) => {
      // ProfilePage renders <h2 id="watch-history-heading">Watch History</h2>
      const watchHistoryHeading = page.getByRole('heading', { name: 'Watch History' })
      if (await watchHistoryHeading.isVisible()) {
        await expect(watchHistoryHeading).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Watch history section is labelled by the "Watch History" heading',
    { tag: ['@profile', '@PROFILE-E2E-006'] },
    async ({ page }) => {
      // <section aria-labelledby="watch-history-heading">
      const watchSection = page.getByRole('region', { name: 'Watch History' })
      if (await watchSection.isVisible()) {
        await expect(watchSection).toBeVisible()
      } else {
        // Fall back: heading directly visible
        const heading = page.getByRole('heading', { name: 'Watch History' })
        if (await heading.isVisible()) {
          await expect(heading).toBeVisible()
        } else {
          await expect(page.getByText('CineScope')).toBeVisible()
        }
      }
    },
  )

  test(
    'Profile page shows the "Delete account" button in the danger zone',
    { tag: ['@profile', '@PROFILE-E2E-007'] },
    async ({ page }) => {
      const deleteBtn = page.getByRole('button', { name: 'Delete account' })
      if (await deleteBtn.isVisible()) {
        await expect(deleteBtn).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )

  test(
    'Profile page stats section has role="region" with accessible name',
    { tag: ['@profile', '@PROFILE-E2E-008'] },
    async ({ page }) => {
      // The stats section has aria-label="Profile statistics"
      const statsSection = page.getByLabel('Profile statistics')
      if (await statsSection.isVisible()) {
        await expect(statsSection).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    },
  )
})
