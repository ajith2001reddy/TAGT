import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./context/AuthContext"
import DashboardLayout from "./layouts/DashboardLayout"
import LoginPage from "./features/auth/LoginPage"
import DashboardPage from "./features/dashboard/DashboardPage"
import ResidentsPage from "./features/residents/ResidentsPage"
import RoomsPage from "./features/rooms/RoomsPage"
import PaymentsPage from "./features/payments/PaymentsPage"
import RequestsPage from "./features/requests/RequestsPage"
import ResidentDashboard from "./features/resident/ResidentDashboard"
import PropertyManagementPage from "./features/advanced/PropertyManagementPage"
import NotificationCenterPage from "./features/advanced/NotificationCenterPage"
import BookingRequestsPage from "./features/advanced/BookingRequestsPage"
import ResidentProfilesPage from "./features/advanced/ResidentProfilesPage"
import RealTimeHubPage from "./features/advanced/RealTimeHubPage"
import EmailAutomationPage from "./features/advanced/EmailAutomationPage"
import AnalyticsPlusPage from "./features/advanced/AnalyticsPlusPage"
import MarketplacePage from "./features/advanced/MarketplacePage"

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen bg-[#060608]" />
  return user ? <>{children}</> : <Navigate to="/login" replace />
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user?.role !== "admin") return <Navigate to="/resident" replace />
  return <>{children}</>
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      <Route element={<RequireAuth><RequireAdmin><DashboardLayout /></RequireAdmin></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/residents" element={<ResidentsPage />} />
        <Route path="/rooms" element={<RoomsPage />} />
        <Route path="/payments" element={<PaymentsPage />} />
        <Route path="/requests" element={<RequestsPage />} />
        <Route path="/properties" element={<PropertyManagementPage />} />
        <Route path="/notifications" element={<NotificationCenterPage />} />
        <Route path="/bookings" element={<BookingRequestsPage />} />
        <Route path="/resident-profiles" element={<ResidentProfilesPage />} />
        <Route path="/realtime" element={<RealTimeHubPage />} />
        <Route path="/email-center" element={<EmailAutomationPage />} />
        <Route path="/analytics-plus" element={<AnalyticsPlusPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
      </Route>

      <Route element={<RequireAuth><DashboardLayout /></RequireAuth>}>
        <Route path="/resident" element={<ResidentDashboard />} />
      </Route>
    </Routes>
  )
}

export default App
