import { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";

function NotificationPanel({ onClose }) {

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {

    const { data, error } = await supabase
      .from("notificationpanel")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setNotifications(data);
    }
  };

  return (
    <div className="absolute right-0 top-12 w-80 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl rounded-2xl p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-white font-semibold text-sm">Notifications</h3>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white text-xs"
        >
          Close
        </button>
      </div>

      {notifications.length === 0 ? (
        <p className="text-white/60 text-sm">No notifications</p>
      ) : (
        <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 rounded-xl bg-white/10 border border-white/10 backdrop-blur-md hover:bg-white/20 transition"
            >
              <p className="text-white text-xs leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotificationPanel;