import React from 'react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';

export default function ParentTrainingView({ parentTrainingForm, setParentTrainingForm, onGenerate }) {
  return (
    <>
      <h3 className="font-bold text-lg mb-2">Parent Training Guide</h3>
      <VoiceTextArea placeholder="Topic (e.g. Extinction)..." value={parentTrainingForm.topic} onChange={e => setParentTrainingForm({...parentTrainingForm, topic: e.target.value})} rows={2} />
      <button onClick={() => onGenerate('parent')} className="w-full py-4 bg-teal-600 hover:bg-teal-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">✨ Generate Scripts</button>
    </>
  );
}
