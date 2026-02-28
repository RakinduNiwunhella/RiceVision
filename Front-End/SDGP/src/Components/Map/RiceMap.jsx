import { MapContainer, TileLayer, CircleMarker, GeoJSON } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { fetchMapFields } from "../../api/api";

/* =========================================================
   MAP CONSTANTS
========================================================= */

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const SRI_LANKA_ZOOM = 8;

// 🇱🇰 Lock map to Sri Lanka
const SRI_LANKA_BOUNDS = [
  [5.8, 79.5],   // Southwest
  [10.1, 82.1],  // Northeast
];

/* =========================================================
   HEALTH COLORS (ROBUST VERSION)
========================================================= */

function getHealthColor(health) {
  if (!health) return "#2563eb";

  const value = health.toLowerCase();

  if (value.includes("normal") || value.includes("healthy"))
    return "#16a34a"; // green

  if (value.includes("mild") || value.includes("stress"))
    return "#facc15"; // yellow

  if (value.includes("severe") || value.includes("damage"))
    return "#dc2626"; // red

  return "#2563eb";
}

/* =========================================================
   STYLES
========================================================= */

const paddyStyle = {
  fillColor: "#f59e0b",
  fillOpacity: 0.6,
  color: "#b45309",
  weight: 1,
};

const districtBoundaryStyle = {
  color: "#3b82f6",
  weight: 3,
  fillOpacity: 0,
};

export default function RiceMap({ filters, layers, isDark }) {
  const [points, setPoints] = useState([]);
  const [paddyGeo, setPaddyGeo] = useState(null);
  const [districtBoundary, setDistrictBoundary] = useState(null);

  const mapRef = useRef(null);

  const selectedDistrict = filters.districts[0];
  const selectedHealth = filters.health;

  /* =========================================================
     BASE MAP LOGIC
  ========================================================= */

  let tileUrl = "";

  if (layers.showRoads) {
    // Full OpenStreetMap
    tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
  } else {
    // Styled dashboard map
    tileUrl = isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
  }

  /* =========================================================
     LOAD PADDY EXTENT
  ========================================================= */
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

  /* =========================================================
     LOAD DISTRICT BOUNDARY
  ========================================================= */
  useEffect(() => {
    setDistrictBoundary(null);

    if (!selectedDistrict) return;

    fetch(`/${selectedDistrict}_District_Boundary.geojson`)
      .then((res) => {
        if (!res.ok) throw new Error("Boundary not found");
        return res.json();
      })
      .then(setDistrictBoundary)
      .catch(console.error);
  }, [selectedDistrict]);

  /* =========================================================
     AUTO ZOOM TO DISTRICT
  ========================================================= */
  useEffect(() => {
    if (districtBoundary && mapRef.current) {
      const layer = L.geoJSON(districtBoundary);
      mapRef.current.fitBounds(layer.getBounds());
    }
  }, [districtBoundary]);

  /* =========================================================
     LOAD ML HEALTH POINTS
  ========================================================= */
  useEffect(() => {
    if (!selectedDistrict || !layers.showCircles) {
      setPoints([]);
      return;
    }

    const loadPoints = async () => {
      try {
        const data = await fetchMapFields({
          districts: [selectedDistrict],
          health: selectedHealth,
        });

        setPoints(data);
      } catch (err) {
        console.error("Map fetch error:", err);
        setPoints([]);
      }
    };

    loadPoints();
  }, [selectedDistrict, selectedHealth, layers.showCircles]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <MapContainer
      ref={mapRef}
      center={SRI_LANKA_CENTER}
      zoom={SRI_LANKA_ZOOM}
      minZoom={7}
      maxZoom={18}
      maxBounds={SRI_LANKA_BOUNDS}
      maxBoundsViscosity={1.0}
      className="h-full w-full rounded-xl"
    >
      {/* Base Map */}
      <TileLayer
        key={`${isDark}-${layers.showRoads}`}
        attribution="© OpenStreetMap contributors"
        url={tileUrl}
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
        points.map((p, idx) => (
          <CircleMarker
            key={idx}
            center={[p.lat, p.lng]}
            radius={5}
            pathOptions={{
              color: getHealthColor(p.paddy_health),
              fillColor: getHealthColor(p.paddy_health),
              fillOpacity: 0.8,
              weight: 1,
            }}
          />
        ))}
    </MapContainer>
  );
}