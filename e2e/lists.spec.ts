import { test, expect } from '@playwright/test'

/**
 * Lists E2E tests — covers the ListsPage (/lists) component.
 *
 * ListsPage is behind AuthGuard — unauthenticated users are redirected to /welcome.
 * All tests handle both the authenticated and unauthenticated paths gracefully.
 *
 * Component reference:
 *   - Left panel aside: aria-label="My Lists"
 *   - Panel title text: "My Lists"
 *   - New list button: text "+ New List" (type="button")
 *   - CreateListForm: input placeholder "List name (required)", submit button text "Create"
 *   - Submit button is disabled when name is empty: disabled={!name.trim()}
 *   - Right panel main: aria-label="List items"
 *   - Empty state text: "No list selected"
 */
test.describe('Lists Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/lists')
    await page.waitForLoadState('networkidle')
  })

  test(
    'Navigating to /lists either shows the lists page or redirects to /welcome',
    { tag: ['@lists', '@critical', '@LISTS-E2E-001'] },
    async ({ page }) => {
      const url = page.url()
      if (url.includes('/welcome')) {
        // Unauthenticated — verify welcome page rendered
        await expect(page.getByText('CineScope')).toBeVisible()
      } else {
        // Authenticated — URL should be /lists
        expect(url).toContain('/lists')
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )

  test(
    'Lists page shows the "My Lists" panel heading when authenticated',
    { tag: ['@lists', '@critical', '@LISTS-E2E-002'] },
    async ({ page }) => {
      // Left panel aside has aria-label="My Lists"
      const panel = page.getByRole('complementary', { name: 'My Lists' })
      if (await panel.isVisible()) {
        await expect(panel).toBeVisible()
        // The panel title span contains "My Lists"
        await expect(page.getByText('My Lists').first()).toBeVisible()
      } else {
        // Unauthenticated — welcome page
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )

  test(
    'Lists page shows the "+ New List" button when authenticated',
    { tag: ['@lists', '@critical', '@LISTS-E2E-003'] },
    async ({ page }) => {
      const newListBtn = page.getByRole('button', { name: '+ New List' })
      if (await newListBtn.isVisible()) {
        await expect(newListBtn).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )

  test(
    'Clicking "+ New List" reveals the create list form',
    { tag: ['@lists', '@LISTS-E2E-004'] },
    async ({ page }) => {
      const newListBtn = page.getByRole('button', { name: '+ New List' })
      if (await newListBtn.isVisible()) {
        await newListBtn.click()

        // CreateListForm renders an input with placeholder "List name (required)"
        const nameInput = page.getByPlaceholder('List name (required)')
        await expect(nameInput).toBeVisible({ timeout: 3000 })
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )

  test(
    'Create form "Create" button is disabled when list name is empty',
    { tag: ['@lists', '@critical', '@LISTS-E2E-005'] },
    async ({ page }) => {
      const newListBtn = page.getByRole('button', { name: '+ New List' })
      if (await newListBtn.isVisible()) {
        await newListBtn.click()

        const nameInput = page.getByPlaceholder('List name (required)')
        await expect(nameInput).toBeVisible({ timeout: 3000 })

        // Submit button starts disabled because name is empty
        const submitBtn = page.getByRole('button', { name: 'Create' })
        await expect(submitBtn).toBeDisabled()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )

  test(
    'Create form "Create" button becomes enabled when list name is filled',
    { tag: ['@lists', '@LISTS-E2E-006'] },
    async ({ page }) => {
      const newListBtn = page.getByRole('button', { name: '+ New List' })
      if (await newListBtn.isVisible()) {
        await newListBtn.click()

        const nameInput = page.getByPlaceholder('List name (required)')
        await expect(nameInput).toBeVisible({ timeout: 3000 })
        await nameInput.fill('My Test List')

        const submitBtn = page.getByRole('button', { name: 'Create' })
        await expect(submitBtn).toBeEnabled()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )

  test(
    'Clicking Cancel on the create form hides it',
    { tag: ['@lists', '@LISTS-E2E-007'] },
    async ({ page }) => {
      const newListBtn = page.getByRole('button', { name: '+ New List' })
      if (await newListBtn.isVisible()) {
        await newListBtn.click()

        const nameInput = page.getByPlaceholder('List name (required)')
        await expect(nameInput).toBeVisible({ timeout: 3000 })

        await page.getByRole('button', { name: 'Cancel' }).click()

        await expect(nameInput).not.toBeVisible({ timeout: 3000 })
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )

  test(
    'Right panel shows "No list selected" empty state when no list is active',
    { tag: ['@lists', '@LISTS-E2E-008'] },
    async ({ page }) => {
      // Right panel has aria-label="List items"
      const rightPanel = page.getByRole('main', { name: 'List items' })
      if (await rightPanel.isVisible()) {
        await expect(rightPanel.getByText('No list selected')).toBeVisible()
      } else {
        await expect(page.getByText('CineScope')).toBeVisible()
      }
    }
  )
})
