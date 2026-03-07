import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "../../supabaseClient";

/* ── helpers ──────────────────────────────────────────── */

function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return "Just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function groupByDay(items) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yest = new Date(today);
  yest.setDate(today.getDate() - 1);

  const groups = { Today: [], Yesterday: [], Earlier: [] };
  items.forEach((n) => {
    const d = new Date(n.created_at);
    d.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime()) groups.Today.push(n);
    else if (d.getTime() === yest.getTime()) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  });
  return groups;
}

function inferType(message = "") {
  const m = message.toLowerCase();
  if (m.includes("flood") || m.includes("disaster") || m.includes("critical") || m.includes("severe"))
    return "critical";
  if (m.includes("warning") || m.includes("alert") || m.includes("risk") || m.includes("drought"))
    return "warning";
  if (m.includes("success") || m.includes("optimal") || m.includes("harvest") || m.includes("good"))
    return "success";
  return "info";
}

const TYPE_META = {
  critical: {
    icon: "emergency",
    dot: "bg-red-500",
    iconCls: "text-red-400",
    iconBg: "bg-red-500/20 border-red-500/30",
    bar: "bg-red-500",
    label: "Critical",
  },
  warning: {
    icon: "warning",
    dot: "bg-amber-400",
    iconCls: "text-amber-400",
    iconBg: "bg-amber-500/20 border-amber-500/30",
    bar: "bg-amber-400",
    label: "Warning",
  },
  success: {
    icon: "check_circle",
    dot: "bg-emerald-400",
    iconCls: "text-emerald-400",
    iconBg: "bg-emerald-500/20 border-emerald-500/30",
    bar: "bg-emerald-400",
    label: "Update",
  },
  info: {
    icon: "info",
    dot: "bg-cyan-400",
    iconCls: "text-cyan-400",
    iconBg: "bg-cyan-500/20 border-cyan-500/30",
    bar: "bg-cyan-400",
    label: "Info",
  },
};

/* ── component ────────────────────────────────────────── */

