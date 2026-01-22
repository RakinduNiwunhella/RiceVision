import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/admin/AdminLayout";
import ComplaintsTable from "./components/admin/ComplaintsTable";
import useComplaints from "./hooks/useComplaints";
import Dashboard from "./components/admin/Dashboard";

/* Complaints page */
function ComplaintsPage() {
  const { complaints, loading } = useComplaints();

  if (loading) {
    return <p className="p-8">Loading complaints...</p>;
  }

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
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="complaints" element={<ComplaintsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
