import { useState } from 'react';
import { ShieldAlert, Sparkles, Loader2 } from 'lucide-react';
import { callGemini } from '@/lib/gemini';

export default function BehaviorsView({ behaviors, setBehaviors, activeClient, isBCBA, showToast, apiKey }) {
  const [newBx, setNewBx] = useState({ name: '', opDef: '', type: 'frequency' });
  const [isDrafting, setIsDrafting] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newBx.name.trim()) return;
    setBehaviors(prev => [...prev, { id: Date.now(), clientId: activeClient?.id, ...newBx }]);
    setNewBx({ name: '', opDef: '', type: 'frequency' });
    showToast("Behavior tracking protocol added.");
  };

  const draftDefinition = async (e) => {
    e.preventDefault();
    if (!newBx.name.trim()) return showToast("Enter a behavior name first.", "error");
    setIsDrafting(true);
    try {
      const prompt = `Write a clinical, one-sentence operational definition for the behavior: "${newBx.name}". Keep it objective and measurable. Exclude subjective terms. Do not include introductory text, just the definition.`;
      const result = await callGemini(prompt, apiKey, "You are a BCBA clinical assistant.");
      setNewBx({ ...newBx, opDef: (result || '').replace(/^"|"$/g, '').trim() });
    } catch (err) {
      showToast("AI draft failed: " + err.message, "error");
    }
    setIsDrafting(false);
  };

  if (!activeClient) return <div className="p-8 text-slate-500 text-center">Select a client first.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-dfp-border pb-4">
        <ShieldAlert size={28} className="text-rose-500" />
        <h2 className="text-3xl font-black text-white tracking-tight">Target Behaviors</h2>
      </div>
      {isBCBA && (
        <div className="bg-dfp-light/80 p-8 rounded-[2rem] border border-dfp-border shadow-lg">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-6">Create Target Behavior</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input className="flex-1 bg-dfp border border-dfp-border text-white p-4 rounded-xl outline-none focus:border-cyan-400 text-sm font-bold uppercase" placeholder="Behavior Identifier (e.g. Elopement)" value={newBx.name} onChange={e => setNewBx({...newBx, name: e.target.value})}/>
              <select className="bg-dfp border border-dfp-border text-cyan-400 p-4 rounded-xl font-black text-sm outline-none focus:border-cyan-400" value={newBx.type} onChange={e => setNewBx({...newBx, type: e.target.value})}><option value="frequency">Count</option><option value="duration">Timer</option></select>
            </div>
            <div className="relative">
              <textarea className="w-full bg-dfp border border-dfp-border text-white p-4 rounded-xl outline-none focus:border-cyan-400 text-sm h-28 custom-scrollbar pr-40" placeholder="Operationalized Topography" value={newBx.opDef} onChange={e => setNewBx({...newBx, opDef: e.target.value})}/>
              <button onClick={draftDefinition} disabled={isDrafting} className="absolute right-3 top-3 bg-dfp-light hover:bg-dfp-border text-cyan-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-colors border border-dfp-border disabled:opacity-50 flex items-center gap-1">
                {isDrafting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {isDrafting ? 'Drafting...' : 'Auto-Draft'}
              </button>
            </div>
            <button type="submit" className="bg-rose-600 text-white px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-rose-500 transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)]">Add Protocol</button>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {behaviors.map(b => (
          <div key={b.id} className="p-6 bg-dfp-light/50 rounded-[2rem] border border-dfp-border shadow-sm relative group">
            <span className="absolute top-0 right-0 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border-b border-l border-rose-500/20 px-3 py-1 rounded-bl-xl">{b.type}</span>
            <h4 className="font-black text-xl text-white mt-1 pr-12">{b.name}</h4>
            <p className="text-sm text-slate-400 mt-2 font-medium border-l-2 border-rose-500 pl-3">{b.opDef}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
