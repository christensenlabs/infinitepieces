import React from 'react';
import { Lightbulb } from 'lucide-react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';

export default function QuickInterventionView({ quickIntForm, setQuickIntForm, onGenerate }) {
  return (
    <>
      <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4 flex items-start gap-2">
         <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0" />
         <p className="text-xs text-yellow-800"><span className="font-bold">Hint:</span> Be specific! Use observable words (e.g., &ldquo;hit with open hand&rdquo;) instead of internal states (e.g., &ldquo;was angry&rdquo;).</p>
      </div>
      <h3 className="font-bold text-lg mb-2">Target Behavior</h3>
      <VoiceTextArea placeholder="Behavior topography... (e.g. throwing blocks)" value={quickIntForm.behavior} onChange={e => setQuickIntForm({...quickIntForm, behavior: e.target.value})} />
      <button onClick={() => onGenerate('quick')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">Generate Strategy</button>
    </>
  );
}
