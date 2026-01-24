import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase/client";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const STATUS_OPTIONS = ["New", "In Progress", "Resolved"];

export default function ComplaintDetailsModal({ id, onClose }) {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch complaint by id prop
  const fetchComplaint = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("complains")
      .select("*")
      .eq("id", id)
      .single();
    if (error) console.error(error);
    else setComplaint(data);
    setLoading(false);
  };

  useEffect(() => {
    if (id) fetchComplaint();
  }, [id]);

  const updateStatus = async (newStatus) => {
    if (!complaint) return;
    setUpdating(true);
    const { data, error } = await supabase
      .from("complains")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error(error);
      alert("Failed to update status");
    } else setComplaint(data);
    setUpdating(false);
  };

  if (loading) return null;

  if (!complaint)
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-red-500">Complaint not found</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded-md"
          >
            Close
          </button>
        </div>
      </div>
    );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        {/* Header */}
        <h1 className="text-xl font-semibold">Complaint Details</h1>

        {/* Status */}
        <div className="flex items-center gap-4">
          <label className="text-gray-500 font-medium">Status:</label>
          <select
            value={complaint.status || "New"}
            onChange={(e) => updateStatus(e.target.value)}
            disabled={updating}
            className="px-3 py-1 rounded-md border bg-gray-50 text-gray-700"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${
              complaint.status === "New"
                ? "bg-red-100 text-red-700"
                : complaint.status === "In Progress"
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {complaint.status}
          </span>
        </div>

        <hr />

        {/* User Information */}
        <div className="space-y-2">
          <h2 className="text-gray-500 font-medium">User Information</h2>
          <div className="flex items-center gap-2 text-gray-700">
            <UserIcon className="w-5 h-5 text-gray-400" />
            <span>
              {complaint.is_anonymous ? "Anonymous" : complaint.full_name}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <EnvelopeIcon className="w-5 h-5 text-gray-400" />
            <span>{complaint.email || "—"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700">
            <PhoneIcon className="w-5 h-5 text-gray-400" />
            <span>{complaint.phone || "—"}</span>
          </div>
        </div>

        <hr />

        {/* Complaint Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h2 className="text-gray-500 font-medium">Type</h2>
            <p className="text-gray-700">{complaint.complaint_type || "—"}</p>
          </div>
          <div>
            <h2 className="text-gray-500 font-medium flex items-center gap-1">
              <CalendarIcon className="w-4 h-4 text-gray-400" />
              Created Date
            </h2>
            <p className="text-gray-700">
              {new Date(complaint.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="col-span-2">
            <h2 className="text-gray-500 font-medium flex items-center gap-1">
              <MapPinIcon className="w-4 h-4 text-gray-400" />
              Location
            </h2>
            <p className="text-gray-700">
              {complaint.province}, {complaint.district}
            </p>
          </div>
        </div>

        <hr />

        {/* Complaint Message */}
        <div>
          <h2 className="text-gray-500 font-medium">Complaint Message</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {complaint.message}
          </p>
        </div>
      </div>
    </div>
  );
}
