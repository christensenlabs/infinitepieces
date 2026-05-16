import React from 'react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';
import VoiceInput from '@/components/ui/VoiceInput';

export default function PlayIdeasView({ playForm, setPlayForm, onGenerate }) {
  return (
    <>
      <h3 className="font-bold text-lg mb-2">Ideas for Play</h3>
      <div className="mb-4">
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Current Situation</label>
        <VoiceTextArea placeholder="Describe situation (e.g. client wandering)..." value={playForm.situation} onChange={e => setPlayForm({...playForm, situation: e.target.value})} rows={3} />
      </div>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Client Interests</label>
        <VoiceInput placeholder="e.g. cars, trains..." value={playForm.interests} onChange={e => setPlayForm({...playForm, interests: e.target.value})} />
      </div>
      <button onClick={() => onGenerate('play')} className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">✨ Get Play Ideas</button>
    </>
  );
}
