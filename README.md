# CineScope

> Discover, explore, and track movies and TV shows — powered by the TMDB API.

---

## Features

- **Movie discovery** — trending (daily/weekly), top-rated, and a filterable discover grid
- **TV show discovery** — trending, top-rated, and a filterable discover grid for TV
- **Detail pages** — movie and TV show detail pages with trailer, cast, recommendations, and extra metadata
- **Person pages** — actor/director bio, profile photo, and full filmography
- **Search** — debounced search (400 ms) across movies and TV shows with localStorage history
- **Advanced filters** — genre, sort order (popularity, rating, release date, revenue), minimum rating slider, release year, and language
- **Favorites & Watchlist** — add/remove movies; drag-and-drop reorder; persisted locally via localStorage
- **Watch history** — mark movies and TV shows as watched; full history page with timestamps; persisted locally via localStorage
- **Custom lists** — create, rename, and delete lists; add/remove any movie or TV show; persisted locally via localStorage
- **User profile** — personal stats, full watch history, and data management
- **Dark / light theme** — toggled via a single `data-theme` attribute, follows system preference, persisted in localStorage
- **Responsive design** — mobile-first layout that scales from phones to wide desktops
- **Performance** — prefetch on card hover/focus, skeleton loaders, lazy images with `srcSet`
- **Accessibility** — focus trap in modals, `aria-*` labels, keyboard navigation (`/` focuses search, `Esc` closes modal)

---

## Tech Stack

| Layer         | Technology                                          |
| ------------- | --------------------------------------------------- |
| Framework     | React 19 + TypeScript 5                             |
| Build         | Vite 7                                              |
| Routing       | React Router v7                                     |
| Data fetching | TanStack Query v5                                   |
| State         | Zustand 5 (with `persist` middleware)               |
| Styling       | CSS Modules + CSS custom properties (design tokens) |
| Data          | TMDB API v4                                         |
| UI primitives | Radix UI (Dialog, Tabs, Dropdown, Select, Tooltip)  |
| Animations    | Framer Motion                                       |
| Drag & Drop   | dnd-kit                                             |
| Unit tests    | Vitest + Testing Library                            |
| E2E tests     | Playwright                                          |
| Lint / format | ESLint + Prettier                                   |
| Git hooks     | Husky + lint-staged                                 |
| Deploy        | Vercel                                              |

---

## Project Structure

```
src/
├── app/              # Router definition and app shell
├── assets/           # Static assets (images, icons)
├── components/
│   └── ui/           # Shared UI components (Layout, Navbar, Button, Skeleton, etc.)
├── features/         # Domain-specific logic, co-located by feature
│   ├── profile/      # Profile stats and data-clearing components
│   ├── favorites/    # Favorites + watchlist Zustand store and components
│   ├── filters/      # Filter/sort UI and logic
│   ├── lists/        # Custom user lists with drag-and-drop
│   ├── movies/       # Movie data fetching and components
│   ├── tv/           # TV show data fetching and components
│   └── watched/      # Watched history Zustand store and components
├── hooks/            # Shared custom hooks
├── lib/              # Config, types, helpers
├── pages/            # Route-level page components
├── styles/           # Global styles and design tokens (variables.css)
└── tests/            # Unit and integration tests
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [TMDB API](https://www.themoviedb.org/settings/api) account (v4 Read Access Token)

### Clone and install

```bash
git clone https://github.com/your-username/cinescope.git
cd cinescope
npm install
```

### Environment variables

Copy `.env.example` to `.env` and fill in the value:

```env
# TMDB — https://www.themoviedb.org/settings/api
VITE_TMDB_ACCESS_TOKEN=        # v4 Read Access Token
```

| Variable                 | Description                   |
| ------------------------ | ----------------------------- |
| `VITE_TMDB_ACCESS_TOKEN` | TMDB API v4 Read Access Token |

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

To create a production build:

```bash
npm run build
npm run preview
```

---

## Architecture

### Data flow

```
Browser
  │
  └─ TMDB API (direct, client-side, read-only)
       Movie/TV metadata, images, search results
```

TanStack Query manages all remote state — caching, background refetching, and loading/error states.

### Local persistence

Favorites, watchlist, watched history, and custom lists are stored entirely in **localStorage** via Zustand's `persist` middleware. No backend or authentication required.

| Store key             | Data                            |
| --------------------- | ------------------------------- |
| `cinescope-favorites` | Favorites list and watchlist    |
| `cinescope-watched`   | Watched history with timestamps |
| `cinescope-lists`     | Custom lists and their items    |

---

## Available Scripts

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `npm run dev`           | Start the Vite development server    |
| `npm run build`         | Type-check and build for production  |
| `npm run preview`       | Preview the production build locally |
| `npm run lint`          | Run ESLint                           |
| `npm run lint:fix`      | Run ESLint with auto-fix             |
| `npm run format`        | Format all files with Prettier       |
| `npm run format:check`  | Check formatting without writing     |
| `npm run test`          | Run unit tests with Vitest           |
| `npm run test:watch`    | Run unit tests in watch mode         |
| `npm run test:coverage` | Generate test coverage report        |
| `npm run test:e2e`      | Run Playwright end-to-end tests      |

---

## Design System

Styles use CSS Modules for component-level encapsulation paired with a global set of CSS custom properties defined in `src/styles/variables.css`.

**Theming:** dark mode is the default. Light mode is activated by setting `data-theme="light"` on the root element — all color, shadow, and surface tokens are overridden at that selector with no JavaScript logic required inside components.

**Token categories:**

| Category      | Examples                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------- |
| Colors        | `--color-bg`, `--color-accent` (`#e8a838`), `--color-text-primary`, `--color-surface`    |
| Typography    | `--font-family` (Inter), `--font-size-xs` through `--font-size-hero`, `--font-weight-*`  |
| Spacing       | `--space-1` through `--space-24` (4 px base unit)                                        |
| Border radius | `--radius-xs` through `--radius-full`                                                    |
| Shadows       | `--shadow-sm` through `--shadow-xl`                                                      |
| Transitions   | `--transition-fast` (120 ms), `--transition-base` (220 ms), `--transition-slow` (380 ms) |
| Layout        | `--navbar-height` (64 px), `--max-width` (1400 px), `--content-padding`                  |
| Z-index       | `--z-base` through `--z-toast`                                                           |

---

## Demo

[https://cinescope-blush.vercel.app](https://cinescope-blush.vercel.app)

---

## License

MIT
