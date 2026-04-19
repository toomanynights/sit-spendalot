import { Navigate, useLocation } from 'react-router-dom'
import { isAuthenticated } from '../api/auth'

/**
 * Wraps a route so unauthenticated visitors are sent to /login.
 * The original path is preserved in location state so LoginPage
 * can redirect back after a successful login.
 */
export default function ProtectedRoute({ children }) {
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
