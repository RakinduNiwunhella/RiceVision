export default function FiltersPanel({ filters, setFilters }) {
  const districts = [
    "Kurunegala",
    "Anuradhapura",
    "Polonnaruwa",
    "Dambulla",
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
    <div className="w-72 bg-white rounded-xl shadow-sm p-4">
      <h2 className="font-semibold text-gray-800 mb-4">Filters</h2>

      {/* Districts */}
      <div className="mb-5">
        <p className="text-sm font-medium text-gray-600 mb-2">Districts</p>
        <div className="space-y-2 text-sm">
          {districts.map((d) => (
            <label key={d} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.districts.includes(d)}
                onChange={() => toggleArrayValue("districts", d)}
              />
              {d}
            </label>
          ))}
        </div>
      </div>

      {/* Season */}
      <div className="mb-5">
        <p className="text-sm font-medium text-gray-600 mb-2">Season</p>
        <select
          className="w-full border rounded-md px-2 py-1 text-sm"
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
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">Health Status</p>
        <div className="space-y-2 text-sm">
          {healthStatuses.map((s) => (
            <label key={s} className="flex items-center gap-2">
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
