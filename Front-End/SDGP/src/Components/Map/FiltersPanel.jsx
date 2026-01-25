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
    <div className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Filters</h2>

      {/* District (Single Selection) */}
      <div className="mb-9">
        <p className="text-base font-medium text-gray-600 dark:text-gray-300 mb-2">District</p>
        <div className="space-y-2 text-base max-h-64 overflow-y-auto">
          {districts.map((d) => (
            <label key={d} className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <input
                type="radio"
                name="district"
                checked={filters.districts[0] === d}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    districts: [d], // enforce single district
                  }))
                }
              />
              {d}
            </label>
          ))}

          {/* Clear district */}
          <button
            className="text-sm text-blue-600 dark:text-blue-400 mt-2"
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                districts: [],
              }))
            }
          >
            Clear district
          </button>
        </div>
      </div>

      {/* Season */}
      <div className="mb-9">
        <p className="text-base font-medium text-gray-600 mb-2">Season</p>
        <select
          className="w-full border rounded-md px-2 py-1 text-base bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
          value={filters.season}
          onChange={(e) =>
            setFilters((prev) => ({ ...prev, season: e.target.value }))
          }
        >
          <option value="all">All seasons</option>
          <option value="maha">Maha</option>
          <option value="yala">Yala</option>
        </select>
      </div>

      {/* Health Status */}
      <div className="mb-9">
        <p className="text-base font-medium text-gray-600 mb-2">Health Status</p>
        <div className="space-y-2 text-base">
          {healthStatuses.map((s) => (
            <label key={s} className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
              <input
                type="checkbox"
                checked={filters.health.includes(s)}
                onChange={() => toggleArrayValue("health", s)}
              />
              {s}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
