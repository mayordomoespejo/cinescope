import { Navigate } from 'react-router-dom'
import { useAuth } from './useAuth'

interface AuthGuardProps {
  /** The route content to render when the user is authenticated. */
  children: React.ReactNode
}

/**
 * Wraps a route element and redirects to /welcome if user is not authenticated.
 * Shows a loading spinner while auth state is being determined.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
        aria-label="Loading"
        role="status"
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '3px solid rgba(255,255,255,0.15)',
            borderTopColor: 'var(--color-accent)',
            animation: 'spin 0.7s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />
  }

  return <>{children}</>
}
