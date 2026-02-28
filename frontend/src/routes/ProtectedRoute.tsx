import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-slate-950" />
  if (!user) return <Navigate to="/login" replace />
  return <Outlet />
}
