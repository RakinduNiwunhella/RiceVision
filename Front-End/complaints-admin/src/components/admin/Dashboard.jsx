import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { supabase } from "@/services/client";

const BRAND_COLOR = "#2dd4bf"; // teal-400 (matches sidebar)

export default function Dashboard() {
  const [stats, setStats] = useState([]);
  const [complaintTypes, setComplaintTypes] = useState([]);
  const [complaintsOverTime, setComplaintsOverTime] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);

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
          accent: "bg-indigo-600",
        },
        {
          title: "Anonymous Complaints",
          value: anonymous ?? 0,
          sub: total
            ? `${Math.round((anonymous / total) * 100)}% anonymous`
            : "—",
          accent: "bg-purple-600",
        },
        {
          title: "Pending Complaints",
          value: pending ?? 0,
          sub: "Needs attention",
          accent: "bg-amber-500",
        },
        {
          title: "Resolved Complaints",
          value: resolved ?? 0,
          sub: total
            ? `${Math.round((resolved / total) * 100)}% resolved`
            : "—",
          accent: "bg-emerald-600",
        },
      ]);

      const { data: typeData } = await supabase
        .from("complains")
        .select("complaint_type");

      const groupedTypes = Object.values(
        (typeData || []).reduce((acc, row) => {
          const type = row.complaint_type || "Other";
          acc[type] = acc[type] || { name: type, value: 0 };
          acc[type].value += 1;
          return acc;
        }, {}),
      );

      setComplaintTypes(groupedTypes);

      const { data: timeData } = await supabase
        .from("complains")
        .select("created_at");

      const groupedMonths = Object.values(
        (timeData || []).reduce((acc, row) => {
          const month = new Date(row.created_at).toLocaleString("default", {
            month: "short",
          });
          acc[month] = acc[month] || { month, value: 0 };
          acc[month].value += 1;
          return acc;
        }, {}),
      );

      setComplaintsOverTime(groupedMonths);
      setLoading(false);
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          System overview and complaint analytics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div
            key={s.title}
            className="bg-white border border-gray-200 rounded-xl p-6 flex gap-4"
          >
            <div className={`w-3 rounded-full ${s.accent}`} />
            <div>
              <p className="text-sm text-gray-500">{s.title}</p>
              <p className="text-3xl font-semibold text-gray-900">
                {loading ? "—" : s.value}
              </p>
              <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Section */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Analytics Overview
          </h2>
          <p className="text-sm text-gray-500">
            Complaint distribution and trends
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Complaints by Type */}
          <div className="border border-gray-200 rounded-xl p-5 h-[360px]">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Complaints by Type
            </h3>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintTypes}>
                <CartesianGrid
                  stroke="#e5e7eb"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(45,212,191,0.12)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[6, 6, 0, 0]}
                  fill={BRAND_COLOR}
                  activeBar={{ fill: "#14b8a6" }} // teal-500
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Complaints Over Time */}
          <div className="border border-gray-200 rounded-xl p-5 h-[360px]">
            <h3 className="text-sm font-medium text-gray-700 mb-4">
              Complaints Over Time
            </h3>

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complaintsOverTime}>
                <CartesianGrid
                  stroke="#e5e7eb"
                  strokeDasharray="3 3"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(45,212,191,0.12)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={BRAND_COLOR}
                  strokeWidth={3}
                  dot={{ r: 4, fill: BRAND_COLOR }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
