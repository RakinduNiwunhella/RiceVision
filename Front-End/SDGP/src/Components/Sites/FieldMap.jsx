import { useState } from "react";
import FiltersPanel from "../Map/FiltersPanel";
import MapLayersPanel from "../Map/MapLayersPanel";
import RiceMap from "../Map/RiceMap";

export default function FieldMap() {
  const [filters, setFilters] = useState({
    districts: [],
    season: "all",
    health: [],
  });

  const [layers, setLayers] = useState({
      paddyExtent: false,

    ndvi: false,
    evi: false,
    vv: false,
    vh: false,
  });

  return (
    <div className="relative flex gap-4 p-4 h-screen bg-gray-100">
      <FiltersPanel filters={filters} setFilters={setFilters} />

      <div className="flex-1 bg-gray-200 rounded-xl overflow-hidden">
        <RiceMap filters={filters} layers={layers} />
      </div>

      <MapLayersPanel layers={layers} setLayers={setLayers} />
    </div>
  );
}
