export default function MapLayersPanel({ layers, setLayers }) {

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

      {[
        { key: "paddyExtent", label: "🌾 Paddy Extent" },
        { key: "showCircles", label: "📍 Field Health Markers" },
        { key: "showRoads", label: "🛣 Show Roads & Labels" },
      ].map(({ key, label }) => (
        <div key={key} className="flex items-center justify-between mb-3">
          <span className="text-gray-700 dark:text-gray-200">
            {label}
          </span>

          <button
            onClick={() => toggleLayer(key)}
            className={`w-10 h-5 flex items-center rounded-full p-1 transition ${
              layers[key] ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                layers[key] ? "translate-x-5" : ""
              }` }
            />
          </button>
        </div>
      ))}
    </div>
  );
}