import React from 'react';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';

export default function HipaaLogs({ auditLogs }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
           <div>
             <h3 className="heading-section text-brand-navy">Immutable Access & Security Logs</h3>
             <p className="text-sm text-slate-500 mt-1">Live tracking of every action taken within this prototype.</p>
           </div>
         </div>

         {auditLogs.length === 0 ? (
           <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-medium">Log is empty. Actions taken in the app will appear here automatically.</div>
         ) : (
           <div className="space-y-3">
             {auditLogs.map(log => (
               <div key={log.id} className="flex flex-col md:flex-row justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm">
                 <div className="flex gap-4 items-start">
                   <div className="text-slate-400 mt-1"><Icon name="userShield"/></div>
                   <div>
                     <p className="font-bold text-brand-navy">{log.user} <span className="font-normal text-slate-500">performed:</span> {log.action}</p>
                     <p className="text-xs text-slate-500 mt-1">Target: <span className="font-bold text-brand-navy">{log.target}</span></p>
                   </div>
                 </div>
                 <div className="mt-3 md:mt-0 md:text-right flex flex-row md:flex-col justify-between items-end">
                   <Badge tone={log.risk === 'High' ? 'red' : log.risk === 'Medium' ? 'gold' : 'slate'}>{log.risk} Risk</Badge>
                   <p className="text-[10px] text-slate-400 mt-2 font-mono">{log.timestamp}</p>
                 </div>
               </div>
             ))}
           </div>
         )}
      </Card>
    </div>
  );
}
