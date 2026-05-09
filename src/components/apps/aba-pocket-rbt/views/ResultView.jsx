import React from 'react';
import { CheckCircle2, RefreshCw, Copy, Save } from 'lucide-react';
import { renderMarkdown } from '../../../../lib/renderMarkdown';

export default function ResultView({ generatedResult, permissions, role, setActiveTab, setGeneratedResult, copyToClipboard, saveToLibrary }) {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-8">
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
        <p className="font-bold text-emerald-800">Generation Complete</p>
      </div>
      <div className="prose prose-sm md:prose-base max-w-none text-slate-700">{renderMarkdown(generatedResult)}</div>
      <div className="flex flex-col sm:flex-row gap-4 border-t pt-6">
        <button onClick={() => { setActiveTab(permissions[role]?.[0] || 'abAnalyzer'); setGeneratedResult(''); }} className="flex-1 bg-slate-100 hover:bg-slate-200 hover:scale-[1.02] transition-transform text-slate-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4"/> Start New</button>
        <button onClick={() => copyToClipboard(generatedResult)} className="flex-1 bg-slate-100 hover:bg-slate-200 hover:scale-[1.02] transition-transform text-slate-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Copy className="w-4 h-4"/> Copy</button>
        <button onClick={saveToLibrary} className="flex-1 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] transition-transform text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4"/> Save Artifact</button>
      </div>
    </div>
  );
}
