import { useEffect, useState } from "react";
import { supabase } from "@/services/client";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const EMPTY_FORM = { title: "", message: "", description: "" };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  /* -------------------- FETCH -------------------- */

  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notificationpanel")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setNotifications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  /* -------------------- MODAL HELPERS -------------------- */

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (n) => {
    setEditing(n);
    setForm({ title: n.title || "", message: n.message || "", description: n.description || "" });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  /* -------------------- SAVE (CREATE / UPDATE) -------------------- */

  const handleSave = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);

    if (editing) {
      // Update
      const { error } = await supabase
        .from("notificationpanel")
        .update({
          title: form.title.trim(),
          message: form.message.trim(),
          description: form.description.trim(),
        })
        .eq("id", editing.id);

      if (error) {
        alert("Failed to update: " + error.message);
      }
    } else {
      // Create
      const { error } = await supabase
        .from("notificationpanel")
        .insert({
          title: form.title.trim(),
          message: form.message.trim(),
          description: form.description.trim(),
        });

      if (error) {
        alert("Failed to create: " + error.message);
      }
    }

    setSaving(false);
    closeModal();
    fetchNotifications();
  };

  /* -------------------- DELETE -------------------- */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification? This cannot be undone.")) return;
    setDeleting(id);

    // Delete associated read records first
    await supabase.from("notification_reads").delete().eq("notification_id", id);

    const { error } = await supabase
      .from("notificationpanel")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Failed to delete: " + error.message);
    }

    setDeleting(null);
    fetchNotifications();
  };

  /* -------------------- RENDER -------------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-sm text-gray-500 mt-1">
            Create, edit, and manage notifications sent to all users
          </p>
        </div>
        <button
          onClick={openCreate}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-teal-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          New Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4">
          <div className="w-3 rounded-full bg-indigo-600" />
          <div>
            <p className="text-sm text-gray-500">Total</p>
            <p className="text-2xl font-semibold text-gray-900">
              {loading ? "—" : notifications.length}
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4">
          <div className="w-3 rounded-full bg-teal-500" />
          <div>
            <p className="text-sm text-gray-500">This Month</p>
            <p className="text-2xl font-semibold text-gray-900">
              {loading
                ? "—"
                : notifications.filter(
                    (n) =>
                      new Date(n.created_at).getMonth() === new Date().getMonth() &&
                      new Date(n.created_at).getFullYear() === new Date().getFullYear()
                  ).length}
            </p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-5 flex gap-4">
          <div className="w-3 rounded-full bg-amber-500" />
          <div>
            <p className="text-sm text-gray-500">Today</p>
            <p className="text-2xl font-semibold text-gray-900">
              {loading
                ? "—"
                : notifications.filter(
                    (n) =>
                      new Date(n.created_at).toDateString() === new Date().toDateString()
                  ).length}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Title</th>
              <th className="px-4 py-3 text-left font-semibold">Message</th>
              <th className="px-4 py-3 text-left font-semibold">Date</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  Loading notifications...
                </td>
              </tr>
            ) : notifications.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  No notifications yet. Create one to get started.
                </td>
              </tr>
            ) : (
              notifications.map((n) => (
                <tr
                  key={n.id}
                  className="border-b last:border-b-0 hover:bg-teal-50/40 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                    {n.title}
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-[300px] truncate">
                    {n.message}
                  </td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(n.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEdit(n)}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(n.id)}
                        disabled={deleting === n.id}
                        className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 font-medium text-sm transition-colors disabled:opacity-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                        {deleting === n.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Footer */}
        {!loading && (
          <div className="p-4 text-sm text-gray-500 border-t bg-gray-50">
            Showing {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* -------------------- MODAL -------------------- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {editing ? "Edit Notification" : "New Notification"}
              </h2>
              <button
                onClick={closeModal}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. System Maintenance"
                  className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Short summary shown in the notification list"
                  className="w-full h-10 border border-gray-300 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Detailed description shown when user expands the notification"
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title.trim() || !form.message.trim()}
                className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg shadow hover:shadow-md transition disabled:opacity-50"
              >
                {saving ? "Saving..." : editing ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
