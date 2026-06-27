import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }
  
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }
  
  return children
}
