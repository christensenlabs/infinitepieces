import { useState } from 'react';

export default function MatchingLawCalc() {
  const [r1, setR1] = useState(10);
  const [r2, setR2] = useState(2);

  const totalR = r1 + r2;
  const b1 = totalR > 0 ? (r1 / totalR) * 100 : 0;
  const b2 = totalR > 0 ? (r2 / totalR) * 100 : 0;

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm">Input the rate of reinforcement for two concurrent schedules to predict choice behavior distribution.</p>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Rate of Reinforcement 1 (R1)</label>
          <input type="number" min="0" value={r1} onChange={e => setR1(Number(e.target.value))} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">Rate of Reinforcement 2 (R2)</label>
          <input type="number" min="0" value={r2} onChange={e => setR2(Number(e.target.value))} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none" />
        </div>
      </div>
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <h4 className="text-white font-bold mb-4">Predicted Behavioral Distribution</h4>
        <div className="w-full h-8 flex rounded-lg overflow-hidden font-bold text-xs text-white bg-slate-800">
          {b1 > 0 && <div className="bg-indigo-500 flex items-center justify-center transition-all duration-500 whitespace-nowrap overflow-hidden" style={{ width: `${b1}%` }}>B1 ({b1.toFixed(1)}%)</div>}
          {b2 > 0 && <div className="bg-slate-600 flex items-center justify-center transition-all duration-500 whitespace-nowrap overflow-hidden" style={{ width: `${b2}%` }}>B2 ({b2.toFixed(1)}%)</div>}
        </div>
      </div>
    </div>
  );
}
