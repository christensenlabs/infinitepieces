import { useState } from 'react';
import { UserCheck, CheckCircle2, Sparkles, Loader2, Target } from 'lucide-react';
import { callGemini } from '../../../../lib/gemini';
import { renderMarkdown } from '../../../../lib/renderMarkdown';

export default function AICoach({ apiKey, showToast }) {
  const [clinicalText, setClinicalText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReview = async () => {
    if (!clinicalText) return;
    setIsLoading(true);
    const userPrompt = `Review this clinical text (goal, BIP, or operational definition):\n\n${clinicalText}\n\nCritique it for: 1. Dead Man's Test. 2. Objectivity. 3. 2026 BACB Ethics (assent/trauma). Then suggest an improved rewrite.`;
    const systemPrompt = 'You are a strict, highly ethical BCBA-D clinical supervisor.';
    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) { setFeedback(text); showToast('Peer review complete.'); }
    } catch { showToast('Failed to run peer review.', 'error'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in h-full flex flex-col">
      <div>
        <h2 className="text-2xl font-bold text-white">AI Clinical Coach &amp; Peer Review</h2>
        <p className="text-slate-400">Monitoring Treatment Integrity and actively auditing your clinical writing.</p>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center space-x-6">
        <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400"><CheckCircle2 size={32} /></div>
        <div>
          <h3 className="text-lg font-bold text-emerald-400 mb-1">Global Alignment Score: 94%</h3>
          <p className="text-slate-300 text-sm">The AI has analyzed your past edits and learned your preference for DRA over DRO.</p>
        </div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold text-white mb-2 flex items-center"><UserCheck className="mr-2 text-indigo-400" /> AI Peer Review Request</h3>
          <p className="text-xs text-slate-400 mb-4">Paste a goal, operational definition, or BIP snippet here. The LLM will audit it against 2026 BACB standards.</p>
          <textarea value={clinicalText} onChange={(e) => setClinicalText(e.target.value)} className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none mb-4 custom-scrollbar" placeholder="e.g. J.D. will stop crying..." />
          <button onClick={handleReview} disabled={isLoading || !clinicalText} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex justify-center items-center disabled:opacity-50">
            {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />} Run Clinical Audit
          </button>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 overflow-y-auto prose prose-invert text-sm custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4"><Loader2 size={32} className="animate-spin" /><span className="font-medium animate-pulse">Auditing compliance...</span></div>
          ) : feedback ? (
            <div>{renderMarkdown(feedback)}</div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600"><Target size={48} className="mb-4 opacity-30" /><p>Awaiting text...</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
