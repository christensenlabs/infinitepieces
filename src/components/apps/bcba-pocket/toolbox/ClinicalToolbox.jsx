import { Zap, Database, BarChart2, Activity, Network } from 'lucide-react';

function ToolCard({ title, desc, icon, color, onLaunch }) {
  const colorMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-600',
    emerald: 'text-emerald-400 bg-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-600',
    purple: 'text-purple-400 bg-purple-500/10 hover:border-purple-500/30 hover:bg-purple-600',
  };
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col transition-colors group">
      <div className={`p-3 rounded-xl w-fit mb-4 ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`}>{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 flex-1">{desc}</p>
      <button onClick={onLaunch} className={`w-full bg-slate-800 text-white text-sm font-bold py-3 rounded-xl transition-colors ${colorMap[color].split(' ')[3]}`}>Launch Tool</button>
    </div>
  );
}

export default function ClinicalToolbox({ onOpenModal }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full">
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8">
        <h2 className="text-3xl font-black text-white flex items-center"><Zap className="mr-3 text-indigo-400" size={32} /> Advanced Clinical Toolbox</h2>
        <p className="text-slate-400 mt-2">Powered by 100 years of Applied Behavior Analysis.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ToolCard title="ABC Data Analyzer" desc="Paste raw ABC narrative data. The AI will extract patterns and hypothesize the behavioral function." icon={<Database size={24} />} color="indigo" onLaunch={() => onOpenModal('abc')} />
        <ToolCard title="Matching Law Modeler" desc="Calculate relative rates of responding across concurrent schedules of reinforcement." icon={<BarChart2 size={24} />} color="emerald" onLaunch={() => onOpenModal('matching')} />
        <ToolCard title="FA Synthesizer" desc="Determine behavioral function and isolate variables based on Iwata et al. (1982/1994)." icon={<Activity size={24} />} color="purple" onLaunch={() => onOpenModal('fa')} />
        <ToolCard title="RFT Matrix Builder" desc="Build relational frames (Coordination) and generate derived relational responding targets." icon={<Network size={24} />} color="indigo" onLaunch={() => onOpenModal('rft')} />
      </div>
    </div>
  );
}
