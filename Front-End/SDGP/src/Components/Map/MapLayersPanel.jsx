export default function MapLayersPanel({ layers, setLayers, districtSelected }) {

const toggleLayer = (layer) => {
  setLayers((prev) => {
    // If selecting Satellite
    if (layer === "showSatellite") {
      return {
        ...prev,
        showSatellite: !prev.showSatellite,
        showRoads: false, // 🔥 turn off OSM when satellite selected
      };
    }

    // If selecting OpenStreet
    if (layer === "showRoads") {
      return {
        ...prev,
        showRoads: !prev.showRoads,
        showSatellite: false, // 🔥 turn off satellite
      };
    }

    // Normal layers
    return {
      ...prev,
      [layer]: !prev[layer],
    };
  });
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

      {[
  { key: "paddyExtent", label: "🌾 Paddy Extent" },
  { key: "showCircles", label: "📍 Field Health Markers" },
  { key: "showSatellite", label: "🛰 Satellite View" }, // 👈 ADD
  { key: "showRoads", label: "🛣 Show Roads & Labels" },
].map(({ key, label }) => (
        <div
          key={key}
          className={`flex items-center justify-between mb-3 ${
            !districtSelected ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <span className="text-gray-700 dark:text-gray-200">
            {label}
          </span>

          <button
            onClick={() => toggleLayer(key)}
            disabled={!districtSelected}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
              layers[key] ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                layers[key] ? "translate-x-5" : ""
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  );
}