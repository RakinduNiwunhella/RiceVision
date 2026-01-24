import React, { useState, useMemo } from "react";

const alertsData = [
  {
    id: 1,
    title: "Drought",
    description: "Soil moisture dropped below 30% in Field A. Irrigation recommended.",
    status: "Open",
    priority: "High",
    field: "Field A",
    timestamp: "2026-01-09T06:30:00Z",
  },
  {
    id: 2,
    title: "Heat Stress",
    description: "Temperature exceeded 35°C in Field B. Risk of crop heat stress.",
    status: "Open",
    priority: "Medium",
    field: "Field B",
    timestamp: "2026-01-09T07:00:00Z",
  },
  {
    id: 3,
    title: "Not Applicable",
    description: "Signs of pest infestation detected in Field C. Field inspection advised.",
    status: "Open",
    priority: "High",
    field: "Field C",
    timestamp: "2026-01-09T08:15:00Z",
  },
  {
    id: 4,
    title: "Drought",
    description: "Irrigation system malfunction detected in Field D.",
    status: "Open",
    priority: "High",
    field: "Field D",
    timestamp: "2026-01-09T09:00:00Z",
  },
  {
    id: 5,
    title: "Not Applicable",
    description: "Nitrogen levels are below the recommended threshold in Field E.",
    status: "Open",
    priority: "Medium",
    field: "Field E",
    timestamp: "2026-01-09T09:30:00Z",
  },
  {
    id: 6,
    title: "Flood",
    description: "Heavy rainfall predicted. Flood risk detected in Field F.",
    status: "Open",
    priority: "High",
    field: "Field F",
    timestamp: "2026-01-09T10:00:00Z",
  },
  {
    id: 7,
    title: "Not Applicable",
    description: "Excessive weed growth detected in Field G.",
    status: "Open",
    priority: "Medium",
    field: "Field G",
    timestamp: "2026-01-09T10:45:00Z",
  },
  {
    id: 8,
    title: "Heat Stress",
    description: "Unusual temperature fluctuations detected in Field H.",
    status: "Open",
    priority: "Medium",
    field: "Field H",
    timestamp: "2026-01-09T11:15:00Z",
  },
  {
    id: 9,
    title: "Not Applicable",
    description: "Crop flowering stage slightly delayed in Field A.",
    status: "Resolved",
    priority: "Low",
    field: "Field A",
    timestamp: "2026-01-08T14:00:00Z",
  },
  {
    id: 10,
    title: "Not Applicable",
    description: "Early warning signs detected during crop health scan in Field B.",
    status: "Open",
    priority: "High",
    field: "Field B",
    timestamp: "2026-01-09T12:00:00Z",
  },
  {
    id: 11,
    title: "Not Applicable",
    description: "Sensor connectivity issue reported in Field C.",
    status: "Denied",
    priority: "High",
    field: "Field C",
    timestamp: "2026-01-09T12:30:00Z",
  },
  {
    id: 12,
    title: "Heat Stress",
    description: "High wind and temperature conditions detected in Field D.",
    status: "Open",
    priority: "Medium",
    field: "Field D",
    timestamp: "2026-01-09T13:00:00Z",
  },
  {
    id: 13,
    title: "Drought",
    description: "Predicted yield is below expected levels due to water stress in Field E.",
    status: "Open",
    priority: "Medium",
    field: "Field E",
    timestamp: "2026-01-09T13:30:00Z",
  },
  {
    id: 14,
    title: "Flood",
    description: "Waterlogging detected. Drainage required in Field F.",
    status: "Open",
    priority: "High",
    field: "Field F",
    timestamp: "2026-01-09T14:00:00Z",
  },
  {
    id: 15,
    title: "Salinity Stress",
    description: "Soil salinity levels are high in Field G. Crop stress likely.",
    status: "Resolved",
    priority: "Medium",
    field: "Field G",
    timestamp: "2026-01-08T15:00:00Z",
  },
];

const tabOptions = ["Open", "Resolved", "Denied", "All"];

const Alerts = () => {
  const [alerts, setAlerts] = useState(alertsData);
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

  const handleResolve = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Resolved" } : a))
    );
  };

  const handleDeny = (id) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "Denied" } : a))
    );
  };

  const formatTimestamp = (iso) => new Date(iso).toLocaleString();

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 dark:bg-slate-950 min-h-screen text-gray-900 dark:text-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Paddy Field Risk Alerts</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-gray-200 dark:border-gray-700">
        {tabOptions.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 font-semibold border-b-4 ${
              activeTab === tab
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
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
        className="w-full mb-6 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />

      {/* Alerts */}
      <div className="space-y-5 max-h-[70vh] overflow-y-auto">
        {filteredAlerts.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400">No alerts found</p>
        )}

        {filteredAlerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-6 rounded-xl border-l-8 shadow-sm transition
  ${
    alert.status === "Open"
      ? "border-red-500 bg-red-50 dark:bg-red-950/30"
      : alert.status === "Resolved"
      ? "border-green-500 bg-green-50 dark:bg-green-950/30"
      : "border-gray-500 bg-gray-100 dark:bg-slate-800"
  }`}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {alert.title}
              <span className="text-sm text-gray-500 ml-2">
                ({alert.field})
              </span>
            </h2>

            <p className="mt-2 text-gray-700 dark:text-gray-300">{alert.description}</p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Priority: {alert.priority} | {formatTimestamp(alert.timestamp)}
            </p>

            {alert.status === "Open" && (
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => handleResolve(alert.id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition"
                >
                  Resolve
                </button>
                <button
                  onClick={() => handleDeny(alert.id)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 transition"
                >
                  Deny
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Alerts;