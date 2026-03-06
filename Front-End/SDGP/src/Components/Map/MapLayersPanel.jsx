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
    <div className="w-full lg:w-72 glass p-6 shadow-xl">
      <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-6">Map Layers</h2>

      <div className="space-y-2">
        {layerList.map(({ key, label }) => (
          <div
            key={key}
            onClick={() => toggleLayer(key)}
            className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition cursor-pointer"
          >
            <span className="text-sm font-medium text-white/90 group-hover:text-white">{label}</span>
            <div className={`relative w-8 h-4 rounded-full transition-colors duration-300 ${layers[key] ? 'bg-emerald-500' : 'bg-white/10'}`}>
              <div
                className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${layers[key] ? 'translate-x-4' : 'translate-x-0'}`}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-[10px] text-white/40 leading-relaxed italic">
          Select layers to overlay specialized agricultural satellite telemetry on the current field view.
        </p>
      </div>
    </div>
  );
}