import { MapContainer, TileLayer, CircleMarker, GeoJSON } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import { latLngBounds } from "leaflet";
import L from "leaflet";
import { supabase } from "../../supabaseClient";

/* ---------- CONSTANTS ---------- */
const SRI_LANKA_CENTER = [7.8731, 80.7718];
const SRI_LANKA_ZOOM = 7;

const HEALTH_MAP = {
  Healthy: "Normal",
  Stressed: "Mild Stress",
  Damaged: "Severe Stress",
};

function getHealthColor(health) {
  if (health === "Normal") return "#16a34a";
  if (health === "Mild Stress") return "#facc15";
  if (health === "Severe Stress") return "#dc2626";
  return "#2563eb";
}

/* ---------- STYLES ---------- */
const paddyStyle = {
  fillColor: "#f59e0b",
  fillOpacity: 0.7,
  color: "#b45309",
  weight: 1,
};

const districtBoundaryStyle = {
  color: "#1e3a8a",
  weight: 3,
  fillOpacity: 0,
};

export default function RiceMap({ filters, layers }) {
  const [points, setPoints] = useState([]);
  const [paddyGeo, setPaddyGeo] = useState(null);
  const [districtBoundary, setDistrictBoundary] = useState(null);

  const mapRef = useRef(null);

  const selectedDistrict = filters.districts[0];
  const selectedHealth = filters.health;

  /* ---------- LOAD PADDY EXTENT ---------- */
  useEffect(() => {
    if (!selectedDistrict || !layers.paddyExtent) {
      setPaddyGeo(null);
      return;
    }

    fetch(`/${selectedDistrict}.geojson`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load paddy extent");
        return res.json();
      })
      .then(setPaddyGeo)
      .catch(console.error);
  }, [selectedDistrict, layers.paddyExtent]);

  /* ---------- LOAD DISTRICT BOUNDARY (DYNAMIC) ---------- */
  useEffect(() => {
    // Clear old boundary immediately
    setDistrictBoundary(null);

    if (!selectedDistrict) return;

    const boundaryFile = `/${selectedDistrict}_District_Boundary.geojson`;

    fetch(boundaryFile)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Boundary not found for ${selectedDistrict}`);
        }
        return res.json();
      })
      .then(setDistrictBoundary)
      .catch(console.error);
  }, [selectedDistrict]);

  /* ---------- AUTO ZOOM ---------- */
  useEffect(() => {
    if (districtBoundary && mapRef.current) {
      const layer = L.geoJSON(districtBoundary);
      mapRef.current.fitBounds(layer.getBounds());
    }
  }, [districtBoundary]);

  /* ---------- FETCH ML POINTS ---------- */
  useEffect(() => {
    if (!selectedDistrict) {
      setPoints([]);
      return;
    }

    const fetchAllPoints = async () => {
      const pageSize = 1000;
      let from = 0;
      let allData = [];

      while (true) {
        const { data, error } = await supabase
          .from("final_ml_predictions")
          .select("lat, lng, paddy_health")
          .eq("District", selectedDistrict)
          .neq("paddy_health", "Not Applicable")
          .range(from, from + pageSize - 1);

        if (error || !data || data.length === 0) break;

        allData = allData.concat(data);
        from += pageSize;
      }

      setPoints(allData);
    };

    fetchAllPoints();
  }, [selectedDistrict]);

  /* ---------- HEALTH FILTER ---------- */
  let visiblePoints = points;

  if (selectedHealth.length > 0) {
    const dbHealthValues = selectedHealth.map((ui) => HEALTH_MAP[ui]);
    visiblePoints = points.filter((p) =>
      dbHealthValues.includes(p.paddy_health)
    );
  }

  /* ---------- FALLBACK BOUNDS ---------- */
  const bounds =
    visiblePoints.length > 0
      ? latLngBounds(visiblePoints.map((p) => [p.lat, p.lng]))
      : null;

  return (
    <MapContainer
      ref={mapRef}
      center={SRI_LANKA_CENTER}
      zoom={SRI_LANKA_ZOOM}
      bounds={!districtBoundary ? bounds : null}
      className="h-full w-full rounded-xl"
    >
      {/* Base map */}
      <TileLayer
        attribution="© OpenStreetMap"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* District Boundary */}
      {districtBoundary && (
        <GeoJSON data={districtBoundary} style={districtBoundaryStyle} />
      )}

      {/* Paddy Extent */}
      {selectedDistrict && layers.paddyExtent && paddyGeo && (
        <GeoJSON data={paddyGeo} style={paddyStyle} />
      )}

      {/* ML Health Points */}
      {selectedDistrict &&
        layers.showCircles &&
        visiblePoints.map((p, idx) => (
          <CircleMarker
            key={idx}
            center={[p.lat, p.lng]}
            radius={4}
            pathOptions={{
              color:
                selectedHealth.length === 0
                  ? "#2563eb"
                  : getHealthColor(p.paddy_health),
              fillColor:
                selectedHealth.length === 0
                  ? "#2563eb"
                  : getHealthColor(p.paddy_health),
              fillOpacity: 0.75,
              weight: 1,
            }}
          />
        ))}
    </MapContainer>
  );
}
