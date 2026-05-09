import {
  Brain, Loader2, Sparkles, X
} from 'lucide-react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';
import { renderMarkdown } from '@/lib/renderMarkdown';

export default function StrategyCoach({
  client,
  strategyForm,
  setStrategyForm,
  generatedStrategy,
  setGeneratedStrategy,
  isGeneratingStrategy,
  handleGenerateStrategy,
}) {
  return (
    <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
      <div className="w-full lg:w-5/12 bg-[#0A1220]/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-2xl flex flex-col shrink-0">
        <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]"><Brain size={24} /></div>
          <div>
            <h3 className="font-black text-white text-xl">Behavior Coach</h3>
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">BIP-Tethered Guidance</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed mb-8 font-medium">Describe a challenging moment. The AI will cross-reference {client.name}&apos;s clinical behavior plan and provide empathetic, actionable advice.</p>

        <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">1. What happened right before?</label>
            <VoiceTextArea value={strategyForm.antecedent} onChange={(e) => setStrategyForm({...strategyForm, antecedent: e.target.value})} placeholder="e.g. I told him it was time to turn off the iPad..." rows={2} className="w-full p-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-slate-900/50 text-white placeholder-slate-500 shadow-inner font-medium pr-14 transition-all resize-none custom-scrollbar" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">2. What did {client.name} do?</label>
            <VoiceTextArea value={strategyForm.behavior} onChange={(e) => setStrategyForm({...strategyForm, behavior: e.target.value})} placeholder="e.g. He threw the iPad and started crying..." rows={2} className="w-full p-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-slate-900/50 text-white placeholder-slate-500 shadow-inner font-medium pr-14 transition-all resize-none custom-scrollbar" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">3. How did you respond? (Optional)</label>
            <VoiceTextArea value={strategyForm.consequence} onChange={(e) => setStrategyForm({...strategyForm, consequence: e.target.value})} placeholder="e.g. I gave it back for 5 more minutes..." rows={2} className="w-full p-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-slate-900/50 text-white placeholder-slate-500 shadow-inner font-medium pr-14 transition-all resize-none custom-scrollbar" />
          </div>
        </div>

        <div className="pt-6 mt-4 border-t border-white/5 shrink-0">
          <button
            onClick={handleGenerateStrategy}
            disabled={isGeneratingStrategy || !strategyForm.antecedent || !strategyForm.behavior}
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#040811] py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGeneratingStrategy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
            {isGeneratingStrategy ? 'Consulting Behavior Plan...' : 'Generate Strategy'}
          </button>
        </div>
      </div>

      <div className="w-full lg:w-7/12 bg-[#0A1220]/50 backdrop-blur-md border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="px-8 py-6 bg-slate-900/50 border-b border-white/5 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-white text-lg flex items-center gap-2"><Sparkles className="text-cyan-400 w-5 h-5"/> Coach Response</h3>
          {generatedStrategy && (
             <button onClick={() => setGeneratedStrategy('')} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg"><X size={16}/></button>
          )}
        </div>
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar prose prose-invert max-w-none text-sm leading-relaxed">
          {isGeneratingStrategy ? (
             <div className="h-full flex flex-col items-center justify-center text-cyan-500/50 space-y-4">
               <Loader2 size={48} className="animate-spin" />
               <span className="font-bold uppercase tracking-widest text-xs animate-pulse">Analyzing Clinical Data...</span>
             </div>
          ) : generatedStrategy ? (
             <div className="animate-in fade-in slide-in-from-bottom-4">{renderMarkdown(generatedStrategy)}</div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
               <Brain size={64} className="mb-4" />
               <p className="text-lg font-medium">Awaiting input...</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
