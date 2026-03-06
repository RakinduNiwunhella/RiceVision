import { MapContainer, TileLayer, CircleMarker, GeoJSON } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import { latLngBounds } from "leaflet";
import L from "leaflet";
import { fetchMapFields } from "../../api/api";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

/* ---------- CONFIG ---------- */

const SRI_LANKA_BOUNDS = [
  [6.1, 79.65],
  [9.85, 81.85],
];

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

    fetch(`/${selectedDistrict}_District_Boundary.geojson`)
      .then((res) => res.json())
      .then(setDistrictBoundary)
      .catch(console.error);

  }, [selectedDistrict]);

  /* ---------- AUTO ZOOM ---------- */
  useEffect(() => {
  if (!selectedDistrict && mapRef.current) {
    mapRef.current.fitBounds(SRI_LANKA_BOUNDS);
  }
}, [selectedDistrict]);

  /* ---------- DEFAULT SRI LANKA VIEW ---------- */

useEffect(() => {

  if (!mapRef.current) return;

  if (!selectedDistrict) {
    mapRef.current.fitBounds(SRI_LANKA_BOUNDS);
  }

}, [selectedDistrict]);

  useEffect(() => {

    if (districtBoundary && mapRef.current) {
      const layer = L.geoJSON(districtBoundary);
      mapRef.current.fitBounds(layer.getBounds());
    }

  }, [districtBoundary]);

  /* ---------- FETCH ML POINTS ---------- */

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
        console.error(err);
        setPoints([]);
      }
    };

    loadPoints();

  }, [selectedDistrict, selectedHealth, layers.showCircles]);

  const bounds =
    points.length > 0
      ? latLngBounds(points.map((p) => [p.lat, p.lng]))
      : null;

  return (

<MapContainer
  ref={mapRef}
  bounds={SRI_LANKA_BOUNDS}
  maxBounds={SRI_LANKA_BOUNDS}
  maxBoundsViscosity={1.0}
  minZoom={7}
  className="h-full w-full rounded-3xl"
>

{/* ---------- BASE MAP ---------- */}

{/* Default white map (no roads) */}
{!layers.showSatellite && (
  <TileLayer
    attribution="© Carto"
    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
  />
)}

{/* Satellite */}
{layers.showSatellite && (
  <>
    <TileLayer
      attribution="© Esri"
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
    />

    {layers.showRoadOverlay && (
      <>
        <TileLayer
          attribution="© OpenStreetMap"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={layers.roadOpacity}
        />

        {/* Labels always visible */}
        <TileLayer
          attribution="© Carto"
          url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
          opacity={1}
        />
      </>
    )}
  </>
)}

{/* ---------- DISTRICT BOUNDARY ---------- */}

{districtBoundary && (
  <GeoJSON data={districtBoundary} style={districtBoundaryStyle} />
)}

{/* ---------- PADDY EXTENT ---------- */}

{selectedDistrict && layers.paddyExtent && paddyGeo && (
  <GeoJSON data={paddyGeo} style={paddyStyle} />
)}

{/* ---------- CLUSTERED ML HEALTH POINTS ---------- */}

{layers.showCircles && points.length > 0 && (
  <MarkerClusterGroup>
    {points.map((p, idx) => (
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
  </MarkerClusterGroup>
)}

</MapContainer>
  );
}