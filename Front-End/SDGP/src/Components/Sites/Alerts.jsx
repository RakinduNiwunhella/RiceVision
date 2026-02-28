import React, { useState, useMemo, useEffect } from "react";
import { fetchAlerts, updateAlertStatus } from "../../api/api";

const tabOptions = ["Open", "Resolved", "Ignored", "All"];

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState("Open");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      const matchesTab = activeTab === "All" || alert.status === activeTab;
      const matchesSearch =
        alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [alerts, activeTab, searchTerm]);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const data = await fetchAlerts();
        setAlerts(data);
      } catch (err) {
        console.error("Error fetching alerts:", err);
      }
    };

    loadAlerts();
  }, []);

  const counts = useMemo(() => {
    const countObj = { Open: 0, Resolved: 0, Ignored: 0 };
    alerts.forEach((alert) => {
      if (countObj[alert.status] !== undefined) {
        countObj[alert.status]++;
      }
    });
    countObj.All = alerts.length;
    return countObj;
  }, [alerts]);

  const updateStatus = async (id, newStatus) => {
    try {
      setUpdatingId(id);

      // Trigger animation first
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id ? { ...alert, _justUpdated: true } : alert,
        ),
      );

      // Wait 300ms before changing status
      setTimeout(async () => {
        setAlerts((prev) =>
          prev.map((alert) =>
            alert.id === id
              ? { ...alert, status: newStatus, _justUpdated: false }
              : alert,
          ),
        );

        await updateAlertStatus(id, newStatus);
      }, 300);
    } catch (err) {
      console.error("Error updating alert:", err);
    } finally {
      setTimeout(() => setUpdatingId(null), 300);
    }
  };

  const handleResolve = (id) => {
    updateStatus(id, "Resolved");
  };

  const handleIgnore = (id) => {
    updateStatus(id, "Ignored");
  };

  const formatTimestamp = (iso) => new Date(iso).toLocaleString();

  return (
    <div
      className="
        min-h-screen p-10
        bg-slate-70 dark:bg-slate-950
      "
    >
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
          Paddy Field Risk Alerts
        </h1>

        {/* Tabs */}
        <div className="mb-10 flex justify-center">
          <div
            className="
              relative inline-flex p-2 rounded-3xl
              bg-white/30 dark:bg-slate-800/30
              backdrop-blur-xl
              border border-white/40 dark:border-slate-700/50
              shadow-[0_20px_60px_rgba(0,0,0,0.15)]
            "
          >
            {tabOptions.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 text-sm font-semibold rounded-2xl
                  transition-all duration-300
                  ${
                    activeTab === tab
                      ? tab === "Open"
                        ? "bg-red-500/10 text-red-600 border border-red-400/40"
                        : tab === "Resolved"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-400/40"
                          : tab === "Ignored"
                            ? "bg-gray-500/10 text-gray-600 border border-gray-400/40"
                            : "bg-slate-200/50 text-slate-800 border border-slate-300"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }
                `}
              >
                {tab}
                <span className="ml-2 text-xs opacity-70">{counts[tab]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search alerts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-8 px-6 py-4 rounded-2xl
            bg-white/70 dark:bg-slate-900/70
            backdrop-blur-lg
            border border-slate-300 dark:border-slate-700
            text-slate-800 dark:text-slate-200
            placeholder-slate-500
            focus:ring-2 focus:ring-emerald-400/40
            focus:border-emerald-400
            transition-all duration-300"
        />

        {/* Alerts */}
        <div className="space-y-5 max-h-[70vh] overflow-y-auto">
          {filteredAlerts.length === 0 && (
            <p className="text-center text-slate-500 dark:text-slate-400">
              No alerts found
            </p>
          )}

          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`relative p-8 rounded-3xl
                backdrop-blur-xl
                bg-white/100 dark:bg-slate-950
                border
                ${
                  alert.status === "Open"
                    ? "border-red-400/40"
                    : alert.status === "Resolved"
                      ? "border-emerald-400/40"
                      : "border-gray-400/40"
                }
                
                transition-all duration-500 ease-in-out
              
                hover:-translate-y-1
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
                    {alert.title}
                  </h2>

                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full
                      ${
                        alert.status === "Open"
                          ? "bg-red-500/10 text-red-600"
                          : alert.status === "Resolved"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-gray-400/10 text-gray-600"
                      }`}
                  >
                    {alert.status}
                  </span>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {alert.description}
              </p>

              <div className="mt-4 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>Priority: {alert.priority}</span>
                <span>{formatTimestamp(alert.timestamp)}</span>
              </div>

              {alert.status === "Open" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleResolve(alert.id)}
                    disabled={updatingId === alert.id}
                    className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 hover:scale-105"
                  >
                    {updatingId === alert.id ? "Updating..." : "Resolve"}
                  </button>
                  <button
                    onClick={() => handleIgnore(alert.id)}
                    disabled={updatingId === alert.id}
                    className="px-4 py-2 text-sm font-medium bg-slate-700 text-white rounded-xl hover:bg-slate-800 transition-all duration-200 hover:scale-105"
                  >
                    {updatingId === alert.id ? "Updating..." : "Ignore"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
