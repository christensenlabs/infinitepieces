export default function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition-all rounded-xl ${active ? 'bg-[#112240] text-cyan-400 border-r-4 border-cyan-500 shadow-inner' : 'hover:bg-white/5 hover:text-white text-slate-500'}`}>
      {icon} {label}
    </button>
  );
}
