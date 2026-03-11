import { MapContainer, TileLayer, CircleMarker, Circle, GeoJSON, Tooltip, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import L from "leaflet";
import { fetchMapFields, fetchGEETileUrl } from "../../api/api";
import MarkerClusterGroup from "react-leaflet-cluster";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.Default.css";

/* ---------- CONFIG ---------- */

const SRI_LANKA_CENTER = [7.8731, 80.7718];

const SRI_LANKA_BOUNDS = [
  [5.8, 79.4],
  [10.2, 82.2],
];

const SRI_LANKA_ZOOM = 7;

/* ---------- HEALTH COLOR ---------- */

function getHealthColor(health) {
  if (health === "Healthy" || health === "Normal") return "#22c55e";
  if (health === "Mild Stress") return "#facc15";
  if (health === "Severe Stress") return "#dc2626";
  if (health === "Not Applicable") return "#696969";
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

/* ---------- FLY-TO CONTROLLER ---------- */

function FlyToController({ flyTo }) {
  const map = useMap();

  useEffect(() => {
    if (!flyTo) return;

    if (flyTo.type === "pest" && flyTo.locations?.length > 0) {
      const first = flyTo.locations[0];
      map.flyTo([first.lat, first.lon], 13, { animate: true, duration: 1.5 });
    } else if (flyTo.type === "disaster") {
      map.flyTo([flyTo.lat, flyTo.lon], 13, { animate: true, duration: 1.5 });
    }
  }, [flyTo, map]);

  return null;
}

/* ---------- ALERT MARKER ---------- */

function AlertMarker({ flyTo }) {
  if (!flyTo) return null;

  if (flyTo.type === "pest") {
    return (
      <>
        {flyTo.locations.map((loc, idx) => (
          <CircleMarker
            key={idx}
            center={[loc.lat, loc.lon]}
            radius={5}
            pathOptions={{
              color: "#ef4444",
              fillColor: "#ef4444",
              fillOpacity: 0.6,
              weight: 1.5,
            }}
          />
        ))}
      </>
    );
  }

  return (
    <Circle
      center={[flyTo.lat, flyTo.lon]}
      radius={2000}
      pathOptions={{
        color: "#ef4444",
        fillColor: "#ef4444",
        fillOpacity: 0.25,
        weight: 2,
      }}
    />
  );
}

export default function RiceMap({ filters, layers, flyTo }) {

  const { isDark } = useTheme();

  const [points, setPoints] = useState([]);
  const [paddyGeo, setPaddyGeo] = useState(null);
  const [districtBoundary, setDistrictBoundary] = useState(null);

  const [ndviTileUrl, setNdviTileUrl] = useState(null);
  const [eviTileUrl, setEviTileUrl] = useState(null);
  const [vvTileUrl, setVvTileUrl] = useState(null);
  const [vhTileUrl, setVhTileUrl] = useState(null);

  const mapRef = useRef(null);

  const selectedDistrict = filters.districts[0];
  const selectedHealth = filters.health;

  const overlayOpacity = layers.overlayOpacity ?? 0.75;

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

    if (districtBoundary) {
      const layer = L.geoJSON(districtBoundary);

      mapRef.current.fitBounds(layer.getBounds(), {
        padding: [80, 80],
      });
    } else {
      mapRef.current.fitBounds(SRI_LANKA_BOUNDS, {
        padding: [40, 40],
      });
    }

  }, [districtBoundary]);

  /* ---------- LOAD SATELLITE TILES ---------- */

  useEffect(() => {
    if (!selectedDistrict || !layers.ndvi) return setNdviTileUrl(null);
    fetchGEETileUrl({ type: "ndvi", district: selectedDistrict })
      .then(res => setNdviTileUrl(res.tile_url))
      .catch(() => setNdviTileUrl(null));
  }, [selectedDistrict, layers.ndvi]);

  useEffect(() => {
    if (!selectedDistrict || !layers.evi) return setEviTileUrl(null);
    fetchGEETileUrl({ type: "evi", district: selectedDistrict })
      .then(res => setEviTileUrl(res.tile_url))
      .catch(() => setEviTileUrl(null));
  }, [selectedDistrict, layers.evi]);

  useEffect(() => {
    if (!selectedDistrict || !layers.vv) return setVvTileUrl(null);
    fetchGEETileUrl({ type: "vv", district: selectedDistrict })
      .then(res => setVvTileUrl(res.tile_url))
      .catch(() => setVvTileUrl(null));
  }, [selectedDistrict, layers.vv]);

  useEffect(() => {
    if (!selectedDistrict || !layers.vh) return setVhTileUrl(null);
    fetchGEETileUrl({ type: "vh", district: selectedDistrict })
      .then(res => setVhTileUrl(res.tile_url))
      .catch(() => setVhTileUrl(null));
  }, [selectedDistrict, layers.vh]);

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

    setPoints(data);   // NOT response.data

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

<FlyToController flyTo={flyTo} />
<AlertMarker flyTo={flyTo} />

{/* ---------- DEFAULT MAP ---------- */}

{!layers.showSatellite && (
  <>
    <TileLayer
      key={isDark ? "dark-map" : "light-map"}
      attribution="© Carto"
      url={
        isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          : "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      }
    />

    <TileLayer
      key={isDark ? "dark-labels" : "light-labels"}
      attribution="© Carto"
      url={
        isDark
          ? "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png"
          : "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
      }
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
          url={
            isDark
              ? "https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}.png"
              : "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png"
          }
          opacity={1}
        />
      </>
    )}
  </>
)}

{districtBoundary && (
  <GeoJSON data={districtBoundary} style={districtBoundaryStyle} />
)}

{selectedDistrict && layers.paddyExtent && paddyGeo && (
  <GeoJSON data={paddyGeo} style={paddyStyle} />
)}

{layers.ndvi && ndviTileUrl && (
  <TileLayer url={ndviTileUrl} opacity={overlayOpacity} />
)}

{layers.evi && eviTileUrl && (
  <TileLayer url={eviTileUrl} opacity={overlayOpacity} />
)}

{layers.vv && vvTileUrl && (
  <TileLayer url={vvTileUrl} opacity={overlayOpacity} />
)}

{layers.vh && vhTileUrl && (
  <TileLayer url={vhTileUrl} opacity={overlayOpacity} />
)}

{layers.showCircles && points && points.length > 0 && (
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