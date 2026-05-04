# Cinescope — Project Rules

## Active Skills

react-19, typescript, zustand-5, playwright

---

## Stack

- **Language**: TypeScript 5.9
- **Framework**: React 19 (Vite, SPA)
- **Router**: React Router v7
- **State**: Zustand 5 (`persist` middleware for localStorage)
- **Data fetching**: TanStack Query v5
- **UI**: Radix UI primitives, Framer Motion, dnd-kit
- **Testing**: Vitest + Testing Library (unit), Playwright (E2E)
- **Deploy**: Vercel

---

## Project Structure

```
src/
├── app/           # Router config
├── components/    # Shared UI (Layout, Navbar, ErrorBoundary...)
├── features/      # Feature modules (favorites, watched, lists, movies, tv...)
│   └── [feature]/
│       ├── components/
│       ├── hooks/
│       └── store.ts   # Zustand store with persist
├── lib/           # tmdbClient, types, utils
├── pages/         # Route-level components
└── tests/         # Vitest unit tests
e2e/               # Playwright E2E tests
```

---

## Key Conventions

- No auth — app is fully public, no login required
- Persistence via `localStorage` only (Zustand `persist`): keys `cinescope-favorites`, `cinescope-watched`, `cinescope-lists`
- TMDB API via `src/lib/tmdbClient.ts` with Bearer token (`VITE_TMDB_API_KEY`)
- Alias `@/` → `src/`
- Lazy-loaded pages via `React.lazy` + `Suspense`
- Intro screen at `/welcome` → navigates to `/` directly

---

## Env Vars

```
VITE_TMDB_API_KEY=   # TMDB Bearer token (required)
```
