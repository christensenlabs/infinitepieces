export default function QuickActionButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-slate-900/50 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/30 rounded-2xl text-slate-300 hover:text-indigo-400 transition-all shadow-lg hover:shadow-indigo-500/10">
      <div className="mb-3">{icon}</div>
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}
