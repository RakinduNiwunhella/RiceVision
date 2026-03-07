import React, { useState, useEffect } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie, Label 
} from 'recharts';

const Report = () => {
  const districts = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];
  const stages = ["Transplant", "Vegetative", "Reproductive", "Ripening", "Harvest"];

  const [mode, setMode] = useState("single");
  const [configA, setConfigA] = useState({ district: "Anuradhapura", date: "2026-03-06", season: "Maha" });
  const [configB, setConfigB] = useState({ district: "Gampaha", date: "2026-03-06", season: "Maha" });
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async (conf, setter) => {
    try {
      const res = await fetch(`http://localhost:8000/api/detailed-report?date=${conf.date}&district=${conf.district}&season=${conf.season}`);
      const json = await res.json();
      setter(json);
    } catch (err) { setter({ error: true }); }
  };

  useEffect(() => {
    setLoading(true);
    const tasks = [fetchData(configA, setDataA)];
    if (mode === "compare") tasks.push(fetchData(configB, setDataB));
    Promise.all(tasks).finally(() => setLoading(false));
  }, [configA, configB, mode]);

  const downloadCSV = (report, district) => {
    if (!report) return;
    const combined = { ...report.summary, ...report.metrics, ...report.categories };
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Metric,Value\n" 
      + Object.entries(combined).map(([k, v]) => `${k},${v}`).join("\n");
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `RiceVision_${district}_Report.csv`;
    link.click();
  };

  const ReportPane = ({ report, config, setConfig, title }) => {
    if (!report || report.error) return (
      <div className="flex-1 bg-slate-900/50 rounded-[3rem] p-20 text-center border border-white/5 animate-pulse text-slate-500 font-bold">
        LOADING SATELLITE DATA...
      </div>
    );

    // 1. Yield Chart Data
    const yieldData = [
      { name: 'Predicted', val: report.summary.yield, col: '#10b981' },
      { name: 'Historical', val: report.summary.historical, col: '#6366f1' }
    ];

    // 2. Health Donut Data (Simulation based on Severe Stress %)
    const healthData = [
      { name: 'Healthy', value: 100 - report.metrics.stress_pct, color: '#10b981' },
      { name: 'Stressed', value: report.metrics.stress_pct, color: '#f43f5e' }
    ];

    // 3. Stage Progress Logic
    const currentStageIdx = stages.indexOf(report.categories.current_stage);
    const progressPct = ((currentStageIdx + 1) / stages.length) * 100;

    return (
      <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-[3rem] p-8 backdrop-blur-md">
        {/* Controls & Download */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex gap-2">
            <select value={config.district} onChange={(e)=>setConfig({...config, district: e.target.value})} className="bg-slate-800 text-[10px] p-2 rounded-xl border-none font-black outline-none">
              {districts.map(d => <option key={d}>{d}</option>)}
            </select>
          </div>
          <button onClick={() => downloadCSV(report, config.district)} className="bg-emerald-600/20 hover:bg-emerald-600 text-emerald-500 hover:text-white px-4 py-2 rounded-xl text-[10px] font-black transition-all">
            DOWNLOAD CSV
          </button>
        </div>

        {/* Hero Yield */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-800 p-8 rounded-[2.5rem] shadow-xl mb-6 relative overflow-hidden">
          <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">{title} Forecast</p>
          <h2 className="text-5xl font-black my-2">{Math.round(report.summary.yield).toLocaleString()} <span className="text-sm font-normal">kg/ha</span></h2>
          <div className="mt-4 flex gap-3">
             <div className="bg-black/20 px-3 py-1 rounded-full text-[9px] font-bold">RISK: {report.metrics.risk_score.toFixed(1)}</div>
             <div className="bg-black/20 px-3 py-1 rounded-full text-[9px] font-bold">PESTS: {report.metrics.pest_count}</div>
          </div>
        </div>

        {/* Multi-Graph Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
            {/* Yield Bar */}
            <div className="bg-white/5 p-4 rounded-3xl h-[180px]">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-4">Yield vs Normal</p>
                <ResponsiveContainer width="100%" height="80%">
                    <BarChart data={yieldData}>
                        <Bar dataKey="val" radius={[5, 5, 0, 0]}>
                            {yieldData.map((entry, i) => <Cell key={i} fill={entry.col} />)}
                        </Bar>
                        <Tooltip contentStyle={{display:'none'}} />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Health Donut */}
            <div className="bg-white/5 p-4 rounded-3xl h-[180px]">
                <p className="text-[9px] font-black text-slate-500 uppercase mb-2">Health Status</p>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={healthData} innerRadius={35} outerRadius={50} paddingAngle={5} dataKey="value">
                            {healthData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Growth Stage Timeline */}
        <div className="bg-white/5 p-6 rounded-3xl mb-8">
            <div className="flex justify-between text-[9px] font-black text-slate-500 mb-4 uppercase">
                <span>Growth Timeline</span>
                <span className="text-emerald-500">{report.categories.current_stage}</span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full transition-all duration-1000" style={{width: `${progressPct}%`}}></div>
            </div>
            <div className="flex justify-between mt-2 text-[8px] text-slate-600 font-bold uppercase">
                <span>Start</span>
                <span>Harvest</span>
            </div>
        </div>

        {/* Raw Data Table */}
        <div className="max-h-[150px] overflow-y-auto pr-2 custom-scrollbar border-t border-white/5 pt-4">
            {Object.entries(report.raw_data.yield_csv).slice(0, 10).map(([k, v]) => (
                <div key={k} className="flex justify-between text-[10px] py-1.5 border-b border-white/5">
                    <span className="text-slate-500 uppercase">{k.replace(/_/g, ' ')}</span>
                    <span className="text-white font-bold">{v}</span>
                </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-2xl font-black italic tracking-tighter">RICEVISION <span className="text-emerald-500 font-normal">INTEL</span></h1>
          <div className="flex bg-slate-900 p-1 rounded-2xl border border-white/10">
            <button onClick={() => setMode("single")} className={`px-8 py-2 rounded-xl text-xs font-black transition ${mode === "single" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500"}`}>SINGLE</button>
            <button onClick={() => setMode("compare")} className={`px-8 py-2 rounded-xl text-xs font-black transition ${mode === "compare" ? "bg-emerald-600 text-white shadow-lg" : "text-slate-500"}`}>COMPARE</button>
          </div>
        </header>

        <div className={`flex flex-col ${mode === "compare" ? "lg:flex-row" : "max-w-2xl mx-auto"} gap-8`}>
          <ReportPane report={dataA} config={configA} setConfig={setConfigA} title="Primary" />
          {mode === "compare" && <ReportPane report={dataB} config={configB} setConfig={setConfigB} title="Secondary" />}
        </div>
      </div>
    </div>
  );
};

export default Report;