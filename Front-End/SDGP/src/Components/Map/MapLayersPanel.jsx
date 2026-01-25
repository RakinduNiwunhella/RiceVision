export default function MapLayersPanel({ layers, setLayers }) {
  const toggleLayer = (layer) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const layerList = [
    { key: "paddyExtent", label: "Paddy Extent" },
    { key: "showCircles", label: "Show Circles" }, // ✅ NEW
    { key: "ndvi", label: "NDVI" },
    { key: "evi", label: "EVI" },
    { key: "vv", label: "VV" },
    { key: "vh", label: "VH" },
  ];

  return (
    <div className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Map Layers</h2>

      {layerList.map(({ key, label }) => (
        <div
          key={key}
          className="flex items-center justify-between text-base mb-2 text-gray-700 dark:text-gray-200"
        >
          <span className="text-gray-700 dark:text-gray-200">{label}</span>
          <input
            type="checkbox"
            checked={layers[key]}
            onChange={() => toggleLayer(key)}
          />
        </div>
      ))}
    </div>
  );
}
