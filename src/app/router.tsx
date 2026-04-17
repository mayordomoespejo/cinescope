import { lazy, Suspense } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/ui/Layout'
import AuthGuard from '@/features/auth/AuthGuard'

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
const LoginPage = lazy(() => import('@/pages/LoginPage'))

const pageFallback = <div style={{ minHeight: '100vh' }} aria-busy="true" />

export const router = createBrowserRouter([
  {
    path: '/welcome',
    element: <Suspense fallback={pageFallback}><WelcomePage /></Suspense>,
  },
  {
    path: '/login',
    element: <Suspense fallback={pageFallback}><LoginPage /></Suspense>,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <AuthGuard>
            <Suspense fallback={pageFallback}><Home /></Suspense>
          </AuthGuard>
        ),
      },
      {
        path: 'favorites',
        element: (
          <AuthGuard>
            <Suspense fallback={pageFallback}><Favorites /></Suspense>
          </AuthGuard>
        ),
      },
      {
        path: 'movie/:id',
        element: (
          <AuthGuard>
            <Suspense fallback={pageFallback}><MovieDetailPage /></Suspense>
          </AuthGuard>
        ),
      },
      {
        path: 'tv',
        element: (
          <AuthGuard>
            <Suspense fallback={pageFallback}><TVBrowsePage /></Suspense>
          </AuthGuard>
        ),
      },
      {
        path: 'tv/:id',
        element: (
          <AuthGuard>
            <Suspense fallback={pageFallback}><TVDetailPage /></Suspense>
          </AuthGuard>
        ),
      },
      {
        path: 'person/:id',
        element: (
          <AuthGuard>
            <Suspense fallback={pageFallback}><PersonPage /></Suspense>
          </AuthGuard>
        ),
      },
      {
        path: 'profile',
        element: (
          <AuthGuard>
            <Suspense fallback={pageFallback}><ProfilePage /></Suspense>
          </AuthGuard>
        ),
      },
      {
        path: 'lists',
        element: (
          <AuthGuard>
            <Suspense fallback={pageFallback}><ListsPage /></Suspense>
          </AuthGuard>
        ),
      },
      {
        path: 'watched',
        element: (
          <AuthGuard>
            <Suspense fallback={pageFallback}><WatchedPage /></Suspense>
          </AuthGuard>
        ),
      },
      {
        path: '*',
        element: <Suspense fallback={pageFallback}><NotFound /></Suspense>,
      },
    ],
  },
])
