import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types'

interface Props {
  children: React.ReactNode
  allowedRoles: Role[]
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user.role)) return <Navigate to="/login" replace />
  return <>{children}</>
}
