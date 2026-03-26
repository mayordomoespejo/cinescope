import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/ui/Layout'
import Home from '@/pages/Home'
import Favorites from '@/pages/Favorites'
import NotFound from '@/pages/NotFound'
import MovieDetailPage from '@/pages/MovieDetailPage'
import TVBrowsePage from '@/pages/TVBrowsePage'
import TVDetailPage from '@/pages/TVDetailPage'
import PersonPage from '@/pages/PersonPage'
import ProfilePage from '@/pages/ProfilePage'
import ListsPage from '@/pages/ListsPage'
import WelcomePage from '@/pages/WelcomePage'
import LoginPage from '@/pages/LoginPage'
import AuthGuard from '@/features/auth/AuthGuard'

export const router = createBrowserRouter([
  {
    path: '/welcome',
    element: <WelcomePage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <AuthGuard>
            <Home />
          </AuthGuard>
        ),
      },
      {
        path: 'favorites',
        element: (
          <AuthGuard>
            <Favorites />
          </AuthGuard>
        ),
      },
      {
        path: 'movie/:id',
        element: (
          <AuthGuard>
            <MovieDetailPage />
          </AuthGuard>
        ),
      },
      {
        path: 'tv',
        element: (
          <AuthGuard>
            <TVBrowsePage />
          </AuthGuard>
        ),
      },
      {
        path: 'tv/:id',
        element: (
          <AuthGuard>
            <TVDetailPage />
          </AuthGuard>
        ),
      },
      {
        path: 'person/:id',
        element: (
          <AuthGuard>
            <PersonPage />
          </AuthGuard>
        ),
      },
      {
        path: 'profile',
        element: (
          <AuthGuard>
            <ProfilePage />
          </AuthGuard>
        ),
      },
      {
        path: 'lists',
        element: (
          <AuthGuard>
            <ListsPage />
          </AuthGuard>
        ),
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])
