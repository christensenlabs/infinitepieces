export default function InputField({ label, name, value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-400">{label}</label>
      <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500" />
    </div>
  );
}
