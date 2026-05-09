import {
  BookOpen, Shield, Target, Lightbulb
} from 'lucide-react';
import LibraryCard from '../components/LibraryCard';

export default function Library({ libraryData }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col pb-10">
      <div className="bg-[#0A1220]/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex items-center gap-6 shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-400 relative z-10 hidden sm:block"><BookOpen size={32} /></div>
        <div className="relative z-10">
          <h3 className="font-black text-white text-3xl mb-2">ABA Knowledge Library</h3>
          <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">Understanding the &quot;Why&quot; behind behavior is the first step. Every behavior serves one of four functions. We&apos;ve translated the science into simple, actionable strategies for home.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-12">

        {/* Category 1: Core Functions */}
        {libraryData?.functions && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center"><Target size={16}/></div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">The 4 Functions of Behavior</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {libraryData.functions.map((card, idx) => (
                <LibraryCard key={idx} {...card} />
              ))}
            </div>
          </div>
        )}

        {/* Category 2: Proactive Strategies */}
        {libraryData?.proactive && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center"><Shield size={16}/></div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Proactive Strategies (Before the Meltdown)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {libraryData.proactive.map((card, idx) => (
                <LibraryCard key={idx} {...card} />
              ))}
            </div>
          </div>
        )}

        {/* Category 3: Teaching & Responding */}
        {libraryData?.teaching && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center"><Lightbulb size={16}/></div>
              <h3 className="text-xl font-bold text-white uppercase tracking-wider">Skill Building & Responding</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {libraryData.teaching.map((card, idx) => (
                <LibraryCard key={idx} {...card} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
