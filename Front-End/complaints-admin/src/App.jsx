import { Routes, Route, Navigate } from "react-router-dom";
import useComplaints from "./hooks/useComplaints";
import ComplaintsTable from "./components/admin/ComplaintsTable";
import AdminLayout from "./components/admin/AdminLayout";
import ComplaintDetails from "./components/pages/ComplaintDetails";

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
    <AdminLayout>
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/complaints" replace />} />

        {/* Complaints list */}
        <Route path="/complaints" element={<ComplaintsPage />} />

        {/* Complaint details */}
        <Route path="/complaints/:id" element={<ComplaintDetails />} />
      </Routes>
    </AdminLayout>
  );
}
