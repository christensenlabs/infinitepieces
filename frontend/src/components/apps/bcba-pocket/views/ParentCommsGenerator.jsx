import { useState } from 'react';
import { Mail, Sparkles, Loader2, Save } from 'lucide-react';
import { callGemini } from '@/lib/gemini';
import { renderMarkdown } from '@/lib/renderMarkdown';
import InputField from '../components/InputField';
import TextAreaField from '../components/TextAreaField';

export default function ParentCommsGenerator({ apiKey, showToast, onCopy }) {
  const [data, setData] = useState({ clientInitials: '', tone: 'Empathetic & Supportive', rawNotes: '' });
  const [generated, setGenerated] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!data.rawNotes) { showToast('Please enter incident details.', 'error'); return; }
    setIsLoading(true);
    setGenerated('');
    const userPrompt = `Client: ${data.clientInitials}\nTone: ${data.tone}\nIncident Notes:\n${data.rawNotes}\n\nDraft an email to the caregiver. Translate behavioral jargon into empathetic, objective English. Do not blame the child.`;
    const systemPrompt = 'You are an empathetic, highly professional BCBA communicating with parents.';
    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) { setGenerated(text); showToast('Email drafted!'); }
    } catch { showToast('Failed to draft email.', 'error'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-6xl flex gap-6 animate-in fade-in h-full">
      <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
        <h3 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center"><Mail className="mr-2 text-blue-400" size={20} /> Parent Comms AI</h3>
        <p className="text-slate-400 text-xs mb-4">Translate rigid objective behavioral data into empathetic emails for parents.</p>
        <InputField label="Client Initials" name="clientInitials" value={data.clientInitials} onChange={(e) => setData({ ...data, clientInitials: e.target.value })} placeholder="e.g. J.D." />
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Communication Tone</label>
          <select value={data.tone} onChange={(e) => setData({ ...data, tone: e.target.value })} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500">
            <option>Empathetic &amp; Supportive</option><option>Direct Incident Report</option><option>Celebratory &amp; Positive</option><option>Collaboration Request</option>
          </select>
        </div>
        <TextAreaField label="Clinical Notes / Incident Details" name="rawNotes" value={data.rawNotes} onChange={(e) => setData({ ...data, rawNotes: e.target.value })} placeholder="e.g. J.D. engaged in 4 instances of SIB..." rows={6} />
        <button onClick={handleGenerate} disabled={isLoading || !data.rawNotes} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex justify-center items-center transition-all">
          {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />} Draft Email
        </button>
      </div>
      <div className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Generated Communication</h3>
          {generated && <button onClick={() => onCopy(generated)} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center"><Save size={14} className="mr-2" /> Copy</button>}
        </div>
        <div className="p-8 overflow-y-auto prose prose-invert max-w-none text-sm custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-blue-400 space-y-4"><Loader2 size={32} className="animate-spin" /><span className="font-medium animate-pulse">Translating jargon...</span></div>
          ) : generated ? (
            <div>{renderMarkdown(generated)}</div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600"><Mail size={48} className="mb-4 opacity-30" /><p>Awaiting input...</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
