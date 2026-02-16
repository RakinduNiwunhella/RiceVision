import React, { useEffect, useState } from "react";

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
  const [stats, setStats] = useState([]);
  const [districtData, setDistrictData] = useState([]);

  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        // 1️⃣ Fetch summary stats from FastAPI
        const summaryRes = await fetch("http://127.0.0.1:8000/field-data/summary");
        if (!summaryRes.ok) throw new Error("Failed to fetch summary");
        const summary = await summaryRes.json();

        setStats([
          { label: "Total Fields", value: summary.total_fields },
          { label: "Healthy Fields", value: summary.healthy_fields },
          { label: "Stressed Fields", value: summary.stressed_fields },
          { label: "Critical Alerts", value: summary.critical_alerts },
        ]);

        // 2️⃣ Fetch district table data from FastAPI
        const districtRes = await fetch("http://127.0.0.1:8000/field-data/districts");
        if (!districtRes.ok) throw new Error("Failed to fetch districts");
        const districts = await districtRes.json();

        setDistrictData(districts);
      } catch (error) {
        console.error("API Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">
          Loading field data...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
            Field Data Overview
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Aggregated satellite-derived insights on paddy field conditions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-xl bg-white dark:bg-slate-800 shadow-sm p-4"
            >
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {item.value}
              </p>
            </div>
          ))}
        </div>

        {/* Table Section */}
        <div className="rounded-xl bg-white dark:bg-slate-800 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-slate-900 dark:text-white">
              District-wise Paddy Health & Yield Summary
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">District</th>
                  <th className="px-4 py-3 text-left">Total Fields</th>
                  <th className="px-4 py-3 text-left">Healthy</th>
                  <th className="px-4 py-3 text-left">Stressed</th>
                  <th className="px-4 py-3 text-left">Critical</th>
                  <th className="px-4 py-3 text-left">Avg NDVI</th>
                  <th className="px-4 py-3 text-left">Avg Yield (t/ha)</th>
                  <th className="px-4 py-3 text-left">Total Yield (tons)</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {districtData.map((d) => (
                  <tr
                    key={d.district}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition"
                  >
                    <td className="px-4 py-3 font-medium">{d.district}</td>
                    <td className="px-4 py-3">{d.total_fields}</td>

                    <td className="px-4 py-3 text-green-600">
                      {d.healthy_fields}
                    </td>
                    <td className="px-4 py-3 text-yellow-600">
                      {d.stressed_fields}
                    </td>
                    <td className="px-4 py-3 text-red-600">
                      {d.critical_fields}
                    </td>

                    <td className="px-4 py-3">{d.avg_ndvi}</td>
                    <td className="px-4 py-3">{d.avg_yield_ton_ha}</td>
                    <td className="px-4 py-3 font-medium">
                      {d.total_yield_tons}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FieldData;
