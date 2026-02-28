import { Navigate, Route, Routes } from "react-router-dom"
import ProtectedRoute from "./routes/ProtectedRoute"
import RoleRoute from "./routes/RoleRoute"
import SaasLayout from "./layouts/SaasLayout"

import LandingPage from "./pages/public/LandingPage"
import LoginPage from "./pages/public/LoginPage"
import RegisterPage from "./pages/public/RegisterPage"

import ProviderOverviewPage from "./pages/provider/OverviewPage"
import ProviderPropertiesPage from "./pages/provider/PropertiesPage"
import ProviderUsersPage from "./pages/provider/UsersPage"
import ProviderRevenuePage from "./pages/provider/RevenuePage"
import ProviderSettingsPage from "./pages/provider/SettingsPage"

import OwnerOverviewPage from "./pages/owner/OverviewPage"
import OwnerRoomsPage from "./pages/owner/RoomsPage"
import OwnerResidentsPage from "./pages/owner/ResidentsPage"
import OwnerPaymentsPage from "./pages/owner/PaymentsPage"
import OwnerRequestsPage from "./pages/owner/RequestsPage"
import OwnerAnalyticsPage from "./pages/owner/AnalyticsPage"

import ResidentDashboardPage from "./pages/resident/DashboardPage"
import ResidentPaymentsPage from "./pages/resident/PaymentsPage"
import ResidentRequestsPage from "./pages/resident/RequestsPage"
import ResidentProfilePage from "./pages/resident/ProfilePage"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<SaasLayout />}>
          <Route element={<RoleRoute allowedRoles={["super_admin"]} />}>
            <Route path="/provider-dashboard" element={<ProviderOverviewPage />} />
            <Route path="/provider-dashboard/properties" element={<ProviderPropertiesPage />} />
            <Route path="/provider-dashboard/users" element={<ProviderUsersPage />} />
            <Route path="/provider-dashboard/revenue" element={<ProviderRevenuePage />} />
            <Route path="/provider-dashboard/settings" element={<ProviderSettingsPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["owner"]} />}>
            <Route path="/owner-dashboard" element={<OwnerOverviewPage />} />
            <Route path="/owner-dashboard/rooms" element={<OwnerRoomsPage />} />
            <Route path="/owner-dashboard/residents" element={<OwnerResidentsPage />} />
            <Route path="/owner-dashboard/payments" element={<OwnerPaymentsPage />} />
            <Route path="/owner-dashboard/requests" element={<OwnerRequestsPage />} />
            <Route path="/owner-dashboard/analytics" element={<OwnerAnalyticsPage />} />
          </Route>

          <Route element={<RoleRoute allowedRoles={["resident"]} />}>
            <Route path="/resident-dashboard" element={<ResidentDashboardPage />} />
            <Route path="/resident-dashboard/payments" element={<ResidentPaymentsPage />} />
            <Route path="/resident-dashboard/requests" element={<ResidentRequestsPage />} />
            <Route path="/resident-dashboard/profile" element={<ResidentProfilePage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
