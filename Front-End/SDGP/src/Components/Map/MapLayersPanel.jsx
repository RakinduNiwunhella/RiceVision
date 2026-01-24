export default function MapLayersPanel({ layers, setLayers }) {
  const toggleLayer = (layer) => {
    setLayers((prev) => ({
      ...prev,
      [layer]: !prev[layer],
    }));
  };

  const layerList = [
    { key: "paddyExtent", label: "Paddy Extent" },
    { key: "ndvi", label: "NDVI" },
    { key: "evi", label: "EVI" },
    { key: "vv", label: "VV" },
    { key: "vh", label: "VH" },
  ];

  return (
    <div className="w-72 bg-white rounded-xl shadow-sm p-4">
      <h2 className="font-semibold text-gray-800 mb-4">Map Layers</h2>

      {layerList.map(({ key, label }) => (
        <div
          key={key}
          className="flex items-center justify-between text-sm mb-2"
        >
          <span>{label}</span>
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
