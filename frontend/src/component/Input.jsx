export function RenderInput(label, name, value, onChange, error, type = "text") {
  return (
    <label className="block" key={name}>
      <span className="text-gray-700">{label}:</span>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-1 p-2 outline-none focus:border-black focus:border-2 block w-full rounded-md border-gray-300 shadow-sm  focus:ring focus:ring-indigo-200 focus:ring-opacity-50 ${
          error ? "border-red-500" : ""
        }`}
        placeholder={`Enter your ${label.toLowerCase()}...`}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </label>
  );
}
