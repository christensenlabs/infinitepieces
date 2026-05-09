import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp } from 'lucide-react';

export default function LibraryView({ programs, activeClient }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!activeClient) return <div className="p-8 text-slate-500 text-center">Select a client first.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-[#233554] pb-4">
        <BookOpen size={28} className="text-cyan-400" />
        <h2 className="text-3xl font-black text-white tracking-tight">Curriculum Core</h2>
      </div>

      <div className="space-y-4">
        {programs.map(p => {
          const isOpen = expandedId === p.id;
          return (
            <div key={p.id} className={`bg-[#112240]/80 rounded-[2rem] border transition-all ${isOpen ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.1)]' : 'border-[#233554]'}`}>
              <div onClick={() => setExpandedId(isOpen ? null : p.id)} className="p-6 cursor-pointer flex justify-between items-start hover:bg-[#0A192F]/50 rounded-[2rem]">
                <div>
                  <h3 className="font-black text-xl text-white">{p.target}</h3>
                  <p className="text-xs font-bold text-cyan-400 mt-1 uppercase tracking-widest">{p.method} • {p.domain}</p>
                </div>
                {isOpen ? <ChevronUp className="text-cyan-400"/> : <ChevronDown className="text-slate-500"/>}
              </div>
              {isOpen && (
                <div className="p-6 bg-[#0A192F] border-t border-[#233554] rounded-b-[2rem] animate-in slide-in-from-top-2 text-sm text-slate-300">
                  <p className="mb-4"><strong>Procedure:</strong> {p.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
