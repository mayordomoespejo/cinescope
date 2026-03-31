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
| Styling | CSS Modules + CSS custom properties (design tokens) |
| Auth | Firebase Authentication (email/password + Google OAuth) |
| Backend | Supabase Edge Functions (Deno) |
| Database | Supabase (PostgreSQL) |
| Data | TMDB API v4 |
| UI primitives | Radix UI (Dialog, Tabs, Dropdown, Select, Tooltip) |
| Animations | Framer Motion |
| Drag & Drop | dnd-kit |
| Unit tests | Vitest + Testing Library |
| E2E tests | Playwright |
| Lint / format | ESLint + Prettier |
| Git hooks | Husky + lint-staged |
| Deploy | Vercel |

---

## Project Structure

```
src/
├── app/              # Router definition and app shell
├── assets/           # Static assets (images, icons)
├── components/
│   └── ui/           # Shared UI components (Layout, Navbar, Button, Skeleton, etc.)
├── features/         # Domain-specific logic, co-located by feature
│   ├── auth/         # Firebase auth service, AuthGuard, hooks
│   ├── favorites/    # Favorites state and components
│   ├── filters/      # Filter/sort UI and logic
│   ├── lists/        # Custom user lists with drag-and-drop
│   ├── movies/       # Movie data fetching and components
│   ├── tv/           # TV show data fetching and components
│   └── watched/      # Watched history state and components
├── hooks/            # Shared custom hooks
├── lib/              # Supabase client, function URL helpers, Firebase config
├── pages/            # Route-level page components
├── styles/           # Global styles and design tokens (variables.css)
└── tests/            # Unit and integration tests

supabase/
└── functions/
    ├── _shared/        # Shared Deno modules (auth, CORS, Supabase client, Firebase Admin)
    ├── sync-favorites/ # Edge Function: favorites persistence
    ├── sync-watchlist/ # Edge Function: watchlist persistence
    └── sync-watched/   # Edge Function: watched history persistence
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

Copy `.env.example` to `.env` and fill in all values:

```env
# TMDB — https://www.themoviedb.org/settings/api
VITE_TMDB_ACCESS_TOKEN=        # v4 Read Access Token

# Supabase — https://supabase.com/dashboard/project/_/settings/api
VITE_SUPABASE_URL=             # Project URL (e.g. https://xyz.supabase.co)
VITE_SUPABASE_ANON_KEY=        # Public anon key

# Firebase — https://console.firebase.google.com/project/_/settings/general
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

| Variable | Description |
|----------|------------|
| `VITE_TMDB_ACCESS_TOKEN` | TMDB API v4 Read Access Token |
| `VITE_SUPABASE_URL` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |
| `VITE_FIREBASE_API_KEY` | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (e.g. `project-id.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

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

### Auth flow

Firebase handles identity (sign-in, tokens, session lifecycle). Supabase handles data persistence (favorites, watchlist, watched history, custom lists) via Edge Functions that verify the caller's Firebase ID token before touching the database.

```
User
 └─ Firebase Authentication (email/password or Google OAuth)
      └─ Firebase ID Token (short-lived JWT)
           └─ Authorization: Bearer <token>
                └─ Supabase Edge Function
                     ├─ Firebase Admin SDK verifies token
                     └─ Supabase Admin client reads/writes PostgreSQL
```

All protected routes use `AuthGuard`, which redirects unauthenticated users to `/login`.

### Data flow

```
Browser
  │
  ├─ TMDB API (direct, client-side, read-only)
  │    Movie/TV metadata, images, search results
  │
  └─ Supabase Edge Functions (authenticated via Firebase token)
       Favorites, Watchlist, Watched history, Custom lists
         │
         └─ PostgreSQL (Supabase)
              Per-user persistent data
```

TanStack Query manages all remote state — caching, background refetching, optimistic updates, and loading/error states.

### Offline-first data pattern

Favorites, watchlist, watched history, and ratings are written to **localStorage first** for instant UI feedback, then synced to Supabase in the background. On login, Supabase data is hydrated back into localStorage so the latest state is always available after a session refresh.

---

## Available Scripts

| Command | Description |
|---------|------------|
| `npm run dev` | Start the Vite development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Run ESLint with auto-fix |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run test` | Run unit tests with Vitest |
| `npm run test:watch` | Run unit tests in watch mode |
| `npm run test:coverage` | Generate test coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests |

---

## Supabase Edge Functions

All functions run on Deno and require a valid Firebase ID token in the `Authorization: Bearer <token>` header. Authentication is handled by shared helpers in `supabase/functions/_shared/`.

| Function | Methods | Purpose |
|----------|---------|---------|
| `sync-favorites` | `GET`, `POST` | Read and upsert the user's favorite movies list |
| `sync-watchlist` | `GET`, `POST` | Read and upsert the user's watchlist |
| `sync-watched` | `GET`, `POST`, `DELETE` | Read, upsert, and remove entries from the user's watched history |

The `_shared/` directory contains modules reused across all functions:

| Module | Purpose |
|--------|---------|
| `auth.ts` | `requireAuth` helper — extracts and verifies the Bearer token |
| `firebaseAuth.ts` | Firebase Admin SDK initialization |
| `supabaseClient.ts` | Supabase Admin client factory |
| `cors.ts` | CORS headers and preflight (`OPTIONS`) handler |

---

## Design System

Styles use CSS Modules for component-level encapsulation paired with a global set of CSS custom properties defined in `src/styles/variables.css`.

**Theming:** dark mode is the default. Light mode is activated by setting `data-theme="light"` on the root element — all color, shadow, and surface tokens are overridden at that selector with no JavaScript logic required inside components.

**Token categories:**

| Category | Examples |
|----------|---------|
| Colors | `--color-bg`, `--color-accent` (`#e8a838`), `--color-text-primary`, `--color-surface` |
| Typography | `--font-family` (Inter), `--font-size-xs` through `--font-size-hero`, `--font-weight-*` |
| Spacing | `--space-1` through `--space-24` (4 px base unit) |
| Border radius | `--radius-xs` through `--radius-full` |
| Shadows | `--shadow-sm` through `--shadow-xl` |
| Transitions | `--transition-fast` (120 ms), `--transition-base` (220 ms), `--transition-slow` (380 ms) |
| Layout | `--navbar-height` (64 px), `--max-width` (1400 px), `--content-padding` |
| Z-index | `--z-base` through `--z-toast` |

---

## Demo

[https://cinescope-blush.vercel.app](https://cinescope-blush.vercel.app)

---

## License

MIT
