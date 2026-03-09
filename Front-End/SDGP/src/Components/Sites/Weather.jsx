import React, { useState, useEffect, useCallback, useRef } from "react";
import { getDSDivision } from "../../utils/geoUtils";

// ─────────────────────────────────────────────
// All 25 Sri Lankan Districts + coordinates
// ─────────────────────────────────────────────
const DISTRICTS = [
  { name: "Ampara", lat: 7.2975, lon: 81.6747 },
  { name: "Anuradhapura", lat: 8.3114, lon: 80.4037 },
  { name: "Badulla", lat: 6.9934, lon: 81.0550 },
  { name: "Batticaloa", lat: 7.7310, lon: 81.6747 },
  { name: "Colombo", lat: 6.9271, lon: 79.8612 },
  { name: "Galle", lat: 6.0535, lon: 80.2210 },
  { name: "Gampaha", lat: 7.0917, lon: 80.0137 },
  { name: "Hambantota", lat: 6.1429, lon: 81.1212 },
  { name: "Jaffna", lat: 9.6615, lon: 80.0255 },
  { name: "Kalutara", lat: 6.5854, lon: 79.9607 },
  { name: "Kandy", lat: 7.2906, lon: 80.6337 },
  { name: "Kegalle", lat: 7.2513, lon: 80.3464 },
  { name: "Kilinochchi", lat: 9.3803, lon: 80.3770 },
  { name: "Kurunegala", lat: 7.4818, lon: 80.3609 },
  { name: "Mannar", lat: 8.9810, lon: 79.9044 },
  { name: "Matale", lat: 7.4675, lon: 80.6234 },
  { name: "Matara", lat: 5.9549, lon: 80.5550 },
  { name: "Monaragala", lat: 6.8728, lon: 81.3507 },
  { name: "Mullaitivu", lat: 9.2671, lon: 80.8142 },
  { name: "Nuwara Eliya", lat: 6.9497, lon: 80.7891 },
  { name: "Polonnaruwa", lat: 7.9403, lon: 81.0188 },
  { name: "Puttalam", lat: 8.0362, lon: 79.8283 },
  { name: "Ratnapura", lat: 6.6928, lon: 80.3992 },
  { name: "Trincomalee", lat: 8.5874, lon: 81.2152 },
  { name: "Vavuniya", lat: 8.7514, lon: 80.4971 },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestDistrict(lat, lon) {
  let best = DISTRICTS[0];
  let bestDist = Infinity;
  for (const d of DISTRICTS) {
    const dist = haversine(lat, lon, d.lat, d.lon);
    if (dist < bestDist) { bestDist = dist; best = d; }
  }
  return best;
}

function wmoLabel(code) {
  if (code === 0) return { label: "Clear Sky", icon: "☀️", color: "text-amber-400" };
  if (code <= 2) return { label: "Partly Cloudy", icon: "⛅", color: "text-yellow-300" };
  if (code === 3) return { label: "Overcast", icon: "☁️", color: "text-slate-400" };
  if (code <= 49) return { label: "Foggy / Haze", icon: "🌫️", color: "text-slate-300" };
  if (code <= 57) return { label: "Drizzle", icon: "🌦️", color: "text-blue-300" };
  if (code <= 67) return { label: "Rain", icon: "🌧️", color: "text-blue-400" };
  if (code <= 77) return { label: "Snow / Ice", icon: "🌨️", color: "text-sky-200" };
  if (code <= 82) return { label: "Rain Showers", icon: "🌩️", color: "text-blue-400" };
  if (code <= 86) return { label: "Heavy Snow Showers", icon: "❄️", color: "text-sky-100" };
  if (code <= 99) return { label: "Thunderstorm", icon: "⛈️", color: "text-red-400" };
  return { label: "Unknown", icon: "🌡️", color: "text-white" };
}

function windDir(deg) {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return dirs[Math.round((deg % 360) / 45) % 8];
}

function fmtTime(iso) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function fmtDay(iso, short = false) {
  return new Date(iso).toLocaleDateString("en-US", short
    ? { weekday: "short", day: "numeric" }
    : { weekday: "long", month: "short", day: "numeric" });
}

// ─────────────────────────────────────────────
// Open-Meteo fetch
// ─────────────────────────────────────────────
async function fetchOpenMeteo(lat, lon) {
  const base = "https://api.open-meteo.com/v1/forecast";
  const params = [
    `latitude=${lat}`,
    `longitude=${lon}`,
    "timezone=auto",
    "past_days=7",
    "forecast_days=14",
    "current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,showers,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    "hourly=temperature_2m,relative_humidity_2m,dew_point_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,cloud_cover,visibility,wind_speed_10m,wind_direction_10m,uv_index,et0_fao_evapotranspiration,soil_temperature_0cm,soil_temperature_6cm,soil_temperature_18cm,soil_moisture_0_to_1cm,soil_moisture_1_to_3cm,soil_moisture_3_to_9cm,vapour_pressure_deficit",
    "daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,sunrise,sunset,uv_index_max,precipitation_sum,rain_sum,precipitation_hours,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max,et0_fao_evapotranspiration,shortwave_radiation_sum",
  ];
  const url = `${base}?${params.join("&")}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  return res.json();
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────
function StatCard({ label, value, unit, sub, accent = "emerald", icon }) {
  const colors = {
    emerald: "text-emerald-400 border-emerald-500/20 bg-emerald-500/5",
    blue: "text-blue-400 border-blue-500/20 bg-blue-500/5",
    amber: "text-amber-400 border-amber-500/20 bg-amber-500/5",
    cyan: "text-cyan-400 border-cyan-500/20 bg-cyan-500/5",
    rose: "text-rose-400 border-rose-500/20 bg-rose-500/5",
    violet: "text-violet-400 border-violet-500/20 bg-violet-500/5",
    orange: "text-orange-400 border-orange-500/20 bg-orange-500/5",
    sky: "text-sky-400 border-sky-500/20 bg-sky-500/5",
  };
  return (
    <div className={`glass glass-hover p-5 rounded-3xl border flex flex-col gap-2 transition-all duration-300 hover:-translate-y-0.5 ${colors[accent]}`}>
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">{label}</span>
        {icon && <span className="text-base opacity-60">{icon}</span>}
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-3xl font-black leading-none ${colors[accent].split(" ")[0]}`}>{value}</span>
        {unit && <span className="text-[10px] text-white/40 font-bold mb-1">{unit}</span>}
      </div>
      {sub && <span className="text-[9px] text-white/40 font-medium">{sub}</span>}
    </div>
  );
}

