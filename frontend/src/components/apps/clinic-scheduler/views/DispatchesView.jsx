import React from 'react';
import {
  Calendar, CheckCircle, Sparkles, Loader2, Radio
} from 'lucide-react';

export default function DispatchesView({
  shifts, dispatchToPool, markResolved,
  drafts, setDrafts, isDrafting, generateDraft,
  makeupSlots, isFindingMakeup, handleFindMakeup
}) {
  const activeDispatches = shifts.filter(s => s.status === 'uncovered' || s.status === 'parent_cancel');

  return (
    <div className="fade-in space-y-6 overflow-y-auto flex-1 pb-10 custom-scrollbar">
      <div className="bg-sched-panel p-6 rounded-xl border border-sched-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Tri-Channel Dispatch Hub</h2>
          <p className="text-slate-400 text-sm mt-1">Intercepted Parent Cancellations and Staff Exceptions stream here automatically.</p>
        </div>
        <span className={`${activeDispatches.length > 0 ? 'bg-red-900/40 text-red-400 border border-red-700/50' : 'bg-green-900/40 text-green-400 border border-green-700/50'} font-bold px-4 py-2 rounded-lg shrink-0`}>
          {activeDispatches.length} Active Alerts
        </span>
      </div>

      {activeDispatches.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-sched-border bg-sched-panel rounded-xl">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-3" />
          <p className="text-white font-medium text-lg">Inbox Zero</p>
          <p className="text-slate-400">All sessions are currently staffed and running smoothly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeDispatches.map(dispatch => (
            <div key={dispatch.id} className="bg-sched-panel border-l-4 border-l-yellow-500 border border-sched-border rounded-xl p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4 border-b border-sched-border pb-4">
                <div>
                  <div className="flex items-center mb-2 flex-wrap gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-orange-900/40 text-orange-400 border border-orange-700/50">Coverage Needed</span>
                    <h3 className="font-bold text-white text-lg">{dispatch.clientName || dispatch.patientName}</h3>
                  </div>
                  {dispatch.date && <p className="text-sm text-slate-400 flex items-center"><Calendar size={14} className="mr-2"/> {dispatch.date} at {dispatch.startTime}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                   <button onClick={() => dispatchToPool(dispatch)} className="px-4 py-2 bg-yellow-500 text-sched-bg font-black uppercase tracking-widest rounded-lg text-xs hover:bg-yellow-600 transition-colors flex items-center gap-1.5"><Radio size={14} /> Dispatch SubPool</button>
                   <button onClick={() => markResolved(dispatch.id)} className="px-4 py-2 bg-sched-bg text-slate-300 hover:text-white border border-sched-border hover:border-slate-400 font-bold rounded-lg text-sm transition-colors whitespace-nowrap">Mark Resolved</button>
                </div>
              </div>

              <div className="bg-sched-bg p-4 rounded-lg border border-sched-border">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Tri-Channel AI Communications</h4>
                 <div className="flex flex-wrap gap-3">
                     <button onClick={() => generateDraft(dispatch, 'to_parent')} disabled={isDrafting[dispatch.id + 'to_parent']} className="px-4 py-2 bg-indigo-900/30 text-indigo-400 border border-indigo-700/50 rounded-lg text-sm font-bold hover:bg-indigo-900/50 flex items-center disabled:opacity-50">{isDrafting[dispatch.id + 'to_parent'] ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>} Text Parent</button>
                     <button onClick={() => handleFindMakeup(dispatch)} disabled={isFindingMakeup[dispatch.id]} className="px-4 py-2 bg-emerald-900/30 text-emerald-400 border border-emerald-700/50 rounded-lg text-sm font-bold hover:bg-emerald-900/50 flex items-center disabled:opacity-50">{isFindingMakeup[dispatch.id] ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>} Find Makeup Slots</button>
                     <button onClick={() => generateDraft(dispatch, 'to_rbt')} disabled={isDrafting[dispatch.id + 'to_rbt']} className="px-4 py-2 bg-rose-900/30 text-rose-400 border border-rose-700/50 rounded-lg text-sm font-bold hover:bg-rose-900/50 flex items-center disabled:opacity-50">{isDrafting[dispatch.id + 'to_rbt'] ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>} Notify RBT</button>
                 </div>
                 {(drafts[dispatch.id + 'to_parent'] || drafts[dispatch.id + 'to_rbt']) && (
                   <div className="mt-4 bg-sched-panel border border-sched-border rounded-lg p-4 fade-in">
                     <div className="space-y-3">
                       {['to_parent', 'to_rbt'].map(type => {
                         if (!drafts[dispatch.id + type]) return null;
                         return (
                           <div key={type} className="border border-sched-border bg-sched-bg rounded p-3">
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{type === 'to_parent' ? 'To Parents:' : 'To Assigned RBT:'}</span>
                             <textarea className="w-full text-sm text-slate-300 bg-transparent outline-none resize-none font-medium" rows={2} value={drafts[dispatch.id + type]} onChange={(e) => setDrafts(prev => ({...prev, [dispatch.id + type]: e.target.value}))}/>
                           </div>
                         )
                       })}
                     </div>
                   </div>
                 )}
                 {makeupSlots[dispatch.id] && (
                   <div className="mt-4 bg-emerald-900/20 border border-emerald-700/50 rounded-lg p-4 fade-in">
                      <p className="text-xs font-bold text-emerald-400 mb-2 uppercase flex items-center"><Sparkles size={12} className="mr-1"/> AI Makeup Slot Suggestions</p>
                      <p className="text-sm text-emerald-300 whitespace-pre-wrap">{makeupSlots[dispatch.id]}</p>
                   </div>
                 )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
