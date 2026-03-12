import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Circle,
  GeoJSON,
  Tooltip,
  Popup,
  useMap,
} from "react-leaflet";
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

function districtToFile(district) {
  return district.replace(/\s+/g, "");
}

const SRI_LANKA_ZOOM = 7;

/* ---------- HEALTH COLOR ---------- */

function getHealthColor(health) {
  if (health === "Healthy" || health === "Normal") return "#22c55e";
  if (health === "Mild Stress") return "#facc15";
  if (health === "Severe Stress") return "#dc2626";
  if (health === "Not Applicable") return "#696969";
  return "#2563eb";
}

/* ---------- PEST RISK LABEL ---------- */

function getPestRiskLabel(level) {
  if (level === 0) return { text: "None", color: "#22c55e" };
  if (level === 1) return { text: "Low", color: "#facc15" };
  if (level === 2) return { text: "Medium", color: "#f97316" };
  if (level >= 3) return { text: "High", color: "#dc2626" };
  return { text: "N/A", color: "#9ca3af" };
}

function getDisasterColor(risk) {
  if (!risk) return "#9ca3af";
  const r = risk.toLowerCase();
  if (r === "low" || r === "none") return "#22c55e";
  if (r === "medium" || r === "moderate") return "#f97316";
  if (r === "high" || r === "severe") return "#dc2626";
  return "#9ca3af";
}

/* ---------- POINT POPUP ---------- */

