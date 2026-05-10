import React from 'react';
import { X } from 'lucide-react';
import { schedulerStyles } from '../styles';

export default function SessionDetailModal({
  selectedSession, setSelectedSession, saveSession, deleteSession, reportException
}) {
  return (
    <div className={schedulerStyles.overlay}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col zoom-in-95 max-h-[90vh]">
        <div className={`${schedulerStyles.modalHeader} border-b-[4px] ${selectedSession.category === 'admin' ? 'border-slate-500' : 'border-yellow-500'} shrink-0`}>
          <div>
            <h2 className="text-xl font-bold">{selectedSession.patientName}</h2>
            <p className="text-slate-300 text-xs mt-1">{selectedSession.date} | {selectedSession.startTime} - {selectedSession.endTime}</p>
          </div>
          <button onClick={() => setSelectedSession(null)} className="text-slate-400 hover:text-white transition-colors"><X size={24} /></button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">

          {selectedSession.category !== 'admin' && (
            <div className="mb-6 space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">Report Exception to Dispatch</h3>
              <p className="text-xs text-slate-600 mb-3">If this session cannot be completed as scheduled, report it below to route it to the Action Queue.</p>
              <div className="flex gap-3">
                <button onClick={() => reportException('staff_callout')} className="flex-1 bg-white border border-red-200 text-red-600 font-bold py-2 rounded-lg hover:bg-red-50 text-xs sm:text-sm shadow-sm transition-colors">
                  Staff Call-out
                </button>
                <button onClick={() => reportException('parent_cancel')} className="flex-1 bg-white border border-orange-200 text-orange-600 font-bold py-2 rounded-lg hover:bg-orange-50 text-xs sm:text-sm shadow-sm transition-colors">
                  Parent Cancelled
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2 border-b border-slate-100 pb-2">Edit Scheduling Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Date</label><input type="date" value={selectedSession.date} onChange={e => setSelectedSession({...selectedSession, date: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Staff Assigned</label><input type="text" value={selectedSession.staffName} onChange={e => setSelectedSession({...selectedSession, staffName: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">Start Time</label><input type="time" value={selectedSession.startTime} onChange={e => setSelectedSession({...selectedSession, startTime: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand" /></div>
              <div><label className="block text-xs font-bold text-slate-600 mb-1">End Time</label><input type="time" value={selectedSession.endTime} onChange={e => setSelectedSession({...selectedSession, endTime: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand" /></div>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-600 mb-1">Status Override</label>
               <select value={selectedSession.status} onChange={e => setSelectedSession({...selectedSession, status: e.target.value})} className="w-full border border-slate-300 p-2 rounded-lg text-sm outline-none focus:ring-1 focus:ring-brand bg-white">
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
               </select>
            </div>
          </div>
        </div>

        <div className="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-between items-center shrink-0">
          <button onClick={() => deleteSession(selectedSession.id)} className="text-red-500 text-xs font-bold hover:underline">Delete</button>
          <div className="flex space-x-3">
            <button onClick={() => setSelectedSession(null)} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm rounded-lg transition-colors">Cancel</button>
            <button onClick={saveSession} className="bg-brand text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-brand-navy transition-colors">Save</button>
          </div>
        </div>
      </div>
    </div>
  );
}
