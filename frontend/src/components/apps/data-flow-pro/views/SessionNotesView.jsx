import { useState } from 'react';
import { FileSignature, Sparkles, Loader2, Clock, Save } from 'lucide-react';
import { callGemini } from '@/lib/gemini';
import { dfpStyles } from '../styles';

export default function SessionNotesView({ activeClient, sessionData, programs, sessionNotes, setSessionNotes, showToast, apiKey }) {
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!activeClient) return <div className="p-8 text-slate-500 text-center">Select a client first.</div>;

  const handleGenerate = async () => {
     setIsGenerating(true);

     // Compile data context for the prompt
     const stats = programs.map(p => {
        const data = sessionData[p.id];
        if (!data || data.trials.length === 0) return `- ${p.target}: No data collected today.`;
        const ind = data.trials.filter(t => t === 'IND').length;
        const total = data.trials.length;
        const pct = Math.round((ind / total) * 100);
        return `- ${p.target}: ${total} trials logged (${pct}% Independent).`;
     }).join('\n');

     const prompt = `You are a BCBA. Write a professional, clinical ABA SOAP note for client ${activeClient.name} (Age ${activeClient.age}).

     Client Profile Context: ${activeClient.profile}

     Data Collected Today:
     ${stats}

     Format the response strictly with the following headings:
     **Subjective:**
     **Objective:**
     **Assessment:**
     **Plan:**

     Keep the tone highly objective, clinical, and concise.`;

     try {
       const result = await callGemini(prompt, apiKey, "You are a BCBA clinical assistant.");
       setDraft(result || "AI returned no content.");
     } catch (err) {
       setDraft("AI Error: " + err.message);
     }
     setIsGenerating(false);
  };

  const handleSave = () => {
     if (!draft.trim()) {
       showToast("Note is empty.", "error");
       return;
     }
     setSessionNotes(prev => [...prev, { id: Date.now(), clientId: activeClient.id, date: new Date().toLocaleDateString(), text: draft }]);
     setDraft('');
     showToast("Session note finalized and secured.");
  };

  const clientNotes = sessionNotes.filter(n => n.clientId === activeClient.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className={dfpStyles.sectionBorder}>
        <FileSignature size={28} className="text-fuchsia-400" />
        <h2 className="text-3xl font-black text-white tracking-tight">Clinical Documentation</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Section */}
        <div className={`${dfpStyles.panel} flex flex-col h-[500px]`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-400">SOAP Note Drafter</h3>
            <button onClick={handleGenerate} disabled={isGenerating} className="bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-fuchsia-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50">
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Auto-Generate
            </button>
          </div>

          <textarea
            className="flex-1 w-full bg-dfp border border-dfp-border rounded-[1.5rem] p-6 text-sm text-slate-300 focus:outline-none focus:border-fuchsia-500 transition-all custom-scrollbar resize-none"
            placeholder="Click Auto-Generate to synthesize today's data into a clinical note, or type manually..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />

          <div className="mt-4 flex justify-end">
             <button onClick={handleSave} disabled={!draft.trim() || isGenerating} className={`${dfpStyles.btnAction} px-8 py-3 rounded-xl disabled:opacity-50 flex items-center gap-2`}>
                <Save size={16} /> Save to Vault
             </button>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-dfp-light/40 p-8 rounded-[2.5rem] border border-dfp-border overflow-y-auto custom-scrollbar h-[500px]">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 sticky top-0 bg-dfp-light/40 py-2">Past Records</h3>
          {clientNotes.length === 0 ? (
            <div className="text-center py-10 text-slate-500 italic text-sm">No saved notes for this client.</div>
          ) : (
            <div className="space-y-4">
              {clientNotes.slice().reverse().map(note => (
                <div key={note.id} className="bg-dfp p-5 rounded-2xl border border-dfp-border">
                  <div className="text-[10px] font-bold text-cyan-400 mb-2 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12}/> {note.date}</div>
                  <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
