import React from 'react';
import { cn } from '../utils';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';

export default function Providers({ providers, deleteProvider, onAddProvider, supervisionThreshold }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <Card>
         <div className="flex justify-between items-center mb-6">
           <div>
             <h3 className="text-xl font-black text-brand-navy">Providers & Supervision</h3>
             <p className="text-sm text-slate-500 mt-1">Live tracking of {supervisionThreshold}% rule and BACB expirations.</p>
           </div>
           <button onClick={onAddProvider} className="bg-accent-gold-muted text-white px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-sm hover:bg-amber-500"><Icon name="plus"/> Add Provider</button>
         </div>

         {providers.length === 0 ? (
           <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-medium">Zero providers in system.</div>
         ) : (
           <div className="overflow-x-auto custom-scrollbar pb-4">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead>
                 <tr className="border-b border-slate-200 text-slate-500">
                   <th className="py-3 font-black uppercase text-[10px] tracking-wider">Provider</th>
                   <th className="py-3 font-black uppercase text-[10px] tracking-wider">BACB Expiration</th>
                   <th className="py-3 font-black uppercase text-[10px] tracking-wider">OIG Status</th>
                   <th className="py-3 font-black uppercase text-[10px] tracking-wider">{supervisionThreshold}% Rule Status</th>
                   <th className="py-3 font-black uppercase text-[10px] tracking-wider text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {providers.map(prov => {
                   const supPass = Number(prov.supPercent) >= supervisionThreshold;
                   const isExp = new Date(prov.bacbExp) < new Date();
                   return (
                     <tr key={prov.id} className={!supPass || isExp ? 'bg-rose-50/30' : ''}>
                       <td className="py-4">
                         <p className="font-bold text-brand-navy">{prov.name}</p>
                         <p className="text-[10px] font-bold uppercase text-slate-500">{prov.role}</p>
                       </td>
                       <td className="py-4"><Badge tone={isExp ? 'red' : 'green'}>{prov.bacbExp}</Badge></td>
                       <td className="py-4"><Badge tone={prov.oigCleared ? 'green' : 'red'}>{prov.oigCleared ? 'Cleared' : 'Flagged'}</Badge></td>
                       <td className="py-4">
                         {prov.role === 'RBT' ? (
                           <div className="flex items-center gap-3">
                             <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                               <div className={cn("h-1.5 rounded-full transition-all duration-1000", supPass ? 'bg-emerald-500' : 'bg-rose-500')} style={{width: `${Math.min((prov.supPercent/supervisionThreshold)*100, 100)}%`}}></div>
                             </div>
                             <span className={cn("text-xs font-black", supPass ? 'text-emerald-600' : 'text-rose-600')}>{prov.supPercent}%</span>
                           </div>
                         ) : <span className="text-xs text-slate-400">—</span>}
                       </td>
                       <td className="py-4 text-right"><button onClick={() => deleteProvider(prov.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"><Icon name="trash"/></button></td>
                     </tr>
                   )
                 })}
               </tbody>
             </table>
           </div>
         )}
      </Card>
    </div>
  );
}
