import { useState } from 'react';

export default function FAGrapher() {
  const [ran, setRan] = useState(false);
  return (
    <div className="space-y-6 text-center">
      <p className="text-slate-400 text-sm">Simulate a multi-element experimental design based on Iwata&apos;s FA methodology.</p>
      <div className="h-48 bg-slate-950 border border-slate-800 rounded-2xl flex items-end justify-center space-x-6 p-6 pb-10 relative">
        <div className="absolute left-4 top-4 text-xs font-bold text-slate-500 -rotate-90 origin-left">Responses per Min</div>
        <div className="flex flex-col items-center w-12"><div className={`w-full bg-slate-600 rounded-t-md transition-all duration-1000 ${ran ? 'h-8' : 'h-2'}`} /><span className="text-[10px] text-slate-400 mt-2 absolute bottom-2">Play</span></div>
        <div className="flex flex-col items-center w-12"><div className={`w-full bg-blue-500 rounded-t-md transition-all duration-1000 ${ran ? 'h-12' : 'h-2'}`} /><span className="text-[10px] text-slate-400 mt-2 absolute bottom-2">Alone</span></div>
        <div className="flex flex-col items-center w-12"><div className={`w-full bg-yellow-500 rounded-t-md transition-all duration-1000 ${ran ? 'h-16' : 'h-2'}`} /><span className="text-[10px] text-slate-400 mt-2 absolute bottom-2">Attention</span></div>
        <div className="flex flex-col items-center w-12"><div className={`w-full bg-red-500 rounded-t-md transition-all duration-1000 ${ran ? 'h-40' : 'h-2'}`} /><span className="text-[10px] font-bold text-red-400 mt-2 absolute bottom-2">Escape</span></div>
      </div>
      <button onClick={() => setRan(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-colors">Run Simulation</button>
      {ran && <p className="text-emerald-400 text-sm font-bold animate-in fade-in">Clear differentiation observed. Function: Social Negative Reinforcement (Escape).</p>}
    </div>
  );
}
