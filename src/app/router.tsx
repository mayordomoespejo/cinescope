import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/ui/Layout'

const Home = lazy(() => import('@/pages/Home'))
const Favorites = lazy(() => import('@/pages/Favorites'))
const NotFound = lazy(() => import('@/pages/NotFound'))
const MovieDetailPage = lazy(() => import('@/pages/MovieDetailPage'))
const TVBrowsePage = lazy(() => import('@/pages/TVBrowsePage'))
const TVDetailPage = lazy(() => import('@/pages/TVDetailPage'))
const PersonPage = lazy(() => import('@/pages/PersonPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const ListsPage = lazy(() => import('@/pages/ListsPage'))
const WatchedPage = lazy(() => import('@/pages/WatchedPage'))
const WelcomePage = lazy(() => import('@/pages/WelcomePage'))

const pageFallback = <div style={{ minHeight: '100vh' }} aria-busy="true" />

export const router = createBrowserRouter([
  {
    path: '/welcome',
    element: (
      <Suspense fallback={pageFallback}>
        <WelcomePage />
      </Suspense>
    ),
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={pageFallback}>
            <Home />
          </Suspense>
        ),
      },
      {
        path: 'favorites',
        element: (
          <Suspense fallback={pageFallback}>
            <Favorites />
          </Suspense>
        ),
      },
      {
        path: 'movie/:id',
        element: (
          <Suspense fallback={pageFallback}>
            <MovieDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'tv',
        element: (
          <Suspense fallback={pageFallback}>
            <TVBrowsePage />
          </Suspense>
        ),
      },
      {
        path: 'tv/:id',
        element: (
          <Suspense fallback={pageFallback}>
            <TVDetailPage />
          </Suspense>
        ),
      },
      {
        path: 'person/:id',
        element: (
          <Suspense fallback={pageFallback}>
            <PersonPage />
          </Suspense>
        ),
      },
      {
        path: 'profile',
        element: (
          <Suspense fallback={pageFallback}>
            <ProfilePage />
          </Suspense>
        ),
      },
      {
        path: 'lists',
        element: (
          <Suspense fallback={pageFallback}>
            <ListsPage />
          </Suspense>
        ),
      },
      {
        path: 'watched',
        element: (
          <Suspense fallback={pageFallback}>
            <WatchedPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={pageFallback}>
            <NotFound />
          </Suspense>
        ),
      },
    ],
  },
])
