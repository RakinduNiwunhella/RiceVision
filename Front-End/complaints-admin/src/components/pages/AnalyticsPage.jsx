import { useEffect, useState } from "react";
import { supabase } from "@/services/client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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

export default function AnalyticsPage() {
  const [resolutionData, setResolutionData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [hourData, setHourData] = useState([]);

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
      statusCount[row.status] = (statusCount[row.status] || 0) + 1;
    });

    setStatusData(
      Object.entries(statusCount).map(([name, value]) => ({
        name,
        value,
      })),
    );

    /* ---------- COMPLAINTS BY TYPE ---------- */
    const typeCount = {};
    data.forEach((row) => {
      const type = row.complaint_type || "Other";
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    setResolutionData(
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
      Object.entries(hourCount).map(([hour, count]) => ({
        hour,
        count,
      })),
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Real-time insights from complaint data
        </p>
      </div>

      {/* STATUS DISTRIBUTION */}
      <Card>
        <CardHeader>
          <CardTitle>Complaint Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} dataKey="value" nameKey="name" label>
                {statusData.map((_, i) => (
                  <Cell key={i} fill={`hsl(var(--chart-${i + 1}))`} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* COMPLAINTS BY TYPE */}
      <Card>
        <CardHeader>
          <CardTitle>Complaints by Type</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={resolutionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* PEAK HOURS */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Complaint Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
