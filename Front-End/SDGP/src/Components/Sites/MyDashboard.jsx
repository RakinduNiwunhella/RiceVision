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
import { supabase } from "../../supabaseClient";

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
  const [outbreaks, setOutbreaks] = useState([]);
  const [ndviTrend, setNdviTrend] = useState([]);
  const [showAllOutbreaks, setShowAllOutbreaks] = useState(false);
  const [districtHealth, setDistrictHealth] = useState([]);

  const pieColors = ["#10b981", "#f59e0b", "#ef4444"];

  const healthPieData = healthSummary
    ? [
        { name: "Normal", value: healthSummary.normal_pct },
        { name: "Mild Stress", value: healthSummary.mild_stress_pct },
        { name: "Severe Stress", value: healthSummary.severe_stress_pct },
      ]
    : [];

  /* ------------------ FETCH HEALTH ------------------ */
  useEffect(() => {
    const fetchHealthSummary = async () => {
      const { data } = await supabase
        .from("paddy_health_summary_view")
        .select("normal_pct, mild_stress_pct, severe_stress_pct")
        .eq("district", "kurunegala")
        .single();

      setHealthSummary(data);
    };

    fetchHealthSummary();
  }, []);

  /* ------------------ FETCH YIELD ------------------ */
  useEffect(() => {
    const fetchYieldForecast = async () => {
      const { data } = await supabase
        .from("yield_forecast_view")
        .select("total_yield_tons, confidence")
        .eq("district", "kurunegala")
        .single();

      setYieldForecast(data);
    };

    fetchYieldForecast();
  }, []);

  /* ------------------ FETCH OUTBREAKS ------------------ */
  useEffect(() => {
    const fetchOutbreaks = async () => {
      const { data } = await supabase
        .from("disaster_risk_overview_view")
        .select("id, title, district, event_date")
        .order("event_date", { ascending: false });

      setOutbreaks(data || []);
    };

    fetchOutbreaks();
  }, []);

  /* ------------------ FETCH NATIONAL NDVI TREND ------------------ */
  useEffect(() => {
    const fetchNdviTrend = async () => {
      const { data, error } = await supabase
        .from("national_ndvi_trend_view")
        .select("date, mean_ndvi")
        .order("date", { ascending: true });

      if (!error && data) {
        setNdviTrend(
          data.map((row) => ({
            day: row.date,
            value: row.mean_ndvi,
          }))
        );
      }
    };

    fetchNdviTrend();
  }, []);

  /* ------------------ FETCH DISTRICT HEALTH OVERVIEW ------------------ */
  useEffect(() => {
    const fetchDistrictHealth = async () => {
      const { data, error } = await supabase
        .from("paddy_health_summary_view")
        .select("district, normal_pct")
        .order("normal_pct", { ascending: false });

      if (!error && data) {
        setDistrictHealth(data);
      }
    };

    fetchDistrictHealth();
  }, []);

  const formatMT = (value) => {
    if (!value) return "-";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M MT";
    if (value >= 1_000) return (value / 1_000).toFixed(1) + "K MT";
    return value.toFixed(1) + " MT";
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
                    >
                      {healthPieData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#334155" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <StatWidget
            title="Yield Forecast (MT)"
            value={
              yieldForecast
                ? formatMT(yieldForecast.total_yield_tons)
                : "Loading..."
            }
            subtitle={
              yieldForecast
                ? `Confidence: ${yieldForecast.confidence}%`
                : null
            }
          />

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
              <div>
                <p className="font-medium text-slate-900 dark:text-white">
                  {o.title} – {o.district}
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{o.event_date}</p>
              </div>

              <button className="text-sm rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 transition">
                View
              </button>
            </div>
          ))}

          {outbreaks.length > 5 && (
            <div className="px-6 py-4 text-center border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowAllOutbreaks(!showAllOutbreaks)}
                className="text-sm rounded-md bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 transition"
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
              <Tooltip contentStyle={{ backgroundColor: "#020617", borderColor: "#334155" }} />
              <Line dataKey="value" stroke="#10b981" />
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

          {districtHealth.map((d, i) => (
            <div
              key={i}
              className="flex justify-between px-4 py-3 text-sm border-b border-gray-200 dark:border-gray-700 last:border-b-0"
            >
              <span className="font-medium capitalize text-slate-900 dark:text-white">{d.district}</span>
              <span className="text-slate-700 dark:text-slate-300">{Math.round(d.normal_pct)}% Healthy</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyDashboard;