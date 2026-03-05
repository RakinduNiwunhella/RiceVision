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
  <div className="glass glass-hover p-6 text-center">
    <p className="text-xs font-semibold uppercase tracking-widest text-white/70 mb-2">{title}</p>
    <p className="text-4xl font-bold text-white drop-shadow-lg">{value}</p>
    {subtitle && <p className="text-xs text-white/60 mt-2">{subtitle}</p>}
  </div>
);

const ProgressWidget = ({ label, value, color }) => {
  const bar = {
    green: "from-emerald-400 to-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.5)]",
    yellow: "from-amber-400  to-amber-300  shadow-[0_0_12px_rgba(251,191,36,0.5)]",
    blue: "from-blue-400   to-cyan-300   shadow-[0_0_12px_rgba(56,182,255,0.5)]",
  };

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex justify-between text-xs font-semibold text-white/80 mb-1">
        <span>{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bar[color]}`}
          style={{ width: `${value}%`, transition: "width 1s ease" }}
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
    <div className="min-h-[calc(100vh-3rem)] -mx-6 -mt-6">
      {/* Page Content */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-12 space-y-12">

        {/* ── Page Header ── */}
        <div>
          <h1 className="text-3xl font-bold text-white" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}>
            National Overview
          </h1>
          <p className="text-sm text-white/60 mt-1 tracking-wide">Live agricultural intelligence dashboard</p>
        </div>

        {/* ── Row 1: Stat Widgets ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-10">

          {/* Field Health Distribution */}
          <div className="glass glass-hover p-6 flex flex-col">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 mb-4">Field Health Distribution</p>
            <div className="flex-1 min-h-[200px]">
              {healthSummary && (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={healthPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={85}
                      label={({ value }) => `${value.toFixed(1)}%`}
                      labelLine={{ stroke: "rgba(255,255,255,0.4)" }}
                      isAnimationActive={true}
                      activeIndex={-1}
                      style={{ outline: "none", cursor: "default" }}
                    >
                      {healthPieData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i]} />
                      ))}
                    </Pie>
                    <Legend
                      wrapperStyle={{ color: "rgba(255,255,255,0.75)", fontSize: "12px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
              {!healthSummary && (
                <div className="flex items-center justify-center h-52 text-white/40 text-sm">Loading...</div>
              )}
            </div>
          </div>

          {/* Yield Forecast */}
          <div className="glass glass-hover p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 mb-3">Yield Forecast</p>
            <p className="text-5xl font-black text-white leading-none" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.4)" }}>
              {yieldForecast ? formatMT(yieldForecast.total_yield_tons) : (
                <span className="text-2xl text-white/40">Loading…</span>
              )}
            </p>
            <p className="text-xs text-emerald-400 mt-1 font-medium">Metric tonnes projected</p>

            <div className="mt-5 pt-4 border-t border-white/10">
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">Top Producing Districts</p>
              <ul className="space-y-2">
                {bestYieldDistricts.map((d, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span className="text-sm text-white/80">{i + 1}. {d.District}</span>
                    <span className="text-sm font-bold text-emerald-300 tabular-nums">{formatMT(d.total_yield_ton_ha)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Expected Shortfall */}
          <div className="glass glass-hover p-6 flex flex-col justify-between">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 mb-3">Expected Shortfall</p>
            <p className="text-5xl font-black text-white leading-none" style={{ textShadow: "0 4px 30px rgba(0,0,0,0.4)" }}>
              220K MT
            </p>
            <p className="text-xs text-amber-400 mt-1 font-medium">vs 3.0M MT national demand</p>

            <div className="mt-6 rounded-xl overflow-hidden bg-white/10 h-2">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-red-400 rounded-full"
                style={{ width: "7.3%", transition: "width 1.5s ease" }}
              />
            </div>
            <p className="text-xs text-white/40 mt-1.5">7.3% supply gap</p>
          </div>
        </div>

        {/* ── Outbreaks Section ── */}
        <div className="glass p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1">Outbreaks</p>
              <h2 className="text-lg font-bold text-white">Disease & Disaster Monitoring</h2>
            </div>
            <span className="glass-btn text-xs px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white/80">
              {outbreaks.length} active
            </span>
          </div>

          <div className="space-y-2">
            {(showAllOutbreaks ? outbreaks : outbreaks.slice(0, 5)).map((o) => (
              <div
                key={o.id}
                className="flex justify-between items-center px-4 py-3.5 rounded-xl bg-white/8 hover:bg-white/14 transition border border-white/10 hover:border-white/20"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <div className="flex items-center gap-3">
                  {getOutbreakIcon(o.title)}
                  <div>
                    <p className="font-semibold text-white text-sm">{o.title} — {o.district}</p>
                    <p className="text-xs text-white/50 mt-0.5">{o.event_date}</p>
                  </div>
                </div>
                <button className="text-xs font-semibold rounded-full px-4 py-1.5 border border-white/25 text-white/80 hover:bg-white/15 transition">
                  View
                </button>
              </div>
            ))}
          </div>

          {outbreaks.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setShowAllOutbreaks(!showAllOutbreaks)}
                className="text-xs font-semibold rounded-full px-6 py-2 border border-white/25 text-white/80 hover:bg-white/15 transition"
              >
                {showAllOutbreaks ? "Show Less" : `Show All ${outbreaks.length}`}
              </button>
            </div>
          )}
        </div>

        {/* ── NDVI + District Health Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pb-8">

          {/* NDVI Trend */}
          <div className="glass glass-hover p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1">30-Day Trend</p>
            <h3 className="text-lg font-bold text-white mb-5">National NDVI</h3>

            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={ndviTrend}>
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 1]} stroke="rgba(255,255,255,0.2)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  cursor={{ stroke: "rgba(255,255,255,0.2)", strokeWidth: 1 }}
                  contentStyle={{
                    background: "rgba(15,23,42,0.85)",
                    backdropFilter: "blur(20px)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: "12px",
                    padding: "8px 12px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                  }}
                  labelStyle={{ color: "rgba(255,255,255,0.6)", fontSize: "11px" }}
                  itemStyle={{ color: "#6ee7b7", fontSize: "12px", fontWeight: 700 }}
                  formatter={(value) => [`${value.toFixed(3)}`, "NDVI"]}
                />
                <Line dataKey="value" stroke="#6ee7b7" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>

            {healthSummary && (
              <div className="mt-5 pt-4 border-t border-white/10 space-y-2.5">
                <ProgressWidget label="Normal" value={healthSummary.normal_pct} color="green" />
                <ProgressWidget label="Mild Stress" value={healthSummary.mild_stress_pct} color="yellow" />
                <ProgressWidget label="Severe Stress" value={healthSummary.severe_stress_pct} color="blue" />
              </div>
            )}
          </div>

          {/* District Health */}
          <div className="glass glass-hover p-6">
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/50 mb-1">Per District</p>
            <h3 className="text-lg font-bold text-white mb-5">Health Overview</h3>

            <div className="space-y-1">
              {(showAllDistricts ? districtHealth : districtHealth.slice(0, 8)).map((d, i) => {
                const healthPct = Math.round(d.normal_pct);
                const color = healthPct >= 75 ? "#4ade80" : healthPct >= 50 ? "#fbbf24" : "#f87171";
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/8 transition group"
                    style={{ ":hover": { background: "rgba(255,255,255,0.08)" } }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span className="flex-1 text-sm capitalize text-white/85 font-medium">{d.district}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/15 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${healthPct}%`, background: color, transition: "width 1s ease" }} />
                      </div>
                      <span className="text-xs font-bold tabular-nums" style={{ color }}>{healthPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {districtHealth.length > 8 && (
              <div className="mt-4 text-center border-t border-white/10 pt-4">
                <button
                  onClick={() => setShowAllDistricts(!showAllDistricts)}
                  className="text-xs font-semibold rounded-full px-6 py-2 border border-white/25 text-white/80 hover:bg-white/15 transition"
                >
                  {showAllDistricts ? "Show Less" : `Show All ${districtHealth.length}`}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyDashboard;
