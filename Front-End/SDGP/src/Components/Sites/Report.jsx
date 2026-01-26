import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CSVLink } from "react-csv";
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

  // Fetch data from Supabase
  const fetchData = async () => {
    if (!district1) return;
    setLoading(true);
    try {
      const districts =
        filterType === "comparison" && district2
          ? [district1, district2]
          : [district1];
      const startDate = `2025-${month.toString().padStart(2, "0")}-01`;
      const endDate = `2025-${month.toString().padStart(2, "0")}-31`;

      const { data, error } = await supabase
        .from("reports_analytics_table")
        .select(
          `
          District,
          Date,
          total_yield_tons,
          healthy_percentage,
          risk_level,
          mean_ndvi,
          stage_name,
          pest_risk
        `,
        )
        .in("District", districts)
        .gte("Date", startDate)
        .lte("Date", endDate);

      if (error) throw error;

      setReports(data);
    } catch (err) {
      console.error(err);
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
        <div className="flex gap-3 mb-4">
          <div className="bg-white dark:bg-[#1e293b] p-4 rounded shadow w-1/3 text-center">
            <p className="text-gray-500 dark:text-slate-400">Total Yield</p>
            <p className="text-2xl font-bold dark:text-[#e2e8f0]">
              {filtered
                .reduce((acc, r) => acc + parseFloat(r.total_yield_tons), 0)
                .toFixed(2)}{" "}
              tons
            </p>
          </div>
          <div className="bg-white dark:bg-[#1e293b] p-4 rounded shadow w-1/3 text-center">
            <p className="text-gray-500 dark:text-slate-400">Average Health</p>
            <p className="text-2xl font-bold dark:text-[#e2e8f0]">
              {avgHealth.toFixed(1)}%
            </p>
          </div>
          <div className="bg-white dark:bg-[#1e293b] p-4 rounded shadow w-1/3 text-center">
            <p className="text-gray-500 dark:text-slate-400">Average NDVI</p>
            <p className="text-2xl font-bold dark:text-[#e2e8f0]">
              {(
                filtered.reduce((acc, r) => acc + parseFloat(r.mean_ndvi), 0) /
                filtered.length
              ).toFixed(3)}
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold mb-2 text-black dark:text-[#e2e8f0] text-center">
              Yield (tons)
            </h2>
            <div style={{ height: "200px" }}>
              <Line
                key={`yield-${isDark}`}
                data={yieldData}
                options={baseLineOptions}
                height={200}
              />
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-700">
            <h2 className="font-semibold mb-2 text-black dark:text-[#e2e8f0] text-center">
              Mean NDVI
            </h2>
            <div style={{ height: "200px" }}>
              <Line
                key={`yield-${isDark}`}
                data={ndviData}
                options={baseLineOptions}
                height={200}
              />
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-700 flex flex-col items-center">
            <h2 className="font-semibold mb-2 text-black dark:text-[#e2e8f0] text-center">
              Health %
            </h2>
            <div style={{ height: "180px", width: "180px" }}>
              <Doughnut
                key={`health-${isDark}`}
                data={healthData}
                options={baseDoughnutOptions}
                height={180}
              />
            </div>
          </div>
          <div className="p-4 bg-white dark:bg-[#1e293b] rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-700 flex flex-col items-center">
            <h2 className="font-semibold mb-2 text-black dark:text-[#e2e8f0] text-center">
              Pest Risk
            </h2>
            <div style={{ height: "180px", width: "180px" }}>
              <Doughnut
                key={`health-${isDark}`}
                data={pestData}
                options={baseDoughnutOptions}
                height={180}
              />
            </div>
          </div>
        </div>
      </>
    );
  };

  const renderComparison = () => {
    if (!reports.length || !district2) return null;

    return (
      <>
        <div className="grid md:grid-cols-2 gap-4">
          {[district1, district2].map((d, idx) => {
            const filtered = reports.filter((r) => r.District === d);
            const yieldData = {
              labels: filtered.map((r) => r.Date),
              datasets: [
                {
                  label: `Yield - ${d}`,
                  data: filtered.map((r) => r.total_yield_tons),
                  borderColor: idx === 0 ? "#1f7a4c" : "#2a5d9f",
                  backgroundColor:
                    idx === 0 ? "rgba(31,122,76,0.2)" : "rgba(42,93,159,0.2)",
                  tension: 0.3,
                  fill: true,
                },
              ],
            };
            const ndviData = {
              labels: filtered.map((r) => r.Date),
              datasets: [
                {
                  label: `NDVI - ${d}`,
                  data: filtered.map((r) => r.mean_ndvi),
                  borderColor: idx === 0 ? "#2a5d9f" : "#1f7a4c",
                  backgroundColor:
                    idx === 0 ? "rgba(42,93,159,0.2)" : "rgba(31,122,76,0.2)",
                  tension: 0.3,
                  fill: true,
                },
              ],
            };
            const avgHealth =
              filtered.reduce(
                (acc, r) => acc + parseFloat(r.healthy_percentage),
                0,
              ) / filtered.length;
            const healthData = {
              labels: ["Healthy", "Not Healthy"],
              datasets: [
                {
                  data: [avgHealth, 100 - avgHealth],
                  backgroundColor: [
                    idx === 0 ? "#1f7a4c" : "#2a5d9f",
                    "#6b7280",
                  ],
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
            const baseLineOptions = {
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                legend: {
                  labels: {
                    color: window.matchMedia("(prefers-color-scheme: dark)")
                      .matches
                      ? "#f1f5f9"
                      : "#000000",
                    font: { size: 12, weight: "600" },
                  },
                },
              },
              scales: {
                x: {
                  grid: {
                    color: window.matchMedia("(prefers-color-scheme: dark)")
                      .matches
                      ? "#334155"
                      : "#d1d5db",
                  },
                  ticks: {
                    color: window.matchMedia("(prefers-color-scheme: dark)")
                      .matches
                      ? "#f1f5f9"
                      : "#000000",
                    font: { size: 12, weight: "600" },
                  },
                },
                y: {
                  grid: {
                    color: window.matchMedia("(prefers-color-scheme: dark)")
                      .matches
                      ? "#334155"
                      : "#d1d5db",
                  },
                  ticks: {
                    color: window.matchMedia("(prefers-color-scheme: dark)")
                      .matches
                      ? "#f1f5f9"
                      : "#000000",
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
                    color: window.matchMedia("(prefers-color-scheme: dark)")
                      .matches
                      ? "#f1f5f9"
                      : "#000000",
                    font: { size: 12, weight: "600" },
                  },
                },
              },
            };
            return (
              <div
                key={d}
                className="p-4 bg-white dark:bg-[#1e293b] rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-700"
              >
                <h2 className="font-semibold text-black dark:text-[#e2e8f0] mb-2 text-center">
                  {d}
                </h2>
                <div style={{ height: "200px" }}>
                  <Line
                    key={`yield-${d}-${isDark}`}
                    data={yieldData}
                    options={baseLineOptions}
                    height={200}
                  />
                </div>
                <div style={{ height: "200px" }}>
                  <Line
                    key={`ndvi-${d}-${isDark}`}
                    data={ndviData}
                    options={baseLineOptions}
                    height={200}
                  />
                </div>
                <div className="flex flex-col items-center mt-2">
                  <div style={{ height: "180px", width: "180px" }}>
                    <Doughnut
                      key={`health-${d}-${isDark}`}
                      data={healthData}
                      options={baseDoughnutOptions}
                      height={180}
                    />
                  </div>
                </div>
                <div className="flex flex-col items-center mt-2">
                  <div style={{ height: "180px", width: "180px" }}>
                    <Doughnut
                      key={`pest-${d}-${isDark}`}
                      data={pestData}
                      options={baseDoughnutOptions}
                      height={180}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <div className="p-6 bg-white dark:bg-[#050810] dark:text-slate-200">
      <h1 className="text-3xl font-bold mb-2 text-black dark:text-[#e2e8f0]">
        RiceVision Monthly Report
      </h1>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        View the yield, healthy percentage, mean NDVI, stage, and pest risk for
        selected districts for the month.
      </p>

      {/* Filter Type */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-5 py-2 rounded-lg font-medium transition ${
            filterType === "single"
              ? "bg-[#1f7a4c] text-white shadow hover:bg-[#16623b]"
              : "bg-white dark:bg-[#1e293b] border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#334155]"
          }`}
          onClick={() => setFilterType("single")}
        >
          Single View
        </button>
        <button
          className={`px-5 py-2 rounded-lg font-medium transition ${
            filterType === "comparison"
              ? "bg-[#1f7a4c] text-white shadow hover:bg-[#16623b]"
              : "bg-white dark:bg-[#1e293b] border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#334155]"
          }`}
          onClick={() => setFilterType("comparison")}
        >
          District Comparison
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4 p-4 bg-white dark:bg-[#1e293b] rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <select
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
          className="px-3 py-2 rounded border dark:bg-[#334155] dark:border-gray-700 dark:text-slate-200"
        >
          {monthsList.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>
        <select
          value={district1}
          onChange={(e) => setDistrict1(e.target.value)}
          className="px-3 py-2 rounded border dark:bg-[#334155] dark:border-gray-700 dark:text-slate-200"
        >
          <option value="">Select District 1</option>
          {districtsList.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        {filterType === "comparison" && (
          <select
            value={district2}
            onChange={(e) => setDistrict2(e.target.value)}
            className="px-3 py-2 rounded border dark:bg-[#334155] dark:border-gray-700 dark:text-slate-200"
          >
            <option value="">Select District 2</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        )}
      </div>

      {loading && <div>Loading...</div>}

      {/* Charts */}
      {filterType === "single" ? renderSingleView() : renderComparison()}

      {/* Table & Export */}
      {reports.length > 0 && (
        <div className="mt-4 p-4 bg-white dark:bg-[#1e293b] rounded-xl shadow-md hover:shadow-lg transition border border-gray-100 dark:border-gray-700">
          <div className="flex gap-3 mb-3">
            <button
              onClick={downloadPDF}
              className="px-5 py-2 bg-[#1f7a4c] text-white rounded-lg hover:bg-[#16623b] transition"
            >
              Download PDF
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
              className="px-5 py-2 bg-[#2a5d9f] text-white rounded-lg hover:bg-[#23497c] transition"
            >
              Download CSV
            </CSVLink>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-200 dark:bg-[#334155] text-left">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">District</th>
                  <th className="px-3 py-2">Yield (tons)</th>
                  <th className="px-3 py-2">Healthy %</th>
                  <th className="px-3 py-2">Risk Level</th>
                  <th className="px-3 py-2">Mean NDVI</th>
                  <th className="px-3 py-2">Stage Name</th>
                  <th className="px-3 py-2">Pest Risk</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-[#1e293b]">
                {reports.map((r, i) => (
                  <tr
                    key={i}
                    className={`border-t dark:border-gray-700 ${r.risk_level === "High Risk" ? "bg-red-50 dark:bg-[#4b1818]" : ""}`}
                  >
                    <td className="px-3 py-2">{r.Date}</td>
                    <td className="px-3 py-2">{r.District}</td>
                    <td className="px-3 py-2">{r.total_yield_tons}</td>
                    <td className="px-3 py-2">{r.healthy_percentage}</td>
                    <td className="px-3 py-2">{r.risk_level}</td>
                    <td className="px-3 py-2">{r.mean_ndvi}</td>
                    <td className="px-3 py-2">{r.stage_name}</td>
                    <td className="px-3 py-2">{r.pest_risk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportPage;
