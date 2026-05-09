import React from 'react';
import { UserCircle } from 'lucide-react';
import VoiceTextArea from '../../../ui/VoiceTextArea';
import VoiceInput from '../../../ui/VoiceInput';

export default function ProgramMentorView({ mentorForm, setMentorForm, clientInterests, onGenerate }) {
  return (
    <>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start mb-6">
        <UserCircle className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-indigo-900">Client Profile Sync</h4>
          <p className="text-sm text-indigo-800 mt-1">Select your client to automatically pull their preferences. Generate actionable implementation tips and play ideas for the specific program you are running today.</p>
        </div>
      </div>

      <h3 className="font-bold text-lg mb-2">1. Select Client Profile</h3>
      <select
        className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm font-medium mb-4"
        onChange={(e) => {
          setMentorForm({...mentorForm, clientName: e.target.value, interests: clientInterests[e.target.value] || ''});
        }}
      >
        <option value="">-- Select Assigned Client --</option>
        {Object.keys(clientInterests).map(name => (
          <option key={name} value={name}>{name}</option>
        ))}
      </select>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Program Name</label>
          <VoiceInput placeholder="e.g., Manding, Tying Shoes..." value={mentorForm.programName} onChange={e => setMentorForm({...mentorForm, programName: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Current Target / Goal</label>
          <VoiceInput placeholder="e.g., Mands with 2 words..." value={mentorForm.target} onChange={e => setMentorForm({...mentorForm, target: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-700 mb-1.5">Client Interests (Auto-Synced)</label>
        <VoiceTextArea placeholder="Client preferences..." value={mentorForm.interests} onChange={e => setMentorForm({...mentorForm, interests: e.target.value})} rows={2} />
      </div>

      <button onClick={() => onGenerate('mentor')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">Get Implementation Ideas</button>
    </>
  );
}
