import React, { useEffect, useState, useRef } from "react";

const Notifications = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const panelRef = useRef();

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    try {
      const BASE_URL =
        import.meta.env.VITE_API_BASE || "https://ricevision-backend.onrender.com";
      const response = await fetch(`${BASE_URL}/notifications`);
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const BASE_URL =
        import.meta.env.VITE_API_BASE || "https://ricevision-backend.onrender.com";
      await fetch(`${BASE_URL}/notifications/${id}/read`, {
        method: "PUT",
      });

      // Mark as read locally
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Count of unread notifications
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div
      ref={panelRef}
      className="absolute right-6 top-16 w-80 backdrop-blur-lg bg-white/20 dark:bg-slate-800/40 border border-white/30 dark:border-slate-700 rounded-xl shadow-2xl p-4 z-50 animate-fade-in"
      style={{ animation: "fadeIn 0.3s ease-in-out" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Notifications
        </h3>
        {unreadCount > 0 && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-white bg-emerald-500 rounded-full">
            {unreadCount}
          </span>
        )}
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-sm">No notifications</p>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2">
          {notifications.map((note) => (
            <div
              key={note.id}
              onClick={() => markAsRead(note.id)}
              className={`flex items-start gap-3 border-b border-white/20 last:border-none p-2 rounded-lg cursor-pointer transition hover:bg-white/10 ${
                !note.is_read ? "bg-emerald-100/20 dark:bg-emerald-500/20" : ""
              }`}
            >
              {!note.is_read && (
                <span className="relative w-2 h-2 mt-2">
                  <span className="absolute inline-flex w-full h-full rounded-full bg-emerald-400 opacity-75 animate-ping"></span>
                  <span className="relative block w-2 h-2 bg-emerald-500 rounded-full"></span>
                </span>
              )}
              <div className="flex-1">
                <p className="text-sm text-slate-800 dark:text-slate-200">
                  {note.message}
                </p>
                <span className="text-xs text-slate-400">
                  {new Date(note.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;