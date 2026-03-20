import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

const Notifications = ({ onRead, onUnreadCountChange, style }) => {
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [userId, setUserId] = useState(null);

  // get logged user
  const getUser = async () => {
    const { data } = await supabase.auth.getUser();
    return data.user;
  };

  // fetch notifications and join user_notifications for current user
  const fetchNotifications = async (uid) => {
    // left join user_notifications for the current user
    const { data, error } = await supabase
      .from("notificationpanel")
      .select(`
        id,
        title,
        message,
        description,
        created_at,
        user_notifications:user_notifications!notification_id(
          is_read
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // For each notification, user_notifications may be [] or undefined if not present for this user
      const formatted = data.map((n) => ({
        ...n,
        is_read: n.user_notifications?.[0]?.is_read || false,
      }));
      setNotifications(formatted);
    }
  };

  const fetchUnreadCount = async () => {
    if (!userId) return;
    const { data, error, count } = await supabase
      .from("user_notifications")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (!error) {
      const unreadCount = count || 0;
      if (onUnreadCountChange) onUnreadCountChange(unreadCount);
    }
  };

  const markAsRead = async (notificationId) => {
    if (!userId) return;
    try {
      // check if row exists
      const { data: existing, error: selectError } = await supabase
        .from("user_notifications")
        .select("*")
        .eq("user_id", userId)
        .eq("notification_id", notificationId)
        .single();

      if (selectError && selectError.code !== "PGRST116") throw selectError;

      if (existing) {
        // update row
        const { error: updateError } = await supabase
          .from("user_notifications")
          .update({ is_read: true })
          .eq("user_id", userId)
          .eq("notification_id", notificationId);
        if (updateError) throw updateError;
      } else {
        // insert new row
        const { error: insertError } = await supabase
          .from("user_notifications")
          .insert({ user_id: userId, notification_id: notificationId, is_read: true });
        if (insertError) throw insertError;
      }

      // update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, is_read: true } : n
        )
      );

      if (onRead) onRead(notificationId);

      // fetch updated unread count
      fetchUnreadCount();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const user = await getUser();
      if (user) {
        setUserId(user.id);
        await fetchNotifications(user.id);
        await fetchUnreadCount();
      }
    };

    loadData();
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
                          markAsRead(note.id);
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