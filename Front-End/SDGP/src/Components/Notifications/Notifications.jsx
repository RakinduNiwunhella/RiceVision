import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { useLanguage } from "../../context/LanguageContext";

const Notifications = ({ onRead, style }) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from("notificationpanel")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (id) => {
    try {
      // update via supabase directly
      const { error } = await supabase
        .from("notificationpanel")
        .update({ is_read: true })
        .eq("id", id);
      if (error) throw error;

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, is_read: true } : n
        )
      );

      if (onRead) onRead(id);
    } catch (error) {
      console.error("Error updating notification:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  return (
    <div style={style} className="glass border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-96 overflow-y-auto p-4 bg-slate-800 dark:bg-slate-900">

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-white">
          {t('notifications')}
        </h3>
      </div>

      {notifications.length === 0 ? (
        <p className="text-white/60 text-sm">{t('noNotifications')}</p>
      ) : (
        notifications.map((note) => (
          <div
            key={note.id}
            onClick={() => markAsRead(note.id)}
            className={`flex items-start gap-3 border-b border-white/10 last:border-none py-3 px-2 rounded-lg cursor-pointer transition-colors duration-200 hover:bg-white/20 dark:hover:bg-white/10 ${
              !note.is_read ? "bg-emerald-500/10 dark:bg-emerald-400/20" : ""
            }`}
          >
            <div className="mt-1">
              {!note.is_read && (
                <span className="w-2 h-2 bg-emerald-500 rounded-full block"></span>
              )}
            </div>

            <div className="flex-1">
              <p className="text-sm text-white wrap-break-word">
                {note.message}
              </p>

              <span className="text-xs text-white/70">
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