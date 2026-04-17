import { test, expect } from '@playwright/test'

/**
 * Auth E2E tests — covers the LoginPage and LoginForm components.
 *
 * All tests use mock / invalid credentials — no real Firebase auth calls are
 * made. Validation tests submit the form without hitting the network.
 *
 * Component reference:
 *   - LoginForm: email input (label "Email"), password input (label "Contraseña")
 *   - Submit button text: "Continuar"
 *   - Google button text: "Continuar con Google"
 *   - Error spans: role="alert" with id="email-error" / "password-error"
 */
test.describe('Auth — Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
  })

  test(
    'Login page renders correctly with all required elements',
    { tag: ['@auth', '@critical', '@AUTH-E2E-001'] },
    async ({ page }) => {
      await expect(page.getByText('Bienvenido')).toBeVisible()
      await expect(page.getByLabel('Email')).toBeVisible()
      await expect(page.getByLabel('Contraseña')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Continuar' })).toBeVisible()
    },
  )

  test(
    'Form validation shows error when email is empty',
    { tag: ['@auth', '@AUTH-E2E-002'] },
    async ({ page }) => {
      // Leave email empty, fill a valid password, and submit
      const passwordInput = page.getByLabel('Contraseña')
      await passwordInput.focus()
      await passwordInput.fill('password123')

      await page.getByRole('button', { name: 'Continuar' }).click()

      // Email validation error appears as role="alert"
      const emailError = page.getByRole('alert').filter({ hasText: /.+/ }).first()
      await expect(emailError).toBeVisible({ timeout: 3000 })
    },
  )

  test(
    'Form validation shows error when password is too short',
    { tag: ['@auth', '@AUTH-E2E-003'] },
    async ({ page }) => {
      await page.getByLabel('Email').fill('test@example.com')

      const passwordInput = page.getByLabel('Contraseña')
      await passwordInput.focus()
      await passwordInput.fill('abc') // Less than 6 characters

      await page.getByRole('button', { name: 'Continuar' }).click()

      // Password error renders with id="password-error" and role="alert"
      const passwordError = page.locator('#password-error')
      await expect(passwordError).toBeVisible({ timeout: 3000 })
    },
  )

  test(
    'Google sign-in button is visible',
    { tag: ['@auth', '@AUTH-E2E-004'] },
    async ({ page }) => {
      const googleButton = page.getByRole('button', { name: /Continuar con Google/i })
      await expect(googleButton).toBeVisible()
    },
  )

  test(
    'Email input accepts text input',
    { tag: ['@auth', '@AUTH-E2E-005'] },
    async ({ page }) => {
      const emailInput = page.getByLabel('Email')
      await emailInput.fill('user@example.com')
      await expect(emailInput).toHaveValue('user@example.com')
    },
  )

  test(
    'Password field is of type password by default (masked)',
    { tag: ['@auth', '@AUTH-E2E-006'] },
    async ({ page }) => {
      const passwordInput = page.getByLabel('Contraseña')
      // Before interaction, the readOnly trick is active — type is still password
      await expect(passwordInput).toHaveAttribute('type', 'password')
    },
  )

  test(
    'Password visibility toggle changes input type to text',
    { tag: ['@auth', '@AUTH-E2E-007'] },
    async ({ page }) => {
      const passwordInput = page.getByLabel('Contraseña')
      // Focus first to clear readOnly state
      await passwordInput.focus()
      await passwordInput.fill('mypassword')

      // Toggle show-password button
      const toggleBtn = page.getByRole('button', { name: /Mostrar contraseña/i })
      await expect(toggleBtn).toBeVisible()
      await toggleBtn.click()

      await expect(passwordInput).toHaveAttribute('type', 'text')
    },
  )
})
