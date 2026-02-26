import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import FiltersPanel from "../Map/FiltersPanel";
import MapLayersPanel from "../Map/MapLayersPanel";
import RiceMap from "../Map/RiceMap";

export default function FieldMap() {
  const { isDark } = useOutletContext();

  const [filters, setFilters] = useState({
    districts: [],
    health: [],
  });

  const [layers, setLayers] = useState({
    paddyExtent: true,
    showCircles: true,
    showRoads: false,
  });

  return (
    <div className="relative flex gap-4 p-4 h-screen">

      <FiltersPanel filters={filters} setFilters={setFilters} />

      <div className="relative flex-1 bg-gray-200 dark:bg-gray-800 rounded-xl overflow-hidden shadow-md">
        
        <div className="absolute top-4 left-4 z-[1000] bg-white dark:bg-gray-900 px-4 py-2 rounded-xl shadow-md">
          <p className="text-sm font-semibold text-green-600">
            🟢 Live Data – Updated Recently
          </p>
        </div>

        <RiceMap
          filters={filters}
          layers={layers}
          isDark={isDark}
        />
      </div>

      <MapLayersPanel layers={layers} setLayers={setLayers} />
    </div>
  );
}