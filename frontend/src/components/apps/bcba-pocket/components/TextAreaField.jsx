export default function TextAreaField({ label, name, value, onChange, placeholder, rows }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-400">{label}</label>
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-y custom-scrollbar" />
    </div>
  );
}
