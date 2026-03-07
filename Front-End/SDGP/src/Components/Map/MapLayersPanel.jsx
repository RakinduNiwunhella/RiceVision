export default function MapLayersPanel({ layers, setLayers, districtSelected }) {

  const toggleLayer = (layer) => {
    setLayers((prev) => {

      const updated = {
        ...prev,
        [layer]: !prev[layer],
      };

      // If satellite is turned OFF → disable road overlay
      if (layer === "showSatellite" && prev.showSatellite === true) {
        updated.showRoadOverlay = false;
      }

      return updated;
    });
  };

  const layerList = [
    { key: "paddyExtent", label: "Paddy Extent" },
    { key: "showCircles", label: "Show Circles" },
    { key: "showSatellite", label: "Satellite View" },
    { key: "ndvi", label: "NDVI" },
    { key: "evi", label: "EVI" },
    { key: "vv", label: "VV" },
    { key: "vh", label: "VH" },
  ];

  return (
    <div className="w-full lg:w-72 glass p-6 shadow-xl">

      <h2 className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-6">
        Map Layers
      </h2>

      {!districtSelected && (
        <div className="mb-4 text-xs text-white/40 italic">
          🔒 Select a district to enable map layers
        </div>
      )}

      <div className="space-y-2">

        {layerList.map(({ key, label }) => (
          <div key={key}>

            <div
              onClick={() => districtSelected && toggleLayer(key)}
              className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              <span className="text-sm text-white/90">{label}</span>

              <div
                className={`relative w-8 h-4 rounded-full ${
                  layers[key] ? "bg-emerald-500" : "bg-white/10"
                }`}
              >
                <div
                  className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                    layers[key] ? "translate-x-4" : ""
                  }`}
                />
              </div>
            </div>

            {/* Road overlay under Satellite */}

            {key === "showSatellite" && layers.showSatellite && (
              <div className="ml-4 mt-3 border-l border-white/10 pl-4 space-y-3">

                <div
                  onClick={() => toggleLayer("showRoadOverlay")}
                  className="flex items-center justify-between text-sm cursor-pointer"
                >
                  <span className="text-white/70">Road Overlay</span>

                  <div
                    className={`relative w-8 h-4 rounded-full ${
                      layers.showRoadOverlay ? "bg-emerald-500" : "bg-white/10"
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform ${
                        layers.showRoadOverlay ? "translate-x-4" : ""
                      }`}
                    />
                  </div>
                </div>

                {layers.showRoadOverlay && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={layers.roadOpacity}
                    onChange={(e) =>
                      setLayers((prev) => ({
                        ...prev,
                        roadOpacity: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-emerald-500"
                  />
                )}

              </div>
            )}

          </div>
        ))}

      </div>

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-[10px] text-white/40 italic">
          Select layers to overlay specialized agricultural satellite telemetry.
        </p>
      </div>

    </div>
  );
}