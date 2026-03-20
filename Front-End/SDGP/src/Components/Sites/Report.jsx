import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactDOM from "react-dom";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';
import logoImg from '../assets/logo.png';
import { apiFetch } from "../../api/apiFetch";
import { translations, useLanguage } from "../../context/LanguageContext";
import { translateHealthCategory, translateStageCategory } from "../../utils/agriTranslations";
import { translateDistrictName, SRI_LANKA_DISTRICTS } from "../../utils/locationTranslations";
import TutorialTooltip from "../../Components/TutorialTooltip";
import { usePageTutorial } from "../../hooks/usePageTutorial";

const getByPath = (obj, key) => {
  if (!obj || !key) return undefined;
  return key.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
};

const tEn = (key) => getByPath(translations.en, key) ?? key;

const CustomSelect = ({ value, onChange, options, className = "" }) => {
  const [open, setOpen] = useState(false);
  const [dropdownStyle, setDropdownStyle] = useState({});
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!open && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();

      setDropdownStyle({
        position: "fixed",
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
        zIndex: 99999
      });
    }

    setOpen(!open);
  };

  const normalizedOptions = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );
  const selectedLabel =
    normalizedOptions.find((opt) => opt.value === value)?.label || value;

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        className="w-full flex justify-between items-center bg-white/5 border border-white/10 text-[10px] px-4 py-3 rounded-xl font-bold text-white outline-none hover:bg-white/10 transition-all cursor-pointer"
      >
        <span>{selectedLabel}</span>

        <span
          className="material-symbols-outlined text-sm text-white/85 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        >
          expand_more
        </span>
      </button>

      {open &&
        ReactDOM.createPortal(
          <div
            style={{
              ...dropdownStyle,
              background: "rgba(10,22,14,0.95)",
              backdropFilter: "blur(24px)"
            }}
            className="max-h-52 overflow-y-auto rounded-xl border border-white/20 shadow-2xl pointer-events-auto"
          >
            {normalizedOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-[10px] font-bold flex items-center gap-2 transition-all ${value === opt.value
                  ? "text-emerald-400 bg-emerald-500/20"
                  : "text-white hover:bg-white/20"
                  }`}
              >
                <span
                  className="material-symbols-outlined text-xs"
                  style={{
                    visibility: value === opt.value ? "visible" : "hidden"
                  }}
                >
                  check
                </span>

                {opt.label}
              </button>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
};

const Report = () => {
  const location = useLocation();
  const { t, language } = useLanguage();
  const selectedDistrict = location.state?.district;
  const districts = SRI_LANKA_DISTRICTS;
  const districtOptions = districts.map((district) => ({
    value: district,
    label: translateDistrictName(district, language),
  }));

  const [mode, setMode] = useState("single");
  const [availableDates, setAvailableDates] = useState([]);
  const [configA, setConfigA] = useState({ district: selectedDistrict || "Anuradhapura", date: "", season: "Maha" });
  const [configB, setConfigB] = useState({ district: "Gampaha", date: "", season: "Maha" });

  useEffect(() => {
    if (location.state?.district) {
      setConfigA((prev) => ({
        ...prev,
        district: location.state.district,
      }));
    }
  }, [location.state]);

  const [dataA, setDataA] = useState(null);
  const [dataB, setDataB] = useState(null);

  // Tutorial Setup
  const tutorialSteps = [
    {
      title: t("yieldReports") || "Yield Analytics Reports",
      action: t("reportTutorialOverviewAction"),
      outcome: t("reportTutorialOverviewOutcome")
    },
    {
      title: t("reportTutorialModeTitle"),
      action: t("reportTutorialModeAction"),
      outcome: t("reportTutorialModeOutcome")
    },
    {
      title: t("reportTutorialDistrictTitle"),
      action: t("reportTutorialDistrictAction"),
      outcome: t("reportTutorialDistrictOutcome")
    },
    {
      title: t("reportTutorialYieldTitle"),
      action: t("reportTutorialYieldAction"),
      outcome: t("reportTutorialYieldOutcome")
    },
    {
      title: t("reportTutorialMetricsTitle"),
      action: t("reportTutorialMetricsAction"),
      outcome: t("reportTutorialMetricsOutcome")
    }
  ];

  const {
    currentStep,
    showTutorial,
    currentTutorialStep,
    hasMoreSteps,
    nextStep,
    prevStep,
    closeTutorial
  } = usePageTutorial("report", tutorialSteps);

  // Element refs for tutorial
  const headerRef = useRef(null);
  const modeToggleRef = useRef(null);
  const districtSelectorRef = useRef(null);
  const yieldHeroRef = useRef(null);
  const metricsExportRef = useRef(null);

  // Fetch available S3 dates once on mount and set the latest as default
  useEffect(() => {
    apiFetch("/api/available-dates")
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
    if (!conf.date) return;

    try {
      const res = await apiFetch(
        `/api/detailed-report?date=${conf.date}&district=${conf.district}&season=${conf.season}`
      );

      const json = await res.json();

      if (!res.ok) throw new Error(json.detail || "Data not found");
      setter(json);


    } catch (err) {
      setter({ error: true, message: err.message });
    }
  };

  useEffect(() => {
    if (configA.date) fetchData(configA, setDataA);
    if (mode === "compare" && configB.date) fetchData(configB, setDataB);
  }, [configA, configB, mode]);

  const generatePDF = async (report, config) => {
    const t = tEn;
    const language = "en";
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const PW = 210;
    const PH = 297;
    const M = 14;

    // ── PALETTE ───────────────────────────────────────────────────
    const WHITE = [255, 255, 255];
    const OFFWH = [248, 250, 252];
    const GREEN = [16, 185, 129];   // single brand green throughout
    const NAVY = [15, 23, 42];
    const INK = [15, 23, 42];
    const DARK = [30, 41, 59];
    const SUBTEXT = [71, 85, 105];
    const MUTED = [148, 163, 184];
    const LGRAY = [241, 245, 249];
    const BORDER = [226, 232, 240];
    const ORANGE = [217, 119, 6];
    const RED = [220, 38, 38];
    const REDLT = [254, 242, 242];

    // ── PAGE BACKGROUND ───────────────────────────────────────────
    doc.setFillColor(...WHITE);
    doc.rect(0, 0, PW, PH, 'F');

    // ── LOAD LOGO (maintain aspect ratio) ─────────────────────────
    let logoDataUrl = null;
    let logoW = 0, logoH = 0;
    try {
      const imgEl = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = logoImg;
      });
      const maxH = 16;
      const ratio = imgEl.naturalWidth / imgEl.naturalHeight;
      logoH = maxH;
      logoW = maxH * ratio;
      const canvas = document.createElement('canvas');
      canvas.width = imgEl.naturalWidth;
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
    doc.text(translateDistrictName(config.district, language), M, 53.5);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(...SUBTEXT);
    doc.text('Sri Lanka  ·  District Yield Forecast', M, 59);

    // Chips (right-aligned)
    const chipH = 8;
    const chipW = 34;
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
    const gapVal = report.summary.gap;
    const gapSign = gapVal >= 0 ? '+' : '';
    const gapAccent = gapVal >= 0 ? GREEN : RED;
    const pct = raw.percent_change !== undefined
      ? parseFloat(raw.percent_change).toFixed(1)
      : ((gapVal / report.summary.historical) * 100).toFixed(1);

    const cW = (PW - M * 2 - 5) / 2;
    const cH = 27;

    drawStatCard(M, y, cW, cH, 'PREDICTED AVG YIELD', `${Math.round(report.summary.yield).toLocaleString()} kg/ha`, 'Satellite-derived ML forecast');
    drawStatCard(M + cW + 5, y, cW, cH, 'HISTORICAL BASELINE', `${Math.round(report.summary.historical).toLocaleString()} kg/ha`, 'Long-term district average');
    y += cH + 4;
    drawStatCard(M, y, cW, cH, 'YIELD GAP', `${gapSign}${Math.round(gapVal).toLocaleString()} kg/ha`, `${gapSign}${pct}% vs baseline`, gapAccent);
    drawStatCard(M + cW + 5, y, cW, cH, 'TOTAL PRODUCTION EST.', `${Math.round(report.summary.total_kg / 1000).toLocaleString()} MT`, 'Full district (metric tons)');
    y += cH + 10;

    // ── FIELD OVERVIEW TABLE ──────────────────────────────────────
    sectionHeading('Field Overview', y);
    y += 6;

    const riskScore = report.metrics.risk_score;
    const riskLabel = riskScore < 1 ? 'Low' : riskScore < 4 ? 'Moderate' : 'High';
    const riskAccent = riskScore < 1 ? GREEN : riskScore < 4 ? ORANGE : RED;
    const pestLabel = report.metrics.pest_count === 0 ? 'Clear' : report.metrics.pest_count < 20 ? 'Moderate' : 'Critical';

    const fieldRows = [
      [t('reportGrowthStageLabel'), translateStageCategory(report.categories.current_stage, t), t('reportHealthStatusLabel'), translateHealthCategory(report.categories.health_status, t)],
      [t('reportPestIncidentsLabel'), `${report.metrics.pest_count} (${pestLabel})`, t('reportRiskScoreLabel'), `${riskScore.toFixed(2)} / 10 (${riskLabel})`],
      [t('reportSevereStressArea'), `${report.metrics.stress_pct.toFixed(2)}%`, t('reportEstHarvestDate'), report.metrics.harvest_date],
      [t('mapSeason'), config.season, t('reportDataDate'), config.date],
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
      styles: { fontSize: 8, cellPadding: { top: 3.5, bottom: 3.5, left: 5, right: 5 }, textColor: INK, fillColor: WHITE },
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
        ['Predicted Average Yield', Math.round(report.summary.yield).toLocaleString(), 'kg/ha', 'ML satellite forecast'],
        ['Historical Average Yield', Math.round(report.summary.historical).toLocaleString(), 'kg/ha', 'District long-term baseline'],
        ['Total Estimated Production', Math.round(report.summary.total_kg).toLocaleString(), 'kg', 'Full district acreage'],
        ['Total Estimated Production', Math.round(report.summary.total_kg / 1000).toLocaleString(), 'MT', 'Metric tons (÷ 1,000)'],
        ['Yield Gap', `${gapSign}${Math.round(gapVal).toLocaleString()}`, 'kg/ha', gapVal >= 0 ? 'Above historical average' : 'Below historical average'],
        ['% Change vs Historical', `${gapSign}${pct}%`, '—', gapVal >= 0 ? 'Out-performing baseline' : 'Under-performing vs baseline'],
      ],
      theme: 'grid',
      headStyles: { fillColor: GREEN, textColor: WHITE, fontSize: 7.5, fontStyle: 'bold', cellPadding: 4 },
      bodyStyles: { fontSize: 7.5, textColor: INK, fillColor: WHITE, cellPadding: 3.5 },
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
      head: [[t('reportHeadingRiskFactor'), t('reportHeadingValue'), t('reportHeadingStatus')]],
      body: [
        [t('reportOverallRiskScore'), riskScore.toFixed(2), riskLabel],
        [t('reportSevereStressCoverage'), `${report.metrics.stress_pct.toFixed(2)}%`, report.metrics.stress_pct < 5 ? t('reportAcceptable') : t('reportActionRequired')],
        [t('reportPestIncidentsLabel'), String(report.metrics.pest_count), pestLabel],
        [t('reportCropHealthStatus'), translateHealthCategory(report.categories.health_status, t), report.categories.health_status === 'Normal' ? t('reportNormal') : t('reportWarning')],
        [t('reportGrowthStageLabel'), translateStageCategory(report.categories.current_stage, t), '—'],
      ],
      theme: 'grid',
      headStyles: { fillColor: riskAccent, textColor: WHITE, fontSize: 7.5, fontStyle: 'bold', cellPadding: 4 },
      bodyStyles: { fontSize: 7.5, textColor: INK, fillColor: WHITE, cellPadding: 3.5 },
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

  const generateComparisonPDF = async () => {
    const language = "en";

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    const PW = 210;
    const PH = 297;
    const M = 14;

    const WHITE = [255, 255, 255];
    const OFFWH = [248, 250, 252];
    const GREEN = [16, 185, 129];
    const DARK = [30, 41, 59];
    const INK = [15, 23, 42];
    const SUBTEXT = [71, 85, 105];
    const MUTED = [148, 163, 184];
    const LGRAY = [241, 245, 249];
    const BORDER = [226, 232, 240];

    doc.setFillColor(...WHITE);
    doc.rect(0, 0, PW, PH, "F");

    // Load logo (maintain aspect ratio)
    let logoDataUrl = null;
    let logoW = 0, logoH = 0;
    try {
      const imgEl = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = logoImg;
      });
      const maxH = 16;
      const ratio = imgEl.naturalWidth / imgEl.naturalHeight;
      logoH = maxH;
      logoW = maxH * ratio;
      const canvas = document.createElement("canvas");
      canvas.width = imgEl.naturalWidth;
      canvas.height = imgEl.naturalHeight;
      canvas.getContext("2d").drawImage(imgEl, 0, 0);
      logoDataUrl = canvas.toDataURL("image/png");
    } catch (_) {
      // Logo is optional.
    }

    /* ---------------- HEADER ---------------- */

    doc.setFillColor(...WHITE);
    doc.rect(0, 0, PW, 40, "F");

    doc.setFillColor(0, 100, 50);
    doc.rect(0, 40, PW, 2, "F");

    // Logo - vertically centered in header.
    const logoY = (39 - logoH) / 2;
    if (logoDataUrl) {
      doc.addImage(logoDataUrl, "PNG", M, logoY, logoW, logoH);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...INK);

    doc.setFontSize(9);

    doc.text(
      `Generated ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}`,
      PW - M,
      26,
      { align: "right" }
    );

    doc.text(
      `Satellite Data ${configA.date}`,
      PW - M,
      36,
      { align: "right" }
    );

    /* ---------------- DISTRICT TITLE ROW ---------------- */

    doc.setFillColor(...OFFWH);
    doc.rect(0, 42, PW, 20, "F");

    doc.setDrawColor(...BORDER);
    doc.line(0, 62, PW, 62);

    doc.setFontSize(12);
    doc.setTextColor(...INK);

    const districtADisplay = translateDistrictName(configA.district, language);
    const districtBDisplay = translateDistrictName(configB.district, language);

    doc.text(`Comparison between ${districtADisplay} and ${districtBDisplay}`, M, 53);

    doc.setFontSize(7);
    doc.setTextColor(...SUBTEXT);

    doc.text("Sri Lanka · Comparative Yield Analytics", M, 59);

    /* ---------------- SUMMARY CARDS ---------------- */

    let y = 72;

    const cardW = (PW - M * 2 - 5) / 2;
    const cardH = 26;

    const drawCard = (x, label, valA, valB) => {

      doc.setFillColor(...OFFWH);
      doc.roundedRect(x, y, cardW, cardH, 3, 3, "F");

      doc.setFillColor(...GREEN);
      doc.roundedRect(x, y, 3, cardH, 2, 2, "F");

      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);
      doc.text(label, x + 7, y + 7);

      doc.setFontSize(11);
      doc.setTextColor(...INK);

      doc.text(`${valA}`, x + 7, y + 15);
      doc.text(`${valB}`, x + cardW / 2 + 7, y + 15);

      doc.setFontSize(6);
      doc.setTextColor(...SUBTEXT);

      doc.text(districtADisplay, x + 7, y + 21);
      doc.text(districtBDisplay, x + cardW / 2 + 7, y + 21);

    };

    drawCard(
      M,
      "Predicted Yield (kg/ha)",
      Math.round(dataA.summary.yield).toLocaleString(),
      Math.round(dataB.summary.yield).toLocaleString()
    );

    drawCard(
      M + cardW + 5,
      "Historical Yield (kg/ha)",
      Math.round(dataA.summary.historical).toLocaleString(),
      Math.round(dataB.summary.historical).toLocaleString()
    );

    y += cardH + 5;

    drawCard(
      M,
      "Total Production (MT)",
      Math.round(dataA.summary.total_kg / 1000).toLocaleString(),
      Math.round(dataB.summary.total_kg / 1000).toLocaleString()
    );

    drawCard(
      M + cardW + 5,
      "Risk Score",
      dataA.metrics.risk_score.toFixed(2),
      dataB.metrics.risk_score.toFixed(2)
    );

    y += cardH + 10;

    /* ---------------- COMPARISON TABLE ---------------- */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);

    doc.text("PERFORMANCE COMPARISON", M, y);

    doc.setDrawColor(...GREEN);
    doc.line(M, y + 1.5, PW - M, y + 1.5);

    y += 6;

    autoTable(doc, {
      startY: y,
      margin: { left: M, right: M },
      head: [
        ["Metric", districtADisplay, districtBDisplay]
      ],
      body: [
        [
          "Predicted Yield (kg/ha)",
          Math.round(dataA.summary.yield).toLocaleString(),
          Math.round(dataB.summary.yield).toLocaleString()
        ],
        [
          "Historical Yield (kg/ha)",
          Math.round(dataA.summary.historical).toLocaleString(),
          Math.round(dataB.summary.historical).toLocaleString()
        ],
        [
          "Total Production (kg)",
          Math.round(dataA.summary.total_kg).toLocaleString(),
          Math.round(dataB.summary.total_kg).toLocaleString()
        ],
        [
          "Pest Incidents",
          dataA.metrics.pest_count,
          dataB.metrics.pest_count
        ],
        [
          "Risk Score",
          dataA.metrics.risk_score.toFixed(2),
          dataB.metrics.risk_score.toFixed(2)
        ],
        [
          "Severe Stress %",
          dataA.metrics.stress_pct.toFixed(2) + "%",
          dataB.metrics.stress_pct.toFixed(2) + "%"
        ]
      ],
      theme: "grid",
      headStyles: {
        fillColor: GREEN,
        textColor: WHITE,
        fontSize: 7.5,
        fontStyle: "bold"
      },
      styles: {
        fontSize: 7.5,
        cellPadding: 3
      },
      alternateRowStyles: { fillColor: LGRAY },
      tableLineColor: BORDER,
      tableLineWidth: 0.2
    });

    y = doc.lastAutoTable.finalY + 12;

    /* ---------------- WINNER INSIGHT ---------------- */

    const diff = dataA.summary.yield - dataB.summary.yield;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(...GREEN);

    doc.text("KEY INSIGHT", M, y);

    doc.line(M, y + 1.5, PW - M, y + 1.5);

    y += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...INK);

    const winner =
      diff > 0 ? districtADisplay : districtBDisplay;

    doc.text(
      `${winner} shows higher predicted yield by ${Math.abs(Math.round(diff))} kg/ha.`,
      M,
      y
    );

    /* ---------------- FOOTER ---------------- */

    const totalPages = doc.getNumberOfPages();

    for (let p = 1; p <= totalPages; p++) {

      doc.setPage(p);

      doc.setDrawColor(...BORDER);
      doc.line(M, PH - 13, PW - M, PH - 13);

      doc.setFontSize(6.5);
      doc.setTextColor(...MUTED);

      doc.text(
        "RiceVision Analytics | Agricultural Intelligence Platform | Confidential",
        M,
        PH - 7
      );

      doc.text(
        `Page ${p} of ${totalPages}`,
        PW - M,
        PH - 7,
        { align: "right" }
      );

    }

    doc.save(`RiceVision_Comparison_${configA.district}_vs_${configB.district}.pdf`);

  };
  const getPestStatus = (count) => {
    if (count === 0) return { label: t("statusSafe"), color: "text-emerald-400" };
    if (count < 20) return { label: t("statusModerate"), color: "text-amber-400" };
    return { label: t("statusCritical"), color: "text-red-400" };
  };

  const getRiskStatus = (score) => {
    if (score < 1) return { label: t("statusStable"), color: "text-emerald-400" };
    if (score < 4) return { label: t("statusWarning"), color: "text-amber-400" };
    return { label: t("statusHighRisk"), color: "text-red-400" };
  };

  const ReportPane = ({ report, config, setConfig, title, districtSelectorRef, yieldHeroRef, metricsExportRef, isSingleMode = false }) => {
    if (report?.error) return (
      <div className="flex-1 glass p-6 sm:p-12 rounded-2xl sm:rounded-[3rem] text-center border border-red-500/20">
        <span className="material-symbols-outlined text-5xl text-red-300 mb-4 block">signal_disconnected</span>
        <h3 className="text-red-400 font-black uppercase tracking-widest mb-3 text-sm">{t('dataUnavailable')}</h3>
        <p className="text-xs text-white/85 mb-6">{report.message}</p>
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
      <div className="flex-1 glass rounded-2xl sm:rounded-[3rem] p-8 sm:p-20 text-center animate-pulse">
        <p className="text-white/85 font-black uppercase tracking-widest text-xs">{t('fetchingSatelliteData')}</p>
      </div>
    );

    const chartData = [
      { name: t('predictedAverage'), value: report.summary.yield, color: '#10b981' },
      { name: t('historicalBaseline'), value: report.summary.historical, color: '#6366f1' }
    ];

    return (
      <div className="flex-1 glass glass-hover rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-8 border border-white/10 shadow-2xl relative">
        {/* Pane header */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="col-span-2 flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-emerald-400 tracking-[0.2em] uppercase flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {title} {t('viewLabel')}
            </span>
            <button
              ref={metricsExportRef}
              onClick={() => generatePDF(report, config)}
              className={`flex items-center gap-2 text-[10px] font-black px-4 py-1.5 rounded-xl border transition-all duration-300 hover:scale-[1.02] cursor-pointer uppercase tracking-widest ${isSingleMode
                ? "border-emerald-400/70 bg-emerald-500/10 hover:bg-emerald-500/20 hover:border-emerald-300"
                : "border-white/10 hover:bg-white/10 hover:border-white/20"
                }`}            >
              <span className="material-symbols-outlined text-xs">download</span>
              {t('downloadPdf')}
            </button>
          </div>
          <div ref={districtSelectorRef}>
            <CustomSelect
              value={config.district}
              onChange={(val) => setConfig({ ...config, district: val })}
              options={districtOptions}
            />
          </div>
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
        <div ref={yieldHeroRef} className="glass p-3 sm:p-5 rounded-xl sm:rounded-[2rem] border border-emerald-500/20 shadow-xl mb-6 relative overflow-hidden">
          {/* subtle glow */}
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 blur-[50px] -mr-8 -mt-8 pointer-events-none rounded-full" />
          <div className="relative z-10 flex flex-col">
            <div className="text-center flex flex-col items-center justify-center py-1 sm:py-2">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/85 mb-1 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-sm">monitoring</span>
                {t('predictedAverage')}
              </p>
              <h2 className="text-3xl sm:text-5xl font-black tracking-tighter text-white leading-none">
                {Math.round(report.summary.yield).toLocaleString()}
                <span className="text-base font-normal text-white/85 ml-2">kg/ha</span>
              </h2>
            </div>
            <div className="mt-2 pt-3 border-t border-white/5 grid grid-cols-2 gap-3">
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/85 mb-0.5">{t('totalYieldLabel')}</p>
                <p className="text-base font-black text-white">{Math.round(report.summary.total_kg).toLocaleString()} <span className="text-xs font-bold text-white/85">kg</span></p>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/85 mb-0.5">{t('historicalBaseline')}</p>
                <p className="text-base font-black text-white">{Math.round(report.summary.historical).toLocaleString()} <span className="text-xs font-bold text-white/85">kg/ha</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="h-[200px] w-full mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.90)', fontSize: 10, fontWeight: 'bold' }} />
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
            <p className="text-[9px] font-black text-white/85 uppercase tracking-widest mb-2">{t('pestCount')}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white">{report.metrics.pest_count}</span>
              <span className={`text-[9px] font-black ${getPestStatus(report.metrics.pest_count).color}`}>
                {getPestStatus(report.metrics.pest_count).label}
              </span>
            </div>
          </div>
          <div className="glass glass-hover p-5 rounded-3xl border border-white/10 group transition-all duration-300">
            <p className="text-[9px] font-black text-white/85 uppercase tracking-widest mb-2">{t('riskFactor')}</p>
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
    <div className="min-h-full p-4 sm:p-6 lg:p-10 text-white font-sans transition-all duration-500">
      <div className="max-w-7xl mx-auto space-y-10 pb-20">

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6" ref={headerRef}>
          <div>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-black text-white tracking-tight" style={{ textShadow: "0 2px 20px rgba(0,0,0,0.4)" }}>
              {t('yieldReports')}
            </h1>
            <p className="text-white/85 text-[10px] sm:text-xs md:text-sm mt-2 font-bold uppercase tracking-[0.2em]">
              {t('satelliteDerivedAnalytics')}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4" ref={modeToggleRef}>
            <div className="flex p-1 rounded-2xl bg-white/5 border border-white/10 w-fit">
              <button
                onClick={() => setMode("single")}
                className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${mode === "single" ? "glass bg-white/15 text-white shadow-lg border-white/20" : "text-white/85 hover:text-white/90"}`}
              >
                {t('single')}
              </button>
              <button
                onClick={() => setMode("compare")}
                className={`px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all duration-300 ${mode === "compare" ? "glass bg-white/15 text-white shadow-lg border-white/20" : "text-white/85 hover:text-white/90"}`}
              >
                {t('compare')}
              </button>
            </div>
            <div className="glass px-4 py-2 rounded-xl border-white/10 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/85">{t('liveData')}</span>
            </div>
            {mode === "compare" && dataA && dataB && (
              <button
                onClick={() => generateComparisonPDF()}
                className="flex items-center gap-2 text-[10px] font-black px-4 py-2 rounded-xl border border-emerald-400/70 bg-emerald-500/10 transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-300 hover:scale-[1.02] cursor-pointer uppercase tracking-widest"
              >
                <span className="material-symbols-outlined text-sm">compare</span>
                {t('exportComparisonReport')}
              </button>
            )}
          </div>
        </div>

        {/* Report Panes */}
        <div className={`flex flex-col ${mode === "compare" ? "lg:flex-row" : "max-w-2xl mx-auto w-full"} gap-8`}>
          <ReportPane
            report={dataA}
            config={configA}
            setConfig={setConfigA}
            title={t('primaryLabel')}
            districtSelectorRef={currentStep === 2 ? districtSelectorRef : undefined}
            yieldHeroRef={currentStep === 3 ? yieldHeroRef : undefined}
            metricsExportRef={currentStep === 4 ? metricsExportRef : undefined}
            isSingleMode={mode === "single"}
          />
          {mode === "compare" && <ReportPane report={dataB} config={configB} setConfig={setConfigB} title={t('comparisonLabel')} />}
        </div>

      </div>
      {/* ─── TUTORIAL TOOLTIPS ─── */}
      {showTutorial && currentTutorialStep && (
        <>
          {currentStep === 0 && (
            <TutorialTooltip
              visible={true}
              position="bottom"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={headerRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={closeTutorial}
            />
          )}
          {currentStep === 1 && (
            <TutorialTooltip
              visible={true}
              position="bottom"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={modeToggleRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={closeTutorial}
            />
          )}
          {currentStep === 2 && (
            <TutorialTooltip
              visible={true}
              position="bottom"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={districtSelectorRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={closeTutorial}
            />
          )}
          {currentStep === 3 && (
            <TutorialTooltip
              visible={true}
              position="bottom"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={yieldHeroRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={closeTutorial}
            />
          )}
          {currentStep === 4 && (
            <TutorialTooltip
              visible={true}
              position="bottom"
              title={currentTutorialStep.title}
              action={currentTutorialStep.action}
              outcome={currentTutorialStep.outcome}
              elementRef={metricsExportRef}
              step={currentStep}
              totalSteps={tutorialSteps.length}
              onNext={nextStep}
              onPrevious={prevStep}
              onDismiss={closeTutorial}
            />
          )}
        </>
      )}
    </div>

  );
};

export default Report;