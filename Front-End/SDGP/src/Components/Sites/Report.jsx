import React, { useEffect, useState } from "react";
import { supabase } from "../../supabaseClient";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const Report = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    const { data, error } = await supabase
      .from("reports_analytics")
      .select("*")
      .limit(100);

    if (!error) {
      setReports(data || []);
    } else {
      console.error(error);
    }
  };

  const downloadPDF = () => {
    console.log("PDF download triggered"); // DEBUG LINE

    const doc = new jsPDF({ orientation: "landscape" });

    doc.setFontSize(18);
    doc.text("RiceVision - Analytical Report", 14, 15);

    doc.setFontSize(11);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 25);

    autoTable(doc, {
      startY: 35,
      head: [[
        "Date",
        "Year",
        "District",
        "Mean NDVI",
        "Stage",
        "Healthy %",
        "Yield",
        "Disaster Risk",
        "Pest Risk"
      ]],
      body: reports.map(r => [
        r.date,
        r.year,
        r.district,
        Number(r.ndvi_mean).toFixed(2),
        r.stage_name,
        `${Number(r.healthy_percentage).toFixed(1)}%`,
        Number(r.estimated_yield).toFixed(1),
        r.disaster_risk,
        r.pest_risk
      ])
    });

    doc.save("RiceVision_Report.pdf");
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6 text-gray-900 dark:text-gray-100">
      <h2 className="text-2xl font-semibold mb-4">Reports</h2>

      <button
        onClick={downloadPDF}
        className="mb-4 rounded-md bg-green-700 px-5 py-2 text-white font-medium hover:bg-green-800 transition"
      >
        Download Report PDF
      </button>

      <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
        Total records loaded: {reports.length}
      </p>

      {reports.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-200 dark:bg-gray-800 text-left">
              <tr>
                <th className="px-3 py-2 font-semibold">Date</th>
                <th className="px-3 py-2 font-semibold">Year</th>
                <th className="px-3 py-2 font-semibold">District</th>
                <th className="px-3 py-2 font-semibold">Mean NDVI</th>
                <th className="px-3 py-2 font-semibold">Stage</th>
                <th className="px-3 py-2 font-semibold">Healthy %</th>
                <th className="px-3 py-2 font-semibold">Yield</th>
                <th className="px-3 py-2 font-semibold">Disaster Risk</th>
                <th className="px-3 py-2 font-semibold">Pest Risk</th>
              </tr>
            </thead>

            <tbody className="bg-white dark:bg-gray-900">
              {reports.map((r, i) => (
                <tr
                  key={i}
                  className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                >
                  <td className="px-3 py-2">{r.date}</td>
                  <td className="px-3 py-2">{r.year}</td>
                  <td className="px-3 py-2">{r.district}</td>
                  <td className="px-3 py-2">
                    {Number(r.ndvi_mean).toFixed(2)}
                  </td>
                  <td className="px-3 py-2">{r.stage_name}</td>
                  <td className="px-3 py-2">
                    {Number(r.healthy_percentage).toFixed(1)}%
                  </td>
                  <td className="px-3 py-2">
                    {Number(r.estimated_yield).toFixed(1)}
                  </td>
                  <td className="px-3 py-2">{r.disaster_risk}</td>
                  <td className="px-3 py-2">{r.pest_risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Report;