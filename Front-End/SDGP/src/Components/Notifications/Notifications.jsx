import React, { useEffect, useState } from "react";
import {
  fetchNotifications as apiFetchNotifications,
  fetchNotificationUnreadCount,
  markNotificationRead,
} from "../../api/api";

const Notifications = ({ onRead, onUnreadCountChange, style }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  // fetch notifications (backend returns user-specific read state via JWT)
  const loadNotifications = async () => {
    try {
      const data = await apiFetchNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const { unread_count } = await fetchNotificationUnreadCount();
      if (onUnreadCountChange) onUnreadCountChange(unread_count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await markNotificationRead(notificationId);

      // update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      if (onRead) onRead(notificationId);

      // use unread_count from backend response
      if (onUnreadCountChange && result.unread_count != null) {
        onUnreadCountChange(result.unread_count);
      } else {
        loadUnreadCount();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    loadNotifications();
    loadUnreadCount();
  }, []);

  return (
    <>
      <div
        style={style}
        onClick={(e) => e.stopPropagation()}
        className="glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[calc(100vh-20px)] overflow-y-auto p-4 bg-slate-800 dark:bg-slate-900 transition-all"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">
            Notifications
          </h3>
        </div>

        {notifications.length === 0 ? (
          <p className="text-white/85 text-sm">No notifications</p>
        ) : (
          notifications.map((note) => {
            const isSelected = selectedNotification?.id === note.id;
            return (
              <div
                key={note.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedNotification((prev) =>
                    prev && prev.id === note.id ? null : note
                  );
                }}
                className={`flex flex-col gap-2 border-b border-white/10 last:border-none p-3 rounded-lg cursor-pointer transition-all duration-300 hover:bg-white/10 ${
                  !note.is_read ? "bg-emerald-500/10 dark:bg-emerald-400/20" : ""
                } ${isSelected ? "shadow-lg bg-white/5" : ""}`}
              >
                <div className="flex items-start gap-3 relative">
                  <div className="flex items-center gap-2">
                    {!note.is_read && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(note.id);
                        }}
                        className="w-2 h-2 bg-emerald-500 rounded-full flex-shrink-0 cursor-pointer transition-all duration-200"
                        title="Mark as read"
                      ></span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-white font-medium">{note.title}</p>
                      <p className="text-xs text-white/80">{note.message}</p>
                      <span className="text-xs text-white/60">
                        {new Date(note.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {isSelected && note.description && (
                  <div className="mt-2 px-3 py-2 rounded bg-white/10 text-sm text-white/90 transition-all duration-300">
                    {note.description}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default Notifications;