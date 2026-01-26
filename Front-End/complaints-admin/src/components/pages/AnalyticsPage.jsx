import { useEffect, useState, useRef } from "react";
import { supabase } from "@/services/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/* -------------------- CONSTANTS -------------------- */

const STATUS_COLOR_MAP = {
  new: "#3b82f6", // blue-500
  "in progress": "#f59e0b", // amber-500
  resolved: "#10b981", // emerald-500
};

const BRAND_COLOR = "#2dd4bf"; // sidebar teal

/* -------------------- ANIMATION HELPERS -------------------- */

function animateValue(from, to, duration, onUpdate) {
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const value = Math.round(from + (to - from) * progress);
    onUpdate(value);
    if (progress < 1) requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

/* -------------------- PIE LABEL -------------------- */

const AnimatedPercentageLabel = ({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  hasAnimated,
}) => {
  const [displayPercent, setDisplayPercent] = useState(
    hasAnimated.current ? Math.round(percent * 100) : 0,
  );

  useEffect(() => {
    if (hasAnimated.current) return;
    animateValue(0, Math.round(percent * 100), 800, setDisplayPercent);
  }, [percent, hasAnimated]);

  if (percent < 0.05) return null;

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {displayPercent}%
    </text>
  );
};

/* -------------------- COMPONENT -------------------- */

export default function AnalyticsPage() {
  const [statusData, setStatusData] = useState([]);
  const [typeData, setTypeData] = useState([]);
  const [hourData, setHourData] = useState([]);
  const [animatedTotal, setAnimatedTotal] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const hasAnimated = useRef(false);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    const { data, error } = await supabase
      .from("complains")
      .select("status, complaint_type, created_at");

    if (error) {
      console.error(error);
      return;
    }

    /* ---------- STATUS DISTRIBUTION ---------- */
    const statusCount = {};
    data.forEach((row) => {
      const status = (row.status || "new").toLowerCase();
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    const statusArr = Object.entries(statusCount).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLOR_MAP[name] || "#6b7280",
    }));

    setStatusData(statusArr);

    const total = statusArr.reduce((sum, s) => sum + s.value, 0);

    if (!hasAnimated.current) {
      animateValue(0, total, 1000, setAnimatedTotal);
      hasAnimated.current = true;
    } else {
      setAnimatedTotal(total);
    }

    /* ---------- COMPLAINTS BY TYPE ---------- */
    const typeCount = {};
    data.forEach((row) => {
      const type = row.complaint_type || "Other";
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    setTypeData(
      Object.entries(typeCount).map(([category, count]) => ({
        category,
        count,
      })),
    );

    /* ---------- PEAK HOURS ---------- */
    const hourCount = {};
    data.forEach((row) => {
      const hour = new Date(row.created_at).getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    setHourData(
      Object.entries(hourCount)
        .map(([hour, count]) => ({ hour, count }))
        .sort((a, b) => a.hour - b.hour),
    );

    setLastUpdated(new Date());
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time insights from complaint data
          </p>
        </div>

        <div className="text-xs text-gray-500">
          Last updated:{" "}
          <span className="font-medium text-gray-700">
            {lastUpdated ? lastUpdated.toLocaleString() : "—"}
          </span>
        </div>
      </div>

      {/* STATUS DISTRIBUTION */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">
          Complaint Status Distribution
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          Current breakdown of complaint resolution states
        </p>

        {/* Wider chart, smaller legend */}
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-10 items-center">
          {/* Donut Chart */}
          <div className="h-[340px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={85}
                  outerRadius={135}
                  paddingAngle={4}
                  label={(props) => (
                    <AnimatedPercentageLabel
                      {...props}
                      hasAnimated={hasAnimated}
                    />
                  )}
                  labelLine={false}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            {/* Center Total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-4xl font-semibold text-gray-900">
                {animatedTotal}
              </p>
              <p className="text-sm text-gray-500">Total</p>
            </div>
          </div>

          {/* Compact Legend */}
          <div className="space-y-3">
            {statusData.map((s) => (
              <div
                key={s.name}
                className="flex items-center justify-between border border-gray-200 rounded-md px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="font-medium text-gray-700 capitalize text-sm">
                    {s.name}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {s.value} complaints
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BREAKDOWN CHARTS */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Complaints by Type */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-[420px]">
          <h3 className="font-semibold text-gray-900 mb-1">
            Complaints by Type
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Distribution of reported complaint categories
          </p>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeData}>
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis dataKey="category" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                fill={BRAND_COLOR}
                activeBar={{ fill: "#14b8a6" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Peak Hours */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-[420px]">
          <h3 className="font-semibold text-gray-900 mb-1">
            Peak Complaint Hours
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Times of day with the highest complaint submissions
          </p>

          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={hourData}>
              <CartesianGrid
                stroke="#e5e7eb"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis dataKey="hour" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                fill={BRAND_COLOR}
                activeBar={{ fill: "#14b8a6" }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
