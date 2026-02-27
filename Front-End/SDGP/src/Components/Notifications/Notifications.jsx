import React, { useEffect, useState } from "react";

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE || "https://ricevision-backend.onrender.com";
      const response = await fetch(`${BASE_URL}/notifications`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      const BASE_URL = import.meta.env.VITE_API_BASE || "https://ricevision-backend.onrender.com";
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: "PUT",
      });

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div className="absolute right-6 top-16 w-80 bg-white dark:bg-slate-800 shadow-lg rounded-lg p-4 z-50 border border-slate-200 dark:border-slate-700">

      <h3 className="text-lg font-semibold mb-3 text-slate-800 dark:text-slate-200">
        Notifications
      </h3>

      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No notifications</p>
      ) : (
        notifications.map((note) => (
          <div
            key={note.id}
            onClick={() => markAsRead(note.id)}
            className={`flex items-start gap-3 border-b border-slate-200 dark:border-slate-700 last:border-none py-3 px-2 rounded cursor-pointer transition hover:bg-slate-100 dark:hover:bg-slate-700 ${
              !note.is_read ? "bg-blue-50 dark:bg-slate-700/60" : ""
            }`}
          >
            <div className="mt-1">
              {!note.is_read && (
                <span className="w-2 h-2 bg-blue-500 rounded-full block"></span>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {note.message}
              </p>

              <span className="text-xs text-slate-400">
                {new Date(note.created_at).toLocaleString()}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;