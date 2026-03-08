import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import logoImg from '../assets/logo.png';

const CustomSelect = ({ value, onChange, options, className = "" }) => {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999,
      });
    }
    setOpen((o) => !o);
  };

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full flex justify-between items-center bg-white/5 border border-white/10 text-[10px] px-4 py-3 rounded-xl font-bold text-white outline-none hover:bg-white/10 transition-all"
      >
        <span>{value}</span>
        <span
          className="material-symbols-outlined text-sm text-white/40 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          expand_more
        </span>
      </button>
      {open && ReactDOM.createPortal(
        <div
          style={{
            ...dropdownStyle,
            background: "rgba(10, 22, 14, 0.95)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
          }}
          className="max-h-52 overflow-y-auto rounded-xl border border-white/20 shadow-2xl"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-[10px] font-bold flex items-center gap-2 transition-all ${
                value === opt
                  ? "text-emerald-400 bg-emerald-500/20"
                  : "text-white hover:bg-white/20 hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined text-xs" style={{ visibility: value === opt ? "visible" : "hidden" }}>check</span>
              {opt}
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};

const Report = () => {
  const districts = ["Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle", "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle", "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala", "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura", "Trincomalee", "Vavuniya"];

  const [mode, setMode] = useState("single");
  const [availableDates, setAvailableDates] = useState([]);
  const [configA, setConfigA] = useState({ district: "Anuradhapura", date: "", season: "Maha" });
  const [configB, setConfigB] = useState({ district: "Gampaha", date: "", season: "Maha" });
  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  // Fetch available S3 dates once on mount and set the latest as default
  useEffect(() => {
    fetch("https://ricevision-cakt.onrender.com/api/available-dates")
      .then((r) => r.json())
      .then((json) => {
        const dates = json.dates || [];
        setAvailableDates(dates);
        if (dates.length > 0) {
          setConfigA((c) => ({ ...c, date: dates[0] }));
          setConfigB((c) => ({ ...c, date: dates[0] }));
        }
      })
      .catch(() => {
        // Fall back to a known date if the endpoint fails
        const fallback = "2026-03-06";
        setAvailableDates([fallback]);
        setConfigA((c) => ({ ...c, date: fallback }));
        setConfigB((c) => ({ ...c, date: fallback }));
      });
  }, []);

  const fetchData = async (conf, setter) => {
    if (!conf.date) return; // wait until date is resolved
    try {
      const res = await fetch(`https://ricevision-cakt.onrender.com/api/detailed-report?date=${conf.date}&district=${conf.district}&season=${conf.season}`);
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

  const generatePDF = async (report, config) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const PW = 210;
    const PH = 297;
    const M  = 14;

    // ── PALETTE ───────────────────────────────────────────────────
    const WHITE  = [255, 255, 255];
    const OFFWH  = [248, 250, 252];
    const GREEN  = [16, 185, 129];   // single brand green throughout
    const NAVY   = [15,  23,  42];
    const INK    = [15,  23,  42];
    const DARK   = [30,  41,  59];
    const SUBTEXT= [71,  85, 105];
    const MUTED  = [148, 163, 184];
    const LGRAY  = [241, 245, 249];
    const BORDER = [226, 232, 240];
    const ORANGE = [217, 119,   6];
    const RED    = [220,  38,  38];
    const REDLT  = [254, 242, 242];

    // ── PAGE BACKGROUND ───────────────────────────────────────────
    doc.setFillColor(...WHITE);
    doc.rect(0, 0, PW, PH, 'F');

    // ── LOAD LOGO (maintain aspect ratio) ─────────────────────────
    let logoDataUrl = null;
    let logoW = 0, logoH = 0;
    try {
      const imgEl = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload  = () => resolve(img);
        img.onerror = reject;
        img.src = logoImg;
      });
      const maxH = 16;
      const ratio = imgEl.naturalWidth / imgEl.naturalHeight;
      logoH = maxH;
      logoW = maxH * ratio;
      const canvas = document.createElement('canvas');
      canvas.width  = imgEl.naturalWidth;
      canvas.height = imgEl.naturalHeight;
      canvas.getContext('2d').drawImage(imgEl, 0, 0);
      logoDataUrl = canvas.toDataURL('image/png');
    } catch (_) { /* logo is optional */ }

    // ── HEADER (white background) ────────────────────────────────
    doc.setFillColor(...WHITE);
    doc.rect(0, 0, PW, 40, 'F');

    // Dark green separator between header and district row
    doc.setFillColor(0, 100, 50);
    doc.rect(0, 40, PW, 2, 'F');

    // Logo — vertically centred in header
    const logoY = (39 - logoH) / 2;
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', M, logoY, logoW, logoH);
    }

    // Centred title block
    const cx = PW / 2;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text('YIELD ANALYTICS REPORT', cx, 16, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(
      `Generated  ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`,
      cx, 26, { align: 'center' }
    );
    doc.text(`Satellite data  ${config.date}`, cx, 36, { align: 'center' });

    // ── DISTRICT ROW ──────────────────────────────────────────────
    doc.setFillColor(...OFFWH);
    doc.rect(0, 42, PW, 20, 'F');
    doc.setDrawColor(...BORDER);
    doc.setLineWidth(0.25);
    doc.line(0, 62, PW, 62);

    // District name + subtitle
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...INK);
    doc.text(config.district, M, 53.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...SUBTEXT);
    doc.text('Sri Lanka  ·  District Yield Forecast', M, 59);

    // Chips (right-aligned)
    const chipH  = 8;
    const chipW  = 34;
    const chipY2 = 45;
    const chip2X = PW - M - chipW;
    const chip1X = chip2X - 4 - chipW;
    const chipTY = chipY2 + chipH / 2 + 1.1;

    // Season chip — white fill, green text
    doc.setFillColor(...WHITE);
    doc.roundedRect(chip1X, chipY2, chipW, chipH, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...GREEN);
    doc.text(`${config.season} Season`, chip1X + chipW / 2, chipTY, { align: 'center' });

    // Date chip — light gray
    doc.setFillColor(...LGRAY);
    doc.roundedRect(chip2X, chipY2, chipW, chipH, 2, 2, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(...DARK);
    doc.text(config.date, chip2X + chipW / 2, chipTY, { align: 'center' });

    // ── HELPERS ───────────────────────────────────────────────────
    const raw = report.raw_data?.yield_csv || {};

    const newPage = () => {
      doc.addPage();
      doc.setFillColor(...WHITE);
      doc.rect(0, 0, PW, PH, 'F');
      // slim green stripe on continuation pages
      doc.setFillColor(...GREEN);
      doc.rect(0, 0, PW, 6, 'F');
      doc.setFillColor(10, 160, 110);
      doc.rect(0, 5.5, PW, 0.5, 'F');
      return 14;
    };

    const sectionHeading = (label, yy) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(...GREEN);
      doc.text(label.toUpperCase(), M, yy);
      doc.setDrawColor(...GREEN);
      doc.setLineWidth(0.4);
      doc.line(M, yy + 1.5, PW - M, yy + 1.5);
    };

    const drawStatCard = (x, cy, w, h, label, value, sub, accentColor = GREEN) => {
      // card bg
      doc.setFillColor(...OFFWH);
      doc.roundedRect(x, cy, w, h, 2.5, 2.5, 'F');
      // left accent
      doc.setFillColor(...accentColor);
      doc.roundedRect(x, cy, 3, h, 1.5, 1.5, 'F');
      // label
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text(label, x + 7, cy + 7);
      // value
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...INK);
      doc.text(String(value), x + 7, cy + 15.5);
      // sub
      if (sub) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6);
        doc.setTextColor(...SUBTEXT);
        doc.text(sub, x + 7, cy + 21);
      }
    };

    // ── KPI SUMMARY CARDS ─────────────────────────────────────────
    let y = 70;
    const gapVal    = report.summary.gap;
    const gapSign   = gapVal >= 0 ? '+' : '';
    const gapAccent = gapVal >= 0 ? GREEN : RED;
    const pct = raw.percent_change !== undefined
      ? parseFloat(raw.percent_change).toFixed(1)
      : ((gapVal / report.summary.historical) * 100).toFixed(1);

    const cW = (PW - M * 2 - 5) / 2;
    const cH = 27;

    drawStatCard(M,          y, cW, cH, 'PREDICTED AVG YIELD',   `${Math.round(report.summary.yield).toLocaleString()} kg/ha`,        'Satellite-derived ML forecast');
    drawStatCard(M + cW + 5, y, cW, cH, 'HISTORICAL BASELINE',   `${Math.round(report.summary.historical).toLocaleString()} kg/ha`,   'Long-term district average');
    y += cH + 4;
    drawStatCard(M,          y, cW, cH, 'YIELD GAP',             `${gapSign}${Math.round(gapVal).toLocaleString()} kg/ha`,            `${gapSign}${pct}% vs baseline`, gapAccent);
    drawStatCard(M + cW + 5, y, cW, cH, 'TOTAL PRODUCTION EST.', `${Math.round(report.summary.total_kg / 1000).toLocaleString()} MT`, 'Full district (metric tons)');
    y += cH + 10;

    // ── FIELD OVERVIEW TABLE ──────────────────────────────────────
    sectionHeading('Field Overview', y);
    y += 6;

    const riskScore  = report.metrics.risk_score;
    const riskLabel  = riskScore < 1 ? 'Low' : riskScore < 4 ? 'Moderate' : 'High';
    const riskAccent = riskScore < 1 ? GREEN : riskScore < 4 ? ORANGE : RED;
    const pestLabel  = report.metrics.pest_count === 0 ? 'Clear' : report.metrics.pest_count < 20 ? 'Moderate' : 'Critical';

    const fieldRows = [
      ['Growth Stage',       report.categories.current_stage,                       'Health Status',      report.categories.health_status],
      ['Pest Incidents',     `${report.metrics.pest_count} (${pestLabel})`,          'Risk Score',         `${riskScore.toFixed(2)} / 10 (${riskLabel})`],
      ['Severe Stress Area', `${report.metrics.stress_pct.toFixed(2)}%`,             'Est. Harvest Date',  report.metrics.harvest_date],
      ['Season',             config.season,                                          'Data Date',          config.date],
    ];
    if (raw.percent_change !== undefined)
      fieldRows.push(['% vs Historical', `${parseFloat(raw.percent_change).toFixed(2)}%`, 'Pixels Analysed', raw.total_pixels !== undefined ? Number(raw.total_pixels).toLocaleString() : 'N/A']);
    if (raw.health_index_z !== undefined)
      fieldRows.push(['Health Index (Z)', parseFloat(raw.health_index_z).toFixed(3), 'Climate Stress Idx', raw.climate_stress_index !== undefined ? parseFloat(raw.climate_stress_index).toFixed(3) : 'N/A']);

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      body: fieldRows,
      theme: 'plain',
      styles:             { fontSize: 8, cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 }, textColor: INK, fillColor: WHITE },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: SUBTEXT, cellWidth: 44 },
        1: { cellWidth: 50 },
        2: { fontStyle: 'bold', textColor: SUBTEXT, cellWidth: 44 },
        3: { cellWidth: 'auto' },
      },
      tableLineColor: BORDER,
      tableLineWidth: 0.2,
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── YIELD BREAKDOWN TABLE ─────────────────────────────────────
    if (y > 240) y = newPage();
    sectionHeading('Yield Forecast Breakdown', y);
    y += 6;

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['Metric', 'Value', 'Unit', 'Notes']],
      body: [
        ['Predicted Average Yield',    Math.round(report.summary.yield).toLocaleString(),            'kg/ha', 'ML satellite forecast'],
        ['Historical Average Yield',   Math.round(report.summary.historical).toLocaleString(),       'kg/ha', 'District long-term baseline'],
        ['Total Estimated Production', Math.round(report.summary.total_kg).toLocaleString(),         'kg',    'Full district acreage'],
        ['Total Estimated Production', Math.round(report.summary.total_kg / 1000).toLocaleString(),  'MT',    'Metric tons (÷ 1,000)'],
        ['Yield Gap',                  `${gapSign}${Math.round(gapVal).toLocaleString()}`,            'kg/ha', gapVal >= 0 ? 'Above historical average' : 'Below historical average'],
        ['% Change vs Historical',     `${gapSign}${pct}%`,                                          '—',     gapVal >= 0 ? 'Out-performing baseline' : 'Under-performing vs baseline'],
      ],
      theme: 'grid',
      headStyles:         { fillColor: GREEN, textColor: WHITE, fontSize: 7.5, fontStyle: 'bold', cellPadding: 4 },
      bodyStyles:         { fontSize: 7.5, textColor: INK, fillColor: WHITE, cellPadding: 3.5 },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: DARK, cellWidth: 58 },
        1: { cellWidth: 26, halign: 'right' },
        2: { cellWidth: 16 },
        3: { textColor: SUBTEXT },
      },
      tableLineColor: BORDER,
      tableLineWidth: 0.2,
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── RISK & HEALTH ─────────────────────────────────────────────
    if (y > 210) y = newPage();

    // Reset state fully before heading (autoTable can leave stale draw color)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);
    doc.text('RISK & HEALTH ASSESSMENT', M, y);
    doc.setDrawColor(...GREEN);
    doc.setLineWidth(0.4);
    doc.line(M, y + 1.5, PW - M, y + 1.5);
    y += 9;

    // Risk indicator bar
    const barW = PW - M * 2;
    const fillW = Math.max(barW * Math.min(riskScore / 10, 1), 4);
    doc.setFillColor(...LGRAY);
    doc.roundedRect(M, y, barW, 7, 1.5, 1.5, 'F');
    doc.setFillColor(...riskAccent);
    doc.roundedRect(M, y, fillW, 7, 1.5, 1.5, 'F');
    y += 10;

    // Label below the bar — always readable on white background
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...riskAccent);
    doc.text(`Risk Level: ${riskLabel}`, M, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...SUBTEXT);
    doc.text(`Score: ${riskScore.toFixed(2)} / 10`, M + 30, y);
    y += 8;

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [['Risk Factor', 'Value', 'Status']],
      body: [
        ['Overall Risk Score',     riskScore.toFixed(2),                            riskLabel],
        ['Severe Stress Coverage', `${report.metrics.stress_pct.toFixed(2)}%`,      report.metrics.stress_pct < 5 ? 'Acceptable' : 'Action Required'],
        ['Pest Attack Incidents',  String(report.metrics.pest_count),               pestLabel],
        ['Crop Health Status',     report.categories.health_status,                 report.categories.health_status === 'Normal' ? 'Normal' : 'Warning'],
        ['Growth Stage',           report.categories.current_stage,                 '—'],
      ],
      theme: 'grid',
      headStyles:         { fillColor: riskAccent, textColor: WHITE, fontSize: 7.5, fontStyle: 'bold', cellPadding: 4 },
      bodyStyles:         { fontSize: 7.5, textColor: INK, fillColor: WHITE, cellPadding: 3.5 },
      alternateRowStyles: { fillColor: LGRAY },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: DARK, cellWidth: 70 },
        1: { cellWidth: 30, halign: 'center' },
        2: { halign: 'center' },
      },
      tableLineColor: BORDER,
      tableLineWidth: 0.2,
    });
    y = doc.lastAutoTable.finalY + 10;

    // ── DISCLAIMER ────────────────────────────────────────────────
    const disclaimerText = 'This report is generated from satellite imagery and machine-learning models. Data is indicative only — please use alongside on-ground verification. RiceVision assumes no liability for agricultural decisions made solely on the basis of this report.';
    const textLines = doc.splitTextToSize(disclaimerText, PW - M * 2 - 10);
    const boxH = textLines.length * 4.2 + 12;
    if (y + boxH > PH - 18) y = newPage();

    doc.setFillColor(...REDLT);
    doc.roundedRect(M, y, PW - M * 2, boxH, 3, 3, 'F');
    doc.setFillColor(...ORANGE);
    doc.rect(M, y, 3, boxH, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(...ORANGE);
    doc.text('DISCLAIMER', M + 8, y + 7);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.5);
    doc.setTextColor(120, 80, 30);
    doc.text(textLines, M + 8, y + 12.5);

    // ── FOOTER (all pages) ────────────────────────────────────────
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(...BORDER);
      doc.setLineWidth(0.3);
      doc.line(M, PH - 13, PW - M, PH - 13);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text('RiceVision Analytics  |  Agricultural Intelligence Platform  |  Confidential', M, PH - 7);
      doc.text(`Page ${p} of ${totalPages}`, PW - M, PH - 7, { align: 'right' });
    }

    doc.save(`RiceVision_${config.district}_${config.season}_${config.date}.pdf`);
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
        {availableDates.length > 0 && (
          <CustomSelect
            value={config.date}
            onChange={(val) => setConfig({ ...config, date: val })}
            options={availableDates}
          />
        )}
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
          <CustomSelect
            value={config.district}
            onChange={(val) => setConfig({ ...config, district: val })}
            options={districts}
          />
          <CustomSelect
            value={config.season}
            onChange={(val) => setConfig({ ...config, season: val })}
            options={["Maha", "Yala"]}
          />
          {availableDates.length > 0 && (
            <CustomSelect
              className="col-span-2"
              value={config.date}
              onChange={(val) => setConfig({ ...config, date: val })}
              options={availableDates}
            />
          )}

        </div>

        {/* Yield Hero */}
        <div className="glass p-5 rounded-[2rem] border border-emerald-500/20 shadow-xl mb-6 relative overflow-hidden">
          {/* subtle glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 blur-[50px] -mr-8 -mt-8 pointer-events-none rounded-full" />
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-400 text-sm">monitoring</span>
              Predicted Average
            </p>
            <h2 className="text-4xl font-black tracking-tighter text-white">
              {Math.round(report.summary.yield).toLocaleString()}
              <span className="text-base font-normal text-white/50 ml-2">kg/ha</span>
            </h2>
            <div className="mt-3 pt-3 border-t border-white/5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">Total Yield</p>
                <p className="text-base font-black text-white">{Math.round(report.summary.total_kg).toLocaleString()} <span className="text-xs font-bold text-white/40">kg</span></p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 mb-0.5">Historical Baseline</p>
                <p className="text-base font-black text-white">{Math.round(report.summary.historical).toLocaleString()} <span className="text-xs font-bold text-white/40">kg/ha</span></p>
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