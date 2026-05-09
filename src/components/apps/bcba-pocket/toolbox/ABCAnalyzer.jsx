import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { callGemini } from '../../../../lib/gemini';
import { renderMarkdown } from '../../../../lib/renderMarkdown';

export default function ABCAnalyzer({ apiKey }) {
  const [abcData, setAbcData] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const analyzeData = async () => {
    if (!abcData.trim()) return;
    setIsLoading(true);
    const userPrompt = `Analyze the following raw ABC (Antecedent-Behavior-Consequence) narrative data:\n\n${abcData}\n\nTask: 1. Identify the most likely hypothesized function(s) of the behavior (Escape, Attention, Access to Tangibles, Sensory/Automatic). 2. Provide a brief summary of the behavioral patterns and maintaining contingencies observed. Format nicely in markdown.`;
    const systemPrompt = 'You are an elite Board Certified Behavior Analyst. Analyze raw behavioral data accurately and provide clinical insights based on operant conditioning.';
    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) setAnalysis(text);
    } catch {
      setAnalysis('Error analyzing data. Please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6">
      {!analysis ? (
        <>
          <p className="text-slate-400 text-sm">Paste your unstructured ABC narrative data below. The LLM will identify contingencies and hypothesize behavioral function.</p>
          <textarea value={abcData} onChange={(e) => setAbcData(e.target.value)} placeholder={'e.g. A: Told to do math. B: Ripped paper. C: Sent to hall.\nA: Peer took toy. B: Hit peer. C: Got toy back.'} className="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-sm focus:border-indigo-500 outline-none resize-y custom-scrollbar" />
          <button onClick={analyzeData} disabled={isLoading || !abcData} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center">
            {isLoading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Sparkles size={18} className="mr-2" />} Extract Patterns
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 max-h-80 overflow-y-auto prose prose-invert text-sm custom-scrollbar">
            <div>{renderMarkdown(analysis)}</div>
          </div>
          <button onClick={() => setAnalysis('')} className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-3 rounded-xl transition-colors">Analyze New Data</button>
        </div>
      )}
    </div>
  );
}
