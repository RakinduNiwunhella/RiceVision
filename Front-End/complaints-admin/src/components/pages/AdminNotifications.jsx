// src/components/pages/AdminNotifications.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../services/client";
import { PlusIcon } from "@heroicons/react/24/outline";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newNotification, setNewNotification] = useState({ message: "" });

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notificationpanel")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error("Fetch error:", error);
    else setNotifications(data);

    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Add new notification
  const handleAddNotification = async () => {
    if (!newNotification.message) {
      alert("Message is required");
      return;
    }

    setAdding(true);

    const { data, error } = await supabase
      .from("notificationpanel")
      .insert([
        {
          message: newNotification.message,
          is_read: false, // new notifications are unread
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      alert(`Failed to add notification: ${error.message}`);
    } else {
      setNotifications([data, ...notifications]);
      setNewNotification({ message: "" });
    }

    setAdding(false);
  };

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Admin Notifications</h1>

      {/* Add new notification */}
      <div className="bg-white p-4 rounded shadow space-y-3">
        <h2 className="font-semibold">Add New Notification</h2>
        <textarea
          placeholder="Enter notification message"
          className="w-full px-3 py-2 border rounded"
          value={newNotification.message}
          onChange={(e) =>
            setNewNotification({ message: e.target.value })
          }
        />
        <button
          onClick={handleAddNotification}
          disabled={adding}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5" /> Add Notification
        </button>
      </div>

      {/* List notifications */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Message</th>
              <th className="px-4 py-2 text-left">Created At</th>
              <th className="px-4 py-2 text-left">Read</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {notifications.map((n) => (
              <tr key={n.id}>
                <td className="px-4 py-2">{n.message}</td>
                <td className="px-4 py-2">
                  {new Date(n.created_at).toLocaleString()}
                </td>
                <td className="px-4 py-2">{n.is_read ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {notifications.length === 0 && (
          <p className="p-4 text-gray-500">No notifications found.</p>
        )}
      </div>
    </div>
  );
}