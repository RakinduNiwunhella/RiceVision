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
  Legend
);

const monthsList = [
  { label: "January", value: 1 }, { label: "February", value: 2 },
  { label: "March", value: 3 }, { label: "April", value: 4 },
  { label: "May", value: 5 }, { label: "June", value: 6 },
  { label: "July", value: 7 }, { label: "August", value: 8 },
  { label: "September", value: 9 }, { label: "October", value: 10 },
  { label: "November", value: 11 }, { label: "December", value: 12 },
];

const districtsList = [
  "Colombo","Gampaha","Kalutara","Kandy","Matale","Nuwara Eliya",
  "Galle","Matara","Hambantota","Jaffna","Kilinochchi","Mannar",
  "Vavuniya","Mullaitivu","Batticaloa","Ampara","Trincomalee",
  "Kurunegala","Puttalam","Anuradhapura","Polonnaruwa","Badulla",
  "Moneragala","Ratnapura","Kegalle"
];

const ReportPage = () => {
  const [filterType, setFilterType] = useState("single"); // single or comparison
  const [month, setMonth] = useState(12);
  const [district1, setDistrict1] = useState("");
  const [district2, setDistrict2] = useState("");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data from Supabase
  const fetchData = async () => {
    if (!district1) return;
    setLoading(true);
    try {
      const districts = filterType === "comparison" && district2 ? [district1, district2] : [district1];
      const startDate = `2025-${month.toString().padStart(2,"0")}-01`;
      const endDate = `2025-${month.toString().padStart(2,"0")}-31`;

      const { data, error } = await supabase
        .from("final_ml_predictions")
        .select("District, NDVI_smooth, paddy_health, yield_ton_ha, disaster_risk, Date")
        .in("District", districts)
        .gte("Date", startDate)
        .lte("Date", endDate);

      if (error) throw error;

      // Aggregate per day per district
      const dayData = {};
      data.forEach(row => {
        const d = row.District;
        const date = row.Date.split("T")[0];
        if (!dayData[d]) dayData[d] = {};
        if (!dayData[d][date]) dayData[d][date] = { yield:0, count:0, healthy:0, ndviSum:0, risks: [] };
        dayData[d][date].yield += parseFloat(row.yield_ton_ha);
        if (row.paddy_health === "Normal") dayData[d][date].healthy++;
        dayData[d][date].ndviSum += parseFloat(row.NDVI_smooth);
        dayData[d][date].risks.push(row.disaster_risk);
        dayData[d][date].count++;
      });

      // Format for table/chart
      const tableData = [];
      Object.entries(dayData).forEach(([district, dates]) => {
        Object.entries(dates).forEach(([date, val]) => {
          const meanNdvi = val.ndviSum / val.count;
          const healthPercent = (val.healthy / val.count * 100).toFixed(1);
          const highRiskCount = val.risks.filter(r => r === "High Risk").length;
          const riskLevel = highRiskCount > val.count/2 ? "High Risk" : "Low Risk";

          tableData.push({
            District: district,
            Date: date,
            total_yield_tons: val.yield.toFixed(2),
            healthy_percentage: healthPercent,
            risk_level: riskLevel,
            mean_ndvi: meanNdvi.toFixed(3),
          });
        });
      });

      setReports(tableData);

    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=>{ fetchData() }, [filterType, month, district1, district2]);

  // PDF Download
  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Placeholder for RiceVision logo (rectangle box)
    doc.setDrawColor(150);
    doc.setFillColor(230);
    doc.rect((pageWidth - 50) / 2, 10, 50, 20, 'F');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("RiceVision Logo", pageWidth / 2, 22, { align: "center" });

    // Title
    doc.setFontSize(18);
    doc.setTextColor(40);
    doc.text("RiceVision Monthly Report", pageWidth / 2, 40, { align: "center" });

    // Description
    doc.setFontSize(11);
    doc.setTextColor(80);
    doc.text("This report presents yield, healthy percentage, mean NDVI, and risk level per district for the selected month.", pageWidth / 2, 50, { align: "center", maxWidth: pageWidth - 40 });

    // District(s) and Month info
    const districtsText = filterType === "comparison" && district2 ? `${district1} & ${district2}` : district1;
    const monthName = monthsList.find(m => m.value === month)?.label || month;
    doc.setFontSize(12);
    doc.setTextColor(60);
    doc.text(`District(s): ${districtsText}`, 14, 60);
    doc.text(`Month: ${monthName}`, 14, 68);

    // Table
    autoTable(doc, {
      startY: 75,
      headStyles: { fillColor: [200, 200, 200], textColor: 50 },
      bodyStyles: { textColor: 40 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      head:[["Date","District","Yield (tons)","Healthy %","Risk Level","Mean NDVI"]],
      body: reports.map(r=>[r.Date,r.District,r.total_yield_tons,r.healthy_percentage,r.risk_level,r.mean_ndvi]),
      margin: { left: 14, right: 14 }
    });

    // Footer - copyright line
    const pageHeight = doc.internal.pageSize.getHeight();
    doc.setFontSize(9);
    doc.setTextColor(120);
    doc.text("© 2025 RiceVision. All rights reserved.", pageWidth / 2, pageHeight - 10, { align: "center" });

    doc.save(`RiceVision_Full_Report_Month_${month}.pdf`);
  };

  const renderSingleView = () => {
    if (!reports.length) return null;
    const filtered = reports.filter(r => r.District === district1);

    const yieldData = {
      labels: filtered.map(r => r.Date),
      datasets: [{
        label: "Yield (tons)",
        data: filtered.map(r => r.total_yield_tons),
        borderColor: "rgba(34,197,94,1)",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.3
      }]
    };

    const healthData = {
      labels: ["Healthy", "Not Healthy"],
      datasets: [{
        data: [
          filtered.reduce((acc,r) => acc + parseFloat(r.healthy_percentage),0)/filtered.length,
          100 - filtered.reduce((acc,r) => acc + parseFloat(r.healthy_percentage),0)/filtered.length
        ],
        backgroundColor: ["rgba(34,197,94,0.8)","rgba(200,200,200,0.3)"],
        borderWidth: 1
      }]
    };

    const ndviData = {
      labels: filtered.map(r => r.Date),
      datasets: [{
        label: "Mean NDVI",
        data: filtered.map(r => r.mean_ndvi),
        borderColor: "rgba(34,197,94,1)",
        backgroundColor: "rgba(34,197,94,0.2)",
        tension: 0.3,
        fill: true
      }]
    };

    return (
      <div className="grid md:grid-cols-3 gap-6">
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2 text-black">Yield (tons)</h2>
          <Line data={yieldData} options={{responsive:true}}/>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2 text-black">Healthy %</h2>
          <div style={{height: "200px", width: "200px"}}>
            <Doughnut data={healthData} />
          </div>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <h2 className="font-semibold mb-2 text-black">Mean NDVI</h2>
          <Line data={ndviData} options={{responsive:true}}/>
        </div>
      </div>
    );
  };

  const renderComparison = () => {
    if (!reports.length || !district2) return null;

    const districts = [district1,district2];

    return (
      <div className="grid md:grid-cols-2 gap-6">
        {districts.map((d,idx)=>{
          const filtered = reports.filter(r=>r.District===d);
          const yieldData = {
            labels: filtered.map(r=>r.Date),
            datasets:[{
              label:`Yield (tons) - ${d}`,
              data: filtered.map(r=>r.total_yield_tons),
              borderColor: idx===0 ? "rgba(34,197,94,1)" : "rgba(37,99,235,1)",
              backgroundColor: idx===0 ? "rgba(34,197,94,0.2)" : "rgba(37,99,235,0.2)",
              tension:0.3
            }]
          };
          const healthData = {
            labels:["Healthy","Not Healthy"],
            datasets:[{
              data:[
                filtered.reduce((acc,r)=>acc+parseFloat(r.healthy_percentage),0)/filtered.length,
                100 - filtered.reduce((acc,r)=>acc+parseFloat(r.healthy_percentage),0)/filtered.length
              ],
              backgroundColor:[idx===0 ? "rgba(34,197,94,0.8)":"rgba(37,99,235,0.8)", "rgba(200,200,200,0.3)"]
            }]
          };
          const ndviData = {
            labels: filtered.map(r=>r.Date),
            datasets:[{
              label:`Mean NDVI - ${d}`,
              data: filtered.map(r=>r.mean_ndvi),
              borderColor: idx===0 ? "rgba(34,197,94,1)" : "rgba(59,130,246,1)",
              backgroundColor: idx===0 ? "rgba(34,197,94,0.2)" : "rgba(59,130,246,0.2)",
              tension:0.3,
              fill:true
            }]
          };
          return (
            <div key={d} className="p-4 bg-white rounded shadow">
              <h2 className="font-semibold text-black mb-4">{d}</h2>
              <Line data={yieldData} />
              <div className="my-4" style={{height: "200px", width: "200px"}}>
                <Doughnut data={healthData} />
              </div>
              <Line data={ndviData} options={{responsive:true}}/>
            </div>
          )
        })}
      </div>
    )
  };

  return (
    <div className="p-6 bg-gray-50 dark:bg-[#050810] dark:text-slate-200">
      <h1 className="text-3xl font-bold mb-2 text-black">RiceVision Monthly Report</h1>
      <p className="mb-4 text-gray-600 dark:text-gray-400">
        View the yield, healthy percentage, mean NDVI, and risk level for selected districts for the month.
      </p>

      {/* Filter Type */}
      <div className="flex gap-4 mb-4">
        <button
          className={`px-4 py-2 rounded ${filterType==="single"?"bg-emerald-600 text-white":"bg-gray-200 dark:bg-gray-800"}`}
          onClick={()=>setFilterType("single")}>Single View</button>
        <button
          className={`px-4 py-2 rounded ${filterType==="comparison"?"bg-emerald-600 text-white":"bg-gray-200 dark:bg-gray-800"}`}
          onClick={()=>setFilterType("comparison")}>District Comparison</button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded shadow">
        <select value={month} onChange={e=>setMonth(Number(e.target.value))} className="px-3 py-2 rounded border">
          {monthsList.map(m=><option key={m.value} value={m.value}>{m.label}</option>)}
        </select>
        <select value={district1} onChange={e=>setDistrict1(e.target.value)} className="px-3 py-2 rounded border">
          <option value="">Select District 1</option>
          {districtsList.map(d=><option key={d} value={d}>{d}</option>)}
        </select>
        {filterType==="comparison" &&
        <select value={district2} onChange={e=>setDistrict2(e.target.value)} className="px-3 py-2 rounded border">
          <option value="">Select District 2</option>
          {districtsList.map(d=><option key={d} value={d}>{d}</option>)}
        </select>}
      </div>

      {loading && <div>Loading...</div>}

      {/* Charts */}
      {filterType==="single" ? renderSingleView() : renderComparison()}

      {/* Table & Export */}
      {reports.length > 0 &&
        <div className="mt-6 p-4 bg-white rounded shadow">
          <div className="flex gap-4 mb-4">
            <button onClick={downloadPDF} className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Download PDF</button>
            <CSVLink
              data={reports}
              headers={[
                {label:"Date", key:"Date"},
                {label:"District", key:"District"},
                {label:"Yield (tons)", key:"total_yield_tons"},
                {label:"Healthy %", key:"healthy_percentage"},
                {label:"Risk Level", key:"risk_level"},
                {label:"Mean NDVI", key:"mean_ndvi"}
              ]}
              filename={`RiceVision_Full_Report_${month}.csv`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download CSV
            </CSVLink>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead className="bg-gray-200 dark:bg-gray-800 text-left">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">District</th>
                  <th className="px-3 py-2">Yield (tons)</th>
                  <th className="px-3 py-2">Healthy %</th>
                  <th className="px-3 py-2">Risk Level</th>
                  <th className="px-3 py-2">Mean NDVI</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900">
                {reports.map((r,i)=>
                  <tr key={i} className="border-t dark:border-gray-700">
                    <td className="px-3 py-2">{r.Date}</td>
                    <td className="px-3 py-2">{r.District}</td>
                    <td className="px-3 py-2">{r.total_yield_tons}</td>
                    <td className="px-3 py-2">{r.healthy_percentage}</td>
                    <td className="px-3 py-2">{r.risk_level}</td>
                    <td className="px-3 py-2">{r.mean_ndvi}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  );
};

export default ReportPage;