import { useState } from 'react';

export default function RFTBuilder() {
  const [a, setA] = useState('Spoken Word "Dog"');
  const [b, setB] = useState('Picture of Dog');
  const [c, setC] = useState('Text "D-O-G"');
  const [derived, setDerived] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div><label className="text-xs font-bold text-slate-500">Stimulus A</label><input value={a} onChange={e => setA(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" /></div>
        <div><label className="text-xs font-bold text-slate-500">Stimulus B</label><input value={b} onChange={e => setB(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" /></div>
        <div><label className="text-xs font-bold text-slate-500">Stimulus C</label><input value={c} onChange={e => setC(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" /></div>
      </div>
      {!derived ? (
        <button onClick={() => setDerived(true)} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition-colors">Derive Relations</button>
      ) : (
        <div className="bg-slate-950 p-6 rounded-2xl border border-purple-500/30 animate-in zoom-in-95 space-y-4">
          <h4 className="text-white font-bold mb-2">Derived Relational Responding:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-xs block mb-1">Mutual Entailment (Symmetry)</span>
              <span className="text-purple-400 font-bold">{b} = {a}</span><br />
              <span className="text-purple-400 font-bold">{c} = {b}</span>
            </div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-xs block mb-1">Combinatorial Entailment</span>
              <span className="text-emerald-400 font-bold">{a} = {c}</span> (Transitivity)<br />
              <span className="text-emerald-400 font-bold">{c} = {a}</span> (Equivalence)
            </div>
          </div>
          <button onClick={() => setDerived(false)} className="text-slate-400 text-xs hover:text-white underline w-full text-center mt-2">Reset Frame</button>
        </div>
      )}
    </div>
  );
}
