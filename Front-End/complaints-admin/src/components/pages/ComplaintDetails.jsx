import { useEffect, useState } from "react";
import { supabase } from "../../services/client";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const STATUS_OPTIONS = ["new", "in_progress", "resolved"];

const STATUS_STYLES = {
  new: "bg-blue-100 text-blue-700",
  in_progress: "bg-yellow-100 text-yellow-700",
  resolved: "bg-green-100 text-green-700",
};

export default function ComplaintDetails({ id, onClose }) {
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchComplaint = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("complains") // ✅ correct table
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Fetch error:", error);
        setComplaint(null);
      } else {
        setComplaint(data);
      }

      setLoading(false);
    };

    fetchComplaint();
  }, [id]);

  const updateStatus = async (newStatus) => {
    setUpdating(true);

    const { data, error } = await supabase
      .from("complains")
      .update({ status: newStatus })
      .eq("id", id)
      .select()
      .single();

    if (!error) setComplaint(data);
    else alert("Failed to update status");

    setUpdating(false);
  };

  if (loading) return null;

  if (!complaint) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl">
          <p className="text-red-600">Complaint not found</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-lg max-w-2xl w-full p-6 space-y-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-semibold">Complaint Details</h1>

        {/* STATUS (single element only) */}
        <select
          value={complaint.status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={updating}
          className={`px-3 py-2 rounded-md border font-medium ${
            STATUS_STYLES[complaint.status]
          }`}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace("_", " ").toUpperCase()}
            </option>
          ))}
        </select>

        <hr />

        <div className="space-y-2">
          <div className="flex gap-2 items-center">
            <UserIcon className="w-5 h-5 text-gray-400" />
            {complaint.is_anonymous ? "Anonymous" : complaint.full_name}
          </div>

          <div className="flex gap-2 items-center">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            {new Date(complaint.created_at).toLocaleDateString()}
          </div>

          <div className="flex gap-2 items-center">
            <MapPinIcon className="w-5 h-5 text-gray-400" />
            {complaint.province}, {complaint.district}
          </div>
        </div>

        <hr />

        <p className="whitespace-pre-wrap">{complaint.message}</p>
      </div>
    </div>
  );
}
