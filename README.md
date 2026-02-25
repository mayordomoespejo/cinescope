# 🎬 CineScope — Movie Explorer

> A professional Netflix-style movie discovery app built with React, TypeScript, and TMDB API.

[![CI](https://github.com/your-username/cinescope/actions/workflows/ci.yml/badge.svg)](https://github.com/your-username/cinescope/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-purple)](https://vite.dev/)

---

## Overview

CineScope lets you **discover, explore, and track movies** with a sleek dark UI inspired by Netflix. Browse trending films, filter by genre, search with debounce, and open a detailed modal with an embedded YouTube trailer — all backed by the [TMDB API](https://developer.themoviedb.org/).

## Features

- **Home** — Hero section (trending #1), horizontal carousels (Trending + Top Rated), paginated Discover grid
- **Genre Filter** — Horizontally scrollable genre chips, combinable with Sort
- **Sort** — Dropdown: Popularity, Rating, Release Date, Revenue
- **Search** — Debounced (400 ms), results with total count, search history (localStorage)
- **Movie Modal** — Poster, backdrop, overview, runtime, rating, genres, budget/revenue; embedded YouTube trailer; `Esc` to close
- **Favorites & Watchlist** — Persisted in `localStorage`, dedicated `/favorites` page
- **Skeleton loaders** — Cards, hero, modal
- **Dark / Light mode** — CSS variables, persisted in `localStorage`
- **Accessibility** — Focus trap in modal, `aria-*` labels, keyboard navigation (`/` → focus search, `Esc` → close modal)
- **Prefetch on hover** — Modal data pre-loaded before opening
- **Responsive** — Mobile-first grid and carousels

## Stack

| Layer         | Technology                                 |
| ------------- | ------------------------------------------ |
| Framework     | React 19 + TypeScript                      |
| Build         | Vite 7                                     |
| Routing       | React Router v7                            |
| Data Fetching | TanStack Query v5                          |
| Styles        | CSS Modules + CSS Variables                |
| UI Primitives | Radix UI (Dialog, Tabs, Dropdown, Tooltip) |
| Animations    | Framer Motion                              |
| Unit Tests    | Vitest + Testing Library                   |
| E2E Tests     | Playwright                                 |
| Lint / Format | ESLint + Prettier                          |
| Git hooks     | Husky + lint-staged                        |
| Deploy        | Vercel / Netlify                           |

## Architecture

```
src/
├── app/             # Router + QueryClient providers
├── pages/           # Home, Favorites, NotFound
├── features/
│   ├── movies/      # API, hooks, components, types
│   ├── filters/     # Genre filter, Sort dropdown
│   ├── search/      # Search bar component
│   └── favorites/   # localStorage store + hook
├── components/ui/   # Button, Skeleton, Chip, Navbar, Layout
├── lib/             # TMDB client, config, queryKeys, helpers
└── styles/          # CSS variables, global reset
```

### Key decisions

- **URL-driven modal state** — `?movieId=123` makes modals shareable/bookmarkable and syncs with the browser back button.
- **CSS Modules + CSS custom properties** — Zero runtime style overhead; full theming with a single `data-theme` attribute.
- **TanStack Query** — Automatic caching, background revalidation, and `prefetchQuery` on card hover.
- **Radix UI** — Accessible dialog with focus trap and `Esc` dismiss, built in.

## Getting Started

### 1. Clone

```bash
git clone https://github.com/your-username/cinescope.git
cd cinescope
```

### 2. Install

```bash
npm install
```

### 3. Environment variables

```bash
cp .env.example .env
```

Edit `.env` and set your [TMDB Read Access Token](https://www.themoviedb.org/settings/api):

```env
VITE_TMDB_ACCESS_TOKEN=your_token_here
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| `npm run dev`           | Start dev server         |
| `npm run build`         | Production build         |
| `npm run preview`       | Preview production build |
| `npm run lint`          | ESLint                   |
| `npm run lint:fix`      | ESLint with auto-fix     |
| `npm run format`        | Prettier format          |
| `npm run format:check`  | Prettier check           |
| `npm test`              | Vitest unit tests        |
| `npm run test:watch`    | Vitest watch mode        |
| `npm run test:coverage` | Coverage report          |
| `npm run test:e2e`      | Playwright e2e tests     |

## Environment Variables

| Variable                 | Description                              |
| ------------------------ | ---------------------------------------- |
| `VITE_TMDB_ACCESS_TOKEN` | TMDB API v4 Read Access Token (required) |

## Keyboard Shortcuts

| Key   | Action            |
| ----- | ----------------- |
| `/`   | Focus search bar  |
| `Esc` | Close movie modal |

## Roadmap

- [ ] Infinite scroll (replace "Load More" button)
- [ ] Similar movies section in modal
- [ ] Cast list with profile images
- [ ] Collections / tags beyond favorites
- [ ] PWA support (offline mode)
- [ ] Share movie link

---

Built with ❤️ using React + TMDB API. Data provided by [The Movie Database (TMDB)](https://www.themoviedb.org/).
