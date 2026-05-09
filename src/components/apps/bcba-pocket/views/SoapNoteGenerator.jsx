import { Edit3, Sparkles, Loader2, Save } from 'lucide-react';
import { renderMarkdown } from '../../../../lib/renderMarkdown';
import InputField from '../components/InputField';
import TextAreaField from '../components/TextAreaField';

export default function SoapNoteGenerator({ data, onChange, onGenerate, generated, isLoading, onCopy }) {
  return (
    <div className="max-w-6xl flex gap-6 animate-in fade-in h-full">
      <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
        <h3 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center">
          <Edit3 className="mr-2 text-indigo-400" size={20} /> Session Details
        </h3>
        <p className="text-slate-400 text-xs mb-4">Paste your raw shorthand notes. The AI will format them into an insurance-compliant SOAP structure.</p>
        <InputField label="Client Initials" name="clientInitials" value={data.clientInitials} onChange={onChange} placeholder="e.g. J.D." />
        <InputField label="Session Length" name="sessionLength" value={data.sessionLength} onChange={onChange} placeholder="e.g. 120 mins" />
        <TextAreaField label="Raw Shorthand Notes" name="rawNotes" value={data.rawNotes} onChange={onChange} placeholder="e.g. hit peer 3x. worked on FCT for breaks..." rows={8} />
        <button onClick={onGenerate} disabled={isLoading || !data.rawNotes} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex justify-center items-center transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />} Synthesize SOAP Note
        </button>
      </div>
      <div className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Generated Medical Record</h3>
          {generated && <button onClick={() => onCopy(generated)} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center"><Save size={14} className="mr-2" /> Copy for EHR</button>}
        </div>
        <div className="p-8 overflow-y-auto prose prose-invert max-w-none text-sm custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4"><Loader2 size={32} className="animate-spin" /><span className="font-medium animate-pulse">Structuring clinical narrative...</span></div>
          ) : generated ? (
            <div>{renderMarkdown(generated)}</div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600"><Edit3 size={48} className="mb-4 opacity-30" /><p>Awaiting raw notes...</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
