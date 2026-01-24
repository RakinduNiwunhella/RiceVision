const InputField = ({ label, name, type = "text", value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 dark:border-slate-700 
px-4 py-2 bg-white dark:bg-slate-900
text-slate-900 dark:text-slate-100
focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900/30
outline-none transition"
      />
    </div>
  );
};

export default InputField;