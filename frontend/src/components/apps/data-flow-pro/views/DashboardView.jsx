import { useState } from 'react';
import {
  Activity, Users, Calendar, Sparkles,
  ShieldCheck, Target, Cpu
} from 'lucide-react';
import Card from '../components/Card';
import { dfpStyles } from '../styles';

export default function DashboardView({ clients, activeClient, setActiveClient, setActiveTab }) {
  const [goalsMastered] = useState(() => Math.floor(Math.random() * 20) + 5);
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card icon={<Activity/>} label="Active Trials" value={clients.length * 2} color="text-emerald-400" />
         <Card icon={<ShieldCheck/>} label="Note Compliance" value="100%" color="text-cyan-400" />
         <Card icon={<Users/>} label="Total Caseload" value={clients.length} color="text-blue-400" />
         <Card icon={<Target/>} label="Goals Mastered" value={goalsMastered} color="text-fuchsia-400" />
      </div>

      <section>
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2"><Calendar size={16}/> Assigned Clients</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
           {clients.length === 0 ? (
             <div className="w-full text-center py-12 border border-dfp-border rounded-[2rem] border-dashed text-slate-500">No active clients in database.</div>
           ) : clients.map(c => (
             <button key={c.id} onClick={() => setActiveClient(c)} className={`min-w-[280px] p-6 rounded-[2.5rem] border-2 transition-all text-left ${activeClient?.id === c.id ? dfpStyles.cardActive : 'bg-dfp ' + dfpStyles.cardInactive}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black text-xl border border-cyan-500/30">{String(c.name).charAt(0)}</div>
                  <Cpu size={16} className="text-slate-600" />
                </div>
                <h4 className="text-2xl font-black text-white truncate mb-1">{c.name}</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold line-clamp-1">{c.profile}</p>
             </button>
           ))}
        </div>
      </section>

      <div className="bg-dfp-light/80 p-8 rounded-[3rem] border border-dfp-border shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-3"><Sparkles className="text-cyan-400"/> AI Session Insights</h2>
          <p className="text-sm text-slate-400 mt-2">Generate automatic SOAP notes from collected data.</p>
        </div>
        <button onClick={() => setActiveTab('notes')} className={`${dfpStyles.btnAction} px-6 py-3 rounded-xl shadow-cyan-500/20`}>Draft Note</button>
      </div>
    </div>
  );
}
