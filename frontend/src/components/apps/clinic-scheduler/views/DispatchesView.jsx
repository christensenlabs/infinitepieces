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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Tri-Channel Dispatch Hub</h2>
          <p className="text-slate-500 text-sm mt-1">Intercepted Parent Cancellations and Staff Exceptions stream here automatically.</p>
        </div>
        <span className={`${activeDispatches.length > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} font-bold px-4 py-2 rounded-lg shrink-0`}>
          {activeDispatches.length} Active Alerts
        </span>
      </div>

      {activeDispatches.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 bg-white rounded-xl">
          <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-3" />
          <p className="text-slate-600 font-medium text-lg">Inbox Zero</p>
          <p className="text-slate-400">All sessions are currently staffed and running smoothly.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeDispatches.map(dispatch => (
            <div key={dispatch.id} className="bg-white border-l-4 border-l-slate-800 border border-slate-200 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center mb-2 flex-wrap gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded uppercase bg-orange-100 text-orange-700">Coverage Needed</span>
                    <h3 className="font-bold text-slate-800 text-lg">{dispatch.clientName || dispatch.patientName}</h3>
                  </div>
                  {dispatch.date && <p className="text-sm text-slate-600 flex items-center"><Calendar size={14} className="mr-2"/> {dispatch.date} at {dispatch.startTime}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                   <button onClick={() => dispatchToPool(dispatch)} className="px-4 py-2 bg-accent text-brand-panel font-black uppercase tracking-widest rounded-lg text-xs shadow-md hover:bg-cyan-300 transition-colors flex items-center gap-1.5"><Radio size={14} /> Dispatch SubPool</button>
                   <button onClick={() => markResolved(dispatch.id)} className="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold rounded-lg text-sm transition-colors whitespace-nowrap shadow-sm">Mark Resolved</button>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                 <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Tri-Channel AI Communications</h4>
                 <div className="flex flex-wrap gap-3">
                     <button onClick={() => generateDraft(dispatch, 'to_parent')} disabled={isDrafting[dispatch.id + 'to_parent']} className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg text-sm font-bold hover:bg-indigo-100 flex items-center disabled:opacity-50 shadow-sm">{isDrafting[dispatch.id + 'to_parent'] ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>} Text Parent</button>
                     <button onClick={() => handleFindMakeup(dispatch)} disabled={isFindingMakeup[dispatch.id]} className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-bold hover:bg-emerald-100 flex items-center disabled:opacity-50 shadow-sm">{isFindingMakeup[dispatch.id] ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>} Find Makeup Slots</button>
                     <button onClick={() => generateDraft(dispatch, 'to_rbt')} disabled={isDrafting[dispatch.id + 'to_rbt']} className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-100 flex items-center disabled:opacity-50 shadow-sm">{isDrafting[dispatch.id + 'to_rbt'] ? <Loader2 size={16} className="animate-spin mr-2"/> : <Sparkles size={16} className="mr-2"/>} Notify RBT</button>
                 </div>
                 {(drafts[dispatch.id + 'to_parent'] || drafts[dispatch.id + 'to_rbt']) && (
                   <div className="mt-4 bg-white border border-slate-200 rounded-lg p-4 shadow-sm fade-in">
                     <div className="space-y-3">
                       {['to_parent', 'to_rbt'].map(type => {
                         if (!drafts[dispatch.id + type]) return null;
                         return (
                           <div key={type} className="border border-slate-100 bg-slate-50 rounded p-3">
                             <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">{type === 'to_parent' ? 'To Parents:' : 'To Assigned RBT:'}</span>
                             <textarea className="w-full text-sm text-slate-800 bg-transparent outline-none resize-none font-medium" rows={2} value={drafts[dispatch.id + type]} onChange={(e) => setDrafts(prev => ({...prev, [dispatch.id + type]: e.target.value}))}/>
                           </div>
                         )
                       })}
                     </div>
                   </div>
                 )}
                 {makeupSlots[dispatch.id] && (
                   <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-lg p-4 shadow-sm fade-in">
                      <p className="text-xs font-bold text-emerald-800 mb-2 uppercase flex items-center"><Sparkles size={12} className="mr-1"/> AI Makeup Slot Suggestions</p>
                      <p className="text-sm text-emerald-900 whitespace-pre-wrap">{makeupSlots[dispatch.id]}</p>
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
