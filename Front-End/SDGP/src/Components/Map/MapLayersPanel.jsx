export default function MapLayersPanel({ layers, setLayers, districtSelected }) {

  const toggleLayer = (layer) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  return (
    <div className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        View Options
      </h2>

      {!districtSelected && (
        <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          🔒 Select a district to enable view options
        </div>
      )}

      {/* Paddy Extent */}
      <div className="flex items-center justify-between mb-3">
        <span>🌾 Paddy Extent</span>
        <button
          onClick={() => toggleLayer("paddyExtent")}
          disabled={!districtSelected}
          className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
            layers.paddyExtent ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
              layers.paddyExtent ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Field Health Markers */}
      <div className="flex items-center justify-between mb-3">
        <span>📍 Field Health Markers</span>
        <button
          onClick={() => toggleLayer("showCircles")}
          disabled={!districtSelected}
          className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
            layers.showCircles ? "bg-green-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
              layers.showCircles ? "translate-x-5" : ""
            }`}
          />
        </button>
      </div>

      {/* Satellite */}
      <div className="mb-3">
        <div className="flex items-center justify-between">
          <span>🛰 Satellite View</span>
          <button
            onClick={() => toggleLayer("showSatellite")}
            disabled={!districtSelected}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
              layers.showSatellite ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                layers.showSatellite ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>

        {/* Dropdown */}
        {layers.showSatellite && (
          <div className="mt-3 ml-4 border-l border-gray-300 pl-4 space-y-3">

            {/* Roads toggle */}
            <div className="flex items-center justify-between">
              <span className="text-sm">🛣 Roads & Labels</span>
              <button
                onClick={() => toggleLayer("showRoads")}
                className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
                  layers.showRoads ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                    layers.showRoads ? "translate-x-5" : ""
                  }`}
                />
              </button>
            </div>

            {/* Opacity slider */}
            {layers.showRoads && (
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400">
                  Opacity
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={layers.roadOpacity}
                  onChange={(e) =>
                    setLayers(prev => ({
                      ...prev,
                      roadOpacity: parseFloat(e.target.value),
                    }))
                  }
                  className="w-full"
                />
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
}