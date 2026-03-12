import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import FiltersPanel from "../Map/FiltersPanel";
import MapLayersPanel from "../Map/MapLayersPanel";
import RiceMap from "../Map/RiceMap";

/* Normalize health values so they match checkbox labels exactly */
function normalizeHealth(value) {
  if (!value) return null;

  const v = value.trim().toLowerCase();

  if (v === "healthy") return "Healthy";
  if (v === "normal") return "Normal";
  if (v === "mild stress") return "Mild Stress";
  if (v === "severe stress") return "Severe Stress";
  if (v === "not applicable") return "Not Applicable";

  return null;
}

export default function FieldMap() {
  const location = useLocation();
  const state = location.state || {};

  /* Used to zoom map to alert location */
  const flyTo = state?.type ? state : null;

  /* Filters state */
  const [filters, setFilters] = useState({
    districts: [],
    season: "all",
    health: [],
  });

  /* Map layers state */
  const [layers, setLayers] = useState({
    paddyExtent: false,
    showCircles: false,
    showSatellite: false,
    showRoadOverlay: false,
    roadOpacity: 0.6,
    ndvi: false,
    evi: false,
    vv: false,
    vh: false,
    overlayOpacity: 0.75,
  });

  /* Sync filters when arriving from Alerts page */
  useEffect(() => {
    if (!state) return;

    const normalizedHealth = normalizeHealth(state.health);

    setFilters((prev) => ({
      ...prev,
      districts: state.district ? [state.district] : prev.districts,
      health: normalizedHealth ? [normalizedHealth] : prev.health,
    }));

  }, [state?.district, state?.health]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 min-h-[calc(100vh-4rem)] p-3 sm:p-6">

      {/* Filters Panel */}
      <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-auto">
        <FiltersPanel filters={filters} setFilters={setFilters} />
      </div>

      {/* Map */}
      <div className="flex-1 rounded-2xl sm:rounded-3xl overflow-hidden glass border-white/20 shadow-2xl h-[50vh] sm:h-[60vh] md:h-[65vh] lg:h-[80vh]">
        <RiceMap
          filters={filters}
          layers={layers}
          flyTo={flyTo}
        />
      </div>

      {/* Map Layers */}
      <div className="flex flex-col gap-4 sm:gap-6 w-full lg:w-auto">
        <MapLayersPanel
          layers={layers}
          setLayers={setLayers}
          districtSelected={filters.districts.length > 0}
        />
      </div>

    </div>
  );
}