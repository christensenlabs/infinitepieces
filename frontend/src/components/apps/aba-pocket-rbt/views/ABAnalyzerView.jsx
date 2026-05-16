import React from 'react';
import { Lightbulb } from 'lucide-react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';

export default function ABAnalyzerView({ abForm, setAbForm, onGenerate }) {
  return (
    <>
      <h3 className="font-bold text-lg mb-2">A-B Contingency</h3>
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4 flex items-start gap-2">
         <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0" />
         <p className="text-xs text-yellow-800"><span className="font-bold">Hint:</span> Describe exactly what happened immediately before (Antecedent) and exactly what the client did (Behavior).</p>
      </div>
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Antecedent (A)</label>
        <VoiceTextArea placeholder="What occurred prior?" value={abForm.antecedent} onChange={e => setAbForm({...abForm, antecedent: e.target.value})} />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Behavior (B)</label>
        <VoiceTextArea placeholder="Specific topography observed?" value={abForm.behavior} onChange={e => setAbForm({...abForm, behavior: e.target.value})} />
      </div>
      <button onClick={() => onGenerate('ab')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">✨ Analyze Consequence</button>
    </>
  );
}
