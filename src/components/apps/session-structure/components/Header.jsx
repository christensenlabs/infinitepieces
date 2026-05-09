import React from 'react';
import { RefreshCw, Menu, Printer } from 'lucide-react';

export default function Header({
  isSidebarOpen,
  setIsSidebarOpen,
  currentTime,
  keywordInput,
  generateMasterFlow,
}) {
  return (
    <header className="px-5 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between z-10 border-b border-white/5 backdrop-blur-sm print:hidden gap-4">
      <div className="flex items-center gap-4">
        {!isSidebarOpen && (
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors bg-slate-800/50 border border-slate-700">
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
        )}
        <div>
          <h1 className="text-lg md:text-2xl font-black tracking-tight text-white flex items-center gap-2 md:gap-3 flex-wrap">
            Master Schedule
            {currentTime.getHours() >= 15 ? (
              <span className="px-2 py-0.5 rounded-md bg-fuchsia-500 text-[10px] uppercase text-fuchsia-950 font-black animate-pulse whitespace-nowrap">Social Peak Active</span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-[10px] uppercase text-emerald-950 font-black whitespace-nowrap">Standard Flow</span>
            )}
          </h1>
          <p className="text-[10px] md:text-xs text-indigo-300 font-bold tracking-wide">Context: {keywordInput || "Default"} &bull; 8:30 AM — 6:00 PM</p>
        </div>
      </div>

      <div className="flex items-center gap-3 self-end sm:self-auto">
        <button onClick={generateMasterFlow} className="p-2 hover:bg-slate-800 bg-slate-800/50 rounded-lg transition-colors border border-slate-700 text-slate-400 hover:text-white" title="Shuffle Routine">
          <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <button onClick={() => window.print()} className="p-2 hover:bg-slate-800 bg-slate-800/50 rounded-lg transition-colors border border-slate-700 text-slate-400 hover:text-white" title="Print Master Schedule">
          <Printer className="w-4 h-4 md:w-5 md:h-5" />
        </button>
        <div className="flex flex-col items-end border-l border-slate-700 pl-3 md:pl-4 ml-1">
          <span className="text-xl md:text-3xl font-black text-indigo-400 font-mono tracking-tighter leading-none">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span className="text-[9px] md:text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">Live Pulse</span>
        </div>
      </div>
    </header>
  );
}
