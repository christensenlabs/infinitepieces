import React from 'react';
import { X, Brain, CheckCircle2 } from 'lucide-react';

function StrategyModal({ currentZone, greenZone, onSelectStrategy, onClose }) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-8 animate-in fade-in">
      <div className="bg-slate-800 w-full max-w-2xl rounded-[2rem] lg:rounded-[4rem] shadow-2xl overflow-hidden border border-slate-700 animate-in zoom-in-95">
        <div className={`${currentZone.color} p-6 lg:p-12 text-white relative shadow-lg`}>
          <button onClick={onClose} className="absolute top-4 right-4 lg:top-8 lg:right-8 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><X /></button>
          <div className="flex items-center gap-3 lg:gap-8">
             <div className="bg-white/20 p-4 rounded-2xl"><Brain size={32} /></div>
             <div>
                <h2 className="text-lg lg:text-4xl font-black uppercase">Strategy Box</h2>
                <p className="text-xs lg:text-xl font-bold opacity-90 italic">Choose a tool to help you!</p>
             </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentZone.strategies.map((strategy, idx) => {
            const IconComponent = strategy.icon;
            return (
            <button key={idx} onClick={() => onSelectStrategy(greenZone)} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-700 hover:bg-slate-600 border border-slate-600 group transition-all text-left">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-inner shrink-0 ${currentZone.color}`}>
                <IconComponent size={20} strokeWidth={2.5} />
              </div>
              <span className="text-white font-bold uppercase text-xs">{strategy.text}</span>
            </button>
          )})}
          <button onClick={() => onSelectStrategy(greenZone)} className="md:col-span-2 mt-4 py-6 rounded-[2rem] bg-green-500 hover:bg-green-600 text-white font-black uppercase flex items-center justify-center gap-3 transition-colors">
            <CheckCircle2 /> Back to Green Zone!
          </button>
        </div>
      </div>
    </div>
  );
}

export default StrategyModal;
