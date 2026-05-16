import React from 'react';
import { ListTodo } from 'lucide-react';
import VoiceTextArea from '@/components/ui/VoiceTextArea';
import VoiceInput from '@/components/ui/VoiceInput';

export default function VisualScheduleView({ scheduleForm, setScheduleForm, onGenerate }) {
  return (
    <>
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start mb-6">
        <ListTodo className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-indigo-900">Visual Schedule Builder</h4>
          <p className="text-sm text-indigo-800 mt-1">Generate a step-by-step visual schedule for any routine, complete with suggested emojis/icons for the learner.</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Routine / Transition</label>
          <VoiceTextArea placeholder="e.g., Morning routine, going to store..." value={scheduleForm.routine} onChange={e => setScheduleForm({...scheduleForm, routine: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-1.5">Learner Age</label>
          <VoiceInput placeholder="e.g., 5..." value={scheduleForm.age} onChange={e => setScheduleForm({...scheduleForm, age: e.target.value})} />
        </div>
      </div>
      <button onClick={() => onGenerate('schedule')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">✨ Generate Visual Schedule</button>
    </>
  );
}
