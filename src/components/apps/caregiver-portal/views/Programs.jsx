import { Shield, Target } from 'lucide-react';

export default function Programs() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col pb-10">
      <div className="bg-[#0A1220]/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 shadow-xl flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-black text-white text-2xl mb-1">Clinical Programs</h3>
          <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest flex items-center gap-1.5"><Shield size={12}/> ProgramTree Sync Active</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center text-center bg-[#0A1220]/60 backdrop-blur-md border border-white/5 rounded-[2rem] p-12 shadow-lg">
        <Target className="w-16 h-16 text-indigo-500 mb-4 opacity-50" />
        <h3 className="text-2xl font-bold text-white mb-3">ProgramTree Connection</h3>
        <p className="text-slate-400 text-sm max-w-md leading-relaxed">
          This tab will connect directly to the ProgramTree module to display live clinical goals, mastery criteria, and home practice generalization steps.
        </p>
        <button className="mt-8 bg-slate-800 text-slate-300 px-8 py-3.5 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed uppercase tracking-widest">
          Awaiting Module Link
        </button>
      </div>
    </div>
  );
}
