import { test, expect } from '@playwright/test'

test.describe('CineScope Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows the navbar with CineScope logo', async ({ page }) => {
    await expect(page.getByText('CineScope')).toBeVisible()
  })

  test('has a search input', async ({ page }) => {
    const searchInput = page.getByRole('searchbox')
    await expect(searchInput).toBeVisible()
  })

  test('has navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Home' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Favorites' })).toBeVisible()
  })

  test('focuses search on "/" keypress', async ({ page }) => {
    await page.keyboard.press('/')
    const searchInput = page.getByRole('searchbox')
    await expect(searchInput).toBeFocused()
  })

  test('navigates to favorites page', async ({ page }) => {
    await page.getByRole('link', { name: 'Favorites' }).click()
    await expect(page).toHaveURL('/favorites')
    await expect(page.getByText('My Favorites')).toBeVisible()
  })

  test('shows search results when typing', async ({ page }) => {
    const searchInput = page.getByRole('searchbox')
    await searchInput.fill('Batman')
    await page.waitForURL(/\?q=Batman/, { timeout: 5000 })
    await expect(page.getByText(/Results for/i)).toBeVisible({ timeout: 5000 })
  })

  test('theme toggle button is present', async ({ page }) => {
    const themeBtn = page.getByRole('button', { name: /Switch to/i })
    await expect(themeBtn).toBeVisible()
  })
})
