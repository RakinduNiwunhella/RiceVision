// MyDashboard.jsx - Pie chart tooltip completely removed
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { AlertTriangle, MapPin, Calendar, ChevronRight } from "lucide-react";
import { supabase } from "../../supabaseClient";

/* ------------------ Reusable UI ------------------ */

const Card = ({ title, subtitle, children, className = "" }) => (
  <section
    className={`bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm ${className}`}
  >
    {(title || subtitle) && (
      <header className="px-6 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
        {title && (
          <h3 className="text-sm font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h3>
        )}
        {subtitle && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </header>
    )}
    <div className={title || subtitle ? "px-6 pb-5 pt-3" : "p-6"}>
      {children}
    </div>
  </section>
);

const StatWidget = ({ title, value, subtitle }) => (
  <Card>
    <p className="text-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
      {title}
    </p>
    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">
      {value}
    </p>
    {subtitle && (
      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
        {subtitle}
      </p>
    )}
  </Card>
);

const ProgressWidget = ({ label, value, color }) => {
  const bar = {
    green: "bg-emerald-500",
    yellow: "bg-amber-400",
    blue: "bg-blue-500",
  };

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
        <span>{label}</span>
        <span className="font-medium">{value?.toFixed?.(1) ?? value}%</span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-1.5 rounded-full ${bar[color]}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

/* ------------------ MAIN ------------------ */

const MyDashboard = () => {
  const [healthSummary, setHealthSummary] = useState(null);
  const [yieldForecast, setYieldForecast] = useState(null);
  const [outbreaks, setOutbreaks] = useState([]);
  const [ndviTrend, setNdviTrend] = useState([]);
  const [showAllOutbreaks, setShowAllOutbreaks] = useState(false);
  const [districtHealth, setDistrictHealth] = useState([]);

  const [loadingHealth, setLoadingHealth] = useState(true);
  const [loadingYield, setLoadingYield] = useState(true);
  const [loadingOutbreaks, setLoadingOutbreaks] = useState(true);
  const [loadingNdvi, setLoadingNdvi] = useState(true);
  const [loadingDistrictHealth, setLoadingDistrictHealth] = useState(true);

  const pieColors = ["#10b981", "#f59e0b", "#ef4444"];

  const healthPieData = healthSummary
    ? [
        { name: "Normal", value: healthSummary.normal_pct },
        { name: "Mild Stress", value: healthSummary.mild_stress_pct },
        { name: "Severe Stress", value: healthSummary.severe_stress_pct },
      ]
    : [];

  /* ------------------ FETCH HEALTH ------------------ */
  useEffect(() => {
    const fetchHealthSummary = async () => {
      setLoadingHealth(true);
      const { data } = await supabase
        .from("paddy_health_summary_view")
        .select("normal_pct, mild_stress_pct, severe_stress_pct")
        .eq("district", "kurunegala")
        .single();

      setHealthSummary(data);
      setLoadingHealth(false);
    };

    fetchHealthSummary();
  }, []);

  /* ------------------ FETCH YIELD ------------------ */
  useEffect(() => {
    const fetchYieldForecast = async () => {
      setLoadingYield(true);
      const { data } = await supabase
        .from("yield_forecast_view")
        .select("total_yield_tons, confidence")
        .eq("district", "kurunegala")
        .single();

      setYieldForecast(data);
      setLoadingYield(false);
    };

    fetchYieldForecast();
  }, []);

  /* ------------------ FETCH OUTBREAKS ------------------ */
  useEffect(() => {
    const fetchOutbreaks = async () => {
      setLoadingOutbreaks(true);
      const { data } = await supabase
        .from("disaster_risk_overview_view")
        .select("id, title, district, event_date")
        .order("event_date", { ascending: false });

      setOutbreaks(data || []);
      setLoadingOutbreaks(false);
    };

    fetchOutbreaks();
  }, []);

  /* ------------------ FETCH NATIONAL NDVI TREND ------------------ */
  useEffect(() => {
    const fetchNdviTrend = async () => {
      setLoadingNdvi(true);
      const { data, error } = await supabase
        .from("national_ndvi_trend_view")
        .select("date, mean_ndvi")
        .order("date", { ascending: true });

      if (!error && data) {
        setNdviTrend(
          data.map((row) => ({
            day: row.date,
            value: row.mean_ndvi,
          }))
        );
      }
      setLoadingNdvi(false);
    };

    fetchNdviTrend();
  }, []);

  /* ------------------ FETCH DISTRICT HEALTH OVERVIEW ------------------ */
  useEffect(() => {
    const fetchDistrictHealth = async () => {
      setLoadingDistrictHealth(true);
      const { data, error } = await supabase
        .from("paddy_health_summary_view")
        .select("district, normal_pct")
        .order("normal_pct", { ascending: false });

      if (!error && data) {
        setDistrictHealth(data);
      }
      setLoadingDistrictHealth(false);
    };

    fetchDistrictHealth();
  }, []);

  const formatMT = (value) => {
    if (!value) return "-";
    if (value >= 1_000_000) return (value / 1_000_000).toFixed(2) + "M MT";
    if (value >= 1_000) return (value / 1_000).toFixed(1) + "K MT";
    return value.toFixed(1) + " MT";
  };

  /* ------------------ RENDER ------------------ */

  return (
    <div className="space-y-10 max-w-7xl mx-auto text-gray-900 dark:text-gray-100">
      {/* PAGE HEADER */}
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
          National Overview
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          High-level health, yield, and risk insights for Sri Lankan paddy fields.
        </p>
      </header>

      {/* OVERVIEW GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Field Health Distribution"
          subtitle="Kurunegala district • Current season"
          className="lg:col-span-1"
        >
          <div className="w-full h-64">
            {loadingHealth ? (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                Loading distribution…
              </div>
            ) : healthSummary ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={healthPieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    label={({ value }) => `${value.toFixed(1)}%`}
                  >
                    {healthPieData.map((_, i) => (
                      <Cell key={i} fill={pieColors[i]} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-xs text-gray-400">
                No health data available.
              </div>
            )}
          </div>
        </Card>

        <StatWidget
          title="Yield Forecast (MT)"
          value={loadingYield ? "…" : yieldForecast ? formatMT(yieldForecast.total_yield_tons) : "-"}
          subtitle={
            !loadingYield && yieldForecast
              ? `Confidence: ${yieldForecast.confidence}%`
              : loadingYield
              ? "Loading forecast…"
              : "No forecast available"
          }
        />

        <StatWidget
          title="Expected Shortfall (MT)"
          value="220K MT"
          subtitle="Against 3.0M MT national demand"
        />
      </div>

      {/* OUTBREAKS */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Outbreaks
            </h2>
            <p className="text-xs text-gray-500">
              Disease and disaster monitoring across all districts.
            </p>
          </div>
        </div>

        <Card>
          {loadingOutbreaks ? (
            <div className="py-6 text-center text-xs text-gray-400">
              Loading outbreaks…
            </div>
          ) : outbreaks.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">
              No active or recent outbreaks reported.
            </div>
          ) : (
            <>
              {(showAllOutbreaks ? outbreaks : outbreaks.slice(0, 5)).map(
                (o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors px-2 sm:px-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-red-500">
                        <AlertTriangle size={18} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {o.title}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="inline-flex items-center gap-1">
                            <MapPin size={12} /> {o.district}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Calendar size={12} /> {o.event_date}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline">
                      View <ChevronRight size={14} />
                    </button>
                  </div>
                )
              )}

              {outbreaks.length > 5 && (
                <div className="pt-3 text-center">
                  <button
                    onClick={() => setShowAllOutbreaks(!showAllOutbreaks)}
                    className="text-xs font-medium text-blue-600 hover:underline"
                  >
                    {showAllOutbreaks ? "View less" : "View more"}
                  </button>
                </div>
              )}
            </>
          )}
        </Card>
      </section>

      {/* LOWER ANALYTICS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="National NDVI Trend (30 days)"
          subtitle="Mean NDVI values across all monitored paddy fields"
        >
          <div className="space-y-4">
            <div className="h-48">
              {loadingNdvi ? (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  Loading NDVI trend…
                </div>
              ) : ndviTrend.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={ndviTrend}>
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} />
                    <YAxis
                      domain={[0, 1]}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => v.toFixed(2)}
                    />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-gray-400">
                  No NDVI data available.
                </div>
              )}
            </div>

            {healthSummary && (
              <div className="space-y-2">
                <ProgressWidget
                  label="Normal"
                  value={healthSummary.normal_pct}
                  color="green"
                />
                <ProgressWidget
                  label="Mild Stress"
                  value={healthSummary.mild_stress_pct}
                  color="yellow"
                />
                <ProgressWidget
                  label="Severe Stress"
                  value={healthSummary.severe_stress_pct}
                  color="blue"
                />
              </div>
            )}
          </div>
        </Card>

        <Card
          title="District Health Overview"
          subtitle="Ranked by share of healthy fields"
        >
          {loadingDistrictHealth ? (
            <div className="py-6 text-center text-xs text-gray-400">
              Loading district health…
            </div>
          ) : districtHealth.length === 0 ? (
            <div className="py-6 text-center text-xs text-gray-400">
              No district health data available.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {districtHealth.map((d, i) => (
                <div
                  key={d.district ?? i}
                  className="flex justify-between items-center px-1 py-2 text-xs sm:text-sm"
                >
                  <span className="font-medium capitalize text-gray-900 dark:text-white">
                    {d.district}
                  </span>
                  <span className="text-gray-600 dark:text-gray-300">
                    {Math.round(d.normal_pct)}% healthy
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MyDashboard;
