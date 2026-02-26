export default function FiltersPanel({ filters, setFilters }) {
  const districts = [
    "Ampara","Anuradhapura","Badulla","Batticaloa","Colombo",
    "Galle","Gampaha","Hambantota","Jaffna","Kalutara",
    "Kandy","Kegalle","Kilinochchi","Kurunegala","Mannar",
    "Matale","Matara","Moneragala","Mullaitivu","NuwaraEliya",
    "Polonnaruwa","Puttalam","Ratnapura","Trincomalee","Vavuniya",
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
    <div className="w-72 bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        Filters
      </h2>

      {/* District */}
      <div className="mb-8">
        <p className="text-base font-medium text-gray-600 dark:text-gray-300 mb-2">
          District
        </p>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {districts.map((d) => (
            <label key={d} className="flex items-center gap-2">
              <input
                type="radio"
                name="district"
                checked={filters.districts[0] === d}
                onChange={() =>
                  setFilters((prev) => ({
                    ...prev,
                    districts: [d],
                  }))
                }
              />
              <span className="text-gray-700 dark:text-gray-200">{d}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Health */}
      <div>
        <p className="text-base font-medium text-gray-600 dark:text-gray-300 mb-2">
          Health Status
        </p>

        <div className="space-y-2">
          {healthStatuses.map((s) => (
            <label key={s} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={filters.health.includes(s)}
                onChange={() => toggleArrayValue("health", s)}
              />
              <span className="text-gray-700 dark:text-gray-200">{s}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}