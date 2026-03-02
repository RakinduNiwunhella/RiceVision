import { MapContainer, TileLayer, CircleMarker, GeoJSON } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { fetchMapFields } from "../../api/api";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

/* =========================================================
   MAP CONSTANTS
========================================================= */

const SRI_LANKA_CENTER = [7.8731, 80.7718];
const SRI_LANKA_ZOOM = 8;

const SRI_LANKA_BOUNDS = [
  [5.8, 79.5],
  [10.1, 82.1],
];

/* =========================================================
   HEALTH COLORS
========================================================= */

function getHealthColor(health) {
  if (!health) return "#2563eb";

  const value = health.toLowerCase();

  if (value.includes("normal") || value.includes("healthy"))
    return "#16a34a";

  if (value.includes("mild") || value.includes("stress"))
    return "#facc15";

  if (value.includes("severe") || value.includes("damage"))
    return "#dc2626";

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

export default function RiceMap({ filters, layers, isDark, resetViewKey }) {

  const [points, setPoints] = useState([]);
  const [paddyGeo, setPaddyGeo] = useState(null);
  const [districtBoundary, setDistrictBoundary] = useState(null);

  const mapRef = useRef(null);

  const selectedDistrict = filters.districts[0];

  /* =========================================================
     BASE MAP
  ========================================================= */

  const tileUrl = layers.showRoads
    ? "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    : isDark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  /* =========================================================
     LOAD PADDY EXTENT
  ========================================================= */

  useEffect(() => {

  if (!layers.paddyExtent) {
    setPaddyGeo(null);
    return;
  }

  // 🔥 Always clear previous geo first
  setPaddyGeo(null);

  // District mode
  if (selectedDistrict) {
    fetch(`/${selectedDistrict}.geojson`)
      .then(res => res.json())
      .then(data => {
        setPaddyGeo(data);
      })
      .catch(console.error);
  }

  // National mode
  else {
    const districtFiles = [
      "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo",
      "Galle","Gampaha","Hambantota","Jaffna","Kalutara",
      "Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar",
      "Matale","Matara","Moneragala","Mullaitivu","NuwaraEliya",
      "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya",
    ];

    Promise.all(
      districtFiles.map((name) =>
        fetch(`/${name}.geojson`).then(res => res.json())
      )
    )
      .then((allGeo) => {
        setPaddyGeo({
          type: "FeatureCollection",
          features: allGeo.flatMap(g => g.features),
        });
      })
      .catch(console.error);
  }

}, [selectedDistrict, layers.paddyExtent]);

  /* =========================================================
     LOAD DISTRICT BOUNDARY
  ========================================================= */

  useEffect(() => {

    setDistrictBoundary(null);

    if (!selectedDistrict) return;

    fetch(`/${selectedDistrict}_District_Boundary.geojson`)
      .then(res => res.json())
      .then(setDistrictBoundary)
      .catch(console.error);

  }, [selectedDistrict]);

  /* =========================================================
     AUTO ZOOM
  ========================================================= */

  useEffect(() => {
    if (!mapRef.current) return;

    if (districtBoundary) {
      const layer = L.geoJSON(districtBoundary);
      mapRef.current.fitBounds(layer.getBounds());
    } else {
      mapRef.current.fitBounds(SRI_LANKA_BOUNDS);
    }
  }, [districtBoundary]);

  useEffect(() => {
    if (!mapRef.current) return;
    mapRef.current.fitBounds(SRI_LANKA_BOUNDS);
  }, [resetViewKey]);

  /* =========================================================
     LOAD FIELD HEALTH MARKERS
  ========================================================= */

  useEffect(() => {

    if (!layers.showCircles) {
      setPoints([]);
      return;
    }

    const allDistricts = [
      "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo",
      "Galle","Gampaha","Hambantota","Jaffna","Kalutara",
      "Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar",
      "Matale","Matara","Moneragala","Mullaitivu","NuwaraEliya",
      "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya",
    ];

    const loadPoints = async () => {
      try {
        const data = await fetchMapFields({
          districts: selectedDistrict ? [selectedDistrict] : allDistricts,
          health: filters.health,
        });

        setPoints(data);
      } catch (err) {
        console.error(err);
        setPoints([]);
      }
    };

    loadPoints();

  }, [selectedDistrict, filters.health, layers.showCircles]);

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
      preferCanvas={true}
      className="h-full w-full rounded-xl"
    >
      <TileLayer
        key={`${isDark}-${layers.showRoads}`}
        attribution="© OpenStreetMap contributors"
        url={tileUrl}
      />

      {districtBoundary && (
        <GeoJSON data={districtBoundary} style={districtBoundaryStyle} />
      )}

      {layers.paddyExtent && paddyGeo && (
        <GeoJSON data={paddyGeo} style={paddyStyle} />
      )}

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