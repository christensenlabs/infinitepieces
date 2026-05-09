import { useState } from 'react';
import { ListTodo, Sparkles, Loader2, Save } from 'lucide-react';
import { callGemini } from '@/lib/gemini';
import { renderMarkdown } from '@/lib/renderMarkdown';
import InputField from '../components/InputField';

export default function TaskAnalysisGenerator({ apiKey, showToast, onCopy }) {
  const [data, setData] = useState({ skill: '', level: 'Intermediate Learner', chaining: 'Forward Chaining' });
  const [generated, setGenerated] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!data.skill) { showToast('Please enter a target skill.', 'error'); return; }
    setIsLoading(true);
    setGenerated('');
    const userPrompt = `Target Skill: ${data.skill}\nLearner Level: ${data.level}\nPreferred Chaining Method: ${data.chaining}\n\nPlease generate a highly detailed, step-by-step Task Analysis (TA) for this skill tailored to this learner's level. Include prerequisite skills, materials needed, and the numbered micro-steps. Format beautifully in markdown.`;
    const systemPrompt = 'You are a BCBA writing precise and granular task analyses for skill acquisition programs. Break down complex behavior chains logically.';
    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) { setGenerated(text); showToast('Task Analysis Generated!'); }
    } catch { showToast('Failed to generate TA.', 'error'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-6xl flex gap-6 animate-in fade-in h-full">
      <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
        <h3 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center"><ListTodo className="mr-2 text-indigo-400" size={20} /> Task Analysis AI</h3>
        <p className="text-slate-400 text-xs mb-4">Automatically break down complex life skills into distinct, teachable micro-steps for TA programs.</p>
        <InputField label="Target Skill / Behavior Chain" name="skill" value={data.skill} onChange={(e) => setData({ ...data, skill: e.target.value })} placeholder="e.g. Washing Hands" />
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Learner Functioning Level</label>
          <select value={data.level} onChange={(e) => setData({ ...data, level: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>Beginner (Highly granular micro-steps)</option><option>Intermediate Learner</option><option>Advanced Learner (Chunked steps)</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Chaining Method Preference</label>
          <select value={data.chaining} onChange={(e) => setData({ ...data, chaining: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>Forward Chaining</option><option>Backward Chaining</option><option>Total Task Presentation</option>
          </select>
        </div>
        <button onClick={handleGenerate} disabled={isLoading || !data.skill} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex justify-center items-center transition-all">
          {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />} Break Down Skill
        </button>
      </div>
      <div className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Generated TA Sheet</h3>
          {generated && <button onClick={() => onCopy(generated)} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center"><Save size={14} className="mr-2" /> Copy</button>}
        </div>
        <div className="p-8 overflow-y-auto prose prose-invert max-w-none text-sm custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4"><Loader2 size={32} className="animate-spin" /><span className="font-medium animate-pulse">Analyzing behavior chain...</span></div>
          ) : generated ? (
            <div>{renderMarkdown(generated)}</div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600"><ListTodo size={48} className="mb-4 opacity-30" /><p>Awaiting input...</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
