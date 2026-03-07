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
    { key: "ndvi", label: "NDVI", tag: "S2" },
    { key: "evi",  label: "EVI",  tag: "S2" },
    { key: "vv",   label: "VV",   tag: "S1" },
    { key: "vh",   label: "VH",   tag: "S1" },
  ];

  // Show the overlay opacity + legend block when any index layer is ON
  const anyIndexActive = layers.ndvi || layers.evi || layers.vv || layers.vh;

  // Colour legend data (matches RiceMap OVERLAY_META)
  const LEGEND_ITEMS = [
    {
      key: "ndvi",
      label: "NDVI",
      gradient: "linear-gradient(to right, #7f2700, #d4a017, #aaff44, #228b22, #004d00)",
      min: "-0.2",
      max: "0.9",
    },
    {
      key: "evi",
      label: "EVI",
      gradient: "linear-gradient(to right, #7f2700, #d4a017, #aaff44, #228b22, #004d00)",
      min: "-0.2",
      max: "0.9",
    },
    {
      key: "vv",
      label: "VV (dB)",
      gradient: "linear-gradient(to right, #000080, #0000ff, #00ffff, #ffff00, #ff0000)",
      min: "-25",
      max: "0",
    },
    {
      key: "vh",
      label: "VH (dB)",
      gradient: "linear-gradient(to right, #000080, #0000ff, #00ffff, #ffff00, #ff0000)",
      min: "-30",
      max: "-5",
    },
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

        {layerList.map(({ key, label, tag }) => (
          <div key={key}>

            <div
              onClick={() => districtSelected && toggleLayer(key)}
              className="group flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/90">{label}</span>
                {tag && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-white/10 text-white/40 tracking-wider">
                    {tag}
                  </span>
                )}
              </div>

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

      {/* ── Overlay opacity + colour legends ──────────────────────────── */}

      {anyIndexActive && (
        <div className="mt-6 pt-5 border-t border-white/10 space-y-5">

          {/* Opacity slider */}
          <div>
            <div className="flex justify-between text-[10px] text-white/40 font-bold uppercase tracking-widest mb-2">
              <span>Overlay Opacity</span>
              <span>{Math.round((layers.overlayOpacity ?? 0.75) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={layers.overlayOpacity ?? 0.75}
              onChange={(e) =>
                setLayers((prev) => ({
                  ...prev,
                  overlayOpacity: parseFloat(e.target.value),
                }))
              }
              className="w-full accent-emerald-500"
            />
          </div>

          {/* Colour legend for each active index */}
          {LEGEND_ITEMS.filter((l) => layers[l.key]).map((l) => (
            <div key={l.key}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-1.5">
                {l.label}
              </p>
              <div
                className="h-3 w-full rounded-full"
                style={{ background: l.gradient }}
              />
              <div className="flex justify-between text-[9px] text-white/30 mt-1">
                <span>{l.min}</span>
                <span>{l.max}</span>
              </div>
            </div>
          ))}

        </div>
      )}

      <div className="mt-8 pt-6 border-t border-white/10">
        <p className="text-[10px] text-white/40 italic">
          Select layers to overlay specialized agricultural satellite telemetry.
        </p>
        <p className="text-[9px] text-white/25 mt-1">
          S2 = Sentinel-2 optical · S1 = Sentinel-1 SAR
        </p>
      </div>

    </div>
  );
}