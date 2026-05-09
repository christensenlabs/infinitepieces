import { useState, useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

export default function SessionView({ programs, activeClient, sessionData, setSessionData }) {
  const [selectedId, setSelectedId] = useState(programs[0]?.id || null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (programs.length > 0 && !programs.find((p) => p.id === selectedId)) {
      setSelectedId(programs[0]?.id);
    }
  }, [programs, selectedId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!activeClient) return <div className="flex h-full items-center justify-center text-slate-500">Select a client first.</div>;
  if (programs.length === 0) return <div className="flex h-full items-center justify-center text-slate-500">No active programs.</div>;

  const activeP = programs.find(p => p.id === selectedId) || programs[0];
  const currentData = sessionData[selectedId] || { trials: [], stats: {} };
  const totalT = currentData.trials.length;

  const recordTrial = (type) => {
    if (!selectedId) return;
    const cur = sessionData[selectedId] || { trials: [], stats: {} };
    setSessionData({ ...sessionData, [selectedId]: { trials: [...cur.trials, type], stats: { ...cur.stats, [type]: (cur.stats[type] || 0) + 1 } } });
  };

  const removeLastTrial = () => {
    if (!selectedId || currentData.trials.length === 0) return;
    const type = currentData.trials[currentData.trials.length - 1];
    const nextTrials = currentData.trials.slice(0, -1);
    setSessionData({ ...sessionData, [selectedId]: { trials: nextTrials, stats: { ...currentData.stats, [type]: currentData.stats[type] - 1 } } });
  };

  return (
    <div className="h-full flex flex-col bg-[#0A192F] rounded-[2.5rem] border border-[#233554] shadow-2xl overflow-hidden animate-in zoom-in-95">
       <header className="h-16 bg-[#061224]/90 flex items-center justify-between px-6 border-b border-[#233554] shrink-0">
          <span className="font-black text-white text-sm tracking-widest uppercase">{activeClient?.name} <span className="text-cyan-400">SESSION</span></span>
       </header>

       <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 bg-[#112240]/50 border-r border-[#233554] overflow-y-auto custom-scrollbar p-4 space-y-2">
            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4">Target Buffer</div>
            {programs.map((p) => {
              const isSelected = p.id === selectedId;
              const pData = sessionData[p.id];
              const count = pData ? pData.trials.length : 0;
              return (
                <button key={p.id} onClick={() => setSelectedId(p.id)} className={`w-full text-left p-4 rounded-2xl transition-all border ${isSelected ? "bg-cyan-500/10 border-cyan-500/50" : "hover:bg-[#233554]/30 border-transparent"}`}>
                  <span className={`font-bold text-sm block truncate ${isSelected ? "text-white" : "text-slate-400"}`}>{p.target}</span>
                  {count > 0 && <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mt-1 block">{count} Logs</span>}
                </button>
              );
            })}
          </div>

          {/* Main Area */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#112240] to-[#0A192F]">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-[#112240]/80 rounded-[2rem] border border-[#233554] p-8 relative">
                <div className="absolute top-0 right-0 bg-cyan-500/10 text-cyan-400 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl border-b border-l border-cyan-500/20">{activeP?.method}</div>
                <h2 className="text-3xl font-black text-white mb-4 italic pr-16">{activeP?.target}</h2>
                <div className="bg-[#0A192F] p-4 rounded-xl border border-[#233554] text-sm text-slate-300 font-medium">
                  {activeP?.description}
                </div>
              </div>

              <div className="bg-[#112240]/80 rounded-[2.5rem] border border-[#233554] p-8">
                <div className="flex justify-between items-end mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Record Data</div>
                  {totalT > 0 && <button onClick={removeLastTrial} className="text-[10px] font-black text-slate-400 hover:text-rose-500 flex items-center gap-1"><RotateCcw size={12}/> Undo Last</button>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {['IND', 'V', 'M', 'ERR'].map((label) => (
                    <button key={label} onClick={() => recordTrial(label)} className={`h-24 rounded-[2rem] border-b-[6px] flex flex-col items-center justify-center transition-all active:translate-y-1 active:border-b-0 shadow-lg ${label === 'IND' ? 'bg-[#22c55e] border-green-700 text-white' : label === 'ERR' ? 'bg-rose-500 border-rose-700 text-white' : 'bg-blue-500 border-blue-700 text-white'}`}>
                      <span className="font-black text-3xl">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-[#0A192F] rounded-2xl border border-[#233554] p-6 min-h-[100px] flex flex-wrap gap-2 items-start">
                  {currentData.trials.length === 0 ? <span className="text-sm text-slate-600 italic">Awaiting data...</span> : currentData.trials.map((t, i) => (
                    <span key={i} className={`px-3 py-1 rounded-lg text-xs font-black ${t === 'IND' ? 'bg-green-500/20 text-green-400' : t === 'ERR' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
       </div>
    </div>
  );
}
