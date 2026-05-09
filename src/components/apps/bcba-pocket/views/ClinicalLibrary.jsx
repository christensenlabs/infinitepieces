import { useState } from 'react';
import { BookOpen, Search, Database, Loader2, Save } from 'lucide-react';
import { callGemini } from '../../../../lib/gemini';
import { renderMarkdown } from '../../../../lib/renderMarkdown';

export default function ClinicalLibrary({ apiKey, showToast, onCopy }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchLibrary = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResults('');
    const userPrompt = `Search query: ${query}\n\nAct as a 10,000+ document semantic search engine. Search your knowledge base of the 2026 BACB Ethics Code, ABA CPT Medical Billing Codes, Tricare/Medicaid ABA requirements, and 100 years of JABA/JEAB behavioral literature. Provide a highly detailed, deeply researched, and authoritative answer. Cite sources, code numbers, or authors where applicable.`;
    const systemPrompt = 'You are the BehaviorAlly Expert Library Engine. You possess infinite, highly accurate knowledge regarding Applied Behavior Analysis, medical necessity criteria, and ethics.';
    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) setResults(text);
      else throw new Error('Search failed.');
    } catch { showToast('Library search failed due to network error.', 'error'); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-6xl space-y-6 animate-in fade-in h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 flex items-center"><BookOpen className="mr-3 text-indigo-400" size={32} /> Expert Insurance &amp; Clinical Library</h2>
        <p className="text-slate-400 text-sm max-w-3xl">Search a simulated database of over 10,000+ documents including Tricare/Medicaid Medical Necessity manuals, the 2026 BACB Ethics code, CPT coding guidelines, and deep behavioral science literature.</p>
      </div>
      <div className="flex items-center bg-slate-900/80 border-2 border-slate-700 rounded-2xl px-4 py-2 focus-within:border-indigo-500 transition-colors shadow-lg">
        <Search className="text-slate-500 mr-3" size={24} />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchLibrary()} placeholder="e.g. What are the CPT codes for concurrent billing of 97153 and 97155?" className="flex-1 bg-transparent border-none text-lg text-white py-3 focus:outline-none" />
        <button onClick={searchLibrary} disabled={isLoading || !query} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : 'Deep Search'}
        </button>
      </div>
      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center z-10">
          <h3 className="font-bold text-white flex items-center"><Database size={16} className="mr-2 text-indigo-400" /> Library Extraction Results</h3>
          {results && <button onClick={() => onCopy(results)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center"><Save size={14} className="mr-2" /> Copy Extraction</button>}
        </div>
        <div className="p-8 overflow-y-auto prose prose-invert max-w-none text-sm leading-relaxed custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4"><Loader2 size={40} className="animate-spin" /><span className="font-medium animate-pulse tracking-widest uppercase text-xs">Querying 10,000+ Documents...</span></div>
          ) : results ? (
            <div>{renderMarkdown(results)}</div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-slate-600"><BookOpen size={64} className="mb-4 opacity-20" /><p className="text-lg">Database Ready.</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
