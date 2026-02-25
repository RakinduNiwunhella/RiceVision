import React, { useState, useMemo, useEffect } from "react";

const tabOptions = ["Open", "Resolved", "Denied", "All"];

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [activeTab, setActiveTab] = useState("Open");
  const [searchTerm, setSearchTerm] = useState("");

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
    const fetchAlerts = async () => {
      try {
        const res = await fetch("https://ricevision-backend.onrender.com/api/alerts/all");
        const data = await res.json();
        setAlerts(data);
      } catch (err) {
        console.error("Error fetching alerts from backend:", err);
      }
    };

    fetchAlerts();
  }, []);

  const counts = useMemo(() => {
    const countObj = { Open: 0, Resolved: 0, Denied: 0 };
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
      await fetch(`https://ricevision-backend.onrender.com/api/alerts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const res = await fetch("https://ricevision-backend.onrender.com/api/alerts/all");
      const data = await res.json();
      setAlerts(data);
    } catch (err) {
      console.error("Error updating alert:", err);
    }
  };

  const handleResolve = (id) => {
    updateStatus(id, "Resolved");
  };

  const handleDeny = (id) => {
    updateStatus(id, "Denied");
  };

  const formatTimestamp = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 max-w-6xl mx-auto text-slate-900 dark:text-white">
        <h1 className="text-3xl font-bold mb-6 text-slate-900 dark:text-white">
          Paddy Field Risk Alerts
        </h1>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-slate-200 dark:border-slate-700">
          {tabOptions.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 px-4 font-semibold border-b-4 rounded transition ${
                activeTab === tab
                  ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                  : "border-transparent text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              }`}
            >
              {tab} ({counts[tab]})
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search alerts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full mb-6 px-4 py-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
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
              className={`p-6 rounded-xl border-l-8 shadow-sm transition bg-white dark:bg-slate-800 ${
                alert.status === "Open"
                  ? "border-red-500"
                  : alert.status === "Resolved"
                  ? "border-emerald-500"
                  : "border-gray-500"
              }`}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {alert.title}
                <span className="text-sm text-slate-500 dark:text-slate-400 ml-2">
                  ({alert.field})
                </span>
              </h2>

              <p className="mt-2 text-slate-700 dark:text-slate-300">
                {alert.description}
              </p>

              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Priority: {alert.priority} | {formatTimestamp(alert.timestamp)}
              </p>

              {alert.status === "Open" && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => handleResolve(alert.id)}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 dark:hover:bg-emerald-500 transition"
                  >
                    Resolve
                  </button>
                  <button
                    onClick={() => handleDeny(alert.id)}
                    className="px-4 py-2 bg-gray-700 dark:bg-gray-600 text-white rounded-lg hover:bg-gray-800 dark:hover:bg-gray-500 transition"
                  >
                    Deny
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
