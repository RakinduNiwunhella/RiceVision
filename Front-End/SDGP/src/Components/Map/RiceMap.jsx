import { MapContainer, TileLayer, CircleMarker, Circle, GeoJSON, Tooltip, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { fetchMapFields, fetchGEETileUrl } from "../../api/api";
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

  if (health === "Healthy" || health === "Normal") return "#22c55e";      // bright green
  if (health === "Mild Stress") return "#facc15";  // yellow
  if (health === "Severe Stress") return "#dc2626"; // red
  if (health === "Not Applicable") return "#696969"; // ash color

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

  // Pest risk — one small circle per risky pixel
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

  // Disaster — circular zone centred on the event location
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

  const [points, setPoints] = useState([]);
  const [paddyGeo, setPaddyGeo] = useState(null);
  const [districtBoundary, setDistrictBoundary] = useState(null);

  // GEE tile URLs for all overlays (Sentinel-2 NDVI/EVI + Sentinel-1 VV/VH)
  const [ndviTileUrl, setNdviTileUrl] = useState(null);
  const [eviTileUrl,  setEviTileUrl]  = useState(null);
  const [ndviError,   setNdviError]   = useState(null);
  const [eviError,    setEviError]    = useState(null);
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

  /* ---------- LOAD NDVI TILE (GEE Sentinel-2) ---------- */

  useEffect(() => {
    if (!selectedDistrict || !layers.ndvi) {
      setNdviTileUrl(null);
      setNdviError(null);
      return;
    }
    setNdviError(null);
    fetchGEETileUrl({ type: "ndvi", district: selectedDistrict })
      .then((res) => setNdviTileUrl(res.tile_url))
      .catch((err) => { setNdviTileUrl(null); setNdviError(err.message); });
  }, [selectedDistrict, layers.ndvi]);

  /* ---------- LOAD EVI TILE (GEE Sentinel-2) ---------- */

  useEffect(() => {
    if (!selectedDistrict || !layers.evi) {
      setEviTileUrl(null);
      setEviError(null);
      return;
    }
    setEviError(null);
    fetchGEETileUrl({ type: "evi", district: selectedDistrict })
      .then((res) => setEviTileUrl(res.tile_url))
      .catch((err) => { setEviTileUrl(null); setEviError(err.message); });
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
        let data = await fetchMapFields({
          districts: [selectedDistrict],
          health: selectedHealth,
        });

        // defensive client-side filtering: ensure only the chosen
        // health status is shown, since backend filtering may sometimes
        // misfire or be case-sensitive.
        if (selectedHealth && selectedHealth.length === 1) {
          const wanted = selectedHealth[0].toLowerCase();
          data = data.filter(
            (p) => String(p.paddy_health).toLowerCase() === wanted
          );
        }

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

{/* ---------- FLY-TO (alert navigation) ---------- */}
<FlyToController flyTo={flyTo} />
<AlertMarker flyTo={flyTo} />

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

{/* ---------- NDVI TILE (GEE Sentinel-2) ---------- */}

{layers.ndvi && ndviTileUrl && (
  <TileLayer
    url={ndviTileUrl}
    opacity={overlayOpacity}
    attribution="Sentinel-2 NDVI © Copernicus / Google Earth Engine"
  />
)}

{/* ---------- EVI TILE (GEE Sentinel-2) ---------- */}

{layers.evi && eviTileUrl && (
  <TileLayer
    url={eviTileUrl}
    opacity={overlayOpacity}
    attribution="Sentinel-2 EVI © Copernicus / Google Earth Engine"
  />
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
  iconCreateFunction={(cluster) => {

    const markers = cluster.getAllChildMarkers();
    const selectedFilter = filters.health?.[0];   // current filter

    let healthy = 0;
    let mild = 0;
    let severe = 0;

    markers.forEach(m => {

      const health = m.options.health;

      if (health === "Healthy" || health === "Normal") healthy++;
      else if (health === "Mild Stress") mild++;
      else if (health === "Severe Stress") severe++;

    });

    const total = markers.length;

    /* ------------------------------
       CASE 1: SPECIFIC FILTER ACTIVE
       ------------------------------ */

    if (selectedFilter) {

      const color = getHealthColor(selectedFilter);

      return L.divIcon({
        html: `
          <div style="
            background:${color};
            width:40px;
            height:40px;
            border-radius:50%;
            display:flex;
            align-items:center;
            justify-content:center;
            color:white;
            font-weight:bold;
            border:2px solid white;
          ">
            ${cluster.getChildCount()}
          </div>
        `,
        className: "cluster-health",
        iconSize: L.point(40,40)
      });

    }

    /* ------------------------------
       CASE 2: ALL SELECTED
       MIXED COLOR GRADIENT
       ------------------------------ */

    const healthyPct = (healthy / total) * 100;
    const mildPct = (mild / total) * 100;
    const severePct = (severe / total) * 100;

    const gradient = `
      conic-gradient(
        #22c55e 0% ${healthyPct}%,
        #facc15 ${healthyPct}% ${healthyPct + mildPct}%,
        #dc2626 ${healthyPct + mildPct}% 100%
      )
    `;

    return L.divIcon({
      html: `
        <div style="
          background:${gradient};
          width:40px;
          height:40px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
          color:white;
          font-weight:bold;
          border:2px solid white;
        ">
          ${cluster.getChildCount()}
        </div>
      `,
      className: "cluster-health",
      iconSize: L.point(40,40)
    });

  }}
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
  ref={(ref) => {
    if (ref) ref.options.health = p.paddy_health;
  }}
/>
))}
</MarkerClusterGroup>
)}

</MapContainer>

  );
}