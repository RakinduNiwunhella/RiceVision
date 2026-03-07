import { MapContainer, TileLayer, CircleMarker, GeoJSON, Tooltip } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { fetchMapFields, fetchMapOverlay, fetchGEETileUrl } from "../../api/api";
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

/* ---------- COLOUR SCALES ---------- */

/**
 * Simple linear colour interpolation between a list of hex stops.
 * t ∈ [0, 1].
 */
function hexToRgb(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function interpolateColor(stops, t) {
  const clamped = Math.max(0, Math.min(1, t));
  const seg = stops.length - 1;
  const idx = Math.min(Math.floor(clamped * seg), seg - 1);
  const localT = clamped * seg - idx;
  const a = hexToRgb(stops[idx]);
  const b = hexToRgb(stops[idx + 1]);
  const r = Math.round(a[0] + (b[0] - a[0]) * localT);
  const g = Math.round(a[1] + (b[1] - a[1]) * localT);
  const bl = Math.round(a[2] + (b[2] - a[2]) * localT);
  return `rgb(${r},${g},${bl})`;
}

// NDVI / EVI:  brown → yellow → light-green → dark-green
const NDVI_STOPS = ["#7f2700", "#d4a017", "#aaff44", "#228b22", "#004d00"];
// VV / VH SAR: deep-blue → cyan → yellow → orange → red  (used in GEE vis)
const SAR_STOPS  = ["#000080", "#0000ff", "#00ffff", "#ffff00", "#ff0000"];

const OVERLAY_META = {
  ndvi: { label: "NDVI",  unit: "",   stops: NDVI_STOPS, vmin: -0.2, vmax: 0.9 },
  evi:  { label: "EVI",   unit: "",   stops: NDVI_STOPS, vmin: -0.2, vmax: 0.9 },
  vv:   { label: "VV",    unit: " dB", stops: SAR_STOPS,  vmin: -25,  vmax: 0  },
  vh:   { label: "VH",    unit: " dB", stops: SAR_STOPS,  vmin: -30,  vmax: -5 },
};

/* ---------- HEALTH COLOR ---------- */

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

  // Overlay data for NDVI / EVI (per-point values from Supabase)
  const [ndviData, setNdviData] = useState([]);
  const [eviData,  setEviData]  = useState([]);

  // GEE tile URLs for Sentinel-1 VV / VH
  const [vvTileUrl, setVvTileUrl] = useState(null);
  const [vhTileUrl, setVhTileUrl] = useState(null);
  const [vvError,   setVvError]   = useState(null);
  const [vhError,   setVhError]   = useState(null);

  // overlayOpacity comes from shared layers state (controlled in MapLayersPanel)
  const overlayOpacity = layers.overlayOpacity ?? 0.75;

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

  /* ---------- LOAD NDVI OVERLAY ---------- */

  useEffect(() => {
    if (!selectedDistrict || !layers.ndvi) {
      setNdviData([]);
      return;
    }
    fetchMapOverlay({ type: "ndvi", districts: [selectedDistrict] })
      .then((res) => setNdviData(res.data))
      .catch((err) => { console.error("NDVI overlay:", err); setNdviData([]); });
  }, [selectedDistrict, layers.ndvi]);

  /* ---------- LOAD EVI OVERLAY ---------- */

  useEffect(() => {
    if (!selectedDistrict || !layers.evi) {
      setEviData([]);
      return;
    }
    fetchMapOverlay({ type: "evi", districts: [selectedDistrict] })
      .then((res) => setEviData(res.data))
      .catch((err) => { console.error("EVI overlay:", err); setEviData([]); });
  }, [selectedDistrict, layers.evi]);

  /* ---------- LOAD VV TILE (GEE) ---------- */

  useEffect(() => {
    if (!selectedDistrict || !layers.vv) {
      setVvTileUrl(null);
      setVvError(null);
      return;
    }
    setVvError(null);
    fetchGEETileUrl({ type: "vv", district: selectedDistrict })
      .then((res) => setVvTileUrl(res.tile_url))
      .catch((err) => { setVvTileUrl(null); setVvError(err.message); });
  }, [selectedDistrict, layers.vv]);

  /* ---------- LOAD VH TILE (GEE) ---------- */

  useEffect(() => {
    if (!selectedDistrict || !layers.vh) {
      setVhTileUrl(null);
      setVhError(null);
      return;
    }
    setVhError(null);
    fetchGEETileUrl({ type: "vh", district: selectedDistrict })
      .then((res) => setVhTileUrl(res.tile_url))
      .catch((err) => { setVhTileUrl(null); setVhError(err.message); });
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

{/* ---------- NDVI OVERLAY ---------- */}

{layers.ndvi && ndviData.length > 0 && (
  <>
    {ndviData.map((p, i) => (
      <CircleMarker
        key={`ndvi-${i}`}
        center={[p.lat, p.lng]}
        radius={4}
        pathOptions={{
          color: "transparent",
          fillColor: interpolateColor(NDVI_STOPS, p.norm),
          fillOpacity: overlayOpacity,
          weight: 0,
        }}
      >
        <Tooltip sticky>
          <span className="text-xs">NDVI: {p.value.toFixed(3)}</span>
        </Tooltip>
      </CircleMarker>
    ))}
  </>
)}

{/* ---------- EVI OVERLAY ---------- */}

{layers.evi && eviData.length > 0 && (
  <>
    {eviData.map((p, i) => (
      <CircleMarker
        key={`evi-${i}`}
        center={[p.lat, p.lng]}
        radius={4}
        pathOptions={{
          color: "transparent",
          fillColor: interpolateColor(NDVI_STOPS, p.norm),
          fillOpacity: overlayOpacity,
          weight: 0,
        }}
      >
        <Tooltip sticky>
          <span className="text-xs">EVI: {p.value.toFixed(3)}</span>
        </Tooltip>
      </CircleMarker>
    ))}
  </>
)}

{/* ---------- VV TILE (GEE Sentinel-1) ---------- */}

{layers.vv && vvTileUrl && (
  <TileLayer
    url={vvTileUrl}
    opacity={overlayOpacity}
    attribution="Sentinel-1 VV © Copernicus / Google Earth Engine"
  />
)}

{/* ---------- VH TILE (GEE Sentinel-1) ---------- */}

{layers.vh && vhTileUrl && (
  <TileLayer
    url={vhTileUrl}
    opacity={overlayOpacity}
    attribution="Sentinel-1 VH © Copernicus / Google Earth Engine"
  />
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