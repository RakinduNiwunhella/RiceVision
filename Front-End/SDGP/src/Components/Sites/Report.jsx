import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
import { fetchReportData } from "../../api/api";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Doughnut } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
);


const monthsList = [
  { label: "January", value: 1 },
  { label: "February", value: 2 },
  { label: "March", value: 3 },
  { label: "April", value: 4 },
  { label: "May", value: 5 },
  { label: "June", value: 6 },
  { label: "July", value: 7 },
  { label: "August", value: 8 },
  { label: "September", value: 9 },
  { label: "October", value: 10 },
  { label: "November", value: 11 },
  { label: "December", value: 12 },
];

const districtsList = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Moneragala",
  "Ratnapura",
  "Kegalle",
];

const ReportPage = () => {
  const [filterType, setFilterType] = useState("single"); // single or comparison
  const [month, setMonth] = useState(12);
  const [district1, setDistrict1] = useState("");
  const [district2, setDistrict2] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const labelColor = isDark ? "#e5e7eb" : "#111827"; // slate-200 / slate-900
  const gridColor = isDark ? "#334155" : "#e5e7eb"; // slate-700 / slate-200

  const fetchData = async () => {
    if (!district1) return;

    setLoading(true);

    try {
      const districts =
        filterType === "comparison" && district2
          ? [district1, district2]
          : [district1];

      const data = await fetchReportData(districts.join(","), month);
      setReports(data);
    } catch (err) {
      console.error("Error fetching report data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filterType, month, district1, district2]);

  // PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo + Title
    fetch("/logoSDGP.webp")
      .then((res) => res.blob())
      .then((blob) => {
        const reader = new window.FileReader();
        reader.onloadend = function () {
          const base64data = reader.result;
          doc.addImage(base64data, "PNG", (pageWidth - 40) / 2, 10, 40, 20);

          doc.setFontSize(18);
          doc.setTextColor(40);
          doc.text("RiceVision Monthly Report", pageWidth / 2, 40, {
            align: "center",
          });

          doc.setFontSize(11);
          doc.setTextColor(80);
          doc.text(
            "This report presents yield, healthy percentage, mean NDVI, stage, and pest risk per district for the selected month.",
            pageWidth / 2,
            50,
            { align: "center", maxWidth: pageWidth - 40 },
          );

          const districtsText =
            filterType === "comparison" && district2
              ? `${district1} & ${district2}`
              : district1;
          const monthName =
            monthsList.find((m) => m.value === month)?.label || month;
          doc.setFontSize(12);
          doc.setTextColor(60);
          doc.text(`District(s): ${districtsText}`, 14, 60);
          doc.text(`Month: ${monthName}`, 14, 68);

          // Table
          autoTable(doc, {
            startY: 75,
            head: [
              [
                "Date",
                "District",
                "Yield (tons)",
                "Healthy %",
                "Risk Level",
                "Mean NDVI",
                "Stage Name",
                "Pest Risk",
              ],
            ],
            body: reports.map((r) => [
              r.Date,
              r.District,
              r.total_yield_tons,
              r.healthy_percentage,
              r.risk_level,
              r.mean_ndvi,
              r.stage_name,
              r.pest_risk,
            ]),
            headStyles: { fillColor: [200, 200, 200], textColor: 50 },
            bodyStyles: { textColor: 40 },
            alternateRowStyles: { fillColor: [245, 245, 245] },
            margin: { left: 14, right: 14 },
          });

          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(9);
          doc.setTextColor(120);
          doc.text(
            "© 2025 RiceVision. All rights reserved.",
            pageWidth / 2,
            pageHeight - 10,
            { align: "center" },
          );

          doc.save(`RiceVision_Report_Month_${month}.pdf`);
        };
        reader.readAsDataURL(blob);
      });
  };

  // Chart rendering functions
  const renderSingleView = () => {
    if (!reports.length) return null;
    const filtered = reports.filter((r) => r.District === district1);

    // Chart colors and options for professional look and dark mode
    const yieldData = {
      labels: filtered.map((r) => r.Date),
      datasets: [
        {
          label: "Yield (tons)",
          data: filtered.map((r) => r.total_yield_tons),
          borderColor: "#1f7a4c",
          backgroundColor: "rgba(31,122,76,0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    };

    const ndviData = {
      labels: filtered.map((r) => r.Date),
      datasets: [
        {
          label: "Mean NDVI",
          data: filtered.map((r) => r.mean_ndvi),
          borderColor: "#2a5d9f",
          backgroundColor: "rgba(42,93,159,0.2)",
          tension: 0.3,
          fill: true,
        },
      ],
    };

    const avgHealth =
      filtered.reduce((acc, r) => acc + parseFloat(r.healthy_percentage), 0) /
      filtered.length;
    const healthData = {
      labels: ["Healthy", "Not Healthy"],
      datasets: [
        {
          data: [avgHealth, 100 - avgHealth],
          backgroundColor: ["#1f7a4c", "#6b7280"],
        },
      ],
    };

    const pestCounts = {};
    filtered.forEach((r) => {
      pestCounts[r.pest_risk] = (pestCounts[r.pest_risk] || 0) + 1;
    });
    const pestColors = {
      High: "#f87171",
      Moderate: "#d48806",
      Low: "#34d399",
    };
    const pestData = {
      labels: Object.keys(pestCounts),
      datasets: [
        {
          data: Object.values(pestCounts),
          backgroundColor: Object.keys(pestCounts).map(
            (lvl) => pestColors[lvl] || "#6b7280",
          ),
        },
      ],
    };

    // Chart options with dark mode support
    const baseLineOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          labels: {
            color: labelColor,
            font: { size: 12, weight: "600" },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "#334155"
              : "#d1d5db",
          },
          ticks: {
            color: labelColor,
            font: { size: 12, weight: "600" },
          },
        },
        y: {
          grid: {
            color: labelColor,
          },
          ticks: {
            color: labelColor,
            font: { size: 12, weight: "600" },
          },
        },
      },
    };

    const baseDoughnutOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            color: labelColor,
            font: { size: 12, weight: "600" },
          },
        },
      },
    };

    return (
      <>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass glass-hover p-8 rounded-[2rem] text-center shadow-xl border border-white/10 group">
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Total Yield Accumulation</p>
            <p className="text-4xl font-black text-white group-hover:text-emerald-400 transition leading-none">
              {filtered
                .reduce((acc, r) => acc + parseFloat(r.total_yield_tons), 0)
                .toFixed(2)}
              <small className="text-xs ml-1 opacity-50 uppercase tracking-tighter">tons</small>
            </p>
          </div>
          <div className="glass glass-hover p-8 rounded-[2rem] text-center shadow-xl border border-white/10 group">
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Biological Health Index</p>
            <p className="text-4xl font-black text-emerald-400 leading-none">
              {avgHealth.toFixed(1)}%
            </p>
          </div>
          <div className="glass glass-hover p-8 rounded-[2rem] text-center shadow-xl border border-white/10 group">
            <p className="text-[10px] font-black uppercase text-white/40 tracking-widest mb-1">Mean Spectral Index (NDVI)</p>
            <p className="text-4xl font-black text-cyan-400 leading-none">
              {(
                filtered.reduce((acc, r) => acc + parseFloat(r.mean_ndvi), 0) /
                filtered.length
              ).toFixed(3)}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="glass glass-hover p-8 rounded-[2.5rem] shadow-xl border border-white/5 transition-all duration-500">
            <h2 className="text-xs font-black mb-6 text-white/30 uppercase tracking-[0.3em] text-center">
              Longitudinal Yield Flux
            </h2>
            <div style={{ height: "240px" }}>
              <Line
                key={`yield-${isDark}`}
                data={yieldData}
                options={{
                  ...baseLineOptions,
                  scales: {
                    ...baseLineOptions.scales,
                    x: { ...baseLineOptions.scales.x, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ...baseLineOptions.scales.y, grid: { color: 'rgba(255,255,255,0.05)' } }
                  }
                }}
              />
            </div>
          </div>
          <div className="glass glass-hover p-8 rounded-[2.5rem] shadow-xl border border-white/5 transition-all duration-500">
            <h2 className="text-xs font-black mb-6 text-white/30 uppercase tracking-[0.3em] text-center">
              NDVI Precision Analysis
            </h2>
            <div style={{ height: "240px" }}>
              <Line
                key={`ndvi-${isDark}`}
                data={ndviData}
                options={{
                  ...baseLineOptions,
                  scales: {
                    ...baseLineOptions.scales,
                    x: { ...baseLineOptions.scales.x, grid: { color: 'rgba(255,255,255,0.05)' } },
                    y: { ...baseLineOptions.scales.y, grid: { color: 'rgba(255,255,255,0.05)' } }
                  }
                }}
              />
            </div>
          </div>
          <div className="glass glass-hover p-8 rounded-[2.5rem] shadow-xl border border-white/5 flex flex-col items-center">
            <h2 className="text-xs font-black mb-8 text-white/30 uppercase tracking-[0.3em] text-center">
              Biomass Integrity
            </h2>
            <div style={{ height: "200px", width: "200px" }}>
              <Doughnut
                key={`health-${isDark}`}
                data={healthData}
                options={baseDoughnutOptions}
              />
            </div>
          </div>
          <div className="glass glass-hover p-8 rounded-[2.5rem] shadow-xl border border-white/5 flex flex-col items-center">
            <h2 className="text-xs font-black mb-8 text-white/30 uppercase tracking-[0.3em] text-center">
              Sentinel Pathogen Risk
            </h2>
            <div style={{ height: "200px", width: "200px" }}>
              <Doughnut
                key={`pest-${isDark}`}
                data={pestData}
                options={baseDoughnutOptions}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderComparison = () => {
    if (!reports.length || !district2) return null;

    const baseLineOptionsComp = {
      ...baseLineOptions,
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: 'rgba(255,255,255,0.6)', font: { size: 10 } }, grid: { color: 'rgba(255,255,255,0.05)' } }
      },
      plugins: { legend: { labels: { color: 'rgba(255,255,255,0.8)', font: { size: 11, weight: 'bold' } } } }
    };

    const baseDoughnutOptionsComp = {
      ...baseDoughnutOptions,
      plugins: { legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.7)', font: { size: 10, weight: 'bold' } } } }
    };

    return (
      <div className="grid md:grid-cols-2 gap-8">
        {[district1, district2].map((d, idx) => {
          const filtered = reports.filter((r) => r.District === d);
          const yieldData = {
            labels: filtered.map((r) => r.Date),
            datasets: [
              {
                label: `Yield - ${d}`,
                data: filtered.map((r) => r.total_yield_tons),
                borderColor: idx === 0 ? "#34d399" : "#22d3ee",
                backgroundColor: idx === 0 ? "rgba(52,211,153,0.1)" : "rgba(34,211,238,0.1)",
                tension: 0.4,
                fill: true,
                pointRadius: 0
              },
            ],
          };
          const ndviData = {
            labels: filtered.map((r) => r.Date),
            datasets: [
              {
                label: `NDVI - ${d}`,
                data: filtered.map((r) => r.mean_ndvi),
                borderColor: idx === 0 ? "#22d3ee" : "#34d399",
                backgroundColor: idx === 0 ? "rgba(34,211,238,0.1)" : "rgba(52,211,153,0.1)",
                tension: 0.4,
                fill: true,
                pointRadius: 0
              },
            ],
          };
          const avgHealth = filtered.reduce((acc, r) => acc + parseFloat(r.healthy_percentage), 0) / filtered.length;
          const healthData = {
            labels: ["Healthy", "Anomalous"],
            datasets: [{
              data: [avgHealth, 100 - avgHealth],
              backgroundColor: [idx === 0 ? "#10b981" : "#06b6d4", "rgba(255,255,255,0.05)"],
              borderWidth: 0
            }],
          };
          const pestCounts = {};
          filtered.forEach((r) => { pestCounts[r.pest_risk] = (pestCounts[r.pest_risk] || 0) + 1; });
          const pestData = {
            labels: Object.keys(pestCounts),
            datasets: [{
              data: Object.values(pestCounts),
              backgroundColor: Object.keys(pestCounts).map(lvl => lvl === 'High' ? '#f43f5e' : lvl === 'Moderate' ? '#f59e0b' : '#10b981'),
              borderWidth: 0
            }],
          };

          return (
            <div key={d} className="glass glass-hover p-8 rounded-[2.5rem] shadow-2xl space-y-8 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-black text-white tracking-tight">{d}</h2>
                <span className="px-3 py-1 glass rounded-lg text-[9px] font-black uppercase text-white/40 border-white/10">Comparison Alpha</span>
              </div>

              <div className="space-y-6">
                <div style={{ height: "180px" }}>
                  <Line data={yieldData} options={baseLineOptionsComp} />
                </div>
                <div style={{ height: "180px" }}>
                  <Line data={ndviData} options={baseLineOptionsComp} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase text-white/30 mb-4 tracking-widest">Health</span>
                  <div style={{ height: "120px", width: "120px" }}>
                    <Doughnut data={healthData} options={baseDoughnutOptionsComp} />
                  </div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[9px] font-black uppercase text-white/30 mb-4 tracking-widest">Pest Risk</span>
                  <div style={{ height: "120px", width: "120px" }}>
                    <Doughnut data={pestData} options={baseDoughnutOptionsComp} />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-[calc(100vh-3rem)] -mx-6 -mt-6 p-6 lg:p-10 text-white font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              Analytics & Insights
            </h1>
            <p className="text-white/40 text-[10px] sm:text-xs md:text-sm mt-1 font-bold uppercase tracking-[0.2em]">Paddy Field Intelligence Network</p>
          </div>

          <div className="flex gap-4">
            <button
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${filterType === "single"
                ? "glass bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "glass bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/60"
                }`}
              onClick={() => setFilterType("single")}
            >
              Single View
            </button>
            <button
              className={`px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all duration-300 ${filterType === "comparison"
                ? "glass bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                : "glass bg-white/5 text-white/40 border-white/10 hover:bg-white/10 hover:text-white/60"
                }`}
              onClick={() => setFilterType("comparison")}
            >
              Comparison
            </button>
          </div>
        </div>

        {/* Filters Hub */}
        <div className="glass p-6 rounded-[2rem] shadow-xl flex flex-wrap gap-4 items-center">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">calendar_month</span>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 appearance-none min-w-[140px]"
            >
              {monthsList.map((m) => (
                <option key={m.value} value={m.value} className="bg-slate-900">{m.label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-white/30 text-sm">location_on</span>
            <select
              value={district1}
              onChange={(e) => setDistrict1(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 appearance-none min-w-[180px]"
            >
              <option value="" className="bg-slate-900">Select District</option>
              {districtsList.map((d) => (
                <option key={d} value={d} className="bg-slate-900">{d}</option>
              ))}
            </select>
          </div>

          {filterType === "comparison" && (
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 text-sm">compare_arrows</span>
              <select
                value={district2}
                onChange={(e) => setDistrict2(e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 appearance-none min-w-[180px]"
              >
                <option value="" className="bg-slate-900">Compare With...</option>
                {districtsList.map((d) => (
                  <option key={d} value={d} className="bg-slate-900">{d}</option>
                ))}
              </select>
            </div>
          )}

          {loading && (
            <div className="ml-auto flex items-center gap-2 px-4 py-2 glass rounded-xl border-white/10">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase text-white/40">Syncing Intelligence...</span>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="space-y-8">
          {filterType === "single" ? renderSingleView() : renderComparison()}
        </div>

        {/* Table & Actions */}
        {reports.length > 0 && (
          <div className="glass p-8 rounded-[2.5rem] shadow-2xl space-y-6">
            <div className="flex flex-wrap gap-4 items-center justify-between border-b border-white/10 pb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white/40">Raw Data Export</h3>
              <div className="flex gap-3">
                <button
                  onClick={downloadPDF}
                  className="px-6 py-2.5 glass bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/30 rounded-xl transition-all active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                  PDF Report
                </button>
                <CSVLink
                  data={reports}
                  headers={[
                    { label: "Date", key: "Date" },
                    { label: "District", key: "District" },
                    { label: "Yield (tons)", key: "total_yield_tons" },
                    { label: "Healthy %", key: "healthy_percentage" },
                    { label: "Risk Level", key: "risk_level" },
                    { label: "Mean NDVI", key: "mean_ndvi" },
                    { label: "Stage Name", key: "stage_name" },
                    { label: "Pest Risk", key: "pest_risk" },
                  ]}
                  filename={`RiceVision_Full_Report_${month}.csv`}
                  className="px-6 py-2.5 glass bg-white/5 hover:bg-white/10 text-white/60 text-[10px] font-black uppercase tracking-widest border border-white/10 rounded-xl transition-all active:scale-95 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">csv</span>
                  CSV Export
                </CSVLink>
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-white/5">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5">
                    {["Date", "District", "Yield", "Health", "Risk", "NDVI", "Stage", "Pest"].map(h => (
                      <th key={h} className="px-5 py-4 text-[10px] font-black uppercase text-white/30 tracking-widest leading-none">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {reports.map((r, i) => (
                    <tr
                      key={i}
                      className={`hover:bg-white/5 transition-colors group ${r.risk_level === "High Risk" ? "bg-red-500/5" : ""}`}
                    >
                      <td className="px-5 py-4 text-xs font-bold text-white/70">{r.Date}</td>
                      <td className="px-5 py-4 text-xs font-black text-white">{r.District}</td>
                      <td className="px-5 py-4 text-xs font-black text-emerald-400">{r.total_yield_tons}</td>
                      <td className="px-5 py-4 text-xs font-bold text-white/80">{r.healthy_percentage}%</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${r.risk_level === "High Risk" ? "bg-red-500/20 text-red-400" : "bg-emerald-500/20 text-emerald-400"
                          }`}>
                          {r.risk_level.split(' ')[0]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-xs font-mono font-bold text-cyan-400">{r.mean_ndvi}</td>
                      <td className="px-5 py-4 text-[10px] font-black uppercase text-white/40">{r.stage_name}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${r.pest_risk === "High" ? "text-red-400" : r.pest_risk === "Moderate" ? "text-amber-400" : "text-emerald-400"
                          }`}>
                          {r.pest_risk}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportPage;
