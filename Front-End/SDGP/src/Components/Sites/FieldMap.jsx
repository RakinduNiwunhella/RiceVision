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
    showCircles: false,
    ndvi: false,
    evi: false,
    vv: false,
    vh: false,
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-3rem)] -mx-6 -mt-6 p-6">
      <div className="flex flex-col gap-6 w-full lg:w-auto">
        <FiltersPanel filters={filters} setFilters={setFilters} />
      </div>

      <div className="flex-1 rounded-3xl overflow-hidden glass border-white/20 shadow-2xl min-h-[500px]">
        <RiceMap filters={filters} layers={layers} />
      </div>

      <div className="flex flex-col gap-6 w-full lg:w-auto">
        <MapLayersPanel layers={layers} setLayers={setLayers} />
      </div>
    </div>
  );
}