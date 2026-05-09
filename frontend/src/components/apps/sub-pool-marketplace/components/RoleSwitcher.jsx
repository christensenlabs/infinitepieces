export default function RoleSwitcher({ activeRole, onRoleChange }) {
  return (
    <div className="flex items-center gap-3 bg-black/40 p-1 rounded-xl border border-white/5">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 hidden sm:block">View As:</span>
      <button onClick={() => onRoleChange('scheduler')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeRole === 'scheduler' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Scheduler</button>
      <button onClick={() => onRoleChange('rbt')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeRole === 'rbt' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>RBT</button>
      <button onClick={() => onRoleChange('bcba')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeRole === 'bcba' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>BCBA</button>
    </div>
  );
}
