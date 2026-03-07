import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Report = () => {
  const districts = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

  const [mode, setMode] = useState("single");
  const [configA, setConfigA] = useState({ district: "Anuradhapura", date: "2026-03-06", season: "Maha" });
  const [configB, setConfigB] = useState({ district: "Gampaha", date: "2026-03-06", season: "Maha" });
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  const fetchData = async (conf, setter) => {
    try {
      const res = await fetch(`http://localhost:8000/api/detailed-report?date=${conf.date}&district=${conf.district}&season=${conf.season}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.detail || "Data not found");
      setter(json);
    } catch (err) {
      setter({ error: true, message: err.message });
    }
  };

  useEffect(() => {
    fetchData(configA, setDataA);
    if (mode === "compare") fetchData(configB, setDataB);
  }, [configA, configB, mode]);

  const generatePDF = (report, config) => {
    const doc = new jsPDF();
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("RICEVISION ANALYTICS REPORT", 15, 25);
    doc.setFontSize(10);
    doc.text(`District: ${config.district} | Season: ${config.season} | Date: ${config.date}`, 15, 33);
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(14);
    doc.text("Agricultural Forecast Summary", 15, 55);
    const tableData = [
      ["Predicted Average Yield", `${report.summary.yield.toLocaleString()} kg / ha`],
      ["Total Estimated Production", `${report.summary.total_kg.toLocaleString()} kg`],
      ["Historical Baseline", `${report.summary.historical.toLocaleString()} kg/ha`],
      ["Growth Stage", report.categories.current_stage],
      ["Health Status", report.categories.health_status],
      ["Pest Attack Count", report.metrics.pest_count],
      ["General Risk Score", report.metrics.risk_score.toFixed(2)],
      ["Estimated Harvest Date", report.metrics.harvest_date]
    ];
    doc.autoTable({
      startY: 60,
      head: [['Metric', 'Value']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129] }
    });
    doc.save(`RiceVision_${config.district}_Report.pdf`);
  };

  const getPestStatus = (count) => {
    if (count === 0) return { label: "SAFE", color: "text-emerald-400" };
    if (count < 20) return { label: "MODERATE", color: "text-amber-400" };
    return { label: "CRITICAL", color: "text-red-400" };
  };

  const getRiskStatus = (score) => {
    if (score < 1) return { label: "STABLE", color: "text-emerald-400" };
    if (score < 4) return { label: "WARNING", color: "text-amber-400" };
    return { label: "HIGH RISK", color: "text-red-400" };
  };

  const ReportPane = ({ report, config, setConfig, title }) => {
    if (report?.error) return (
      <div className="flex-1 glass p-12 rounded-[3rem] text-center border border-red-500/20">
        <span className="material-symbols-outlined text-5xl text-red-400/40 mb-4 block">signal_disconnected</span>
        <h3 className="text-red-400 font-black uppercase tracking-widest mb-3 text-sm">Data Unavailable</h3>
        <p className="text-xs text-white/30 mb-6">{report.message}</p>
        <input
          type="date"
          value={config.date}
          onChange={(e) => setConfig({ ...config, date: e.target.value })}
          className="bg-white/5 border border-white/10 text-[10px] p-3 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
        />
      </div>
    );

    if (!report) return (
      <div className="flex-1 glass rounded-[3rem] p-20 text-center animate-pulse">
        <p className="text-white/20 font-black uppercase tracking-widest text-xs">Fetching Satellite Data...</p>
      </div>
    );

    const chartData = [
      { name: 'Yield', value: report.summary.yield, color: '#10b981' },
      { name: 'Historical', value: report.summary.historical, color: '#6366f1' }
    ];

    return (
      <div className="flex-1 glass glass-hover rounded-[3rem] p-8 border border-white/10 shadow-2xl">
        {/* Pane header */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="col-span-2 flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {title} VIEW
            </span>
            <button
              onClick={() => generatePDF(report, config)}
              className="flex items-center gap-2 text-[10px] font-black glass hover:bg-white/10 px-4 py-1.5 rounded-xl border border-white/10 transition-all uppercase tracking-widest"
            >
              <span className="material-symbols-outlined text-xs">download</span>
              Export PDF
            </button>
          </div>
          <select
            value={config.district}
            onChange={(e) => setConfig({ ...config, district: e.target.value })}
            className="bg-white/5 border border-white/10 text-[10px] p-3 rounded-xl font-bold outline-none text-white focus:ring-2 focus:ring-emerald-500/30 transition-all"
          >
            {districts.map(d => <option key={d} className="bg-slate-900">{d}</option>)}
          </select>
          <select
            value={config.season}
            onChange={(e) => setConfig({ ...config, season: e.target.value })}
            className="bg-white/5 border border-white/10 text-[10px] p-3 rounded-xl font-bold outline-none text-white focus:ring-2 focus:ring-emerald-500/30 transition-all"
          >
            <option className="bg-slate-900">Maha</option>
            <option className="bg-slate-900">Yala</option>
          </select>
          <input
            type="date"
            value={config.date}
            onChange={(e) => setConfig({ ...config, date: e.target.value })}
            className="col-span-2 bg-white/5 border border-white/10 text-[10px] p-3 rounded-xl font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500/30 transition-all"
          />
        </div>

        {/* Yield Hero */}
        <div className="glass p-8 rounded-[2.5rem] border border-emerald-500/20 shadow-xl mb-6 relative overflow-hidden">
          {/* subtle glow */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 blur-[60px] -mr-12 -mt-12 pointer-events-none rounded-full" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-sm">monitoring</span>
              Predicted Average
            </p>
            <h2 className="text-6xl font-black tracking-tighter text-white">
              {Math.round(report.summary.yield).toLocaleString()}
              <span className="text-xl font-normal text-white/50 ml-2">kg/ha</span>
            </h2>
            <div className="mt-5 pt-5 border-t border-white/5 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Total Yield</p>
                <p className="text-xl font-black text-white">{Math.round(report.summary.total_kg).toLocaleString()} <span className="text-xs font-bold text-white/40">kg</span></p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-1">Historical Baseline</p>
                <p className="text-xl font-black text-white">{Math.round(report.summary.historical).toLocaleString()} <span className="text-xs font-bold text-white/40">kg/ha</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-[200px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 'bold' }} />
              <Tooltip
                cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                contentStyle={{ background: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '15px', backdropFilter: 'blur(10px)' }}
                itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
              />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass glass-hover p-5 rounded-3xl border border-white/10 group transition-all duration-300">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Pest Count</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{report.metrics.pest_count}</span>
              <span className={`text-[9px] font-black ${getPestStatus(report.metrics.pest_count).color}`}>
                {getPestStatus(report.metrics.pest_count).label}
              </span>
            </div>
          </div>
          <div className="glass glass-hover p-5 rounded-3xl border border-white/10 group transition-all duration-300">
            <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mb-2">Risk Factor</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{report.metrics.risk_score.toFixed(1)}</span>
              <span className={`text-[9px] font-black ${getRiskStatus(report.metrics.risk_score).color}`}>
                {getRiskStatus(report.metrics.risk_score).label}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full p-6 lg:p-10 text-white font-sans transition-all duration-500">
      <div className="max-w-7xl mx-auto space-y-10 pb-20">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              Yield Reports
            </h1>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-sm mt-2 font-bold uppercase tracking-[0.2em]">
              Satellite-derived analytics & district yield forecasts
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-4">
            <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
              <button
                onClick={() => setMode("single")}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${mode === "single" ? "glass bg-white/15 text-white shadow-lg border-white/20" : "text-white/40 hover:text-white/70"}`}
              >
                Single
              </button>
              <button
                onClick={() => setMode("compare")}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${mode === "compare" ? "glass bg-white/15 text-white shadow-lg border-white/20" : "text-white/40 hover:text-white/70"}`}
              >
                Compare
              </button>
            </div>
            <div className="glass px-4 py-2 rounded-xl border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Live Data</span>
            </div>
          </div>
        </div>

        {/* Report Panes */}
        <div className={`flex flex-col ${mode === "compare" ? "lg:flex-row" : "max-w-2xl mx-auto w-full"} gap-8`}>
          <ReportPane report={dataA} config={configA} setConfig={setConfigA} title="PRIMARY" />
          {mode === "compare" && <ReportPane report={dataB} config={configB} setConfig={setConfigB} title="COMPARISON" />}
        </div>

      </div>
    </div>
  );
};

export default Report;