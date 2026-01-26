import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

import AdminDashboard from "./dashboards/AdminDashboard";
import ResidentDashboard from "./dashboards/ResidentDashboard";
import ProtectedRoute from "./auth/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                

                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute role="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/resident"
                    element={
                        <ProtectedRoute role="resident">
                            <ResidentDashboard />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
