import React from 'react';
import { GraduationCap } from 'lucide-react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';

export default function IEPDecoderView({ iepForm, setIepForm, onGenerate }) {
  return (
    <>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start mb-6">
        <GraduationCap className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-indigo-900">IEP Goal Decoder</h4>
          <p className="text-sm text-indigo-800 mt-1">Translate confusing clinical goals from your child&apos;s IEP or therapy plan into simple, actionable strategies you can practice at home.</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Therapy or IEP Goal</label>
        <VoiceTextArea placeholder="e.g., 'The student will independently mand for preferred items using 3-word phrases in 8/10 opportunities...'" value={iepForm.goal} onChange={e => setIepForm({...iepForm, goal: e.target.value})} rows={5} />
      </div>
      <button onClick={() => onGenerate('iep')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">✨ Decode Goal</button>
    </>
  );
}
