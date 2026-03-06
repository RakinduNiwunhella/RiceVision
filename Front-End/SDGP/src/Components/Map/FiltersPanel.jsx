export default function FiltersPanel({ filters, setFilters }) {
  // Alphabetically sorted district list
  const districts = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Moneragala",
    "Mullaitivu",
    "NuwaraEliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
  ];

  const healthStatuses = ["Healthy", "Stressed", "Damaged"];

  const toggleArrayValue = (key, value) => {
    setFilters((prev) => {
      const exists = prev[key].includes(value);
      return {
        ...prev,
        [key]: exists
          ? prev[key].filter((v) => v !== value)
          : [...prev[key], value],
      };
    });
  };

  return (
    <div className="w-full lg:w-80 glass p-6 overflow-y-auto max-h-[calc(100vh-6rem)] shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/50">Filters</h2>
        <button
          className="text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-emerald-400 transition"
          onClick={() => setFilters({ districts: [], season: "all", health: [] })}
        >
          Reset All
        </button>
      </div>

      {/* District (Single Selection) */}
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">District Selection</p>
        <div className="space-y-1 text-sm max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {districts.map((d) => (
            <label
              key={d}
              className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-white/10 border border-transparent hover:border-white/10 transition cursor-pointer"
            >
              <span className="text-white/80 group-hover:text-white transition">{d}</span>
              <input
                type="radio"
                name="district"
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
                checked={filters.districts[0] === d}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    districts: [d],
                  }))
                }
              />
            </label>
          ))}
        </div>
      </div>

      {/* Season */}
      <div className="mb-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">Growing Season</p>
        <div className="relative">
          <select
            className="w-full appearance-none rounded-xl px-4 py-2.5 text-sm bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 hover:bg-white/15 transition cursor-pointer shadow-inner"
            value={filters.season}
            onChange={(e) => setFilters((prev) => ({ ...prev, season: e.target.value }))}
          >
            <option value="all" className="bg-slate-900">All Seasons</option>
            <option value="maha" className="bg-slate-900">Maha</option>
            <option value="yala" className="bg-slate-900">Yala</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
            <span className="material-symbols-outlined text-lg">expand_more</span>
          </div>
        </div>
      </div>

      {/* Health Status */}
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/40 mb-3">Crop Condition</p>
        <div className="grid grid-cols-1 gap-2">
          {healthStatuses.map((s) => (
            <label
              key={s}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition cursor-pointer"
            >
              <span className="text-sm font-medium text-white/90">{s}</span>
              <input
                type="checkbox"
                className="w-4 h-4 rounded-lg accent-emerald-500 cursor-pointer"
                checked={filters.health.includes(s)}
                onChange={() => toggleArrayValue("health", s)}
              />
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}