function PointPopup({ p }) {
  const { isDark } = useTheme();
  const healthColor = getHealthColor(p.paddy_health);
  const pestInfo = getPestRiskLabel(p.pest_risk);
  const disasterColor = getDisasterColor(p.disaster_risk);

  const bg = isDark ? "#0f172a" : "#ffffff";
  const textPrimary = isDark ? "#f1f5f9" : "#0f172a";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const textMuted = isDark ? "#64748b" : "#94a3b8";
  const textValue = isDark ? "#e2e8f0" : "#1e293b";
  const border = isDark ? "#1e293b" : "#f1f5f9";
  const headerBorder = isDark ? "#334155" : "#e2e8f0";
  const sectionColor = isDark ? "#64748b" : "#94a3b8";

  const row = (label, value, unit = "", color = null) => {
    if (value == null || value === "") return null;
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "3px 0",
          borderBottom: `1px solid ${border}`,
        }}
      >
        <span style={{ color: textSecondary, fontSize: 11, fontWeight: 500 }}>
          {label}
        </span>
        <span
          style={{ fontWeight: 600, fontSize: 11, color: color || textValue }}
        >
          {value}
          {unit}
        </span>
      </div>
    );
  };

  return (
    <div
      style={{
        minWidth: 220,
        fontFamily: "'Inter', system-ui, sans-serif",
        lineHeight: 1.5,
        backgroundColor: bg,
        color: textPrimary,
        borderRadius: 12,
        margin: -10,
        marginBottom: -14,
        padding: "10px 14px",
      }}
    >
      {/* Header */}
      <div
        style={{
          borderBottom: `2px solid ${headerBorder}`,
          paddingBottom: 6,
          marginBottom: 6,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
          {p.district}
        </div>
        {p.date && (
          <div style={{ fontSize: 10, color: textMuted }}>{p.date}</div>
        )}
      </div>

      {/* Crop Status */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: sectionColor,
          marginBottom: 2,
          marginTop: 4,
        }}
      >
        Crop Status
      </div>
      {row("Health", p.paddy_health, "", healthColor)}
      {row("Growth Stage", p.stage)}
      {row("Season", p.season)}

      {/* Risk */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: sectionColor,
          marginBottom: 2,
          marginTop: 8,
        }}
      >
        Risk Assessment
      </div>
      {row("Pest Risk", pestInfo.text, "", pestInfo.color)}
      {row("Disaster Risk", p.disaster_risk || "N/A", "", disasterColor)}

      {/* Vegetation */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: sectionColor,
          marginBottom: 2,
          marginTop: 8,
        }}
      >
        Vegetation Indices
      </div>
      {row("NDVI", p.ndvi)}
      {row("EVI", p.evi)}

      {/* Weather */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: sectionColor,
          marginBottom: 2,
          marginTop: 8,
        }}
      >
        Weather
      </div>
      {row("Rainfall (7d)", p.rain_7d, " mm")}
      {row("Rainfall (14d)", p.rain_14d, " mm")}
      {row("Temperature", p.temp, " °C")}
      {row("Humidity", p.humidity, " %")}

      {/* Terrain */}
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: 1,
          color: sectionColor,
          marginBottom: 2,
          marginTop: 8,
        }}
      >
        Terrain
      </div>
      {row("Elevation", p.elevation, " m")}
      {row("Slope", p.slope, " °")}

      {/* Coordinates */}
      <div
        style={{
          marginTop: 8,
          fontSize: 9,
          color: textMuted,
          textAlign: "center",
        }}
      >
        {p.lat?.toFixed(5)}, {p.lng?.toFixed(5)}
      </div>
    </div>
  );
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

    fetch(`/${districtToFile(selectedDistrict)}.geojson`)
      .then((res) => res.json())
      .then(setPaddyGeo)
      .catch(console.error);
  }, [selectedDistrict, layers.paddyExtent]);

  /* ---------- LOAD DISTRICT BOUNDARY ---------- */

  useEffect(() => {
    setDistrictBoundary(null);

    if (!selectedDistrict) return;

    fetch(`/${districtToFile(selectedDistrict)}_District_Boundary.geojson`)
      .then((res) => res.json())
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
      .then((res) => setNdviTileUrl(res.tile_url))
      .catch(() => setNdviTileUrl(null));
  }, [selectedDistrict, layers.ndvi]);

  useEffect(() => {
    if (!selectedDistrict || !layers.evi) return setEviTileUrl(null);
    fetchGEETileUrl({ type: "evi", district: selectedDistrict })
      .then((res) => setEviTileUrl(res.tile_url))
      .catch(() => setEviTileUrl(null));
  }, [selectedDistrict, layers.evi]);

  useEffect(() => {
    if (!selectedDistrict || !layers.vv) return setVvTileUrl(null);
    fetchGEETileUrl({ type: "vv", district: selectedDistrict })
      .then((res) => setVvTileUrl(res.tile_url))
      .catch(() => setVvTileUrl(null));
  }, [selectedDistrict, layers.vv]);

  useEffect(() => {
    if (!selectedDistrict || !layers.vh) return setVhTileUrl(null);
    fetchGEETileUrl({ type: "vh", district: selectedDistrict })
      .then((res) => setVhTileUrl(res.tile_url))
      .catch(() => setVhTileUrl(null));
  }, [selectedDistrict, layers.vh]);

  /* ---------- FETCH ML POINTS ---------- */

  useEffect(() => {
    if (!selectedDistrict || !layers.showCircles) {
      setPoints([]);
      return;
    }

    let cancelled = false;

    const loadPoints = async () => {
      try {
        const result = await fetchMapFields({
          districts: [selectedDistrict],
          health: selectedHealth,
        });

        console.log(`[MAP] Backend count: ${result.count}`);
        console.log(`[MAP] Data array length: ${result.data.length}`);
        const valid = result.data.filter((p) => p.lat != null && p.lng != null);
        console.log(`[MAP] Valid points (non-null lat/lng): ${valid.length}`);
        if (valid.length !== result.data.length) {
          console.warn(
            `[MAP] ${result.data.length - valid.length} points dropped due to null lat/lng`,
          );
        }

        if (!cancelled) setPoints(valid);
      } catch (err) {
        if (!cancelled) {
          console.error(err);
          setPoints([]);
        }
      }
    };

    loadPoints();

    return () => {
      cancelled = true;
    };
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
          key={`cluster-${selectedDistrict}-${selectedHealth.join(",")}-${points.length}`}
          disableClusteringAtZoom={10}
          spiderfyOnMaxZoom={false}
          showCoverageOnHover={false}
          maxClusterRadius={30}
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
            >
              <Popup
                maxWidth={280}
                className={`point-popup ${isDark ? "point-popup-dark" : ""}`}
              >
                <PointPopup p={p} />
              </Popup>
            </CircleMarker>
          ))}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
}
