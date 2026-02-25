import { MapContainer, TileLayer, CircleMarker, GeoJSON } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import { latLngBounds } from "leaflet";
import L from "leaflet";
import { fetchMapFields } from "../../api/api";

/* ---------- CONFIG ---------- */

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const SRI_LANKA_ZOOM = 7;

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

  /* ---------- LOAD DISTRICT BOUNDARY ---------- */
  useEffect(() => {
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

  /* ---------- AUTO ZOOM TO DISTRICT ---------- */
  useEffect(() => {
    if (districtBoundary && mapRef.current) {
      const layer = L.geoJSON(districtBoundary);
      mapRef.current.fitBounds(layer.getBounds());
    }
  }, [districtBoundary]);

  /* ---------- FETCH ML POINTS FROM FASTAPI (via api.js like Dashboard) ---------- */
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

  /* ---------- FALLBACK BOUNDS ---------- */
  const bounds =
    points.length > 0
      ? latLngBounds(points.map((p) => [p.lat, p.lng]))
      : null;

  return (
    <MapContainer
      ref={mapRef}
      center={SRI_LANKA_CENTER}
      zoom={SRI_LANKA_ZOOM}
      bounds={!districtBoundary ? bounds : null}
      className="h-full w-full rounded-xl"
    >
      {/* Base Map */}
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
        points.map((p, idx) => (
          <CircleMarker
            key={idx}
            center={[p.lat, p.lng]}
            radius={4}
            pathOptions={{
              color: getHealthColor(p.paddy_health),
              fillColor: getHealthColor(p.paddy_health),
              fillOpacity: 0.75,
              weight: 1,
            }}
          />
        ))}
    </MapContainer>
  );
}