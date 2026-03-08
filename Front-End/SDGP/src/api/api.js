const API_BASE = "https://ricevision-cakt.onrender.com";

// helper
async function get(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error("API error");
  return res.json();
}

// endpoints
export const fetchHealthSummary = () => get("/health-summary");
export const fetchYield = () => get("/yield");
export const fetchBestDistricts = () => get("/best-districts");
export const fetchOutbreaks = () => get("/outbreaks");
export const fetchNDVITrend = () => get("/ndvi-trend");
export const fetchDistrictHealth = () => get("/district-health");
export const fetchStageDistribution = () => get("/stage-distribution");
export const fetchReportData = (districts, month) => get(`/api/report-data?districts=${districts}&month=${month}`);

// Called directly from the browser — Open-Meteo is free, no API key needed
export const fetchWeather = async () => {
  const url =
    "https://api.open-meteo.com/v1/forecast" +
    "?latitude=6.9271&longitude=79.8612" +
    "&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation,cloud_cover" +
    "&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max" +
    "&past_days=7&timezone=auto";

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
  return res.json();
};

export const fetchFaqs = () => get("/api/help/faqs");

/* ------------------ ALERTS ------------------ */
export const fetchAlerts = () => get("/api/alerts/all");

export const updateAlertStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/api/alerts/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) throw new Error("Failed to update alert");

  return res.json();
};

export const submitComplaint = async (payload) => {
  const res = await fetch(`${API_BASE}/api/help/complaints`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let message = "Failed to submit complaint";
    try {
      const data = await res.json();
      message = data.detail || message;
    } catch (_) {}
    throw new Error(message);
  }

  return res.json();
};

/* ------------------ MAP PAGE ------------------ */
export const fetchMapFields = async ({ districts = [], health = [] }) => {
  const params = new URLSearchParams();

  districts.forEach((d) => params.append("districts", d));
  health.forEach((h) => params.append("health", h));

  const res = await fetch(`${API_BASE}/map-fields?${params.toString()}`);

  if (!res.ok) {
    throw new Error("Failed to fetch map fields");
  }

  const result = await res.json();

  if (result.status !== "success") {
    throw new Error(result.message || "Map fetch failed");
  }

  return result.data;
};

/**
 * Fetch per-point NDVI or EVI values for a district.
 * Returns { vmin, vmax, data: [{ lat, lng, value, norm }] }
 */
export const fetchMapOverlay = async ({ type, districts = [] }) => {
  const params = new URLSearchParams({ type });
  districts.forEach((d) => params.append("districts", d));

  const res = await fetch(`${API_BASE}/map-overlay?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch overlay data");

  const result = await res.json();
  if (result.status !== "success") throw new Error(result.message || "Overlay fetch failed");

  return result; // { overlay, vmin, vmax, data }
};

/**
 * Request a GEE XYZ tile URL for Sentinel-1 VV or VH.
 * Returns { tile_url, vmin, vmax } or throws if GEE is not configured.
 */
export const fetchGEETileUrl = async ({ type, district, startDate, endDate }) => {
  const params = new URLSearchParams({ type });
  if (district) params.set("district", district);
  if (startDate) params.set("start_date", startDate);
  if (endDate)   params.set("end_date", endDate);

  const res = await fetch(`${API_BASE}/map-gee-tiles?${params.toString()}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.detail || "GEE tile fetch failed");
  }
  return res.json();
};