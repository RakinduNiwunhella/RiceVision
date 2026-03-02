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

      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id ? { ...alert, _justUpdated: true } : alert,
        ),
      );

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
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-6 lg:space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
              Paddy Field Risk Alerts
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Monitor live field conditions, triage critical issues, and track
              resolution status
            </p>
          </div>
          <div className="inline-flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-2 shadow-sm">
            <div className="flex items-baseline gap-1">
              <span className="text-xs uppercase tracking-wide text-gray-500">
                Total
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {counts.All}
              </span>
            </div>
            <span className="h-4 w-px bg-gray-200" />
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="flex h-1.5 w-1.5 rounded-full bg-red-500" />
              <span>Open {counts.Open}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="inline-flex gap-1 rounded-3xl border border-gray-200 bg-gray-100 p-1.5 shadow-sm">
            {tabOptions.map((tab) => {
              const isActive = activeTab === tab;

              const activeClasses = isActive
                ? tab === "Open"
                  ? "bg-red-500 text-white shadow-sm"
                  : tab === "Resolved"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : tab === "Ignored"
                      ? "bg-gray-700 text-white shadow-sm"
                      : "bg-gray-900 text-white shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white";

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative rounded-2xl px-4 py-2.5 text-xs font-medium sm:px-6 sm:text-sm
                    transition-colors duration-150 ${activeClasses}`}
                >
                  <span>{tab}</span>
                  <span
                    className={`ml-2 inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[10px] sm:text-xs
                      ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-white text-gray-600 border border-gray-200"
                      }`}
                  >
                    {counts[tab]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="w-full lg:max-w-sm">
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z"
                  />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 py-3.5
                  text-sm text-gray-900 placeholder-gray-400 shadow-sm
                  focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white/80 px-3 py-4 shadow-sm sm:px-4 sm:py-5">
          <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
            {filteredAlerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-9-3a1 1 0 112 0 1 1 0 01-2 0zm.25 3.25a.75.75 0 000 1.5h.5v3a.75.75 0 001.5 0v-3A1.75 1.75 0 009.25 10h-.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium text-gray-800">
                  No alerts found
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Adjust your filters or search to refine the results.
                </p>
              </div>
            )}

            {filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-7"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50">
                      <span
                        className={`h-2.5 w-2.5 rounded-full
                          ${
                            alert.status === "Open"
                              ? "bg-red-500"
                              : alert.status === "Resolved"
                                ? "bg-emerald-500"
                                : "bg-gray-400"
                          }`}
                      />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-lg font-semibold tracking-tight text-gray-900 sm:text-xl">
                        {alert.title}
                      </h2>

                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold sm:text-xs
                        ${
                          alert.status === "Open"
                            ? "bg-red-50 text-red-600"
                            : alert.status === "Resolved"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {alert.description}
                </p>

                <div className="mt-4 flex flex-col gap-2 text-[11px] text-gray-500 sm:flex-row sm:items-center sm:justify-between sm:text-xs">
                  <span className="inline-flex items-center gap-2">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 text-amber-500"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10.75 2.75a.75.75 0 0 0-1.5 0V10c0 .199.079.39.22.53l4 4a.75.75 0 1 0 1.06-1.06l-3.78-3.78V2.75Z" />
                        <path d="M4.5 10a5.5 5.5 0 0 1 8.535-4.556.75.75 0 1 0 .83-1.244A7 7 0 1 0 15.25 15a.75.75 0 0 0-1.5 0A5.5 5.5 0 0 1 4.5 10Z" />
                      </svg>
                    </span>
                    <span className="text-xs text-gray-600">
                      Priority: {alert.priority}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-2 tabular-nums">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-gray-200 bg-gray-50">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="1.6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6l3 3m5-3a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z"
                        />
                      </svg>
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimestamp(alert.timestamp)}
                    </span>
                  </span>
                </div>

                {alert.status === "Open" && (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button
                      onClick={() => handleResolve(alert.id)}
                      disabled={updatingId === alert.id}
                      className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white
                        shadow-sm transition-all duration-150 hover:bg-emerald-700 hover:shadow-md
                        disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {updatingId === alert.id ? "Updating..." : "Resolve"}
                    </button>
                    <button
                      onClick={() => handleIgnore(alert.id)}
                      disabled={updatingId === alert.id}
                      className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700
                        shadow-sm transition-all duration-150 hover:bg-gray-50 hover:shadow-md
                        disabled:cursor-not-allowed disabled:opacity-60"
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
    </div>
  );
};

export default Alerts;
