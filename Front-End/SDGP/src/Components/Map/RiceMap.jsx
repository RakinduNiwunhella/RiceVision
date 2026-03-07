import { MapContainer, TileLayer, CircleMarker, GeoJSON } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { fetchMapFields } from "../../api/api";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

/* ---------- CONFIG ---------- */

const SRI_LANKA_CENTER = [7.8731, 80.7718];

// Slightly expanded bounds so districts near edges aren't clipped
const SRI_LANKA_BOUNDS = [
  [5.8, 79.4],
  [10.2, 82.2],
];

const SRI_LANKA_ZOOM = 7;

/* ---------- HEALTH COLOR ---------- */

function getHealthColor(health) {

  if (health === "Healthy") return "#22c55e";      // bright green
  if (health === "Normal") return "#16a34a";       // green
  if (health === "Mild Stress") return "#facc15";  // yellow
  if (health === "Severe Stress") return "#dc2626"; // red
  if (health === "Damaged") return "#7f1d1d";      // dark red

  return "#2563eb"; // fallback
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
      .then(res => res.json())
      .then(setPaddyGeo)
      .catch(console.error);

  }, [selectedDistrict, layers.paddyExtent]);

  /* ---------- LOAD DISTRICT BOUNDARY ---------- */

  useEffect(() => {

    setDistrictBoundary(null);

    if (!selectedDistrict) return;

    fetch(`/${selectedDistrict}_District_Boundary.geojson`)
      .then(res => res.json())
      .then(setDistrictBoundary)
      .catch(console.error);

  }, [selectedDistrict]);

  /* ---------- ZOOM LOGIC ---------- */

  useEffect(() => {

    if (!mapRef.current) return;

    // zoom to district with padding so edges stay visible
    if (districtBoundary) {
      const layer = L.geoJSON(districtBoundary);

      mapRef.current.fitBounds(layer.getBounds(), {
        padding: [80, 80],
      });
    }

    // default Sri Lanka view
    else {
      mapRef.current.fitBounds(SRI_LANKA_BOUNDS, {
        padding: [40, 40],
      });
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

  /* ---------- RENDER ---------- */

  return (

<MapContainer
  ref={mapRef}
  center={SRI_LANKA_CENTER}
  zoom={SRI_LANKA_ZOOM}
  minZoom={7}
  maxZoom={18}
  maxBounds={!selectedDistrict ? SRI_LANKA_BOUNDS : undefined}
  maxBoundsViscosity={1.0}
  preferCanvas={true}
  className="h-full w-full rounded-3xl"
>

{/* ---------- DEFAULT MAP ---------- */}

{!layers.showSatellite && (
  <>
    <TileLayer
      attribution="© Carto"
      url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
    />

    <TileLayer
      attribution="© Carto"
      url="https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
    />
  </>
)}

{/* ---------- SATELLITE ---------- */}

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

{/* ---------- HEALTH POINTS ---------- */}

{layers.showCircles && points.length > 0 && (
<MarkerClusterGroup
  disableClusteringAtZoom={10}
  spiderfyOnMaxZoom={false}
  showCoverageOnHover={false}
  maxClusterRadius={30}
  chunkedLoading
>
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