# CineScope

Movie discovery app backed by the TMDB API with a dark UI, carousels, search, and a favorites watchlist.

---

## Stack

| Layer         | Technology                                 |
| ------------- | ------------------------------------------ |
| Framework     | React 19 + TypeScript 5.9                  |
| Build         | Vite 7                                     |
| Routing       | React Router v7                            |
| Data fetching | TanStack Query v5                          |
| Styles        | CSS Modules + CSS variables                |
| UI primitives | Radix UI (Dialog, Tabs, Dropdown, Tooltip) |
| Animations    | Framer Motion                              |
| Drag and drop | dnd-kit                                    |
| Unit tests    | Vitest + Testing Library                   |
| E2E tests     | Playwright                                 |
| Lint / format | ESLint + Prettier                          |
| Git hooks     | Husky + lint-staged                        |
| Deploy        | Vercel                                     |

---

## Demo

[https://cinescope-blush.vercel.app](https://cinescope-blush.vercel.app)

---

## Features

- Hero section showing the current trending movie with backdrop and metadata
- Horizontal carousels for Trending and Top Rated movies
- Paginated discover grid filterable by genre and sortable by popularity, rating, release date, or revenue
- Debounced search (400 ms) with result count and localStorage search history
- Movie modal with poster, backdrop, overview, runtime, rating, genres, budget/revenue, and embedded YouTube trailer
- URL-driven modal state (`?movieId=123`) for shareable and bookmarkable links
- Favorites and watchlist persisted in localStorage with a dedicated page
- Drag-and-drop reordering of favorites
- Skeleton loaders for cards, hero, and modal
- Dark/light mode toggled via a single `data-theme` attribute, persisted in localStorage
- Prefetch on card hover for instant modal open
- Keyboard navigation: `/` focuses search, `Esc` closes the modal
- Accessible modal with focus trap and `aria-*` labels
- Responsive mobile-first layout

---

## Getting started

Clone the repository:

```bash
git clone https://github.com/your-username/cinescope.git
cd cinescope
```

Install dependencies:

```bash
npm install
```

Copy the environment file and add your TMDB token:

```bash
cp .env.example .env
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Environment variables

| Variable                 | Description                              |
| ------------------------ | ---------------------------------------- |
| `VITE_TMDB_ACCESS_TOKEN` | TMDB API v4 Read Access Token (required) |

Get a token at [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api).

---

## Scripts

| Command                 | Description                  |
| ----------------------- | ---------------------------- |
| `npm run dev`           | Start dev server             |
| `npm run build`         | Production build             |
| `npm run preview`       | Preview production build     |
| `npm run lint`          | Run ESLint                   |
| `npm run lint:fix`      | Run ESLint with auto-fix     |
| `npm run format`        | Format with Prettier         |
| `npm run format:check`  | Check formatting             |
| `npm test`              | Run unit tests               |
| `npm run test:watch`    | Run unit tests in watch mode |
| `npm run test:coverage` | Generate coverage report     |
| `npm run test:e2e`      | Run Playwright E2E tests     |

---

## License

MIT
