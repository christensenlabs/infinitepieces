import React from 'react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';

export default function GenMatrixView({ genForm, setGenForm, onGenerate }) {
  return (
    <>
      <h3 className="font-bold text-lg mb-2">Generalization Builder</h3>
      <VoiceTextArea placeholder="Mastered skill... (e.g. greetings)" value={genForm.skill} onChange={e => setGenForm({...genForm, skill: e.target.value})} rows={2} />
      <button onClick={() => onGenerate('gen')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">Build Matrix</button>
    </>
  );
}
