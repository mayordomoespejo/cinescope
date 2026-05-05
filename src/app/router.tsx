import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/ui/Layout'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import styles from './router.module.css'

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

const pageFallback = <div className={styles.pageFallback} aria-busy="true" />

export const router = createBrowserRouter([
  {
    path: '/welcome',
    element: (
      <ErrorBoundary>
        <Suspense fallback={pageFallback}>
          <WelcomePage />
        </Suspense>
      </ErrorBoundary>
    ),
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ErrorBoundary>
            <Suspense fallback={pageFallback}>
              <Home />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'favorites',
        element: (
          <ErrorBoundary>
            <Suspense fallback={pageFallback}>
              <Favorites />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'movie/:id',
        element: (
          <ErrorBoundary>
            <Suspense fallback={pageFallback}>
              <MovieDetailPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'tv',
        element: (
          <ErrorBoundary>
            <Suspense fallback={pageFallback}>
              <TVBrowsePage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'tv/:id',
        element: (
          <ErrorBoundary>
            <Suspense fallback={pageFallback}>
              <TVDetailPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'person/:id',
        element: (
          <ErrorBoundary>
            <Suspense fallback={pageFallback}>
              <PersonPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'profile',
        element: (
          <ErrorBoundary>
            <Suspense fallback={pageFallback}>
              <ProfilePage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'lists',
        element: (
          <ErrorBoundary>
            <Suspense fallback={pageFallback}>
              <ListsPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: 'watched',
        element: (
          <ErrorBoundary>
            <Suspense fallback={pageFallback}>
              <WatchedPage />
            </Suspense>
          </ErrorBoundary>
        ),
      },
      {
        path: '*',
        element: (
          <ErrorBoundary>
            <Suspense fallback={pageFallback}>
              <NotFound />
            </Suspense>
          </ErrorBoundary>
        ),
      },
    ],
  },
])
