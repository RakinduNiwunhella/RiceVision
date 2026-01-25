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
  const [reports, setReports] = useState([]);

  // Filters
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All Sri Lanka");
  const [comparisonMode, setComparisonMode] = useState("single");
  const [generated, setGenerated] = useState(false);

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

  useEffect(() => {
    loadReports();
  }, []);

  // SUPABASE FETCH (UNCHANGED SOURCE)
  const loadReports = async () => {
    const { data, error } = await supabase
      .from("reports_analytics")
      .select("*")
      .limit(200);

    if (!error) setReports(data || []);
    else console.error(error);
  };

  // FILTERED DATA (CLIENT-SIDE)
  const filteredReports = useMemo(() => {
    if (!generated) return [];

    return reports.filter(r => {
      const monthMatch = selectedMonth
        ? new Date(r.date).getMonth() + 1 === Number(selectedMonth)
        : true;

      const districtMatch =
        selectedDistrict === "All Sri Lanka"
          ? true
          : r.district === selectedDistrict;

      return monthMatch && districtMatch;
    });
  }, [reports, selectedMonth, selectedDistrict, generated]);

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
    doc.text(
      `Month: ${selectedMonth || "All"} | District: ${selectedDistrict}`,
      14,
      25
    );

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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded shadow-sm bg-white dark:bg-slate-800">
          <select
            className="border rounded p-2 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
          >
            <option value="" className="text-slate-700 dark:text-slate-300">All</option>
            {monthNames.map((month, index) => (
              <option key={month} value={index + 1} className="text-slate-700 dark:text-slate-300">
                {month}
              </option>
            ))}
          </select>

          <select
            className="border rounded p-2 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300"
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
          >
            <option className="text-slate-700 dark:text-slate-300">All Sri Lanka</option>
            <option className="text-slate-700 dark:text-slate-300">Colombo</option>
            <option className="text-slate-700 dark:text-slate-300">Gampaha</option>
            <option className="text-slate-700 dark:text-slate-300">Kalutara</option>
            <option className="text-slate-700 dark:text-slate-300">Kandy</option>
            <option className="text-slate-700 dark:text-slate-300">Matale</option>
            <option className="text-slate-700 dark:text-slate-300">Nuwara Eliya</option>
            <option className="text-slate-700 dark:text-slate-300">Galle</option>
            <option className="text-slate-700 dark:text-slate-300">Matara</option>
            <option className="text-slate-700 dark:text-slate-300">Hambantota</option>
            <option className="text-slate-700 dark:text-slate-300">Jaffna</option>
            <option className="text-slate-700 dark:text-slate-300">Kilinochchi</option>
            <option className="text-slate-700 dark:text-slate-300">Mannar</option>
            <option className="text-slate-700 dark:text-slate-300">Mullaitivu</option>
            <option className="text-slate-700 dark:text-slate-300">Vavuniya</option>
            <option className="text-slate-700 dark:text-slate-300">Trincomalee</option>
            <option className="text-slate-700 dark:text-slate-300">Batticaloa</option>
            <option className="text-slate-700 dark:text-slate-300">Ampara</option>
            <option className="text-slate-700 dark:text-slate-300">Kurunegala</option>
            <option className="text-slate-700 dark:text-slate-300">Puttalam</option>
            <option className="text-slate-700 dark:text-slate-300">Anuradhapura</option>
            <option className="text-slate-700 dark:text-slate-300">Polonnaruwa</option>
            <option className="text-slate-700 dark:text-slate-300">Badulla</option>
            <option className="text-slate-700 dark:text-slate-300">Monaragala</option>
            <option className="text-slate-700 dark:text-slate-300">Ratnapura</option>
            <option className="text-slate-700 dark:text-slate-300">Kegalle</option>
          </select>

          <select
            className="border rounded p-2 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700 dark:text-slate-300"
            value={comparisonMode}
            onChange={e => setComparisonMode(e.target.value)}
          >
            <option value="single" className="text-slate-700 dark:text-slate-300">Single View</option>
            <option value="month" className="text-slate-700 dark:text-slate-300">Month Comparison</option>
            <option value="district" className="text-slate-700 dark:text-slate-300">District Comparison</option>
          </select>

          <button
            onClick={() => setGenerated(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded px-4 py-2 transition"
          >
            Generate Report
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
                  labels: filteredReports.map(r => r.date),
                  datasets: [{
                    label: "Monthly Yield Trend",
                    data: filteredReports.map(r => r.estimated_yield)
                  }]
                }}
              />
            </div>

            <div className="p-4 rounded shadow-sm bg-white dark:bg-slate-800">
              <Bar
                data={{
                  labels: filteredReports.map(r => r.district),
                  datasets: [{
                    label: "District Comparison",
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