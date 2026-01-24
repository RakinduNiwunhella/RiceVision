import React from "react";

const stats = [
  { label: "Total Fields", value: "128" },
  { label: "Healthy Fields", value: "96" },
  { label: "Stressed Fields", value: "24" },
  { label: "Critical Alerts", value: "8" },
];

const tableData = [
  {
    id: "FD-001",
    district: "Ampara",
    stage: "Tillering",
    ndvi: "0.72",
    health: "Healthy",
    updated: "2 hours ago",
  },
  {
    id: "FD-002",
    district: "Gampaha",
    stage: "Vegetative",
    ndvi: "0.48",
    health: "Moderate",
    updated: "5 hours ago",
  },
  {
    id: "FD-003",
    district: "Polonnaruwa",
    stage: "Reproductive",
    ndvi: "0.31",
    health: "Critical",
    updated: "1 day ago",
  },
];

const healthColor = (health) => {
  switch (health) {
    case "Healthy":
      return "text-green-600 bg-green-100";
    case "Moderate":
      return "text-yellow-600 bg-yellow-100";
    case "Critical":
      return "text-red-600 bg-red-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
};

const FieldData = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-slate-950 min-h-screen">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Field Data Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Aggregated satellite-derived insights on paddy field conditions
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 hover:shadow-md dark:hover:shadow-black/40 transition"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {item.label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Field Health Records
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
              <tr>
                <th className="px-4 py-3 text-left">Field ID</th>
                <th className="px-4 py-3 text-left">District</th>
                <th className="px-4 py-3 text-left">Growth Stage</th>
                <th className="px-4 py-3 text-left">NDVI</th>
                <th className="px-4 py-3 text-left">Health Status</th>
                <th className="px-4 py-3 text-left">Last Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tableData.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                    {row.id}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {row.district}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {row.stage}
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                    {row.ndvi}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${healthColor(
                        row.health
                      )}`}
                    >
                      {row.health}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                    {row.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FieldData;