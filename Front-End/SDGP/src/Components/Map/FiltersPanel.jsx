import { useRef, useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { translateHealthCategory, HEALTH_FILTER_VALUES } from "../../utils/agriTranslations";
import { translateDistrictName, getCanonicalDistrictName } from "../../utils/locationTranslations";

export default function FiltersPanel({ filters, setFilters }) {
  const { t, language } = useLanguage();
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [districtQuery, setDistrictQuery] = useState("");
  const selectedDistrictRef = useRef(null);

  useEffect(() => {
    if (selectedDistrictRef.current) {
      selectedDistrictRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [filters.districts]);

  useEffect(() => {
    const selected = filters.districts[0];
    setDistrictQuery(selected ? translateDistrictName(selected, language) : "");
  }, [filters.districts, language]);

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
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
  ];

  // Use imported HEALTH_FILTER_VALUES constant instead of local definition
  const healthStatuses = HEALTH_FILTER_VALUES;

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="md:hidden fixed top-20 left-4 z-[1000] bg-emerald-500 text-white p-3 rounded-full shadow-lg"
      >
        <span className="material-symbols-outlined">filter_list</span>
      </button>

      <div
        className={`${open ? "block" : "hidden"} md:block fixed md:relative top-0 left-0 h-full md:h-auto w-72 md:w-80 glass p-4 sm:p-6 overflow-y-auto shadow-xl transition-transform duration-300 z-[999] md:translate-x-0`}
      >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-white/85">
          {t("mapFiltersTitle")}
        </h2>

        {filters.districts.length > 0 && (
          <button
            className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                districts: [],
              }))
            }
          >
            {t("mapClearBtn")}
          </button>
        )}
      </div>

      {/* District (Searchable Dropdown) */}
      <div className="mb-8 relative">
        <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/85 mb-3">
          {t("mapDistrictLabel")}
        </p>

        <input
          type="text"
          placeholder={t("mapSearchDistrictPlaceholder")}
          value={districtQuery}
          onChange={(e) => setDistrictQuery(e.target.value)}
          onFocus={() => setDropdownOpen(true)}
          className="w-full px-4 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-white/85 focus:outline-none focus:border-emerald-400 focus:bg-white/10 transition"
        />

        {/* Dropdown list */}
        {dropdownOpen && (
          <div
            className="relative w-full mt-2 max-h-64 overflow-y-auto custom-scrollbar rounded-xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl z-[9999] ring-1 ring-white/10 animate-in fade-in zoom-in-95"
            style={{ position: "relative" }}
          >
            {districts
              .filter((d) => {
                const q = districtQuery.trim().toLowerCase();
                if (!q) return true;
                return (
                  d.toLowerCase().includes(q) ||
                  translateDistrictName(d, language).toLowerCase().includes(q)
                );
              })
              .map((d) => (
                <div
                  key={d}
                  onClick={() => {
                    const canonical = getCanonicalDistrictName(d);
                    setFilters((prev) => ({
                      ...prev,
                      districts: [canonical],
                    }));
                    setDistrictQuery(translateDistrictName(canonical, language));
                    setDropdownOpen(false);
                  }}
                  className={`px-4 py-3 text-sm cursor-pointer transition-all duration-200 hover:bg-white/20 active:scale-[0.98] ${
                    filters.districts[0] === d
                      ? "bg-emerald-500/25 text-emerald-300 shadow-inner"
                      : "text-white/85"
                  }`}
                >
                  {translateDistrictName(d, language)}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Health Status */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/85">
            {t("mapCropConditionLabel")}
          </p>
          {/* clear all by selecting 'All' or using button */}
          {filters.health.length > 0 && (
            <button
              className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 hover:text-emerald-300"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  health: [],
                }))
              }
            >
              {t("mapClearBtn")}
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 gap-2">
          {/* explicit "All statuses" option */}
          <label className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition cursor-pointer">
            <span className="text-sm font-medium text-white/90">{t("mapAllStatuses")}</span>
            <input
              type="radio"
              name="health"
              className="w-4 h-4 accent-emerald-500 cursor-pointer"
              value=""
              checked={filters.health.length === 0}
              onChange={() =>
                setFilters((prev) => ({
                  ...prev,
                  health: [],
                }))
              }
            />
          </label>
          {healthStatuses.map((s) => (
            <label
              key={s}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition cursor-pointer"
            >
              <span className="text-sm font-medium text-white/90">{translateHealthCategory(s, t)}</span>
              <input
                type="radio"
                name="health"
                className="w-4 h-4 accent-emerald-500 cursor-pointer"
                value={s}
                checked={filters.health[0] === s}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    health: [s],
                  }))
                }
              />
            </label>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-white/85 mb-3">
            {t("mapLegendLabel")}
          </p>
          <div className="space-y-2">
            {[
              { color: "#22c55e", label: "Normal" },
              { color: "#eab308", label: "Mild Stress" },
              { color: "#ef4444", label: "Severe Stress" },
              { color: "#9ca3af", label: "Not Applicable" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[11px] text-white/85">{translateHealthCategory(label, t)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
