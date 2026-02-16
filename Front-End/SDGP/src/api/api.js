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