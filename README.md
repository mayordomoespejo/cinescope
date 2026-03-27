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
- **Favorites & Watchlist** — add/remove movies; drag-and-drop reorder; persisted in localStorage with Supabase cloud sync
- **Watch history** — mark movies and TV shows as watched; full history page with timestamps
- **User ratings** — 1–10 star ratings with optional notes; stored in Supabase
- **Custom lists** — create, rename, and delete lists; add/remove any movie or TV show; managed in Supabase
- **User profile** — personal stats, full watch history, and ratings overview
- **Firebase authentication** — email + password (sign up or sign in in one step) and Google OAuth
- **Dark / light theme** — toggled via a single `data-theme` attribute, follows system preference, persisted in localStorage
- **Responsive design** — mobile-first layout that scales from phones to wide desktops
- **Performance** — prefetch on card hover/focus, skeleton loaders, lazy images with `srcSet`
- **Accessibility** — focus trap in modals, `aria-*` labels, keyboard navigation (`/` focuses search, `Esc` closes modal)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5 |
| Build | Vite 7 |
| Routing | React Router v7 |
| Data fetching | TanStack Query v5 |
| Styling | CSS Modules + CSS variables |
| Auth (identity) | Firebase Authentication |
| Database & sync | Supabase (PostgreSQL + RLS) |
| API | TMDB API v4 |
| UI primitives | Radix UI (Dialog, Tabs, Dropdown, Tooltip) |
| Animations | Framer Motion |
| Drag & Drop | dnd-kit |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright |
| Lint / format | ESLint + Prettier |
| Git hooks | Husky + lint-staged |
| Deploy | Vercel |

---

## Architecture

### Dual auth layer

Firebase handles **identity** (sign in, tokens, session lifecycle). Supabase handles **data** (favorites, watchlist, watched, ratings, custom lists) with Row Level Security policies that scope every row to the authenticated user.

When a Firebase user signs in, a Supabase session is created via `supabase.auth.signInWithIdToken`, bridging the Firebase UID to the Supabase RLS context (`auth.uid()::text = user_id`).

### Offline-first data pattern

Favorites, watchlist, watched history, and ratings are read from and written to **localStorage first** for instant UI feedback. Changes are then synced to Supabase in the background. On login, Supabase data is hydrated back into localStorage so the latest state is always available after a session refresh.

### Feature-based folder structure

```
src/features/{feature}/
  api/          — TMDB/Supabase fetch functions
  hooks/        — TanStack Query hooks
  components/   — React components
  types/        — TypeScript interfaces and types
  store.ts      — localStorage + Supabase store functions
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A [TMDB API](https://www.themoviedb.org/settings/api) account (v4 Read Access Token)
- A [Firebase](https://console.firebase.google.com/) project with Authentication enabled (Email/Password + Google)
- A [Supabase](https://supabase.com/) project

### Clone and install

```bash
git clone https://github.com/your-username/cinescope.git
cd cinescope
npm install
```

### Environment variables

Create a `.env` file at the project root (copy from `.env.example` if present):

```env
# TMDB
VITE_TMDB_ACCESS_TOKEN=        # TMDB v4 Bearer token

# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

| Variable | Description |
|----------|------------|
| `VITE_TMDB_ACCESS_TOKEN` | TMDB API v4 Read Access Token — get it at [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api) |
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (e.g. `project-id.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |

### Run the dev server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Available Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Production build |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm test` | Run unit tests with Vitest |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests |

---

## Project Structure

```
src/
  components/
    ui/              — Shared UI: Button, Chip, Skeleton, ErrorBoundary, Layout, Navbar
  features/
    auth/            — Firebase auth service, AuthModal, AuthGuard, useAuth
    movies/          — Movie API, hooks, components (cards, carousels, grid, hero, modal)
    tv/              — TV API, hooks, components (cards, carousels, grid, hero)
    filters/         — GenreFilter, SortDropdown, AdvancedFilters, useGenres
    favorites/       — Favorites/watchlist store + useFavorites hook
    watched/         — Watch history store + useWatched hook
    ratings/         — Ratings store + useRatings hook
    lists/           — Custom lists store + useLists hook
  lib/
    helpers.ts       — Image URL builders, formatters, utilities
    tmdbClient.ts    — Authenticated TMDB fetch wrapper
    queryKeys.ts     — TanStack Query key factory
    config.ts        — Environment-derived constants
    supabaseClient.ts
  pages/             — Route-level page components
```

---

## Demo

[https://cinescope-blush.vercel.app](https://cinescope-blush.vercel.app)

---

## License

MIT
