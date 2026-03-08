import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Report = () => {
  const districts = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];
  const stages = ["Transplant", "Vegetative", "Reproductive", "Ripening", "Harvest"];

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
    
    // Header
    doc.setFillColor(16, 185, 129); // Emerald 500
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("RICEVISION ANALYTICS REPORT", 15, 25);
    
    doc.setFontSize(10);
    doc.text(`District: ${config.district} | Season: ${config.season} | Date: ${config.date}`, 15, 33);

    // Body Info
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
    return { label: "CRITICAL", color: "text-red-500" };
  };

  const getRiskStatus = (score) => {
    if (score < 1) return { label: "STABLE", color: "text-emerald-400" };
    if (score < 4) return { label: "WARNING", color: "text-amber-400" };
    return { label: "HIGH RISK", color: "text-red-500" };
  };

  const ReportPane = ({ report, config, setConfig, title }) => {
    if (report?.error) return (
        <div className="flex-1 bg-red-900/20 border border-red-500/30 rounded-[3rem] p-12 text-center">
            <h3 className="text-red-500 font-black mb-4">DATA UNAVAILABLE</h3>
            <p className="text-xs text-red-200/60 mb-6">{report.message}</p>
            <input type="date" value={config.date} onChange={(e)=>setConfig({...config, date: e.target.value})} className="bg-slate-800 text-[10px] p-3 rounded-xl border-none font-bold text-white" />
        </div>
    );

    if (!report) return <div className="flex-1 bg-slate-900/50 rounded-[3rem] p-20 text-center animate-pulse">LOADING S3...</div>;

    const chartData = [
      { name: 'Yield', value: report.summary.yield, color: '#10b981' },
      { name: 'Historical', value: report.summary.historical, color: '#6366f1' }
    ];

    return (
      <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 backdrop-blur-md">
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="col-span-2 flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">{title} VIEW</span>
            <button onClick={() => generatePDF(report, config)} className="text-[10px] font-black bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full transition">GENERATE PDF</button>
          </div>
          <select value={config.district} onChange={(e)=>setConfig({...config, district: e.target.value})} className="bg-slate-800 text-[10px] p-3 rounded-xl border-none font-bold outline-none">
            {districts.map(d => <option key={d}>{d}</option>)}
          </select>
          <select value={config.season} onChange={(e)=>setConfig({...config, season: e.target.value})} className="bg-slate-800 text-[10px] p-3 rounded-xl border-none font-bold outline-none">
            <option>Maha</option><option>Yala</option>
          </select>
          <input type="date" value={config.date} onChange={(e)=>setConfig({...config, date: e.target.value})} className="col-span-2 bg-slate-800 text-[10px] p-3 rounded-xl border-none font-bold text-white outline-none" />
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-8 rounded-[2.5rem] shadow-xl mb-6">
          <p className="text-[10px] font-black uppercase opacity-60">Predicted Average</p>
          <h2 className="text-6xl font-black my-1 tracking-tighter">{Math.round(report.summary.yield).toLocaleString()} <span className="text-xl font-normal opacity-70">kg/ha</span></h2>
          <div className="mt-4 pt-4 border-t border-white/10">
            <p className="text-[10px] font-black uppercase opacity-60">Total Yield</p>
            <p className="text-2xl font-black">{Math.round(report.summary.total_kg).toLocaleString()} <span className="text-xs font-bold">kg</span></p>
          </div>
        </div>

        <div className="h-[220px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 'bold'}} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '15px'}} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={50}>
                {chartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
            <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Pest Count</p>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black">{report.metrics.pest_count}</span>
                <span className={`text-[9px] font-black ${getPestStatus(report.metrics.pest_count).color}`}>{getPestStatus(report.metrics.pest_count).label}</span>
            </div>
          </div>
          <div className="bg-white/5 p-5 rounded-3xl border border-white/5">
            <p className="text-[9px] font-bold text-slate-500 uppercase mb-1">Risk Factor</p>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black">{report.metrics.risk_score.toFixed(1)}</span>
                <span className={`text-[9px] font-black ${getRiskStatus(report.metrics.risk_score).color}`}>{getRiskStatus(report.metrics.risk_score).label}</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-black tracking-tighter italic">RICEVISION <span className="text-emerald-500 font-normal">S3</span></h1>
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/10">
            <button onClick={() => setMode("single")} className={`px-8 py-2 rounded-xl text-xs font-black transition ${mode === "single" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500"}`}>SINGLE</button>
            <button onClick={() => setMode("compare")} className={`px-8 py-2 rounded-xl text-xs font-black transition ${mode === "compare" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500"}`}>COMPARE</button>
          </div>
        </header>

        <div className={`flex flex-col ${mode === "compare" ? "lg:flex-row" : "max-w-2xl mx-auto"} gap-8`}>
          <ReportPane report={dataA} config={configA} setConfig={setConfigA} title="PRIMARY" />
          {mode === "compare" && <ReportPane report={dataB} config={configB} setConfig={setConfigB} title="COMPARISON" />}
        </div>
      </div>
    </div>
  );
};

export default Report;