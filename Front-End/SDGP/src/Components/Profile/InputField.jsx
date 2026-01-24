const InputField = ({ label, name, type = "text", value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 px-4 py-2
                   focus:border-green-500 focus:ring-2 focus:ring-green-100
                   outline-none transition"
      />
    </div>
  );
};

export default InputField;