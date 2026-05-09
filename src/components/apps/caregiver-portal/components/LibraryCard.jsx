import { Search, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function LibraryCard({ title, desc, howToTell, do: doText, dont, color }) {
  return (
    <div className="bg-[#0A1220]/60 backdrop-blur-md rounded-3xl border border-white/5 shadow-xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-2xl">
      <div className={`${color} p-5 border-b font-black text-lg tracking-wide text-white`}>{title}</div>
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <p className="text-sm text-slate-300 font-medium leading-relaxed mb-2">{desc}</p>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50 shadow-inner mb-1 flex-1">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Search size={14}/> Spot it / Use it</p>
          <p className="text-sm text-slate-300 leading-relaxed">{howToTell}</p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50 shadow-inner">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle2 size={14}/> Do</p>
          <p className="text-sm text-slate-300 leading-relaxed">{doText}</p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50 shadow-inner">
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertTriangle size={14}/> Don&apos;t</p>
          <p className="text-sm text-slate-300 leading-relaxed">{dont}</p>
        </div>
      </div>
    </div>
  );
}
