import React from 'react';
import { HeartHandshake } from 'lucide-react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';
import VoiceInput from '@/components/ui/VoiceInput';

export default function SiblingExplainerView({ siblingForm, setSiblingForm, onGenerate }) {
  return (
    <>
      <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-4 items-start mb-6">
        <HeartHandshake className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-rose-900">Peer / Sibling Explainer</h4>
          <p className="text-sm text-rose-800 mt-1">Generate a compassionate, age-appropriate script to help a neurotypical sibling or peer understand a clinical concept or behavior.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">What happened? / Concept</label>
          <VoiceTextArea placeholder="e.g., Why he wears headphones, meltdown at store..." value={siblingForm.concept} onChange={e => setSiblingForm({...siblingForm, concept: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Sibling&apos;s Age</label>
          <VoiceInput placeholder="e.g., 8..." value={siblingForm.siblingAge} onChange={e => setSiblingForm({...siblingForm, siblingAge: e.target.value})} />
        </div>
      </div>
      <button onClick={() => onGenerate('sibling')} className="w-full py-4 bg-rose-600 hover:bg-rose-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">✨ Generate Explanation Script</button>
    </>
  );
}
