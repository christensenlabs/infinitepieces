import { Loader2, X, BrainCircuit, FileText } from 'lucide-react';

export default function AiActionModal({ aiActionState, onClose, renderMarkdown }) {
  if (!aiActionState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 fade-in">
      <div className="bg-[#0A1220] border border-cyan-500/30 rounded-3xl w-full max-w-lg shadow-[0_0_40px_rgba(0,229,255,0.15)] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BrainCircuit size={20} />
            </div>
            <div>
              <h3 className="text-white font-black text-lg">{aiActionState.title}</h3>
              <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Powered by Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-8">
          {aiActionState.loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-4">
              <Loader2 size={40} className="text-cyan-400 animate-spin" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Synthesizing Insights...</p>
            </div>
          ) : (
            <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
              {aiActionState.shift && (
                <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
                  <FileText size={16} className="text-slate-500" />
                  <span className="text-slate-300 text-sm font-medium">Context: {aiActionState.shift.clientName || 'Unknown'} • {aiActionState.shift.location}</span>
                </div>
              )}
              <div className="text-white text-sm md:text-base leading-relaxed space-y-1">
                {renderMarkdown(aiActionState.result)}
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
