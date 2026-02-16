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
export const fetchWeather = () => get("/api/weather");

export const fetchFaqs = () => get("/api/help/faqs");

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