import React from 'react';
import { FileText } from 'lucide-react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';

export default function ObjectiveNoteView({ obsNoteForm, setObsNoteForm, onGenerate }) {
  return (
    <>
      <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex gap-4 items-start mb-6">
        <FileText className="w-6 h-6 text-slate-700 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-slate-900">Objective Note Translator</h4>
          <p className="text-sm text-slate-700 mt-1">Convert subjective feelings (e.g., &ldquo;he was mad&rdquo;) into observable, measurable clinical terminology for your session notes.</p>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Subjective Draft</label>
        <VoiceTextArea placeholder="e.g., Noah got really stubborn and mad when I took away the iPad. He cried for a long time." value={obsNoteForm.draft} onChange={e => setObsNoteForm({...obsNoteForm, draft: e.target.value})} rows={5} />
      </div>
      <button onClick={() => onGenerate('obsNote')} className="w-full py-4 bg-slate-800 hover:bg-slate-900 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">Translate to Objective Language</button>
    </>
  );
}
