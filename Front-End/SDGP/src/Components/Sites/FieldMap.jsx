import { useState, useEffect } from "react";
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
    paddyExtent: false,
    showCircles: false,
    showSatellite: false,
    showRoadOverlay: false,
    roadOpacity: 0.6,
  });

  const [nationalView, setNationalView] = useState(false);
  const [resetViewKey, setResetViewKey] = useState(0);

  /* =========================================================
     Auto disable data layers (but keep satellite intact)
  ========================================================= */

  useEffect(() => {
    if (filters.districts.length === 0 && !nationalView) {
      setLayers((prev) => ({
        ...prev,
        paddyExtent: false,
        showCircles: false,
        showRoads: false,
      }));
    }
  }, [filters.districts, nationalView]);

  /* =========================================================
     If user selects district → exit national mode
  ========================================================= */

  useEffect(() => {
    if (filters.districts.length > 0) {
      setNationalView(false);
    }
  }, [filters.districts]);

  return (
    <div className="relative flex gap-4 p-4 h-full">

      <FiltersPanel
        filters={filters}
        setFilters={setFilters}
        nationalView={nationalView}
        onNationalView={() => {
          setFilters({ districts: [], health: [] });

          setLayers((prev) => ({
            ...prev,
            paddyExtent: true,
            showCircles: true,
            showRoads: false,
          }));

          setNationalView(true);
          setResetViewKey(prev => prev + 1);
        }}
        onClearAll={() => {
          setFilters({ districts: [], health: [] });

          setLayers((prev) => ({
            ...prev,
            paddyExtent: false,
            showCircles: false,
            showRoads: false,
          }));

          setNationalView(false);
          setResetViewKey(prev => prev + 1);
        }}
      />

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
          resetViewKey={resetViewKey}
        />
      </div>

      <MapLayersPanel
        layers={layers}
        setLayers={setLayers}
        districtSelected={
          filters.districts.length > 0 || nationalView
        }
      />

    </div>
  );
}