function NotificationPanel({ onClose, anchorRef }) {
  const [notifications, setNotifications] = useState([]);
  const [readIds, setReadIds]             = useState(new Set());
  const [expandedId, setExpandedId]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const panelRef = useRef(null);

  /* close on outside click */
  useEffect(() => {
    function handle(e) {
      const clickedPanel  = panelRef.current && panelRef.current.contains(e.target);
      const clickedAnchor = anchorRef?.current && anchorRef.current.contains(e.target);
      if (!clickedPanel && !clickedAnchor) onClose();
    }
    const id = setTimeout(() => document.addEventListener("mousedown", handle), 10);
    return () => { clearTimeout(id); document.removeEventListener("mousedown", handle); };
  }, [onClose, anchorRef]);

  /* initial fetch */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notificationpanel")
        .select("*")
        .order("created_at", { ascending: false });
      if (!cancelled) {
        if (!error && data) setNotifications(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const refetch = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("notificationpanel")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setNotifications(data);
    setLoading(false);
  };

  const handleCardClick = (id) => {
    setReadIds((prev) => new Set([...prev, id]));
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;
  const groups      = groupByDay(notifications);

  const panel = (
    <div
      ref={panelRef}
      style={{
        position: "fixed",
        top: "72px",
        right: "24px",
        width: "400px",
        zIndex: 9999,
        animation: "notifSlideIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both",
      }}
    >
      {/* ── Liquid Glass shell ── */}
      <div style={{
        position: "relative",
        borderRadius: "24px",
        /* heavy blur + dark-teal tint — readable but translucent */
        background: "rgba(8, 20, 34, 0.38)",
        backdropFilter: "blur(56px) saturate(190%)",
        WebkitBackdropFilter: "blur(56px) saturate(190%)",
        border: "1px solid rgba(255,255,255,0.14)",
        borderTop: "1px solid rgba(255,255,255,0.52)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: "580px",
      }}>

        {/* iridescent shimmer overlay — like real glass */}
        <div style={{
          position: "absolute", inset: 0, borderRadius: "inherit", pointerEvents: "none", zIndex: 0,
          background: "linear-gradient(145deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0.03) 40%, rgba(130,200,255,0.05) 70%, rgba(255,255,255,0.09) 100%)",
        }} />

        {/* all real content sits above the shimmer */}
        <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", maxHeight: "580px" }}>

          {/* ── Header ── */}
          <div style={{ borderBottom: "1px solid rgba(255,255,255,0.09)", padding: "15px 18px 13px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="material-symbols-outlined" style={{ fontSize: 20, color: "#34d399" }}>
                  notifications
                </span>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span style={{
                    fontSize: 10, fontWeight: 800,
                    background: "rgba(52,211,153,0.18)",
                    color: "#6ee7b7",
                    border: "1px solid rgba(52,211,153,0.35)",
                    borderRadius: 999, padding: "2px 9px", letterSpacing: "0.04em",
                    backdropFilter: "blur(8px)",
                  }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    style={{
                      fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.40)",
                      background: "none", border: "none", cursor: "pointer",
                      padding: "4px 8px", borderRadius: 8, transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) => (e.target.style.color = "#34d399")}
                    onMouseLeave={(e) => (e.target.style.color = "rgba(255,255,255,0.40)")}
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{
                    width: 28, height: 28, display: "flex", alignItems: "center",
                    justifyContent: "center",
                    background: "rgba(255,255,255,0.07)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 9, cursor: "pointer", color: "rgba(255,255,255,0.45)",
                    transition: "all 0.2s",
                    backdropFilter: "blur(8px)",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>close</span>
                </button>
              </div>
            </div>
          </div>

          {/* ── Body ── */}
          <div
            className="notif-scroll"
            style={{ overflowY: "auto", flex: 1, padding: "8px 10px 6px" }}
          >
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "52px 0", gap: 12 }}>
                <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid rgba(52,211,153,0.2)", borderTopColor: "#34d399", animation: "notifSpin 0.8s linear infinite" }} />
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>Loading…</span>
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "52px 0", gap: 12 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 18,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  backdropFilter: "blur(12px)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 28, color: "rgba(255,255,255,0.20)" }}>notifications_off</span>
                </div>
                <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 500 }}>No notifications yet</p>
              </div>
            ) : (
              Object.entries(groups).map(([label, items]) => {
                if (items.length === 0) return null;
                return (
                  <div key={label}>
                    <p style={{
                      fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                      letterSpacing: "0.18em", color: "rgba(255,255,255,0.28)",
                      padding: "12px 8px 5px",
                    }}>
                      {label}
                    </p>
                    {items.map((n) => {
                      const type   = n.type || inferType(n.message);
                      const meta   = TYPE_META[type] || TYPE_META.info;
                      const isRead = readIds.has(n.id);
                      const isOpen = expandedId === n.id;

                      /* per-type accent colours (raw values for inline styles) */
                      const ACCENT = {
                        critical: { rgb: "239,68,68" },
                        warning:  { rgb: "251,191,36" },
                        success:  { rgb: "52,211,153" },
                        info:     { rgb: "34,211,238" },
                      }[type] || { rgb: "34,211,238" };

                      return (
                        <div
                          key={n.id}
                          onClick={() => handleCardClick(n.id)}
                          style={{
                            marginBottom: 6,
                            borderRadius: 16,
                            /* glass card — each card is also a glass surface */
                            background: isOpen
                              ? `rgba(${ACCENT.rgb},0.10)`
                              : isRead
                                ? "rgba(255,255,255,0.04)"
                                : "rgba(255,255,255,0.08)",
                            backdropFilter: "blur(20px)",
                            WebkitBackdropFilter: "blur(20px)",
                            border: isRead
                              ? "1px solid rgba(255,255,255,0.08)"
                              : `1px solid rgba(${ACCENT.rgb},0.28)`,
                            borderTop: isRead
                              ? "1px solid rgba(255,255,255,0.13)"
                              : `1px solid rgba(${ACCENT.rgb},0.45)`,
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                            overflow: "hidden",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `rgba(${ACCENT.rgb},0.12)`;
                            e.currentTarget.style.borderColor = `rgba(${ACCENT.rgb},0.35)`;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = isOpen
                              ? `rgba(${ACCENT.rgb},0.10)`
                              : isRead ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.08)";
                            e.currentTarget.style.borderColor = isRead
                              ? "rgba(255,255,255,0.08)"
                              : `rgba(${ACCENT.rgb},0.28)`;
                          }}
                        >
                          {/* ── Collapsed row ── */}
                          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px" }}>

                            {/* Icon badge — glass pill */}
                            <div style={{
                              width: 36, height: 36, borderRadius: 12, flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: `rgba(${ACCENT.rgb},0.15)`,
                              border: `1px solid rgba(${ACCENT.rgb},0.30)`,
                            }}>
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: 18, color: `rgb(${ACCENT.rgb})` }}
                              >
                                {meta.icon}
                              </span>
                            </div>

                            {/* Text */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                                <span style={{
                                  fontSize: 9, fontWeight: 900, textTransform: "uppercase",
                                  letterSpacing: "0.14em", color: `rgb(${ACCENT.rgb})`,
                                  opacity: isRead ? 0.55 : 0.9,
                                }}>
                                  {meta.label}
                                </span>
                                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.30)", flexShrink: 0 }}>
                                  {relativeTime(n.created_at)}
                                </span>
                              </div>
                              <p style={{
                                fontSize: 12, lineHeight: 1.45, margin: 0,
                                color: isRead ? "rgba(255,255,255,0.42)" : "rgba(255,255,255,0.92)",
                                overflow: "hidden", textOverflow: "ellipsis",
                                whiteSpace: isOpen ? "normal" : "nowrap",
                              }}>
                                {n.message}
                              </p>
                            </div>

                            {/* Chevron + unread dot */}
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5, flexShrink: 0 }}>
                              {!isRead && (
                                <span style={{
                                  width: 6, height: 6, borderRadius: "50%",
                                  background: `rgb(${ACCENT.rgb})`,
                                }} />
                              )}
                              <span
                                className="material-symbols-outlined"
                                style={{
                                  fontSize: 17, color: "rgba(255,255,255,0.28)",
                                  transition: "transform 0.25s cubic-bezier(0.34,1.56,0.64,1)",
                                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                                }}
                              >
                                expand_more
                              </span>
                            </div>
                          </div>

                          {/* ── Expanded detail ── */}
                          {isOpen && (
                            <div style={{
                              padding: "0 13px 14px 59px",
                              borderTop: `1px solid rgba(${ACCENT.rgb},0.15)`,
                            }}>
                              <p style={{
                                fontSize: 13, lineHeight: 1.7,
                                color: "rgba(255,255,255,0.85)",
                                margin: "11px 0 9px",
                              }}>
                                {n.message}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                                {n.district && (
                                  <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.42)" }}>
                                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>location_on</span>
                                    {n.district}
                                  </span>
                                )}
                                <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: "rgba(255,255,255,0.32)" }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: 13 }}>schedule</span>
                                  {new Date(n.created_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Footer ── */}
          {notifications.length > 0 && (
            <div style={{
              borderTop: "1px solid rgba(255,255,255,0.08)",
              padding: "10px 18px",
              display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.22)" }}>
                {notifications.length} notification{notifications.length !== 1 ? "s" : ""}
              </span>
              <button
                onClick={refetch}
                style={{
                  display: "flex", alignItems: "center", gap: 4,
                  fontSize: 10, color: "rgba(255,255,255,0.32)",
                  background: "none", border: "none", cursor: "pointer",
                  padding: "4px 8px", borderRadius: 8, transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#34d399")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.32)")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 13 }}>refresh</span>
                Refresh
              </button>
            </div>
          )}

        </div>{/* /z-index wrapper */}
      </div>{/* /glass shell */}

      <style>{`
        @keyframes notifSlideIn {
          from { opacity: 0; transform: translateY(-12px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes notifSpin { to { transform: rotate(360deg); } }
        .notif-scroll::-webkit-scrollbar { width: 4px; }
        .notif-scroll::-webkit-scrollbar-track { background: transparent; }
        .notif-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.10);
          border-radius: 999px;
        }
        .notif-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.20);
        }
      `}</style>
    </div>
  );

  return createPortal(panel, document.body);
}

export default NotificationPanel;
