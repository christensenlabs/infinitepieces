import { Database, Loader2, Download } from 'lucide-react';
import { renderMarkdown } from '../../../../lib/renderMarkdown';
import InputField from '../components/InputField';

export default function ProgramGenerator({ data, onChange, onGenerate, generated, isLoading, onCopy, onExport }) {
  return (
    <div className="max-w-6xl flex gap-6 animate-in fade-in h-full">
      <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
        <h3 className="font-bold text-white border-b border-slate-800 pb-2">Program Parameters</h3>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Domain</label>
          <select name="domain" value={data.domain} onChange={onChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>Communication</option><option>Social Skills</option><option>Adaptive / Daily Living</option><option>Play &amp; Leisure</option><option>Motor Skills</option><option>Executive Functioning</option>
          </select>
        </div>
        <InputField label="Target Skill" name="target" value={data.target} onChange={onChange} placeholder="e.g., Tacting colors, Hand washing..." />
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Teaching Method</label>
          <select name="type" value={data.type} onChange={onChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>DTT (Discrete Trial Training)</option><option>NET (Natural Environment Teaching)</option><option>TA (Task Analysis / Chaining)</option><option>Shaping</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Prompting Strategy</label>
          <select name="promptStrategy" value={data.promptStrategy} onChange={onChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>Least-to-Most (LTM)</option><option>Most-to-Least (MTL)</option><option>Errorless (0s Time Delay)</option><option>Progressive Time Delay</option><option>Graduated Guidance</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Mastery Criteria</label>
          <select name="mastery" value={data.mastery} onChange={onChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>80% across 3 consecutive sessions</option><option>90% across 2 consecutive sessions</option><option>100% across 2 consecutive sessions</option><option>First Trial Data (80% over 3 days)</option>
          </select>
        </div>
        <button onClick={onGenerate} disabled={isLoading || !data.target} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex justify-center items-center transition-all">
          <Database size={18} className="mr-2" /> Generate CR Protocol
        </button>
      </div>
      <div className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Generated CentralReach Protocol</h3>
          {generated && (
            <div className="flex space-x-2">
              <button onClick={() => onExport('CentralReach')} className="bg-emerald-600/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600/30 flex items-center"><Download size={14} className="mr-1" /> Export</button>
              <button onClick={() => onCopy(generated)} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700">Copy</button>
            </div>
          )}
        </div>
        <div className="p-8 overflow-y-auto prose prose-invert text-sm max-w-none custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4"><Loader2 size={32} className="animate-spin" /><span className="font-medium animate-pulse">Structuring CentralReach protocol...</span></div>
          ) : generated ? (
            <div>{renderMarkdown(generated)}</div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600"><Database size={48} className="mb-4 opacity-30" /><p>Awaiting parameters...</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
