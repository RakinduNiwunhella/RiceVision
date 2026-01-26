import { useState } from "react";
import { EyeIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import ComplaintDetails from "../pages/ComplaintDetails";
import { updateComplaintStatus } from "../../services/supabase/complaints";

/* -------------------- STATUS STYLES -------------------- */
/* Lowercase keys = safe with DB values */
const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700",
  "in progress": "bg-amber-100 text-amber-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

/* -------------------- COMPONENT -------------------- */

export default function ComplaintsTable({ complaints }) {
  const [localComplaints, setLocalComplaints] = useState(complaints);
  const [selectedComplaintId, setSelectedComplaintId] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [typeFilter, setTypeFilter] = useState("All Types");

  /* -------------------- STATUS UPDATE -------------------- */

  const handleStatusChange = async (id, newStatus) => {
    setLocalComplaints((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
    );

    const { error } = await updateComplaintStatus(id, newStatus);
    if (error) {
      alert("Failed to update status: " + error.message);
      setLocalComplaints((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "New" } : c)),
      );
    }
  };

  /* -------------------- FILTERING -------------------- */

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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Complaints</h1>
        <p className="text-sm text-gray-500 mt-1">
          View, filter, and manage submitted complaints
        </p>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID, name, or type..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option>All Statuses</option>
            <option>New</option>
            <option>In Progress</option>
            <option>Resolved</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option>All Types</option>
            {Array.from(
              new Set(
                localComplaints.map((c) => c.complaint_type).filter(Boolean),
              ),
            ).map((type) => (
              <option key={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">
                Complaint ID
              </th>
              <th className="px-4 py-3 text-left font-semibold">Full Name</th>
              <th className="px-4 py-3 text-left font-semibold">Anonymous</th>
              <th className="px-4 py-3 text-left font-semibold">Type</th>
              <th className="px-4 py-3 text-left font-semibold">
                Province / District
              </th>
              <th className="px-4 py-3 text-center font-semibold">Status</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-left font-semibold">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredComplaints.map((c) => {
              const statusKey = (c.status || "new").toLowerCase();

              return (
                <tr
                  key={c.id}
                  className="border-b last:border-b-0 hover:bg-teal-50/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium">{c.id}</td>
                  <td className="px-4 py-3">
                    {c.is_anonymous ? "Anonymous" : c.full_name}
                  </td>
                  <td className="px-4 py-3">{c.is_anonymous ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{c.complaint_type || "—"}</td>
                  <td className="px-4 py-3">
                    {c.province} / {c.district}
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium capitalize ${
                        STATUS_STYLES[statusKey] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {c.status || "New"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    {new Date(c.created_at).toLocaleDateString()}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedComplaintId(c.id)}
                      className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-800 font-medium text-sm"
                    >
                      <EyeIcon className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              );
            })}

            {filteredComplaints.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-6 text-gray-500">
                  No complaints found.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Footer */}
        <div className="p-4 text-sm text-gray-500 border-t bg-gray-50">
          Showing {filteredComplaints.length} of {localComplaints.length}{" "}
          complaints
        </div>
      </div>

      {/* Modal */}
      {selectedComplaintId && (
        <ComplaintDetails
          id={selectedComplaintId}
          onClose={() => setSelectedComplaintId(null)}
        />
      )}
    </div>
  );
}
