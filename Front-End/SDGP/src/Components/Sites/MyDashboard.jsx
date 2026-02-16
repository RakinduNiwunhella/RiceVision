// MyDashboard.jsx
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { AlertTriangle, CloudRain, Bug } from "lucide-react";

import {
  fetchHealthSummary,
  fetchYield,
  fetchBestDistricts,
  fetchOutbreaks,
  fetchNDVITrend,
  fetchDistrictHealth
} from "../../api/api";



/* ------------------ Components ------------------ */

const StatWidget = ({ title, value, subtitle }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
    <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
    <p className="text-3xl font-semibold text-slate-900 dark:text-white">
      {value}
    </p>
    {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

const ProgressWidget = ({ label, value, color }) => {
  const bar = {
    green: "bg-emerald-500",
    yellow: "bg-amber-400",
    blue: "bg-blue-500",
  };

  return (
    <div>
      <div className="flex justify-between text-sm text-slate-500 dark:text-slate-400 mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
        <div
          className={`h-2 rounded-full ${bar[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

/* ------------------ MAIN ------------------ */

const MyDashboard = () => {
  const [healthSummary, setHealthSummary] = useState(null);
  const [yieldForecast, setYieldForecast] = useState(null);
  const [bestYieldDistricts, setBestYieldDistricts] = useState([]);
  const [outbreaks, setOutbreaks] = useState([]);
  const [ndviTrend, setNdviTrend] = useState([]);
  const [showAllOutbreaks, setShowAllOutbreaks] = useState(false);
  const [districtHealth, setDistrictHealth] = useState([]);
  const [showAllDistricts, setShowAllDistricts] = useState(false);

  const pieColors = ["#15803d", "#f59e0b", "#ef4444"];

  const healthPieData = healthSummary
    ? [
        { name: "Normal", value: healthSummary.normal_pct },
        { name: "Mild Stress", value: healthSummary.mild_stress_pct },
        { name: "Severe Stress", value: healthSummary.severe_stress_pct },
      ]
    : [];

  /* ------------------ FETCH HEALTH (via FastAPI) ------------------ */
useEffect(() => {
  const loadHealth = async () => {
    try {
      const data = await fetchHealthSummary();
      setHealthSummary(data);
    } catch (err) {
      console.error("Failed to load health summary:", err);
    }
  };

  loadHealth();
}, []);

  /* ------------------ FETCH YIELD (via FastAPI) ------------------ */
useEffect(() => {
  const loadYield = async () => {
    try {
      const data = await fetchYield();
      setYieldForecast(data);
    } catch (err) {
      console.error("Failed to load yield:", err);
    }
  };

  loadYield();
}, []);

  /* ------------------ FETCH BEST YIELD DISTRICTS (via FastAPI) ------------------ */
useEffect(() => {
  const loadBestDistricts = async () => {
    try {
      const data = await fetchBestDistricts();
      setBestYieldDistricts(data);
    } catch (err) {
      console.error("Failed to load best districts:", err);
    }
  };

  loadBestDistricts();
}, []);
  /* ------------------ FETCH OUTBREAKS (via FastAPI) ------------------ */
useEffect(() => {
  const loadOutbreaks = async () => {
    try {
      const data = await fetchOutbreaks();
      setOutbreaks(data);
    } catch (err) {
      console.error("Failed to load outbreaks:", err);
    }
  };

  loadOutbreaks();
}, []);

  /* ------------------ FETCH NATIONAL NDVI TREND (via FastAPI) ------------------ */
useEffect(() => {
  const loadNDVI = async () => {
    try {
      const data = await fetchNDVITrend();
      setNdviTrend(data);
    } catch (err) {
      console.error("Failed to load NDVI trend:", err);
    }
  };

  loadNDVI();
}, []);

  /* ------------------ FETCH DISTRICT HEALTH OVERVIEW (via FastAPI) ------------------ */
useEffect(() => {
  const loadDistrictHealth = async () => {
    try {
      const data = await fetchDistrictHealth();
      setDistrictHealth(data);
    } catch (err) {
      console.error("Failed to load district health:", err);
    }
  };

  loadDistrictHealth();
}, []);

  const formatMT = (value) => {
    if (!value) return "-";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M MT";
    if (value >= 1_000) return (value / 1_000).toFixed(1) + "K MT";
    return value.toFixed(1) + " MT";
  };

  const getOutbreakIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("flood") || t.includes("rain") || t.includes("storm"))
      return <CloudRain className="w-5 h-5 text-blue-500" />;
    if (t.includes("pest") || t.includes("insect"))
      return <Bug className="w-5 h-5 text-rose-500" />;
    return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  };

  /* ------------------ RENDER ------------------ */

  return (
    <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6 text-slate-700 dark:text-slate-300">

      {/* OVERVIEW */}
      <div>
        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">National Overview</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
              Field Health Distribution
            </h3>

            <div className="w-full h-64">
              {healthSummary && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      label={({ value }) => `${value.toFixed(1)}%`}
                      isAnimationActive={false}
                      activeIndex={-1}
                      style={{ outline: "none", cursor: "default" }}
                    >
                      {healthPieData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i]} />
                      ))}
                    </Pie>
                    
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-5 shadow-sm">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Yield Forecast (MT)
            </p>

            <p className="text-3xl font-semibold text-slate-900 dark:text-white mt-1">
              {yieldForecast
                ? formatMT(yieldForecast.total_yield_tons)
                : "Loading..."}
            </p>


            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
                Top Producing Districts
              </p>

              <ul className="space-y-1">
                {bestYieldDistricts.map((d, i) => (
                  <li
                    key={i}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-slate-700 dark:text-slate-300">
                      {i + 1}. {d.District}
                    </span>
                    <span className="font-medium text-emerald-700">
                      {formatMT(d.total_yield_ton_ha)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <StatWidget
            title="Expected Shortfall (MT)"
            value="220K MT"
            subtitle="vs 3.0M MT demand"
          />
        </div>
      </div>

      {/* OUTBREAKS */}
      <div className="mt-12">
        <h2 className="text-lg font-medium text-slate-900 dark:text-white">Outbreaks</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Disease and disaster outbreak monitoring
        </p>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          {(showAllOutbreaks ? outbreaks : outbreaks.slice(0, 5)).map((o) => (
            <div
              key={o.id}
              className="flex justify-between items-center px-6 py-4 hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <div className="flex items-start gap-3">
                {getOutbreakIcon(o.title)}
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">
                    {o.title} – {o.district}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{o.event_date}</p>
                </div>
              </div>

              <button className="text-sm rounded-md bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 transition">
                View
              </button>
            </div>
          ))}

          {outbreaks.length > 5 && (
            <div className="px-6 py-4 text-center border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAllOutbreaks(!showAllOutbreaks)}
                className="text-sm rounded-md bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 transition"
              >
                {showAllOutbreaks ? "View Less" : "View More"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* LOWER ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-12">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
            National NDVI Trend (30 days)
          </h3>

          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={ndviTrend}>
              <XAxis dataKey="day" stroke="#64748b" />
              <YAxis domain={[0, 1]} stroke="#64748b" />
              <Tooltip
                cursor={{ strokeDasharray: "3 3", strokeWidth: 1 }}
                contentStyle={{
                  backgroundColor: "rgba(15, 23, 42, 0.95)",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.25)",
                }}
                labelStyle={{ color: "#94a3b8", fontSize: "12px" }}
                itemStyle={{ color: "#10b981", fontSize: "13px", fontWeight: 500 }}
                formatter={(value) => [`${value.toFixed(3)} NDVI`, "Index"]}
              />
              <Line dataKey="value" stroke="#059669" />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-4 space-y-3">
            {healthSummary && (
              <>
                <ProgressWidget
                  label="Normal"
                  value={healthSummary.normal_pct}
                  color="green"
                />
                <ProgressWidget
                  label="Mild Stress"
                  value={healthSummary.mild_stress_pct}
                  color="yellow"
                />
                <ProgressWidget
                  label="Severe Stress"
                  value={healthSummary.severe_stress_pct}
                  color="blue"
                />
              </>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
            District Health Overview
          </h3>

          {(showAllDistricts ? districtHealth : districtHealth.slice(0, 7)).map((d, i) => (
            <div
              key={i}
              className="flex justify-between px-4 py-3 text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <span className="font-medium capitalize text-slate-900 dark:text-white">{d.district}</span>
              <span className="text-slate-700 dark:text-slate-300">{Math.round(d.normal_pct)}% Healthy</span>
            </div>
          ))}
          {districtHealth.length > 7 && (
            <div className="px-4 py-4 text-center border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAllDistricts(!showAllDistricts)}
                className="text-sm rounded-md bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-1.5 transition"
              >
                {showAllDistricts ? "Show Less" : "Show More"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDashboard;