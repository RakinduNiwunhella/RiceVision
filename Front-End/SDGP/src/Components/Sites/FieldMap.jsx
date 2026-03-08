import { useState } from "react";
import { useLocation } from "react-router-dom";
import FiltersPanel from "../Map/FiltersPanel";
import MapLayersPanel from "../Map/MapLayersPanel";
import RiceMap from "../Map/RiceMap";

export default function FieldMap() {
  const { state } = useLocation();
  const flyTo = state?.type ? state : null;

  // Auto-select district and crop condition from navigation state
  const initialDistrict = state?.district ? [state.district] : [];
  const initialHealth   = state?.health   ? [state.health]   : [];

  const [filters, setFilters] = useState({
    districts: initialDistrict,
    season: "all",
    health: initialHealth,
  });

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

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-4rem)] p-6">
      <div className="flex flex-col gap-6 w-full lg:w-auto">
        <FiltersPanel filters={filters} setFilters={setFilters} />
      </div>

      <div className="flex-1 rounded-3xl overflow-hidden glass border-white/20 shadow-2xl h-[80vh]">
        <RiceMap filters={filters} layers={layers} flyTo={flyTo} />
      </div>

      <div className="flex flex-col gap-6 w-full lg:w-auto">
        <MapLayersPanel
  layers={layers}
  setLayers={setLayers}
  districtSelected={filters.districts.length > 0}
/>
      </div>
    </div>
  );
}