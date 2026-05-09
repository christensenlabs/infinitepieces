export default function Card({ icon, label, value, color }) {
  return (
    <div className="bg-[#112240]/50 border border-[#233554] p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:border-cyan-400/30 transition-colors">
      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}
