import React from 'react';
import { Languages } from 'lucide-react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';

export default function JargonTranslatorView({ jargonForm, setJargonForm, onGenerate }) {
  return (
    <>
      <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex gap-4 items-start mb-6">
        <Languages className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-sky-900">Jargon Translator</h4>
          <p className="text-sm text-sky-800 mt-1">Translate heavy clinical notes or treatment plans into warm, parent-friendly layman&apos;s terms.</p>
        </div>
      </div>
      <h3 className="font-bold text-lg mb-2">Clinical Text</h3>
      <VoiceTextArea placeholder="Paste ABA jargon here (e.g., 'Implemented DRI for property destruction...')" value={jargonForm.text} onChange={e => setJargonForm({...jargonForm, text: e.target.value})} rows={5} />
      <button onClick={() => onGenerate('jargon')} className="w-full py-4 bg-sky-600 hover:bg-sky-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">✨ Translate to Parent-Friendly</button>
    </>
  );
}
