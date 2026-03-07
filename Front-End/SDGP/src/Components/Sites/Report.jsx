import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ReportPage = () => {
  // Use dates that you are certain exist in your S3 bucket
  const [dateA, setDateA] = useState("2026-03-03");
  const [dateB, setDateB] = useState("2026-03-04");
  const [district, setDistrict] = useState("Anuradhapura");
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define API Base
  const API_BASE = "http://localhost:8000";

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    // --- DEBUG STEP 1: LOG INPUTS ---
    console.log("--- STARTING FETCH ---");
    console.log("Base URL:", API_BASE);
    console.log("Selected Date A:", dateA);
    console.log("Selected Date B:", dateB);
    console.log("Selected District:", district);

    // --- DEBUG STEP 2: CONSTRUCT URL ---
    const url = `${API_BASE}/api/compare-reports?date_a=${dateA}&date_b=${dateB}&district=${district}`;
    console.log("Constructed Final URL:", url);

    try {
      const res = await fetch(url);
      
      // --- DEBUG STEP 3: LOG RESPONSE METADATA ---
      console.log("Response Status:", res.status);
      console.log("Response OK:", res.ok);

      if (!res.ok) {
        // If it's a 404, we want to know if it's the FastAPI route missing or the S3 file missing
        const errorText = await res.text();
        console.error("Server Error Response Body:", errorText);
        
        try {
            const errorJson = JSON.parse(errorText);
            throw new Error(errorJson.detail || "Server returned an error");
        } catch (e) {
            throw new Error(`HTTP ${res.status}: The server endpoint was not found or the S3 file is missing.`);
        }
      }

      const result = await res.json();
      
      // --- DEBUG STEP 4: LOG RECEIVED DATA ---
      console.log("Successfully Received Data:", result);
      setData(result);

    } catch (err) {
      // --- DEBUG STEP 5: LOG CATCH BLOCK ---
      console.error("CRITICAL FETCH ERROR:", err.message);
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
      console.log("--- FETCH COMPLETE ---");
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateA, dateB, district]);

  return (
    <div className="p-8 bg-slate-950 min-h-screen text-white font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            S3 Artifact Comparison
          </h1>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-bold">Temporal Delta Analysis</p>
        </div>
        
        <div className="flex gap-4 glass p-4 rounded-2xl border border-white/10 items-center">
          <div className="flex flex-col">
            <label className="text-[9px] uppercase text-white/40 font-black mb-1">Baseline Date</label>
            <input type="date" value={dateA} onChange={(e) => setDateA(e.target.value)} className="bg-transparent text-xs font-bold border-b border-emerald-500 outline-none cursor-pointer"/>
          </div>
          <span className="text-white/20 font-black px-2 self-end mb-1">VS</span>
          <div className="flex flex-col">
            <label className="text-[9px] uppercase text-white/40 font-black mb-1">Comparison Date</label>
            <input type="date" value={dateB} onChange={(e) => setDateB(e.target.value)} className="bg-transparent text-xs font-bold border-b border-cyan-500 outline-none cursor-pointer"/>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-black uppercase tracking-widest text-emerald-500/60 animate-pulse text-center">
            Querying Backend...<br/>
            <span className="text-[8px] opacity-50 lowercase font-mono">Checking logs for status...</span>
          </p>
        </div>
      )}

      {error && (
        <div className="glass p-10 rounded-[2rem] border border-red-500/20 text-center max-w-xl mx-auto">
          <span className="material-symbols-outlined text-red-400 text-5xl mb-4">warning</span>
          <h2 className="text-xl font-black text-white mb-2">404 - Artifacts Not Found</h2>
          <p className="text-sm text-white/40 mb-6">{error}</p>
          <div className="bg-black/40 p-4 rounded-xl mb-6 text-left border border-white/5">
            <p className="text-[10px] text-white/20 uppercase font-black mb-2">Troubleshooting Tip:</p>
            <ul className="text-[10px] text-white/60 space-y-1 list-disc ml-4">
                <li>Verify your FastAPI is deployed with the new route.</li>
                <li>Check S3 for: <code className="text-emerald-400">FinalPredictions/{dateA}/modelPredictions/lstm_results.csv</code></li>
                <li>Ensure district names match (e.g., "Anuradhapura" vs "anuradhapura").</li>
            </ul>
          </div>
          <button onClick={fetchData} className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition">Retry Fetch</button>
        </div>
      )}

      {data && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Health Delta Card */}
          <div className="glass p-8 rounded-[2rem] border border-white/5 relative overflow-hidden group">
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-4">Health Shift (Δ NDVI Z)</p>
            <h2 className={`text-5xl font-black ${data.deltas.health_change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {data.deltas.health_change > 0 ? "+" : ""}{data.deltas.health_change.toFixed(4)}
            </h2>
          </div>

          {/* Maturity Progress Card */}
          <div className="glass p-8 rounded-[2rem] border border-white/5">
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-4">Stage Transition</p>
            <div className="flex items-center gap-4 py-2">
              <span className="px-3 py-1 rounded-lg bg-white/5 text-[10px] font-bold text-white/60">{data.baseline.common_stage}</span>
              <span className="material-symbols-outlined text-emerald-400">arrow_forward</span>
              <span className="px-4 py-2 rounded-lg bg-emerald-500/10 text-xs font-black text-emerald-400 border border-emerald-500/20">{data.current.common_stage}</span>
            </div>
          </div>

          {/* Pest Trend Card */}
          <div className="glass p-8 rounded-[2rem] border border-white/5">
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-4">Pest Trend</p>
            <h2 className={`text-2xl font-black uppercase ${data.deltas.pest_trend === 'Increasing' ? 'text-amber-400' : 'text-emerald-400'}`}>
              {data.deltas.pest_trend}
            </h2>
          </div>

          {/* Visualization: Comparison Chart */}
          <div className="md:col-span-3 glass p-10 rounded-[3rem] border border-white/5 h-[450px]">
             <h3 className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 mb-10">Temporal Feature Comparison</h3>
             <div className="h-full pb-10">
               <Bar 
                  data={{
                      labels: ['Biomass Health (Z)', 'Pest Risk (CPI)'],
                      datasets: [
                          { 
                            label: `Baseline (${dateA})`, 
                            data: [data.baseline.avg_health, data.baseline.avg_pest], 
                            backgroundColor: '#10b981', 
                            borderRadius: 12 
                          },
                          { 
                            label: `Current (${dateB})`, 
                            data: [data.current.avg_health, data.current.avg_pest], 
                            backgroundColor: '#06b6d4', 
                            borderRadius: 12 
                          }
                      ]
                  }}
                  options={{ 
                    maintainAspectRatio: false, 
                    scales: { 
                        y: { grid: { color: 'rgba(255,255,255,0.03)' } },
                        x: { grid: { display: false } }
                    } 
                  }}
               />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;