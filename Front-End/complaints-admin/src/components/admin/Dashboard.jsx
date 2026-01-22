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

const stats = [
  { title: "Total Complaints", value: "1,247", sub: "All time submissions" },
  { title: "Anonymous Complaints", value: "423", sub: "34% of total" },
  { title: "Open Complaints", value: "189", sub: "Requires attention" },
  { title: "Resolved Complaints", value: "1,058", sub: "85% resolution rate" },
];

const complaintTypes = [
  { name: "Service Quality", value: 400 },
  { name: "Delivery Delay", value: 300 },
  { name: "Technical Issue", value: 230 },
  { name: "Billing", value: 180 },
  { name: "Other", value: 140 },
];

const complaintsOverTime = [
  { month: "Jan", value: 95 },
  { month: "Feb", value: 110 },
  { month: "Mar", value: 98 },
  { month: "Apr", value: 125 },
  { month: "May", value: 145 },
  { month: "Jun", value: 175 },
  { month: "Jul", value: 190 },
  { month: "Aug", value: 160 },
  { month: "Sep", value: 135 },
  { month: "Oct", value: 98 },
  { month: "Nov", value: 65 },
  { month: "Dec", value: 50 },
];

export default function Dashboard() {
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
        {/* Bar Chart */}
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

        {/* Scatter Chart */}
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
