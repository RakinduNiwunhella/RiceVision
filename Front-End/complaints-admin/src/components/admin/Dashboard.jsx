import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
} from "recharts";
import { supabase } from "@/services/client";

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [complaintsOverTime, setComplaintsOverTime] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      /* =========================
         STAT CARDS
      ========================= */

      const { count: total } = await supabase
        .from("complains")
        .select("*", { count: "exact", head: true });

      const { count: anonymous } = await supabase
        .from("complains")
        .select("*", { count: "exact", head: true })
        .eq("is_anonymous", true);

      const { count: pending } = await supabase
        .from("complains")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: resolved } = await supabase
        .from("complains")
        .select("*", { count: "exact", head: true })
        .eq("status", "resolved");

      setStats([
        {
          title: "Total Complaints",
          value: total ?? 0,
          sub: "All time submissions",
        },
        {
          title: "Anonymous Complaints",
          value: anonymous ?? 0,
          sub: total
            ? `${Math.round((anonymous / total) * 100)}% of total`
            : "—",
        },
        {
          title: "Pending Complaints",
          value: pending ?? 0,
          sub: "Requires attention",
        },
        {
          title: "Resolved Complaints",
          value: resolved ?? 0,
          sub: total
            ? `${Math.round((resolved / total) * 100)}% resolution rate`
            : "—",
        },
      ]);

      /* =========================
         COMPLAINTS BY TYPE
      ========================= */

      const { data: typeData } = await supabase
        .from("complains")
        .select("complaint_type");

      const groupedTypes = Object.values(
        typeData.reduce((acc, row) => {
          const type = row.complaint_type || "Other";
          acc[type] = acc[type] || { name: type, value: 0 };
          acc[type].value += 1;
          return acc;
        }, {}),
      );

      setComplaintTypes(groupedTypes);

      /* =========================
         COMPLAINTS OVER TIME
      ========================= */

      const { data: timeData } = await supabase
        .from("complains")
        .select("created_at");

      const groupedMonths = Object.values(
        timeData.reduce((acc, row) => {
          const month = new Date(row.created_at).toLocaleString("default", {
            month: "short",
          });

          acc[month] = acc[month] || { month, value: 0 };
          acc[month].value += 1;
          return acc;
        }, {}),
      );

      setComplaintsOverTime(groupedMonths);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Page title */}
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.title} className="bg-white rounded-xl shadow-sm p-6">
            <p className="text-sm text-gray-500">{s.title}</p>
            <p className="text-3xl font-semibold mt-2">{s.value}</p>
            <p className="text-sm text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Complaints by Type */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Complaints by Type</h2>
          <BarChart width={450} height={300} data={complaintTypes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} />
          </BarChart>
        </div>

        {/* Complaints Over Time */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="font-semibold mb-4">Complaints Over Time</h2>
          <ScatterChart width={450} height={300}>
            <CartesianGrid />
            <XAxis dataKey="month" type="category" />
            <YAxis dataKey="value" />
            <Tooltip />
            <Scatter data={complaintsOverTime} />
          </ScatterChart>
        </div>
      </div>
    </div>
  );
}
