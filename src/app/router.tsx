import { createBrowserRouter } from 'react-router-dom'
import Layout from '@/components/ui/Layout'
import Home from '@/pages/Home'
import Favorites from '@/pages/Favorites'
import NotFound from '@/pages/NotFound'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'favorites',
        element: <Favorites />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])
