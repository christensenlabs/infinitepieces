import React from 'react';
import { Book } from 'lucide-react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';
import VoiceInput from '@/components/ui/VoiceInput';

export default function SocialStoryView({ storyForm, setStoryForm, onGenerate }) {
  return (
    <>
      <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-4 items-start mb-6">
        <Book className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-orange-900">Social Story Drafter</h4>
          <p className="text-sm text-orange-800 mt-1">Prepare clients for novel events (haircuts, dentist, transitions) with an instant, personalized, evidence-based social story.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Client Name (Optional)</label>
          <VoiceInput placeholder="e.g., Noah..." value={storyForm.clientName} onChange={e => setStoryForm({...storyForm, clientName: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Client Age</label>
          <VoiceInput placeholder="e.g., 6..." value={storyForm.age} onChange={e => setStoryForm({...storyForm, age: e.target.value})} />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Story Topic / Event</label>
        <VoiceTextArea placeholder="e.g., Going to the dentist, losing a board game..." value={storyForm.topic} onChange={e => setStoryForm({...storyForm, topic: e.target.value})} rows={3} />
      </div>
      <button onClick={() => onGenerate('story')} className="w-full py-4 bg-orange-500 hover:bg-orange-600 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">✨ Generate Social Story</button>
    </>
  );
}
