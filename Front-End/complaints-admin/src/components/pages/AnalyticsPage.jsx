import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";

/* -------------------- MOCK DATA -------------------- */

const resolutionTimeData = [
  { category: "Service Quality", days: 4.2 },
  { category: "Billing", days: 2.8 },
  { category: "Technical Issue", days: 5.6 },
  { category: "Product Defect", days: 6.3 },
  { category: "Other", days: 3.1 },
];

const slaComplianceData = [
  { name: "Within SLA", value: 78, color: "#10b981" },
  { name: "SLA Breached", value: 22, color: "#ef4444" },
];

const peakHoursData = [
  { hour: "00–02", volume: 12 },
  { hour: "03–05", volume: 8 },
  { hour: "06–08", volume: 45 },
  { hour: "09–11", volume: 89 },
  { hour: "12–14", volume: 112 },
  { hour: "15–17", volume: 95 },
  { hour: "18–20", volume: 67 },
  { hour: "21–23", volume: 34 },
];

const complaintSourcesData = [
  { source: "Web Portal", count: 542, percentage: 58 },
  { source: "Mobile App", count: 298, percentage: 32 },
  { source: "Hotline", count: 93, percentage: 10 },
];

const escalationRateData = [
  { category: "Service Quality", rate: 15 },
  { category: "Billing", rate: 8 },
  { category: "Technical Issue", rate: 23 },
  { category: "Product Defect", rate: 31 },
  { category: "Other", rate: 12 },
];

const sentimentData = [
  { name: "Negative", value: 45, color: "#ef4444" },
  { name: "Neutral", value: 38, color: "#6b7280" },
  { name: "Positive", value: 17, color: "#10b981" },
];

const geographicData = [
  { region: "North Region", complaints: 342, change: 12 },
  { region: "South Region", complaints: 287, change: -5 },
  { region: "East Region", complaints: 234, change: 8 },
  { region: "West Region", complaints: 198, change: -3 },
  { region: "Central Region", complaints: 186, change: 15 },
];

/* -------------------- PAGE -------------------- */

export function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30days");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");

  return (
    <div className="p-8 space-y-10">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold">Advanced Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Performance insights, risk signals, and behavioral patterns
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="min-w-[200px] flex-1">
              <label className="text-sm mb-2 block">Date Range</label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[200px] flex-1">
              <label className="text-sm mb-2 block">Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="service">Service Quality</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                  <SelectItem value="product">Product Defect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="min-w-[200px] flex-1">
              <label className="text-sm mb-2 block">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button>Apply</Button>
              <Button variant="outline">Reset</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Performance */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Operational Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Average Resolution Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart layout="vertical" data={resolutionTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="category" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="days" fill="hsl(var(--chart-1))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SLA Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={slaComplianceData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={100}
                    label
                  >
                    {slaComplianceData.map((item, i) => (
                      <Cell key={i} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Behavioral Insights */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Behavioral Insights</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Peak Complaint Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={peakHoursData}>
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="volume" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Complaint Sources</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {complaintSourcesData.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.source}</span>
                    <span>{item.percentage}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded">
                    <div
                      className="h-2 rounded"
                      style={{
                        width: `${item.percentage}%`,
                        background: `hsl(var(--chart-${i + 1}))`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Repeat Complaint Rate</CardTitle>
            </CardHeader>
            <CardContent className="text-center py-8">
              <div className="text-5xl font-semibold mb-4">24.3%</div>
              <div className="flex items-center justify-center gap-2 text-green-600">
                <TrendingDown size={16} />
                <span>-3.2% improvement</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Quality & Risk Signals */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Quality & Risk Signals</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Escalation Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={escalationRateData}>
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="rate" fill="hsl(var(--chart-4))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sentiment Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={100}
                    label
                  >
                    {sentimentData.map((item, i) => (
                      <Cell key={i} fill={item.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Geographic Insights */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Geographic Insights</h2>
        <Card>
          <CardContent className="space-y-3">
            {geographicData.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center p-4 rounded-lg bg-muted/50"
              >
                <div>
                  <div className="font-medium">{item.region}</div>
                  <div className="text-sm text-muted-foreground">
                    {item.complaints} complaints
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 ${
                    item.change > 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {item.change > 0 ? (
                    <TrendingUp size={16} />
                  ) : (
                    <TrendingDown size={16} />
                  )}
                  <span>{item.change}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
