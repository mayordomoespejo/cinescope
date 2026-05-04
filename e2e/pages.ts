import type { Page } from '@playwright/test'

/** Shared locators and actions for the app shell (navbar, search). */
export class AppPage {
  constructor(readonly page: Page) {}

  get logo() {
    return this.page.getByText('CineScope').first()
  }

  get searchInput() {
    return this.page.getByRole('searchbox')
  }

  get navFavoritesLink() {
    return this.page.getByRole('link', { name: 'Favorites' })
  }

  async search(query: string) {
    await this.searchInput.fill(query)
  }
}

/** Locators for media card grids (movies / TV). */
export class MediaGridPage extends AppPage {
  get firstCard() {
    return this.page.getByRole('button', { name: /,\s*\d{4},\s*rating/i }).first()
  }

  get dialog() {
    return this.page.getByRole('dialog')
  }
}

/** Locators for the lists page. */
export class ListsPage extends AppPage {
  get newListButton() {
    return this.page.getByRole('button', { name: '+ New List' })
  }

  get nameInput() {
    return this.page.getByPlaceholder('List name (required)')
  }

  get createButton() {
    return this.page.getByRole('button', { name: 'Create' })
  }

  get dialog() {
    return this.page.getByRole('dialog')
  }
}

/** Locators for the welcome / onboarding page. */
export class WelcomePage extends AppPage {
  get heading() {
    return this.page.getByText('Bienvenido')
  }

  get continueButton() {
    return this.page.getByRole('button', { name: 'Continuar' })
  }
}
