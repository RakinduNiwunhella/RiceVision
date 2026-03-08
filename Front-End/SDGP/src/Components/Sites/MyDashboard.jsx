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
  BarChart,
  Bar,
} from "recharts";
import { AlertTriangle, CloudRain, Bug } from "lucide-react";

import {
  fetchHealthSummary,
  fetchYield,
  fetchBestDistricts,
  fetchOutbreaks,
  fetchDistrictHealth,
  fetchStageDistribution,
} from "../../api/api";
import YieldChatbot from "../chatbot/Yieldchatbot";



/* ------------------ Components ------------------ */

const StatWidget = ({ title, value, subtitle, icon }) => (
  <div className="glass glass-hover p-8 text-center relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
      <span className="material-symbols-outlined text-6xl">{icon}</span>
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">{title}</p>
    <p className="text-5xl font-black text-white tracking-tighter drop-shadow-2xl">{value}</p>
    {subtitle && <p className="text-[10px] font-bold text-emerald-400/60 mt-3 uppercase tracking-widest">{subtitle}</p>}
  </div>
);

const ProgressWidget = ({ label, value, color }) => {
  const bar = {
    green: "from-emerald-500 to-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    yellow: "from-amber-500  to-amber-400  shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    blue: "from-blue-500   to-cyan-400   shadow-[0_0_20px_rgba(59,130,246,0.3)]",
  };

  return (
    <div className="mb-5 last:mb-0">
      <div className="flex justify-between text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">
        <span>{label}</span>
        <span className="text-white/80">{value}%</span>
      </div>
      <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${bar[color]}`}
          style={{ width: `${value}%`, transition: "width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
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
  const [showAllOutbreaks, setShowAllOutbreaks] = useState(false);
  const [districtHealth, setDistrictHealth] = useState([]);
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const [stageDistribution, setStageDistribution] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const stageColors = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444", "#f97316"];

  const pieColors = ["#10b981", "#f59e0b", "#ef4444"]; // Emerald-500, Amber-500, Red-500

  const healthPieData = healthSummary
    ? [
      { name: "Optimal", value: healthSummary.normal_pct },
      { name: "Mild Stress", value: healthSummary.mild_stress_pct },
      { name: "Severe Stress", value: healthSummary.severe_stress_pct },
    ]
    : [];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [health, yld, best, out, dist] = await Promise.all([
          fetchHealthSummary(),
          fetchYield(),
          fetchBestDistricts(),
          fetchOutbreaks(),
          fetchDistrictHealth()
        ]);
        setHealthSummary(health);
        setYieldForecast(yld);
        setBestYieldDistricts(best);
        setOutbreaks(out);
        setDistrictHealth(dist);
      } catch (err) {
        console.error("Dashboard synchronisation error:", err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (districtHealth.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districtHealth[0].district);
    }
  }, [districtHealth]);

  useEffect(() => {
    if (!selectedDistrict) return;
    fetchStageDistribution(selectedDistrict)
      .then(setStageDistribution)
      .catch((err) => console.error("Stage distribution error:", err));
  }, [selectedDistrict]);

  const formatMT = (value) => {
    if (!value) return "-";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M";
    if (value >= 1_000) return (value / 1_000).toFixed(1) + "K";
    return value.toLocaleString();
  };

  const getOutbreakIcon = (title) => {
    const t = title.toLowerCase();
    if (t.includes("flood") || t.includes("rain") || t.includes("storm"))
      return <CloudRain size={18} className="text-blue-400" />;
    if (t.includes("pest") || t.includes("insect"))
      return <Bug size={18} className="text-rose-400" />;
    return <AlertTriangle size={18} className="text-amber-400" />;
  };

  /* ------------------ RENDER ------------------ */

  return (
    <div className="min-h-full p-6 lg:p-10 text-white font-sans transition-all duration-500">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">

        {/* ── Page Header ── */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              Welcome to RiceVision
            </h1>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-sm mt-2 font-bold uppercase tracking-[0.2em]">
              Insights of smarter farming
            </p>
          </div>

          <div className="glass px-6 py-3 rounded-2xl border-white/10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/60">System Synchronized</span>
          </div>
        </div>

        {/* ── Row 1: Stat Widgets ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">

          {/* Field Health Distribution */}
          <div className="glass glass-hover p-8 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 self-start flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-sm">radiology</span>
              Crop Health Distribution
            </p>
            <div className="w-full aspect-square max-h-[240px] relative">
              {healthSummary ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthPieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={95}
                      stroke="none"
                      paddingAngle={8}
                      isAnimationActive={true}
                      animationDuration={1500}
                    >
                      {healthPieData.map((_, i) => (
                        <Cell key={i} fill={pieColors[i]} style={{ filter: `drop-shadow(0 0 10px ${pieColors[i]}44)` }} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', backdropFilter: 'blur(10px)' }}
                      itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-white/20 animate-pulse text-xs font-black uppercase tracking-widest">
                  Analysing...
                </div>
              )}
              {/* Center stats */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">{healthSummary?.normal_pct.toFixed(0)}%</span>
                <span className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em]">Optimal</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full mt-8 pt-6 border-t border-white/5">
              {healthPieData.map((d, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ background: pieColors[i] }} />
                  <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter mb-1 line-clamp-1">{d.name}</span>
                  <span className="text-xs font-bold text-white">{d.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Yield Forecast */}
          <div className="glass glass-hover p-8 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-sm">trending_up</span>
              Output Projection
            </p>
            <div className="flex-1 flex flex-col justify-center py-4">
              <p className="text-6xl font-black text-white tracking-tighter leading-none mb-2" style={{ textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
                {yieldForecast ? formatMT(yieldForecast.total_yield_kgs) : "---"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Metric Tons (Est.)</span>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4 ml-1">High Performance Sectors</p>
              <div className="space-y-4">
                {bestYieldDistricts.map((d, i) => (
                  <div key={i} className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-white/20 w-4">{i + 1}</span>
                      <span className="text-xs font-black text-white uppercase tracking-tight group-hover/item:text-cyan-400 transition-colors">{d.District}</span>
                    </div>
                    <span className="text-xs font-black text-white/80 tabular-nums">{formatMT(d.total_yield_kg_ha)} <span className="text-[10px] text-white/20">t</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expected Shortfall */}
          <div className="glass glass-hover p-8 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-sm">error</span>
                Supply Stability
              </p>
              <div className="py-2">
                <p className="text-5xl font-black text-white tracking-tighter mb-1" style={{ textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>220K</p>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Expected Shortfall (MT)</p>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-white/30">
                <span>National Demand Saturation</span>
                <span className="text-white">92.7%</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  style={{ width: "92.7%", transition: "width 2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                />
              </div>
              <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] italic text-center">Reference: 3.0M MT Threshold</p>
            </div>
          </div>
        </div>

        {/* ── Active Threats Section (Wider) ── */}
        <div className="glass p-1 rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-8 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-500">sensors</span>
              Disease & Disaster Outbreak
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest animate-pulse">Checking Fields...</span>
              <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white/60">
                {outbreaks.length} Alerts Detected
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {(showAllOutbreaks ? outbreaks : outbreaks.slice(0, 5)).map((o) => (
              <div
                key={o.id}
                className="group flex justify-between items-center px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20"
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getOutbreakIcon(o.title)}
                  </div>
                  <div>
                    <p className="font-black text-white text-sm uppercase tracking-tight">{o.title} — {o.district}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-black text-white/30 uppercase tracking-widest">
                      <span>{o.event_date}</span>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-emerald-400 group-hover:animate-pulse">Active</span>
                    </div>
                  </div>
                </div>
                <button className="text-[10px] font-black uppercase tracking-[0.2em] rounded-xl px-6 py-2.5 border border-white/10 text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all active:scale-95">
                  View Details
                </button>
              </div>
            ))}
          </div>

          {outbreaks.length > 5 && (
            <div className="px-8 py-6 bg-white/2 flex justify-center border-t border-white/5">
              <button
                onClick={() => setShowAllOutbreaks(!showAllOutbreaks)}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-colors flex items-center gap-2"
              >
                {showAllOutbreaks ? "Show Less" : `Show All  (${outbreaks.length} )`}
                <span className="material-symbols-outlined text-sm">{showAllOutbreaks ? 'keyboard_double_arrow_up' : 'keyboard_double_arrow_down'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Analytical Depth Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">

          {/* Regional Health Overview */}
          <div className="glass glass-hover p-8 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-sm">map</span>
              District Overview
            </p>
            <h3 className="text-xl font-black text-white tracking-tight uppercase mb-8">District Health Status</h3>

            <div className="flex-1 space-y-2 no-scrollbar overflow-y-auto max-h-[420px] pr-2">
              {(showAllDistricts ? districtHealth : districtHealth.slice(0, 12)).map((d, i) => {
                const healthPct = Math.round(d.normal_pct);
                const color = healthPct >= 75 ? "#10b981" : healthPct >= 50 ? "#f59e0b" : "#ef4444";
                return (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                      <span className="text-xs font-black text-white/70 uppercase tracking-tight group-hover:text-white transition-colors">{d.district}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                        <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${healthPct}%`, background: color }} />
                      </div>
                      <span className="text-[10px] font-black tabular-nums w-8 text-right" style={{ color }}>{healthPct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <button
                onClick={() => setShowAllDistricts(!showAllDistricts)}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 hover:text-white transition-colors"
              >
                {showAllDistricts ? "Show Less" : `Show All (${districtHealth.length} Items)`}
              </button>
            </div>
          </div>

          {/* Stage Distribution Bar Chart */}
          <div className="glass glass-hover p-8 rounded-[3rem] border border-white/10 shadow-2xl flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-sm">bar_chart</span>
              Growth Analysis
            </p>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Stage Distribution</h3>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="text-[10px] font-black uppercase tracking-wider text-white/60 bg-white/5 border border-white/10 rounded-xl px-4 py-2 outline-none cursor-pointer hover:bg-white/10 transition-colors appearance-none"
              >
                {districtHealth.map((d) => (
                  <option key={d.district} value={d.district} className="bg-[#0f172a] text-white">
                    {d.district}
                  </option>
                ))}
              </select>
            </div>

            {stageDistribution.length > 0 ? (
              <>
                <div className="flex-1 min-h-65">
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={stageDistribution} margin={{ top: 10, right: 10, left: 10, bottom: 60 }}>
                      <XAxis
                        dataKey="stage_name"
                        tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9, fontWeight: 900 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                        tickLine={false}
                        angle={-40}
                        textAnchor="end"
                        interval={0}
                        height={70}
                      />
                      <YAxis
                        label={{
                          value: "Count",
                          angle: -90,
                          position: "insideLeft",
                          offset: -5,
                          style: { fill: "rgba(255,255,255,0.25)", fontSize: 9, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" },
                        }}
                        tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 900 }}
                        axisLine={false}
                        tickLine={false}
                        width={55}
                        allowDecimals={false}
                      />
                      <Tooltip
                        contentStyle={{ background: "rgba(0,0,0,0.85)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "15px", backdropFilter: "blur(10px)" }}
                        labelStyle={{ color: "#fff", fontSize: "10px", fontWeight: "900", textTransform: "uppercase" }}
                        itemStyle={{ color: "#a78bfa", fontSize: "10px", fontWeight: "bold" }}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                        formatter={(value) => [value, "Fields"]}
                      />
                      <Bar dataKey="stage_count" radius={[8, 8, 0, 0]}>
                        {stageDistribution.map((_, i) => (
                          <Cell
                            key={i}
                            fill={stageColors[i % stageColors.length]}
                            style={{ filter: `drop-shadow(0 0 8px ${stageColors[i % stageColors.length]}66)` }}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-6 pt-6 border-t border-white/5 grid grid-cols-3 gap-3">
                  {stageDistribution.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: stageColors[i % stageColors.length], boxShadow: `0 0 6px ${stageColors[i % stageColors.length]}` }} />
                      <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter truncate">{d.stage_name}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex-1 min-h-75 flex items-center justify-center text-white/20 animate-pulse text-xs font-black uppercase tracking-widest">
                {selectedDistrict ? "Loading Stage Data..." : "Select a District"}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyDashboard;