function SectionHeading({ children }) {
  return (
    <h3 className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
      <div className="h-px flex-1 bg-white/10" />
      {children}
      <div className="h-px flex-1 bg-white/10" />
    </h3>
  );
}

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
export default function RiceVisionWeather() {
  const [district, setDistrict] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoStatus, setGeoStatus] = useState("idle"); // idle | locating | done | denied
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setDropdownOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const resolveLocation = async (lat, lon) => {
    const geoInfo = await getDSDivision(lat, lon);
    if (geoInfo) {
      // Create a custom district object merging real coordinates with exact names
      // Adding ", [District]" to name and setting district scope.
      setDistrict({
        name: geoInfo.ds,
        district: geoInfo.dist,
        lat: lat,
        lon: lon,
        isCustom: true
      });
    } else {
      // Fallback
      setDistrict(nearestDistrict(lat, lon));
    }
    setGeoStatus("done");
  };

  // Auto-detect location on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setDistrict(DISTRICTS.find((d) => d.name === "Colombo"));
      return;
    }
    setGeoStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolveLocation(coords.latitude, coords.longitude),
      () => {
        setDistrict(DISTRICTS.find((d) => d.name === "Colombo"));
        setGeoStatus("denied");
      },
      { timeout: 8000 }
    );
  }, []);

  // Fetch weather when district changes
  const load = useCallback(async () => {
    if (!district) return;
    try {
      setLoading(true);
      setError(null);
      const result = await fetchOpenMeteo(district.lat, district.lon);
      setData(result);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [district]);

  useEffect(() => { load(); }, [load]);

  if (geoStatus === "locating" || (loading && !data)) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-5">
        <div className="w-14 h-14 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 animate-pulse">
          {geoStatus === "locating" ? "Detecting Your Location..." : "Loading Weather Data..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-[80vh] items-center justify-center gap-4">
        <span className="text-5xl">⚠️</span>
        <p className="text-red-400 font-bold text-sm">{error}</p>
        <button onClick={load} className="px-6 py-2 glass rounded-xl text-emerald-400 text-xs font-black uppercase tracking-widest hover:bg-white/10 transition-all">
          Retry
        </button>
      </div>
    );
  }

  if (!data) return null;

  const c = data.current;
  const h = data.hourly;
  const d = data.daily;
  const cond = wmoLabel(c.weather_code);

  const nowISO = c.time;
  const nowIdx = h.time.findLastIndex((t) => t <= nowISO);
  const next24 = Array.from({ length: 24 }, (_, i) => nowIdx + 1 + i).filter((i) => i < h.time.length);
  const pastIdx = d.time.slice(0, 7);
  const forecastIdx = Array.from({ length: 7 }, (_, i) => 7 + i);
  const todayI = 7;

  const uvNow = h.uv_index[nowIdx] ?? 0;
  const soilTemp0 = h.soil_temperature_0cm[nowIdx];
  const soilTemp6 = h.soil_temperature_6cm[nowIdx];
  const soilTemp18 = h.soil_temperature_18cm[nowIdx];
  const soilM0 = (h.soil_moisture_0_to_1cm[nowIdx] * 100).toFixed(1);
  const soilM1 = (h.soil_moisture_1_to_3cm[nowIdx] * 100).toFixed(1);
  const soilM3 = (h.soil_moisture_3_to_9cm[nowIdx] * 100).toFixed(1);
  const vpd = h.vapour_pressure_deficit[nowIdx]?.toFixed(2);
  const et0Today = d.et0_fao_evapotranspiration[todayI]?.toFixed(1);
  const radToday = d.shortwave_radiation_sum[todayI]?.toFixed(1);
  const visibility = h.visibility[nowIdx];
  const dewPoint = h.dew_point_2m[nowIdx]?.toFixed(1);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "hourly", label: "24-Hour" },
    { id: "soil", label: "Soil & Agro" },
    { id: "forecast", label: "14-Day" },
    { id: "history", label: "History" },
  ];

  return (
    <div className="min-h-screen -mx-6 -mt-6 p-6 lg:p-10 font-sans text-white">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* ─── HEADER ─── */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 flex-wrap">
          <div className="mb-6">

            {/* System label */}
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-emerald-400 mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">partly_cloudy_day</span>
              Paddy Field Weather Intelligence
            </p>

            {/* Main Location */}
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
              {district?.name}
            </h1>

            {/* Admin hierarchy */}
            <p className="text-sm md:text-base text-white/70 font-semibold mt-1">
              {district?.name} DS Division · {district?.district || "Colombo"} District
            </p>

            {/* Meta info */}
            <p className="text-[10px] text-white/30 mt-2 font-bold uppercase tracking-widest">
              {district?.lat.toFixed(4)}°N · {district?.lon.toFixed(4)}°E · Auto-detected
            </p>

          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => {
                if (!navigator.geolocation) return;
                setGeoStatus("locating");
                navigator.geolocation.getCurrentPosition(
                  ({ coords }) => resolveLocation(coords.latitude, coords.longitude),
                  () => setGeoStatus("denied"),
                  { timeout: 8000 }
                );
              }}
              className="glass px-4 py-2.5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-emerald-400 hover:border-emerald-500/30 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">my_location</span>
              {geoStatus === "locating" ? "Locating..." : "Locate Me"}
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen((o) => !o)}
                className="glass px-5 py-2.5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/80 hover:border-emerald-500/30 hover:text-emerald-400 transition-all flex items-center gap-3 min-w-44 justify-between"
              >
                <span className="material-symbols-outlined text-sm">location_on</span>
                {district?.name}
                <span className="material-symbols-outlined text-sm">{dropdownOpen ? "expand_less" : "expand_more"}</span>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 glass border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="max-h-72 w-full custom-scrollbar overflow-y-auto overflow-x-hidden overscroll-contain">
                    {DISTRICTS.map((dst) => (
                      <button
                        key={dst.name}
                        onClick={() => { setDistrict(dst); setDropdownOpen(false); }}
                        className={`w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest transition-all hover:bg-emerald-500/10 hover:text-emerald-400 ${district?.name === dst.name ? "bg-emerald-500/15 text-emerald-400" : "text-white/60"}`}
                      >
                        {dst.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ─── HERO CARD ─── */}
        <div className="glass bg-linear-to-br from-emerald-500/30 to-teal-700/30 p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 block mb-3">
                {c.is_day ? "☀️ Daytime" : "🌙 Night"} · {new Date(c.time).toLocaleString("en-US", { weekday: "long", hour: "2-digit", minute: "2-digit" })}
              </span>
              <div className="flex items-end gap-4">
                <h2 className="text-8xl md:text-[10rem] font-black text-white leading-none">{Math.round(c.temperature_2m)}°</h2>
                <div className="mb-4">
                  <p className="text-2xl font-black text-white/80">{cond.icon} {cond.label}</p>
                  <p className="text-white/40 text-sm mt-1">Feels like {Math.round(c.apparent_temperature)}°C</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="bg-white/10 px-4 py-2 rounded-2xl text-[9px] font-black border border-white/20 uppercase tracking-widest">💧 {c.relative_humidity_2m}% Humidity</span>
                <span className="bg-white/10 px-4 py-2 rounded-2xl text-[9px] font-black border border-white/20 uppercase tracking-widest">💨 {c.wind_speed_10m} km/h {windDir(c.wind_direction_10m)}</span>
                <span className="bg-blue-500/20 px-4 py-2 rounded-2xl text-[9px] font-black border border-blue-400/20 uppercase tracking-widest">🌧️ {d.precipitation_probability_max[todayI]}% Rain Today</span>
                <span className="bg-amber-500/20 px-4 py-2 rounded-2xl text-[9px] font-black border border-amber-400/20 uppercase tracking-widest">☀️ UV {uvNow}</span>
                <span className="bg-white/10 px-4 py-2 rounded-2xl text-[9px] font-black border border-white/20 uppercase tracking-widest">☁️ {c.cloud_cover}% Cloud</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 min-w-40">
              <div className="glass bg-black/20 p-4 rounded-2xl text-center">
                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Sunrise</p>
                <p className="text-lg font-black text-amber-400">{fmtTime(d.sunrise[todayI])}</p>
              </div>
              <div className="glass bg-black/20 p-4 rounded-2xl text-center">
                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Sunset</p>
                <p className="text-lg font-black text-orange-400">{fmtTime(d.sunset[todayI])}</p>
              </div>
              <div className="glass bg-black/20 p-4 rounded-2xl text-center">
                <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Today Rain</p>
                <p className="text-lg font-black text-blue-400">{d.precipitation_sum[todayI]?.toFixed(1)} mm</p>
              </div>
            </div>
          </div>
          <span className="absolute -right-7 -bottom-1 text-[10rem] opacity-[0.5] pointer-events-none select-none">{cond.icon}</span>
        </div>

        {/* ─── TABS ─── */}
        <div className="flex gap-1 glass p-1 rounded-2xl border border-white/10 w-fit flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${activeTab === tab.id
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-white/40 hover:text-white/70"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════ OVERVIEW ════ */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            <SectionHeading>Atmospheric Conditions</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard label="Temperature" value={`${Math.round(c.temperature_2m)}°C`} accent="amber" icon="🌡️" sub={`Feels ${Math.round(c.apparent_temperature)}°C`} />
              <StatCard label="Humidity" value={`${c.relative_humidity_2m}%`} accent="blue" icon="💧" sub={c.relative_humidity_2m > 85 ? "⚠️ Fungal risk" : "Normal"} />
              <StatCard label="Dew Point" value={`${dewPoint}°C`} accent="cyan" icon="🌫️" sub="Moisture saturation threshold" />
              <StatCard label="Cloud Cover" value={`${c.cloud_cover}%`} accent="sky" icon="☁️" sub={c.cloud_cover > 70 ? "Poor sunlight" : "Good for crops"} />
              <StatCard label="Pressure" value={c.pressure_msl?.toFixed(0)} unit="hPa" accent="violet" icon="🔵" sub="Mean sea level" />
              <StatCard label="Wind Speed" value={c.wind_speed_10m} unit="km/h" accent="cyan" icon="💨" sub={`${windDir(c.wind_direction_10m)} · ${c.wind_speed_10m > 15 ? "⚠️ Avoid spraying" : "Safe for spraying"}`} />
              <StatCard label="Wind Gusts" value={c.wind_gusts_10m} unit="km/h" accent="rose" icon="🌪️" sub={c.wind_gusts_10m > 25 ? "⚠️ High gusts" : "Safe"} />
              <StatCard label="Precipitation" value={c.precipitation} unit="mm" accent="blue" icon="🌧️" sub="Current hour" />
              <StatCard label="UV Index" value={uvNow} accent="amber" icon="☀️" sub={uvNow >= 8 ? "⚠️ Very high" : uvNow >= 5 ? "Moderate" : "Low"} />
              <StatCard label="Visibility" value={visibility != null ? (visibility / 1000).toFixed(1) : "—"} unit="km" accent="sky" icon="👁️" sub={visibility < 1000 ? "⚠️ Poor" : "Good"} />
            </div>

            <SectionHeading>Today's Field Summary</SectionHeading>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <StatCard label="Max Temp" value={`${Math.round(d.temperature_2m_max[todayI])}°C`} accent="amber" icon="🔥" />
              <StatCard label="Min Temp" value={`${Math.round(d.temperature_2m_min[todayI])}°C`} accent="sky" icon="❄️" />
              <StatCard label="UV Index Max" value={d.uv_index_max[todayI]} accent="amber" icon="🌞" />
              <StatCard label="Daylight Rain" value={`${d.precipitation_hours[todayI]}h`} accent="blue" icon="⏱️" sub="Hours with rain" />
              <StatCard label="Solar Radiation" value={radToday} unit="MJ/m²" accent="orange" icon="⚡" sub="Today total" />
              <StatCard label="Evapotranspiration" value={et0Today} unit="mm" accent="emerald" icon="🌿" sub="ET₀ — irrigation guide" />
              <StatCard label="Vapour Pressure Def." value={vpd} unit="kPa" accent="violet" icon="💨" sub={vpd > 2 ? "⚠️ Crop stress" : "Normal"} />
              <StatCard label="Wind Max Today" value={d.wind_speed_10m_max[todayI]} unit="km/h" accent="cyan" icon="🌬️" />
              <StatCard label="Rain Sum" value={d.rain_sum[todayI]?.toFixed(1)} unit="mm" accent="blue" icon="🌧️" sub="Total rain today" />
              <StatCard label="Rain Probability" value={`${d.precipitation_probability_max[todayI]}%`} accent="blue" icon="🎲" sub="Max chance today" />
            </div>
          </div>
        )}

        {/* ════ 24-HOUR ════ */}
        {activeTab === "hourly" && (
          <div className="space-y-6">

            <SectionHeading>Next 24 Hours</SectionHeading>

            <div className="overflow-x-auto pb-2">
              <div className="flex gap-3 min-w-max">
                {next24.map((idx, i) => {
                  const info = wmoLabel(h.weather_code[idx]);

                  return (
                    <div
                      key={idx}
                      className={`glass glass-hover p-4 rounded-2xl border text-center flex flex-col gap-2 min-w-24 transition-all hover:-translate-y-1 ${i === 0
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-white/10"
                        }`}
                    >
                      <p className="text-[9px] font-black text-white/50 uppercase">
                        {new Date(h.time[idx]).toLocaleTimeString("en-US", {
                          hour: "2-digit",
                          hour12: true,
                        })}
                      </p>

                      <span className="text-2xl">{info.icon}</span>

                      <p className="text-xl font-black text-white">
                        {Math.round(h.temperature_2m[idx])}°
                      </p>

                      <p className="text-[9px] text-blue-400 font-black">
                        {h.precipitation_probability[idx]}%
                      </p>

                      <p className="text-[8px] text-cyan-400 font-bold">
                        {h.wind_speed_10m[idx]}km/h
                      </p>

                      {h.uv_index[idx] > 0 && (
                        <p className="text-[8px] text-amber-400 font-bold">
                          UV {h.uv_index[idx]}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ─── HOURLY TABLE PANEL ─── */}
            <SectionHeading>Hourly Detail Table</SectionHeading>

            <div className="glass bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">

              <div className="overflow-x-auto">

                <table className="w-full text-[10px] font-bold">

                  <thead>
                    <tr className="text-white/40 uppercase tracking-widest border-b border-white/10">
                      {[
                        "Time",
                        "Cond",
                        "Temp",
                        "Feels",
                        "Humid",
                        "Rain%",
                        "Rain mm",
                        "Wind",
                        "UV",
                        "ET₀",
                        "Visibility",
                      ].map((col) => (
                        <th
                          key={col}
                          className="px-3 py-3 text-left whitespace-nowrap"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {next24.map((idx, i) => {
                      const info = wmoLabel(h.weather_code[idx]);

                      return (
                        <tr
                          key={idx}
                          className={`border-b border-white/5 hover:bg-white/[0.05] transition-colors ${i === 0 ? "bg-emerald-500/10" : ""
                            }`}
                        >
                          <td className="px-3 py-3 text-white/80 whitespace-nowrap">
                            {new Date(h.time[idx]).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            {info.icon} {info.label}
                          </td>

                          <td className="px-3 py-3 text-amber-400">
                            {Math.round(h.temperature_2m[idx])}°C
                          </td>

                          <td className="px-3 py-3 text-white/60">
                            {Math.round(h.apparent_temperature[idx])}°C
                          </td>

                          <td className="px-3 py-3 text-blue-400">
                            {h.relative_humidity_2m[idx]}%
                          </td>

                          <td className="px-3 py-3 text-blue-300">
                            {h.precipitation_probability[idx]}%
                          </td>

                          <td className="px-3 py-3 text-blue-400">
                            {h.precipitation[idx]} mm
                          </td>

                          <td className="px-3 py-3 text-cyan-400 whitespace-nowrap">
                            {h.wind_speed_10m[idx]}{" "}
                            {windDir(h.wind_direction_10m[idx])}
                          </td>

                          <td className="px-3 py-3 text-amber-400">
                            {h.uv_index[idx]}
                          </td>

                          <td className="px-3 py-3 text-emerald-400">
                            {h.et0_fao_evapotranspiration[idx].toFixed(2)} mm
                          </td>

                          <td className="px-3 py-3 text-sky-400 whitespace-nowrap">
                            {h.visibility[idx] != null
                              ? (h.visibility[idx] / 1000).toFixed(1) + " km"
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                </table>

              </div>
            </div>
          </div>
        )}

        {/* ════ SOIL & AGRO ════ */}
        {activeTab === "soil" && (
          <div className="space-y-8">
            <SectionHeading>Soil Temperature Profiles</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "Surface (0 cm)", value: soilTemp0, depth: "Top layer — seed germination zone" },
                { label: "Shallow (6 cm)", value: soilTemp6, depth: "Root zone for seedlings" },
                { label: "Medium (18 cm)", value: soilTemp18, depth: "Active root zone — paddy growth" },
              ].map((s) => (
                <div key={s.label} className="glass glass-hover p-6 rounded-3xl border border-white/10 hover:-translate-y-0.5 transition-all">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">{s.label}</p>
                  <p className="text-5xl font-black text-emerald-400 mb-2">{s.value?.toFixed(1)}°C</p>
                  <p className="text-[9px] text-white/30 font-medium">{s.depth}</p>
                  <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: `${Math.min(100, Math.max(0, ((s.value - 15) / 25) * 100))}%` }} />
                  </div>
                  <div className="flex justify-between text-[8px] text-white/20 mt-1"><span>15°C</span><span>40°C</span></div>
                  <p className={`mt-3 text-[9px] font-black uppercase ${s.value < 18 ? "text-blue-400" : s.value > 35 ? "text-red-400" : "text-emerald-400"}`}>
                    {s.value < 18 ? "⚠️ Too cold for germination" : s.value > 35 ? "⚠️ Heat stress risk" : "✓ Optimal for paddy"}
                  </p>
                </div>
              ))}
            </div>

            <SectionHeading>Soil Moisture Content</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: "0–1 cm", value: soilM0, note: "Topsoil — surface evaporation layer" },
                { label: "1–3 cm", value: soilM1, note: "Seedling root zone" },
                { label: "3–9 cm", value: soilM3, note: "Primary root absorption zone" },
              ].map((s) => (
                <div key={s.label} className="glass glass-hover p-6 rounded-3xl border border-blue-500/20 hover:-translate-y-0.5 transition-all">
                  <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-4">Soil Moisture · {s.label}</p>
                  <p className="text-5xl font-black text-blue-400 mb-2">{s.value}%</p>
                  <p className="text-[9px] text-white/30 font-medium mb-4">{s.note}</p>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-linear-to-r from-blue-500 to-cyan-400 rounded-full" style={{ width: `${Math.min(100, parseFloat(s.value))}%` }} />
                  </div>
                  <p className={`mt-3 text-[9px] font-black uppercase ${parseFloat(s.value) < 20 ? "text-amber-400" : parseFloat(s.value) > 80 ? "text-blue-400" : "text-emerald-400"}`}>
                    {parseFloat(s.value) < 20 ? "⚠️ Low — Consider irrigation" : parseFloat(s.value) > 80 ? "💧 Saturated" : "✓ Good moisture level"}
                  </p>
                </div>
              ))}
            </div>

            <SectionHeading>Agronomic Indicators</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass glass-hover p-6 rounded-3xl border border-emerald-500/20 col-span-1 sm:col-span-2">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">ET₀ Evapotranspiration Today</p>
                <p className="text-5xl font-black text-emerald-400 mb-1">{et0Today} <span className="text-xl text-white/40">mm</span></p>
                <p className="text-[10px] text-white/50 mt-2 leading-relaxed">Reference evapotranspiration (FAO-56) — the amount of water the crop would use under optimal conditions. Use this to plan daily irrigation volumes.</p>
                <div className={`mt-4 inline-block px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest ${parseFloat(et0Today) > 6 ? "bg-amber-500/20 text-amber-400 border border-amber-500/20" : parseFloat(et0Today) > 3 ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                  {parseFloat(et0Today) > 6 ? "High demand — increase irrigation" : parseFloat(et0Today) > 3 ? "Moderate — normal irrigation" : "Low demand — reduce irrigation"}
                </div>
              </div>
              <div className="glass glass-hover p-6 rounded-3xl border border-violet-500/20">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Vapour Pressure Deficit</p>
                <p className="text-5xl font-black text-violet-400 mb-1">{vpd} <span className="text-xl text-white/40">kPa</span></p>
                <p className="text-[9px] text-white/40 mt-2">VPD drives transpiration. High VPD → crop water stress.</p>
                <p className={`mt-3 text-[9px] font-black uppercase ${parseFloat(vpd) > 2 ? "text-red-400" : parseFloat(vpd) > 1 ? "text-amber-400" : "text-emerald-400"}`}>
                  {parseFloat(vpd) > 2 ? "⚠️ Severe stress" : parseFloat(vpd) > 1 ? "Moderate stress" : "✓ Good conditions"}
                </p>
              </div>
              <div className="glass glass-hover p-6 rounded-3xl border border-orange-500/20">
                <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em] mb-2">Solar Radiation Today</p>
                <p className="text-5xl font-black text-orange-400 mb-1">{radToday} <span className="text-xl text-white/40">MJ/m²</span></p>
                <p className="text-[9px] text-white/40 mt-2">Higher radiation drives more ET₀ and photosynthesis.</p>
                <p className={`mt-3 text-[9px] font-black uppercase ${parseFloat(radToday) > 20 ? "text-amber-400" : "text-emerald-400"}`}>
                  {parseFloat(radToday) > 20 ? "High radiation day" : "Normal radiation"}
                </p>
              </div>
            </div>

            <SectionHeading>Spray & Field Work Advisory</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "Pesticide / Herbicide Spraying", ok: c.wind_speed_10m <= 15 && c.precipitation === 0 && c.cloud_cover < 80, reason: c.wind_speed_10m > 15 ? `Wind ${c.wind_speed_10m} km/h — drift risk` : c.precipitation > 0 ? "Active rain — wash-off risk" : c.cloud_cover >= 80 ? "Heavy cloud — poor drying" : "All conditions met", icon: "🪣" },
                { title: "Irrigation Recommended", ok: parseFloat(et0Today) > 4 && parseFloat(soilM0) < 40, reason: parseFloat(et0Today) <= 4 ? `ET₀ low (${et0Today} mm)` : parseFloat(soilM0) >= 40 ? "Soil moisture sufficient" : `ET₀ = ${et0Today} mm, moisture low`, icon: "💧" },
                { title: "Fungal Disease Risk", ok: false, warn: c.relative_humidity_2m > 80, reason: c.relative_humidity_2m > 80 ? `⚠️ Humidity ${c.relative_humidity_2m}% — monitor for blast` : `Humidity ${c.relative_humidity_2m}% — low risk`, icon: "🍄" },
                { title: "Field Machinery Work", ok: c.precipitation === 0 && parseFloat(soilM3) < 70, reason: c.precipitation > 0 ? "Rain present — soil waterlogged" : parseFloat(soilM3) >= 70 ? "Soil too wet for machinery" : "Conditions suitable", icon: "🚜" },
                { title: "Harvest Conditions", ok: c.precipitation === 0 && c.relative_humidity_2m < 75 && c.wind_speed_10m < 20, reason: c.precipitation > 0 ? "Rain — avoid harvest" : c.relative_humidity_2m >= 75 ? "High humidity — grain moisture risk" : "Good harvest window", icon: "🌾" },
                { title: "UV Exposure Risk", ok: uvNow < 6, reason: uvNow >= 8 ? `UV ${uvNow} — very high, use protection` : uvNow >= 6 ? `UV ${uvNow} — wear protective gear` : `UV ${uvNow} — safe`, icon: "🕶️" },
              ].map((a) => (
                <div key={a.title} className={`glass glass-hover p-5 rounded-3xl border transition-all hover:-translate-y-0.5 ${a.warn ? "border-amber-500/30 bg-amber-500/5" : a.ok ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/20 bg-red-500/5"}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-2xl">{a.icon}</span>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${a.warn ? "bg-amber-500/20 text-amber-400" : a.ok ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"}`}>
                      {a.warn ? "Monitor" : a.ok ? "Go" : "Hold"}
                    </span>
                  </div>
                  <p className="text-[11px] font-black text-white/90 mb-2">{a.title}</p>
                  <p className="text-[9px] text-white/40 font-medium">{a.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ════ 14-DAY FORECAST ════ */}
        {activeTab === "forecast" && (
          <div className="space-y-6">

            <SectionHeading>14-Day Outlook</SectionHeading>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {forecastIdx.map((idx) => {
                const info = wmoLabel(d.weather_code[idx]);

                return (
                  <div key={idx} className="glass glass-hover p-5 rounded-3xl border border-white/10 text-center hover:-translate-y-1 transition-all duration-300">
                    <p className="text-[9px] text-white/40 font-black mb-3 uppercase">
                      {fmtDay(d.time[idx], true)}
                    </p>

                    <div className="text-4xl mb-3">{info.icon}</div>

                    <p className="text-xs font-black text-white/60 mb-3">
                      {info.label}
                    </p>

                    <p className="text-2xl font-black text-white">
                      {Math.round(d.temperature_2m_max[idx])}°
                    </p>

                    <p className="text-sm text-white/40 font-bold">
                      {Math.round(d.temperature_2m_min[idx])}°
                    </p>

                    <div className="mt-4 space-y-1">
                      <p className="text-[9px] font-black text-blue-400">
                        {d.precipitation_probability_max[idx]}% Rain
                      </p>

                      <p className="text-[8px] text-blue-300">
                        {d.rain_sum[idx]?.toFixed(1)} mm
                      </p>

                      <p className="text-[8px] text-amber-400">
                        UV {d.uv_index_max[idx]}
                      </p>

                      <p className="text-[8px] text-emerald-400">
                        ET₀ {d.et0_fao_evapotranspiration[idx]?.toFixed(1)} mm
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <SectionHeading>Weekly Agro Forecast Detail</SectionHeading>

            <div className="glass bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
              <div className="overflow-x-auto">

                <table className="w-full text-[10px] font-bold">

                  <thead>
                    <tr className="text-white/40 uppercase tracking-widest border-b border-white/10">
                      {[
                        "Date",
                        "Cond",
                        "Max°C",
                        "Min°C",
                        "Rain%",
                        "Rain mm",
                        "Wind Max",
                        "UV Max",
                        "ET₀",
                        "Radiation",
                        "Sunrise",
                        "Sunset",
                      ].map((col) => (
                        <th key={col} className="px-3 py-3 text-left whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {forecastIdx.map((idx) => {
                      const info = wmoLabel(d.weather_code[idx]);

                      return (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.05] transition-colors">

                          <td className="px-3 py-3 text-white/80 whitespace-nowrap">
                            {fmtDay(d.time[idx], true)}
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            {info.icon} {info.label}
                          </td>

                          <td className="px-3 py-3 text-amber-400">
                            {Math.round(d.temperature_2m_max[idx])}°C
                          </td>

                          <td className="px-3 py-3 text-sky-400">
                            {Math.round(d.temperature_2m_min[idx])}°C
                          </td>

                          <td className="px-3 py-3 text-blue-300">
                            {d.precipitation_probability_max[idx]}%
                          </td>

                          <td className="px-3 py-3 text-blue-400">
                            {d.rain_sum[idx]?.toFixed(1)} mm
                          </td>

                          <td className="px-3 py-3 text-cyan-400">
                            {d.wind_speed_10m_max[idx]} km/h
                          </td>

                          <td className="px-3 py-3 text-amber-400">
                            {d.uv_index_max[idx]}
                          </td>

                          <td className="px-3 py-3 text-emerald-400">
                            {d.et0_fao_evapotranspiration[idx]?.toFixed(1)} mm
                          </td>

                          <td className="px-3 py-3 text-orange-400">
                            {d.shortwave_radiation_sum[idx]?.toFixed(1)} MJ/m²
                          </td>

                          <td className="px-3 py-3 text-amber-300 whitespace-nowrap">
                            {fmtTime(d.sunrise[idx])}
                          </td>

                          <td className="px-3 py-3 text-orange-300 whitespace-nowrap">
                            {fmtTime(d.sunset[idx])}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>

              </div>
            </div>
          </div>
        )}

        {/* ════ HISTORY ════ */}
        {activeTab === "history" && (
          <div className="space-y-6">

            <SectionHeading>Past 7 Days — Field History</SectionHeading>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {pastIdx.map((date, idx) => {
                const info = wmoLabel(d.weather_code[idx]);

                return (
                  <div key={idx} className="glass p-5 rounded-3xl border border-white/5 text-center opacity-80 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300">

                    <p className="text-[9px] text-white/30 font-bold mb-3 uppercase">
                      {fmtDay(date, true)}
                    </p>

                    <div className="text-3xl mb-3">{info.icon}</div>

                    <p className="text-xl font-bold text-white/80">
                      {Math.round(d.temperature_2m_max[idx])}°
                    </p>

                    <p className="text-sm text-white/30 font-bold">
                      {Math.round(d.temperature_2m_min[idx])}°
                    </p>

                    <div className="mt-4 space-y-1">
                      <p className="text-[8px] font-black text-white/30">
                        {d.precipitation_sum[idx]?.toFixed(1)} mm
                      </p>

                      <p className="text-[8px] text-white/20">
                        UV {d.uv_index_max[idx]}
                      </p>

                      <p className="text-[8px] text-white/20">
                        ET₀ {d.et0_fao_evapotranspiration[idx]?.toFixed(1)} mm
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>

            <SectionHeading>Historical Detail Table</SectionHeading>

            <div className="glass bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-6 shadow-xl">
              <div className="overflow-x-auto">

                <table className="w-full text-[10px] font-bold">

                  <thead>
                    <tr className="text-white/40 uppercase tracking-widest border-b border-white/10">
                      {[
                        "Date",
                        "Conditions",
                        "Max°C",
                        "Min°C",
                        "Rain Sum",
                        "Rain Hrs",
                        "Wind Max",
                        "UV Max",
                        "ET₀",
                        "Radiation",
                      ].map((col) => (
                        <th key={col} className="px-3 py-3 text-left whitespace-nowrap">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {pastIdx.map((date, idx) => {
                      const info = wmoLabel(d.weather_code[idx]);

                      return (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/[0.05] transition-colors">

                          <td className="px-3 py-3 text-white/80 whitespace-nowrap">
                            {fmtDay(date)}
                          </td>

                          <td className="px-3 py-3 whitespace-nowrap">
                            {info.icon} {info.label}
                          </td>

                          <td className="px-3 py-3 text-amber-400">
                            {Math.round(d.temperature_2m_max[idx])}°C
                          </td>

                          <td className="px-3 py-3 text-sky-400">
                            {Math.round(d.temperature_2m_min[idx])}°C
                          </td>

                          <td className="px-3 py-3 text-blue-400">
                            {d.precipitation_sum[idx]?.toFixed(1)} mm
                          </td>

                          <td className="px-3 py-3 text-blue-300">
                            {d.precipitation_hours[idx]}h
                          </td>

                          <td className="px-3 py-3 text-cyan-400">
                            {d.wind_speed_10m_max[idx]} km/h
                          </td>

                          <td className="px-3 py-3 text-amber-400">
                            {d.uv_index_max[idx]}
                          </td>

                          <td className="px-3 py-3 text-emerald-400">
                            {d.et0_fao_evapotranspiration[idx]?.toFixed(1)} mm
                          </td>

                          <td className="px-3 py-3 text-orange-400">
                            {d.shortwave_radiation_sum[idx]?.toFixed(1)} MJ/m²
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>

              </div>
            </div>
          </div>
        )}

        <footer className="text-center text-[9px] text-white/20 font-bold uppercase tracking-widest py-6 border-t border-white/5">
          Data sourced from Open-Meteo · Free & No API Key · Updates every 15 min · {district?.name} · {district?.lat}°N {district?.lon}°E
        </footer>
      </div>
    </div>
  );
}
