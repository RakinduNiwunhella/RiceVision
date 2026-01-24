import { useState } from "react";
import {
  EyeIcon,
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import ComplaintDetailsModal from "./ComplaintDetailsModal";
import { updateComplaintStatus } from "../../services/supabase/complaints";

const STATUS_STYLES = {
  New: "bg-red-100 text-red-700",
  "In Progress": "bg-yellow-100 text-yellow-700",
  Resolved: "bg-green-100 text-green-700",
};

export default function ComplaintsTable({ complaints }) {
  const [localComplaints, setLocalComplaints] = useState(complaints);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");

  const handleStatusChange = async (id, newStatus) => {
    setLocalComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
    );

    const { error } = await updateComplaintStatus(id, newStatus);
    if (error) {
      alert("Failed to update status: " + error.message);
      setLocalComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "New" } : c))
      );
    }
  };

  // Filtered complaints
  const filteredComplaints = localComplaints.filter((c) => {
    const matchesSearch =
      search === "" ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      (c.full_name &&
        c.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.complaint_type &&
        c.complaint_type.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus =
      statusFilter === "All Statuses" || c.status === statusFilter;
    const matchesType =
      typeFilter === "All Types" || c.complaint_type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Search and filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center md:gap-4">
        <div className="flex items-center gap-2 flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, name, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 mt-2 md:mt-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option>All Statuses</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option>All Types</option>
            {Array.from(
              new Set(localComplaints.map((c) => c.complaint_type))
            ).map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left">Complaint ID</th>
              <th className="px-4 py-3 text-left">Full Name</th>
              <th className="px-4 py-3 text-left">Anonymous</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Province / District</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.id}</td>
                <td className="px-4 py-3">
                  {c.is_anonymous ? "Anonymous" : c.full_name}
                </td>
                <td className="px-4 py-3">{c.is_anonymous ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{c.complaint_type || "—"}</td>
                <td className="px-4 py-3">
                  {c.province} / {c.district}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded-full ${
                      STATUS_STYLES[c.status || "New"]
                    }`}
                  >
                    {c.status || "New"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {new Date(c.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setSelectedComplaintId(c.id)}
                    className="flex items-center gap-1 px-3 py-1 border rounded-md hover:bg-gray-100"
                  >
                    <EyeIcon className="w-4 h-4" /> View
                  </button>
                </td>
              </tr>
            ))}
            {filteredComplaints.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500">
                  No complaints found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="p-3 text-sm text-gray-500">
          Showing {filteredComplaints.length} of {localComplaints.length}{" "}
          complaints
        </div>
      </div>

      {/* Modal */}
      {selectedComplaintId && (
        <ComplaintDetailsModal
          id={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
        />
      )}
    </div>
  );
}
