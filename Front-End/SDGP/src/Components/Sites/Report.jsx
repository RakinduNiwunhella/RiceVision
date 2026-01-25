import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "../../supabaseClient";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const Report = () => {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedMonth2, setSelectedMonth2] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedDistrict2, setSelectedDistrict2] = useState("");
  const [comparisonMode, setComparisonMode] = useState("single");
  const [generated, setGenerated] = useState(false);

  useEffect(() => {
    setSelectedMonth2("");
    setSelectedDistrict2("");
  }, [comparisonMode]);

  const [reports, setReports] = useState([]);

  // Filters
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ];

  const sriLankaDistricts = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Moneragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya"
  ];

  // Removed initial loadReports useEffect

  const loadReports = async () => {
    // ---- BASIC VALIDATION ----
    if (!selectedMonth || !selectedDistrict) return;

    let query = supabase
      .from("reports_analytics")
      .select("*");

    // ---------- DISTRICT FILTERING (SERVER-SIDE) ----------
    if (comparisonMode === "single") {
      query = query.eq("district", selectedDistrict);
    }

    if (comparisonMode === "district") {
      if (!selectedDistrict2) return;
      query = query.in("district", [selectedDistrict, selectedDistrict2]);
    }

    if (comparisonMode === "month") {
      query = query.eq("district", selectedDistrict);
    }

    // ---------- MONTH FILTERING (SERVER-SIDE) ----------
    const year = new Date().getFullYear();

    if (comparisonMode === "single" || comparisonMode === "district") {
      const startDate = `${year}-${String(selectedMonth).padStart(2, "0")}-01`;
      const endDate   = `${year}-${String(selectedMonth).padStart(2, "0")}-31`;

      query = query
        .gte("date", startDate)
        .lte("date", endDate);
    }

    if (comparisonMode === "month") {
      if (!selectedMonth2) return;

      const m1Start = `${year}-${String(selectedMonth).padStart(2, "0")}-01`;
      const m1End   = `${year}-${String(selectedMonth).padStart(2, "0")}-31`;

      const m2Start = `${year}-${String(selectedMonth2).padStart(2, "0")}-01`;
      const m2End   = `${year}-${String(selectedMonth2).padStart(2, "0")}-31`;

      query = query.or(
        `and(date.gte.${m1Start},date.lte.${m1End}),and(date.gte.${m2Start},date.lte.${m2End})`
      );
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase fetch error:", error);
      return;
    }

    setReports(data || []);
    setGenerated(true);
  };

  // Updated filteredReports to only handle month logic
  const filteredReports = useMemo(() => {
    if (!generated) return [];

    return reports.filter(r => {
      const recordDate = r.date || r.created_at;
      const month = new Date(recordDate).getMonth() + 1;

      if (comparisonMode === "single") {
        return month === Number(selectedMonth);
      }

      if (comparisonMode === "district") {
        return month === Number(selectedMonth);
      }

      if (comparisonMode === "month") {
        return month === Number(selectedMonth) || month === Number(selectedMonth2);
      }

      return false;
    });
  }, [
    reports,
    selectedMonth,
    selectedMonth2,
    selectedDistrict,
    selectedDistrict2,
    comparisonMode,
    generated
  ]);

  const totalYield = filteredReports.reduce(
    (sum, r) => sum + Number(r.estimated_yield || 0),
    0
  );

  // PDF EXPORT
  const downloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(18);
    doc.text("RiceVision - Prediction Report", 14, 15);
    doc.setFontSize(11);

    let subtitle = "";

    if (comparisonMode === "single") {
      subtitle = `Month: ${monthNames[selectedMonth - 1]} | District: ${selectedDistrict}`;
    }
    if (comparisonMode === "district") {
      subtitle = `Month: ${monthNames[selectedMonth - 1]} | Districts: ${selectedDistrict} vs ${selectedDistrict2}`;
    }
    if (comparisonMode === "month") {
      subtitle = `District: ${selectedDistrict} | Months: ${monthNames[selectedMonth - 1]} vs ${monthNames[selectedMonth2 - 1]}`;
    }

    doc.text(subtitle, 14, 25);

    autoTable(doc, {
      startY: 35,
      head: [[
        "Date",
        "District",
        "Stage",
        "Healthy %",
        "Yield"
      ]],
      body: filteredReports.map(r => [
        r.date,
        r.district,
        r.stage_name,
        `${Number(r.healthy_percentage).toFixed(1)}%`,
        Number(r.estimated_yield).toFixed(1)
      ])
    });

    doc.save("RiceVision_Report.pdf");
  };

  // CSV EXPORT
  const exportCSV = () => {
    const headers = ["Date,District,Stage,Healthy %,Yield"];
    const rows = filteredReports.map(r =>
      `${r.date},${r.district},${r.stage_name},${r.healthy_percentage},${r.estimated_yield}`
    );
    const blob = new Blob([headers.concat(rows).join("\n")], {
      type: "text/csv"
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "RiceVision_Report.csv";
    link.click();
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 p-6">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        {/* HEADER */}
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Prediction Report
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Monthly and district based rice yield prediction analysis for Sri Lanka
          </p>
        </header>

        {/* FILTERS */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 rounded shadow-sm bg-white dark:bg-slate-800">

          <select
            className="border rounded p-2 dark:bg-slate-900"
            value={comparisonMode}
            onChange={e => {
              setComparisonMode(e.target.value);
              setGenerated(false);
            }}
          >
            <option value="single">Single View</option>
            <option value="district">District Comparison</option>
            <option value="month">Month Comparison</option>
          </select>

          {/* MONTH SELECT 1 */}
          <select
            className="border rounded p-2 dark:bg-slate-900"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            <option value="">Select Month</option>
            {monthNames.map((m, i) => (
              <option key={m} value={i + 1}>{m}</option>
            ))}
          </select>

          {/* MONTH SELECT 2 (only for month comparison) */}
          {comparisonMode === "month" && (
            <select
              className="border rounded p-2 dark:bg-slate-900"
              value={selectedMonth2}
              onChange={e => setSelectedMonth2(e.target.value)}
            >
              <option value="">Select Month 2</option>
              {monthNames.map((m, i) => (
                <option key={m} value={i + 1}>{m}</option>
              ))}
            </select>
          )}

          {/* DISTRICT SELECT 1 */}
          <select
            className="border rounded p-2 dark:bg-slate-900"
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
          >
            <option value="">Select District</option>
            {sriLankaDistricts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* DISTRICT SELECT 2 (only for district comparison) */}
          {comparisonMode === "district" && (
            <select
              className="border rounded p-2 dark:bg-slate-900"
              value={selectedDistrict2}
              onChange={e => setSelectedDistrict2(e.target.value)}
            >
              <option value="">Select District 2</option>
              {sriLankaDistricts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          )}

          <button
            onClick={() => {
              if (!selectedMonth || !selectedDistrict) return;
              loadReports();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2"
          >
            Generate
          </button>
        </div>

        {/* SUMMARY */}
        {generated && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 rounded shadow-sm bg-white dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Predicted Yield</p>
              <p className="text-2xl font-semibold text-slate-900 dark:text-white">
                {totalYield.toFixed(1)} tons
              </p>
            </div>
            <div className="p-4 rounded shadow-sm bg-white dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Selected Month</p>
              <p className="text-slate-900 dark:text-white">{selectedMonth ? monthNames[selectedMonth - 1] : "All Months"}</p>
            </div>
            <div className="p-4 rounded shadow-sm bg-white dark:bg-slate-800">
              <p className="text-sm text-slate-500 dark:text-slate-400">Selected District</p>
              <p className="text-slate-900 dark:text-white">{selectedDistrict}</p>
            </div>
          </div>
        )}

        {/* CHARTS */}
        {filteredReports.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="p-4 rounded shadow-sm bg-white dark:bg-slate-800">
              <Line
                data={{
                  labels: filteredReports.map(r => r.date || r.created_at),
                  datasets: [{
                    label: "Predicted Yield",
                    data: filteredReports.map(r => r.estimated_yield)
                  }]
                }}
              />
            </div>

            <div className="p-4 rounded shadow-sm bg-white dark:bg-slate-800">
              <Bar
                data={{
                  labels: filteredReports.map(r =>
                    comparisonMode === "month"
                      ? monthNames[new Date(r.date || r.created_at).getMonth()]
                      : r.district
                  ),
                  datasets: [{
                    label: "Predicted Yield",
                    data: filteredReports.map(r => r.estimated_yield)
                  }]
                }}
              />
            </div>
          </div>
        )}

        {/* INSIGHTS */}
        {filteredReports.length > 0 && (
          <div className="p-4 rounded shadow-sm bg-white dark:bg-slate-800 border-l-4 border-emerald-600 mb-6">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Rice yield trends indicate variations across selected months and
              districts. Higher yields are observed in favorable growing periods.
            </p>
          </div>
        )}

        {/* ACTIONS */}
        {filteredReports.length > 0 && (
          <div className="flex gap-4">
            <button
              onClick={downloadPDF}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded transition"
            >
              Download PDF
            </button>
            <button
              onClick={exportCSV}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded transition"
            >
              Export CSV
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;