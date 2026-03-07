import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import ComplaintsTable from "./components/admin/ComplaintsTable";
import useComplaints from "./hooks/useComplaints";
import Dashboard from "./components/admin/Dashboard";
import AnalyticsPage from "./components/pages/AnalyticsPage";
import SettingsPage from "./components/pages/SettingsPage";
import LoginPage from "./components/pages/LoginPage";
import AdminRoute from "./components/auth/AdminRoute";
import AdminNotifications from "./components/pages/AdminNotifications";

function ComplaintsPage() {
  const { complaints, loading } = useComplaints();

  if (loading) return <p className="p-8">Loading complaints...</p>;

  return (
    <>
      <h1 className="text-2xl font-semibold mb-6">Complaints</h1>
      <ComplaintsTable complaints={complaints} />
    </>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* 🔐 Admin only */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="complaints" element={<ComplaintsPage />} />
        <Route path="admin-notifications" element={<AdminNotifications />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}