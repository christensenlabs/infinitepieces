import { AlertCircle, Sparkles, Loader2, ChevronRight, Save } from 'lucide-react';
import { renderMarkdown } from '@/lib/renderMarkdown';
import InputField from '../components/InputField';
import TextAreaField from '../components/TextAreaField';

export function PlanGeneratorForm({ data, onChange, onGenerate, error }) {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">2026 Treatment Plan Synthesizer</h2>
        <p className="text-slate-400 text-sm">Input data. Your Pocket Professor will construct a bulletproof, 2026 compliant plan.</p>
      </div>
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex space-x-6 mb-4">
          <label className="flex items-center space-x-2 text-sm text-emerald-400 font-bold cursor-pointer">
            <input type="checkbox" name="includeAssent" checked={data.includeAssent} onChange={onChange} className="rounded bg-slate-900 border-slate-700 text-emerald-500" />
            <span>Assent-Based Criteria</span>
          </label>
          <label className="flex items-center space-x-2 text-sm text-indigo-400 font-bold cursor-pointer">
            <input type="checkbox" name="traumaInformed" checked={data.traumaInformed} onChange={onChange} className="rounded bg-slate-900 border-slate-700 text-indigo-500" />
            <span>Trauma-Informed</span>
          </label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Initials" name="initials" value={data.initials} onChange={onChange} />
          <InputField label="Age" name="age" value={data.age} onChange={onChange} />
          <InputField label="Diagnosis" name="diagnosis" value={data.diagnosis} onChange={onChange} />
        </div>
        <TextAreaField label="Target Behaviors (Raw Data)" name="behaviors" value={data.behaviors} onChange={onChange} rows={2} />
        <TextAreaField label="Skill Domains" name="skills" value={data.skills} onChange={onChange} rows={2} />
        <TextAreaField label="Caregiver Goals" name="caregiverGoals" value={data.caregiverGoals} onChange={onChange} rows={2} />
      </div>
      <div className="flex justify-end">
        <button onClick={onGenerate} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all">
          <Sparkles size={18} /><span>Synthesize Plan</span>
        </button>
      </div>
    </div>
  );
}

export function PlanViewer({ plan, isLoading, onCopy, onBack }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-emerald-400">
        <Loader2 size={40} className="animate-spin mb-4" /><b>Synthesizing Data...</b>
      </div>
    );
  }
  return (
    <div className="max-w-4xl space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm flex items-center">
          <ChevronRight className="rotate-180 mr-1" size={16} /> Back
        </button>
        <button onClick={onCopy} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center">
          <Save size={16} className="mr-2" /> Copy to Clipboard
        </button>
      </div>
      <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 prose prose-invert max-w-none text-slate-300">
        {plan ? <div>{renderMarkdown(plan)}</div> : 'No plan generated.'}
      </div>
    </div>
  );
}
