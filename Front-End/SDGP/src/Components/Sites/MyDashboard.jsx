// MyDashboard.jsx
import { useState, useEffect, useRef, useMemo } from "react";
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
import { useLanguage } from "../../context/LanguageContext";
import { AlertTriangle, CloudRain, Bug } from "lucide-react";
import TutorialOverlay from "../TutorialOverlay";
import { usePageTutorial } from "../../hooks/usePageTutorial";
import { useNavigate } from "react-router-dom";

import {
  fetchHealthSummary,
  fetchYield,
  fetchBestDistricts,
  fetchOutbreaks,
  fetchDistrictHealth,
  fetchStageDistribution,
} from "../../api/api";



/* ------------------ Components ------------------ */

const StatWidget = ({ title, value, subtitle, icon }) => (
  <div className="glass glass-hover p-4 sm:p-6 md:p-8 text-center relative overflow-hidden group">
    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
      <span className="material-symbols-outlined text-4xl sm:text-6xl">{icon}</span>
    </div>
    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/85 mb-2 sm:mb-3">{title}</p>
    <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-2xl">{value}</p>
    {subtitle && <p className="text-[10px] font-bold text-emerald-400/60 mt-2 sm:mt-3 uppercase tracking-widest">{subtitle}</p>}
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
      <div className="flex justify-between text-[10px] font-black text-white/85 uppercase tracking-widest mb-2">
        <span>{label}</span>
        <span className="text-white/90">{value}%</span>
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
  const { t } = useLanguage();
  const [healthSummary, setHealthSummary] = useState(null);
  const [yieldForecast, setYieldForecast] = useState(null);
  const [bestYieldDistricts, setBestYieldDistricts] = useState([]);
  const [outbreaks, setOutbreaks] = useState([]);
  const [showAllOutbreaks, setShowAllOutbreaks] = useState(false);
  const [districtHealth, setDistrictHealth] = useState([]);
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const [stageDistribution, setStageDistribution] = useState([]);
  const navigate = useNavigate();

  // Refs for tutorial tooltips
  const headerRef = useRef(null);
  const syncBadgeRef = useRef(null);
  const healthCardRef = useRef(null);
  const yieldCardRef = useRef(null);
  const supplyCardRef = useRef(null);
  const threatsCardRef = useRef(null);
  const threatDetailsBtnRef = useRef(null);
  const outbreaksToggleBtnRef = useRef(null);
  const stageChartRef = useRef(null);
  const districtTableRef = useRef(null);
  const districtToggleBtnRef = useRef(null);

  // Tutorial setup - cards, icons, and key actions on dashboard
  const tutorialSteps = useMemo(() => {
    const steps = [
      {
        ref: headerRef,
        title: "Welcome! This is your field control center overview.",
      },
      {
        ref: syncBadgeRef,
        title: "Check this icon to ensure your data is freshly synced.",
      },
      {
        ref: healthCardRef,
        title: "See crop health as a pie chart. Green means optimal.",
      },
      {
        ref: yieldCardRef,
        title: "View your expected total harvest here in metric tons.",
      },
      {
        ref: supplyCardRef,
        title: "Track expected shortfalls and national demand saturation risks quickly.",
      },
      {
        ref: threatsCardRef,
        title: "Review active disease outbreaks and critical pest risks.",
      },
    ]

    if (outbreaks.length > 0) {
      steps.push({
        ref: threatDetailsBtnRef,
        title: "Click here to open detailed recommendations for this threat.",
      })
    }

    if (outbreaks.length > 5) {
      steps.push({
        ref: outbreaksToggleBtnRef,
        title: "Click this to expand or collapse your threat list.",
      })
    }

    steps.push(
      {
        ref: stageChartRef,
        title: "Check what percentage of your crops are in each growth stage.",
      },
      {
        ref: districtTableRef,
        title: "Compare health metrics across all your districts in one table.",
      },
      {
        ref: districtToggleBtnRef,
        title: "Use this button to expand the full district list.",
      },
    )

    return steps
  }, [outbreaks.length])

  const { currentStep, showTutorial, currentTutorialStep, hasMoreSteps, nextStep, prevStep, closeTutorial } =
    usePageTutorial("dashboard", tutorialSteps);

  const stageColors = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444", "#f97316"];

  const pieColors = ["#10b981", "#f59e0b", "#ef4444"]; // Emerald-500, Amber-500, Red-500

  const currentSeason = (yieldForecast?.season || "").toLowerCase() === "yala" ? "Yala" : "Maha";
  const seasonalTargetMT = currentSeason === "Maha" ? 2_600_000 : 1_300_000;
  const seasonalTargetKgs = seasonalTargetMT * 1000;
  const actualYieldKgs = Number(yieldForecast?.total_yield_kgs || 0);
  const expectedShortfallMT = Math.max(0, Math.round((seasonalTargetKgs - actualYieldKgs) / 1000));
  const demandSaturationPct = Math.max(0, Math.min(100, (actualYieldKgs / seasonalTargetKgs) * 100));

  const healthPieData = healthSummary
    ? [
      { name: t('optimal'), value: healthSummary.normal_pct },
      { name: t('mildStress'), value: healthSummary.mild_stress_pct },
      { name: t('severeStress'), value: healthSummary.severe_stress_pct },
    ]
    : [];

  useEffect(() => {
    const loadData = async () => {
      try {
        const [health, yld, best, out, dist, stages] = await Promise.all([
          fetchHealthSummary(),
          fetchYield(),
          fetchBestDistricts(),
          fetchOutbreaks(),
          fetchDistrictHealth(),
          fetchStageDistribution()
        ]);
        setHealthSummary(health);
        setYieldForecast(yld);
        setBestYieldDistricts(best);
        setOutbreaks(out);
        setDistrictHealth(dist);
        setStageDistribution(stages);
      } catch (err) {
        console.error("Dashboard synchronisation error:", err);
      }
    };
    loadData();
  }, []);



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

  const sortedDistrictHealth = useMemo(() => {
    return [...districtHealth].sort((a, b) => {
      const aPestRisk = 100 - Number(a?.normal_pct ?? 0);
      const bPestRisk = 100 - Number(b?.normal_pct ?? 0);
      return bPestRisk - aPestRisk;
    });
  }, [districtHealth]);

  const districtOverview = useMemo(() => {
    if (sortedDistrictHealth.length === 0) {
      return { avgHealth: 0, avgPestRisk: 0, highRiskCount: 0 };
    }

    const totalHealth = sortedDistrictHealth.reduce(
      (sum, district) => sum + Number(district?.normal_pct ?? 0),
      0,
    );

    const avgHealth = Math.round(totalHealth / sortedDistrictHealth.length);
    const avgPestRisk = Math.max(0, 100 - avgHealth);
    const highRiskCount = sortedDistrictHealth.filter(
      (district) => 100 - Number(district?.normal_pct ?? 0) > 70,
    ).length;

    return { avgHealth, avgPestRisk, highRiskCount };
  }, [sortedDistrictHealth]);

  const visibleDistricts = showAllDistricts
    ? sortedDistrictHealth
    : sortedDistrictHealth.slice(0, 12);

  const getRiskMeta = (pestRiskPct) => {
    if (pestRiskPct <= 30) return { label: "Low", color: "#10b981" };
    if (pestRiskPct <= 70) return { label: "Medium", color: "#f59e0b" };
    return { label: "High", color: "#ef4444" };
  };

  /* ------------------ RENDER ------------------ */

  return (
    <div className="min-h-full px-3 py-4 sm:px-6 sm:py-6 lg:p-10 text-white font-sans transition-all duration-500">
      <div className="max-w-7xl mx-auto space-y-6 sm:space-y-10 lg:space-y-12 pb-16 sm:pb-20">

        {/* ── Page Header ── */}
        <div ref={currentStep === 0 ? headerRef : undefined} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
            Welcome to RiceVision
            </h1>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-sm mt-2 font-bold uppercase tracking-[0.2em]">
              {t('Satellite-driven insights for national food security')}
            </p>
          </div>

          <div ref={syncBadgeRef} className="glass px-6 py-3 rounded-2xl border-white/10 flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-white/90">{t('systemSynced')}</span>
          </div>
        </div>

        {/* ── Row 1: Stat Widgets ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-10">

          {/* Field Health Distribution */}
          <div ref={healthCardRef} className="glass glass-hover p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col items-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 self-start flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-sm">radiology</span>
              {t('cropHealthDist')}
            </p>
            <div className="w-full h-[240px] relative">
              {healthSummary ? (
                <ResponsiveContainer width="100%" height={240}>
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
                <div className="absolute inset-0 flex items-center justify-center text-white/85 animate-pulse text-xs font-black uppercase tracking-widest">
                  {t('analysing')}
                </div>
              )}
              {/* Center stats */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-white">{healthSummary?.normal_pct.toFixed(0)}%</span>
                <span className="text-[8px] font-black text-white/85 uppercase tracking-[0.2em]">{t('optimal')}</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 w-full mt-8 pt-6 border-t border-white/5">
              {healthPieData.map((d, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ background: pieColors[i] }} />
                  <span className="text-[10px] font-black text-white/85 uppercase tracking-tighter mb-1 line-clamp-1">{d.name}</span>
                  <span className="text-xs font-bold text-white">{d.value.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Yield Forecast */}
          <div ref={yieldCardRef} className="glass glass-hover p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-cyan-400 text-sm">trending_up</span>
              {t('outputProjection')}
            </p>
            <div className="flex-1 flex flex-col justify-center py-4">
              <p className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tighter leading-none mb-2" style={{ textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
                {yieldForecast ? formatMT(yieldForecast.total_yield_kgs) : "---"}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">{t('metricTons')}</span>
                <div className="flex-1 h-[1px] bg-white/10" />
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/85 mb-4 ml-1">{t('highPerformance')}</p>
              <div className="space-y-4">
                {bestYieldDistricts.map((d, i) => (
                  <div key={i} className="flex justify-between items-center group/item hover:translate-x-1 transition-transform">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-white/85 w-4">{i + 1}</span>
                      <span className="text-xs font-black text-white uppercase tracking-tight group-hover/item:text-cyan-400 transition-colors">{d.District}</span>
                    </div>
                    <span className="text-xs font-black text-white/90 tabular-nums">{formatMT(d.total_yield_kg_ha)} <span className="text-[10px] text-white/85">t</span></span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expected Shortfall */}
          <div ref={supplyCardRef} className="glass glass-hover p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col justify-between md:col-span-2 lg:col-span-1">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/85 mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-sm">error</span>
                {t('supplyStability')}
              </p>
              <div className="py-2">
                <p className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tighter mb-1" style={{ textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>
                  {yieldForecast ? formatMT(expectedShortfallMT) : "---"}
                </p>
                <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">{t('expectedShortfall')}</p>
              </div>
            </div>

            <div className="space-y-4 mt-8">
              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-white/85">
                <span>{t('nationalDemand')}</span>
                <span className="text-white">{demandSaturationPct.toFixed(1)}%</span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-[1px]">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                  style={{ width: `${demandSaturationPct}%`, transition: "width 2s cubic-bezier(0.34, 1.56, 0.64, 1)" }}
                />
              </div>
              <p className="text-[10px] font-bold text-white/85 uppercase tracking-[0.2em] italic text-center">
                {`${t('referenceThreshold')} ${currentSeason} ${formatMT(seasonalTargetMT)} MT`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Active Threats Section (Wider) ── */}
        <div ref={threatsCardRef} className="glass p-2 sm:p-1 rounded-[1.5rem] sm:rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-8 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white/85 flex items-center gap-3">
              <span className="material-symbols-outlined text-rose-500">sensors</span>
              {t('diseaseOutbreak')}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-black text-white/85 uppercase tracking-widest animate-pulse">{t('checkingFields')}</span>
              <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase text-white/85">
                {outbreaks.length} {t('alertsDetected')}
              </div>
            </div>
          </div>

          <div className="p-4 space-y-3">
            {(showAllOutbreaks ? outbreaks : outbreaks.slice(0, 5)).map((o, i) => (
              <div
                key={o.id}
                className="group flex flex-col sm:flex-row justify-between items-start sm:items-center px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 hover:border-white/20 gap-3"
              >
                <div className="flex items-center gap-5">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {getOutbreakIcon(o.title)}
                  </div>
                  <div>
                    <p className="font-black text-white text-sm uppercase tracking-tight">{o.title} — {o.district}</p>
                    <div className="flex items-center gap-3 mt-1 text-[10px] font-black text-white/85 uppercase tracking-widest">
                      <span>{o.event_date}</span>
                      <div className="w-1 h-1 rounded-full bg-white/10" />
                      <span className="text-emerald-400 group-hover:animate-pulse">{t('active')}</span>
                    </div>
                  </div>
                </div>
                <button
                  ref={i === 0 ? threatDetailsBtnRef : undefined}
                  onClick={() => navigate("/alerts")}
                  className="text-[10px] font-black uppercase tracking-[0.2em] rounded-xl px-6 py-2.5 border border-white/10 text-white/85 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all active:scale-95"
                >
                  {t('viewDetails')}
                </button>
              </div>
            ))}
          </div>

          {outbreaks.length > 5 && (
            <div className="px-8 py-6 bg-white/2 flex justify-center border-t border-white/5">
              <button
                ref={outbreaksToggleBtnRef}
                onClick={() => setShowAllOutbreaks(!showAllOutbreaks)}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-white/85 hover:text-white transition-colors flex items-center gap-2"
              >
                {showAllOutbreaks ? t('showLess') : `${t('showAll')} (${outbreaks.length})`}
                <span className="material-symbols-outlined text-sm">{showAllOutbreaks ? 'keyboard_double_arrow_up' : 'keyboard_double_arrow_down'}</span>
              </button>
            </div>
          )}
        </div>

        {/* ── Analytical Depth Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 pb-10 sm:pb-12">

          {/* Stage Distribution */}
          <div ref={stageChartRef} className="glass glass-hover p-4 sm:p-6 md:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-purple-400 text-sm">bar_chart</span>
              {t('growthAnalysis')}
            </p>
            <h3 className="text-xl font-black text-white tracking-tight uppercase mb-6">{t('cropStageDistribution')}</h3>

            {stageDistribution.length > 0 ? (() => {
              const total = stageDistribution.reduce((sum, d) => sum + d.stage_count, 0);
              return (
                <>
                  {/* Total pill */}
                  <div className="flex items-center justify-between mb-5 p-4 rounded-2xl bg-white/5 border border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/85">{t('totalFieldsTracked')}</p>
                    <p className="text-2xl font-black text-white tracking-tighter">{total.toLocaleString()}</p>
                  </div>

                  {/* Bar chart */}
                  <div className="flex-1">
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={stageDistribution} margin={{ top: 5, right: 5, left: -10, bottom: 40 }}>
                        <XAxis
                          dataKey="stage_name"
                          tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 9, fontWeight: 900 }}
                          axisLine={{ stroke: "rgba(255,255,255,0.05)" }}
                          tickLine={false}
                          angle={-35}
                          textAnchor="end"
                          interval={0}
                          height={55}
                        />
                        <YAxis
                          tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9, fontWeight: 900 }}
                          axisLine={false}
                          tickLine={false}
                          width={40}
                          allowDecimals={false}
                        />
                        <Tooltip
                          contentStyle={{ background: "rgba(5,5,20,0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "16px", backdropFilter: "blur(20px)" }}
                          labelStyle={{ color: "#fff", fontSize: "10px", fontWeight: "900", textTransform: "uppercase", letterSpacing: "0.15em" }}
                          itemStyle={{ color: "#a78bfa", fontSize: "11px", fontWeight: "bold" }}
                          cursor={{ fill: "rgba(255,255,255,0.02)" }}
                          formatter={(value) => [`${value.toLocaleString()} fields`, "Count"]}
                        />
                        <Bar dataKey="stage_count" radius={[8, 8, 0, 0]} maxBarSize={56}>
                          {stageDistribution.map((_, i) => (
                            <Cell
                              key={i}
                              fill={stageColors[i % stageColors.length]}
                              style={{ filter: `drop-shadow(0 0 8px ${stageColors[i % stageColors.length]}55)` }}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Per-stage breakdown */}
                  <div className="mt-4 pt-5 border-t border-white/5 flex flex-col gap-2">
                    {stageDistribution.map((d, i) => {
                      const pct = total > 0 ? Math.round((d.stage_count / total) * 100) : 0;
                      const color = stageColors[i % stageColors.length];
                      return (
                        <div key={i} className="flex items-center gap-3 group">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                          <span className="text-[10px] font-black text-white/85 uppercase tracking-tight flex-1 group-hover:text-white/90 transition-colors truncate">{d.stage_name}</span>
                          <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
                          </div>
                          <span className="text-[10px] font-black tabular-nums w-8 text-right" style={{ color }}>{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })() : (
              <div className="flex-1 min-h-75 flex items-center justify-center text-white/85 animate-pulse text-xs font-black uppercase tracking-widest">
                Loading Stage Data...
              </div>
            )}
          </div>

          {/* Regional Health / Pest Overview */}
          <div ref={districtTableRef} className="glass glass-hover p-5 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-white/10 shadow-2xl flex flex-col">
            <div className="flex flex-col gap-5 mb-6">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-white/85">
                <Bug className="text-rose-400" size={14} />
                District Overview
              </div>

              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                  District Pest & Health Status
                </h3>

                <div className="grid grid-cols-3 gap-2 w-full lg:w-auto lg:min-w-[340px]">
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/50">Avg Pest Risk</p>
                    <p className="text-sm font-black tabular-nums text-amber-400 mt-1">{districtOverview.avgPestRisk}%</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/50">Avg Health</p>
                    <p className="text-sm font-black tabular-nums text-emerald-400 mt-1">{districtOverview.avgHealth}%</p>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                    <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/50">High Risk</p>
                    <p className="text-sm font-black tabular-nums text-rose-400 mt-1">{districtOverview.highRiskCount}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-[0.14em] text-white/60">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Low: 0-30%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  Medium: 31-70%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  High: 71-100%
                </span>
              </div>
            </div>

            {districtHealth.length > 0 ? (
              <>
                <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-[0.14em] text-white/55">
                  <span className="col-span-4">District</span>
                  <span className="col-span-3 text-center">Pest Risk</span>
                  <span className="col-span-3 text-center">Health</span>
                  <span className="col-span-2 text-right">Status</span>
                </div>

                <div className="mt-3 flex-1 no-scrollbar overflow-y-auto max-h-[420px] pr-1 space-y-2">
                  {visibleDistricts.map((district, i) => {
                    const healthPct = Math.max(0, Math.min(100, Math.round(Number(district.normal_pct || 0))));
                    const pestRiskPct = 100 - healthPct;
                    const healthColor = healthPct >= 75 ? "#10b981" : healthPct >= 50 ? "#f59e0b" : "#ef4444";
                    const riskMeta = getRiskMeta(pestRiskPct);

                    return (
                      <div
                        key={`${district.district}-${i}`}
                        className="grid grid-cols-1 md:grid-cols-12 items-center gap-3 md:gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all"
                      >
                        <div className="md:col-span-4 flex items-center justify-between md:justify-start gap-3 min-w-0">
                          <div className="w-6 h-6 rounded-lg border border-white/10 bg-white/5 text-[10px] font-black text-white/70 flex items-center justify-center shrink-0">
                            {i + 1}
                          </div>
                          <span className="text-xs font-black text-white/90 uppercase tracking-tight truncate">
                            {district.district}
                          </span>
                          <span
                            className="md:hidden text-[9px] font-black uppercase tracking-[0.12em] px-2 py-1 rounded-full border"
                            style={{
                              color: riskMeta.color,
                              borderColor: `${riskMeta.color}55`,
                              backgroundColor: `${riskMeta.color}1a`,
                            }}
                          >
                            {riskMeta.label} Risk
                          </span>
                        </div>

                        <div className="md:col-span-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="md:hidden text-[9px] font-black uppercase tracking-[0.12em] text-white/55">Pest Risk</span>
                            <span className="text-[10px] font-black tabular-nums" style={{ color: riskMeta.color }}>
                              {pestRiskPct}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${pestRiskPct}%`, background: riskMeta.color }}
                            />
                          </div>
                        </div>

                        <div className="md:col-span-3">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="md:hidden text-[9px] font-black uppercase tracking-[0.12em] text-white/55">Health</span>
                            <span className="text-[10px] font-black tabular-nums" style={{ color: healthColor }}>
                              {healthPct}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/5 border border-white/10 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-1000"
                              style={{ width: `${healthPct}%`, background: healthColor }}
                            />
                          </div>
                        </div>

                        <div className="hidden md:flex md:col-span-2 justify-end">
                          <span
                            className="text-[10px] font-black uppercase tracking-[0.12em] px-2.5 py-1 rounded-full border"
                            style={{
                              color: riskMeta.color,
                              borderColor: `${riskMeta.color}55`,
                              backgroundColor: `${riskMeta.color}1a`,
                            }}
                          >
                            {riskMeta.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="flex-1 min-h-48 flex items-center justify-center text-white/70 animate-pulse text-xs font-black uppercase tracking-widest">
                Loading District Data...
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <button
                ref={districtToggleBtnRef}
                onClick={() => districtHealth.length > 12 && setShowAllDistricts(!showAllDistricts)}
                disabled={districtHealth.length <= 12}
                className={`text-[10px] font-black uppercase tracking-[0.4em] transition-colors ${districtHealth.length > 12 ? "text-white/85 hover:text-white" : "text-white/35 cursor-not-allowed"}`}
              >
                {districtHealth.length <= 12
                  ? `Showing ${districtHealth.length} Districts`
                  : showAllDistricts
                    ? "Show Top 12"
                    : `Show All (${districtHealth.length} Districts)`}
              </button>
            </div>
          </div>

        </div>

        {/* Tutorial Overlay */}
        <TutorialOverlay
          visible={showTutorial}
          steps={tutorialSteps}
          currentStep={currentStep}
          onNext={nextStep}
          onBack={prevStep}
          onSkip={closeTutorial}
          onFinish={closeTutorial}
        />
      </div>
    </div>
  );
};

export default MyDashboard;
