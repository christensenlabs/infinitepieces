export default function NavItem({ icon, label, active, onClick, badge, badgeColor = 'emerald' }) {
  const bColor = badgeColor === 'indigo' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-slate-950';
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-slate-800/80 text-white border border-slate-700/50 shadow-sm' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'}`}>
      <div className="flex items-center space-x-3">
        <div className={`${active ? (badgeColor === 'indigo' ? 'text-indigo-400' : 'text-emerald-400') : 'group-hover:text-slate-200 transition-colors'}`}>{icon}</div>
        <span className="font-medium text-sm tracking-wide">{label}</span>
      </div>
      {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? bColor : 'bg-slate-700 text-slate-300'}`}>{badge}</span>}
    </button>
  );
}
