import React from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';

export default function ClaimScrubber({ claims, deleteClaim, onAddClaim }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
       <Card>
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
           <div>
             <h3 className="heading-section text-brand-navy">Pre-Billing Scrubber</h3>
             <p className="text-sm text-slate-500 mt-1">Add raw claims below. Click &ldquo;Run Deep Scrub&rdquo; at the top to process them.</p>
           </div>
           <button onClick={onAddClaim} className="btn-gold"><Icon name="plus"/> Add Claim</button>
         </div>

         {claims.length === 0 ? (
           <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-medium">Zero claims in system. Click &ldquo;Add Claim&rdquo; to begin.</div>
         ) : (
           <div className="overflow-x-auto custom-scrollbar pb-4">
             <table className="w-full text-left text-sm whitespace-nowrap">
               <thead>
                 <tr className="border-b border-slate-200 text-slate-500">
                   <th className="py-3 font-black uppercase text-[10px] tracking-wider">Date / Client</th>
                   <th className="py-3 font-black uppercase text-[10px] tracking-wider">Codes Billed</th>
                   <th className="py-3 font-black uppercase text-[10px] tracking-wider">Scrubber Result</th>
                   <th className="py-3 font-black uppercase text-[10px] tracking-wider">Status</th>
                   <th className="py-3 font-black uppercase text-[10px] tracking-wider text-right">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {claims.map(claim => (
                   <tr key={claim.id} className={claim.status === 'Hold' ? 'bg-rose-50/30' : ''}>
                     <td className="py-4"><p className="font-bold text-brand-navy">{claim.date}</p><p className="text-slate-500 text-xs">{claim.client}</p></td>
                     <td className="py-4">
                        {claim.codes.map(c => <Badge key={c} tone="slate" className="mr-1">{c}</Badge>)}
                        {claim.modifier && <Badge tone="gold">Mod applied</Badge>}
                     </td>
                     <td className="py-4">
                       {claim.status === 'Pending Scrub' && <span className="text-slate-400 font-bold text-xs"><Icon name="clock"/> Awaiting Scrub</span>}
                       {claim.status === 'Clean' && <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs"><Icon name="checkCircle"/> Audit Passed</span>}
                       {claim.status === 'Hold' && <span className="text-rose-600 font-bold flex items-center gap-1 text-xs"><Icon name="alertTriangle"/> {claim.error}</span>}
                     </td>
                     <td className="py-4"><Badge tone={claim.status === 'Clean' ? 'green' : claim.status === 'Hold' ? 'red' : 'slate'}>{claim.status}</Badge></td>
                     <td className="py-4 text-right"><button onClick={() => deleteClaim(claim.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"><Icon name="trash"/></button></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
       </Card>
    </div>
  );
}
