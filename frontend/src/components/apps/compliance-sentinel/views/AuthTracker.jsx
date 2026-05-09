import React from 'react';
import { cn } from '../utils';
import Icon from '../components/Icon';
import Badge from '../components/Badge';
import Card from '../components/Card';

export default function AuthTracker({ auths, deleteAuth, onAddAuth }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
      <Card>
         <div className="flex justify-between items-center mb-6">
           <div>
             <h3 className="text-xl font-black text-[#12214A]">Authorization Database</h3>
             <p className="text-sm text-slate-500 mt-1">Required for the scrubber to verify claims.</p>
           </div>
           <button onClick={onAddAuth} className="bg-[#D7A83F] text-white px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-sm hover:bg-amber-500"><Icon name="plus"/> Add Auth</button>
         </div>

         {auths.length === 0 ? (
           <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-medium">Zero authorizations in system. Claims will fail scrub until auths are added.</div>
         ) : (
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
             {auths.map(auth => {
               const percent = (auth.used / auth.total) * 100;
               return (
                 <div key={auth.id} className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 relative">
                   <button onClick={() => deleteAuth(auth.id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border shadow-sm transition-colors"><Icon name="trash"/></button>
                   <p className="font-black text-lg text-[#12214A]">{auth.client}</p>
                   <p className="text-xs font-bold text-slate-500 mb-4">{auth.payer} • Code: {auth.code}</p>
                   <div className="flex justify-between text-xs font-bold mb-1">
                     <span className="text-[#12214A]">{auth.used} used</span>
                     <span className="text-slate-500">{auth.total} total</span>
                   </div>
                   <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden">
                     <div className={cn("h-2 rounded-full transition-all duration-1000", percent >= 100 ? "bg-rose-500" : percent > 75 ? "bg-amber-500" : "bg-emerald-500")} style={{width: `${Math.min(percent, 100)}%`}}></div>
                   </div>
                   <Badge tone={new Date(auth.expire) < new Date() ? 'red' : 'slate'}>Exp: {auth.expire}</Badge>
                 </div>
               )
             })}
           </div>
         )}
      </Card>
    </div>
  );
}
