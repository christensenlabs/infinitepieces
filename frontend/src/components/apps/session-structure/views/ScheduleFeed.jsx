import React from 'react';
import BlockIcon from '../components/BlockIcon';

export default function ScheduleFeed({
  clinicSchedule,
  currentBlockId,
  setSelectedBlock,
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 space-y-3 custom-scrollbar pt-6 print:overflow-visible print:pb-0 print:pt-0 print:space-y-0">
      {clinicSchedule.map((block) => {
        const isCurrent = block.id === currentBlockId;
        const isSocialPeak = block.startMinRaw >= 900;
        return (
          <div
            key={block.id}
            onClick={() => setSelectedBlock(block)}
            className={`group relative flex items-center gap-3 md:gap-6 p-1 rounded-[2rem] transition-all duration-300 cursor-pointer print:rounded-none print:border-b print:border-slate-300 print:py-4 print:gap-4 ${isCurrent ? 'scale-[1.01] md:scale-[1.02] z-10 print:scale-100' : 'hover:bg-slate-800/40 print:hover:bg-transparent'}`}
          >
            {/* Time Indicator */}
            <div className="w-16 md:w-24 flex flex-col items-center justify-center shrink-0 print:w-20">
              <span className={`text-[10px] md:text-xs font-black transition-colors print:text-black ${isCurrent ? 'text-indigo-400' : 'text-slate-500'}`}>
                {block.startTime}
              </span>
              <div className={`h-8 md:h-12 w-[2px] rounded-full my-1 print:hidden ${isCurrent ? 'bg-gradient-to-b from-indigo-500 to-transparent' : 'bg-slate-800'}`} />
            </div>

            {/* Main Card */}
            <div className={`flex-1 flex flex-row items-center gap-4 md:gap-6 p-4 md:p-6 rounded-3xl border transition-all duration-300 print:border-none print:p-0 print:shadow-none ${
              isCurrent
                ? 'bg-slate-800/90 border-indigo-500 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]'
                : isSocialPeak
                  ? 'bg-fuchsia-900/5 border-fuchsia-900/20'
                  : 'bg-slate-900/60 border-slate-800/60'
            }`}>
              <div className={`p-3 md:p-4 rounded-2xl shrink-0 print:hidden ${
                block.cat === 'ABA' ? 'bg-rose-500/10' :
                block.cat === 'Group' || block.cat === 'Social' ? 'bg-emerald-500/10' :
                block.cat === 'Fine Motor' ? 'bg-teal-500/10' :
                'bg-slate-800'
              }`}>
                <BlockIcon cat={block.cat} />
              </div>

              <div className="flex-1 text-left print:text-left min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest print:text-slate-500 ${
                    block.cat === 'ABA' ? 'text-rose-400' :
                    block.cat === 'Social' ? 'text-fuchsia-400' :
                    block.cat === 'Group' ? 'text-emerald-400' :
                    block.cat === 'Fine Motor' ? 'text-teal-400' :
                    'text-slate-500'
                  }`}>
                    {block.cat} {isSocialPeak && " (High Density)"}
                  </span>
                  {isCurrent && <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping print:hidden" />}
                </div>
                <h3 className={`text-sm md:text-lg font-bold leading-tight truncate print:text-black print:whitespace-normal ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                  {block.title}
                </h3>
                <p className="text-[10px] md:text-xs text-slate-500 mt-1 md:mt-1.5 font-medium italic print:text-slate-600 line-clamp-1 md:line-clamp-2 print:line-clamp-none">{block.note}</p>
              </div>

              <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 print:hidden">
                <div className="flex -space-x-1.5">
                  {[1, 2, 3].map(i => (
                    <div key={i} className={`w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[8px] font-bold ${isSocialPeak ? 'bg-fuchsia-900 text-fuchsia-200 border-fuchsia-950' : 'text-slate-300'}`}>RB</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
