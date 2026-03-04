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
export const fetchReportData = (districts, month) => get(`/api/report-data?districts=${districts}&month=${month}`);
export const fetchWeather = async (lat, lon) => {
  const res = await fetch(
    `${API_BASE}/api/weather?latitude=${lat}&longitude=${lon}`
  );

  if (!res.ok) throw new Error("Failed to fetch weather");

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