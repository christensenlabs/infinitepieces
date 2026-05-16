import React from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { schedulerStyles } from '../styles';

export default function AddSessionModal({
  newSession, setNewSession, onSubmit, onClose, config,
  smartInputText, setSmartInputText, isSmartParsing, onMagicFill,
  isMatchingStaff, onAutoMatchStaff, matchReason
}) {
  return (
    <div className={schedulerStyles.overlay}>
      <div className="bg-sched-panel border border-sched-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden p-6 sm:p-8 zoom-in-95 flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center mb-6 shrink-0">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Create Session</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={24}/></button>
        </div>

        <div className="overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex bg-sched-bg rounded-lg p-1 mb-6 border border-sched-border">
            <button type="button" onClick={() => setNewSession({...newSession, category: 'clinical'})} className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-colors ${newSession.category !== 'admin' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-slate-400 hover:text-white'}`}>Clinical (Billable)</button>
            <button type="button" onClick={() => setNewSession({...newSession, category: 'admin'})} className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-md transition-colors ${newSession.category === 'admin' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-slate-400 hover:text-white'}`}>Admin / Non-Billable</button>
          </div>

          {newSession.category === 'clinical' && (
            <div className="mb-6 bg-sched-bg border border-sched-border rounded-xl p-4">
              <label className="block text-xs font-bold text-yellow-400 mb-2 uppercase tracking-wider flex items-center"><Sparkles size={12} className="mr-1"/> AI Magic Fill</label>
              <div className="flex space-x-2">
                <input
                  type="text" value={smartInputText} onChange={(e) => setSmartInputText(e.target.value)}
                  placeholder='e.g., "Leo needs 1:1 tmrw at 2pm"'
                  className="flex-1 bg-sched-panel border border-sched-border focus:border-yellow-500 p-2 rounded-lg text-sm outline-none text-white placeholder-slate-500 w-full"
                />
                <button
                  type="button" onClick={onMagicFill} disabled={isSmartParsing || !smartInputText}
                  className="bg-yellow-500 text-sched-bg px-3 py-2 rounded-lg font-bold text-sm hover:bg-yellow-600 disabled:opacity-50 transition-colors flex items-center shrink-0"
                >
                  {isSmartParsing ? <Loader2 size={16} className="animate-spin" /> : 'Parse'}
                </button>
              </div>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div><label className="block text-sm font-bold text-slate-300 mb-1.5">{newSession.category === 'admin' ? 'Task / Event Name' : 'Patient Name'}</label><input required type="text" value={newSession.patientName} onChange={e=>setNewSession({...newSession, patientName: e.target.value})} className={schedulerStyles.input}/></div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-bold text-slate-300">Assigned Staff {newSession.category === 'clinical' && '(Optional)'}</label>
                {newSession.category === 'clinical' && (
                  <button type="button" onClick={onAutoMatchStaff} disabled={isMatchingStaff} className="text-xs text-yellow-400 font-bold hover:text-yellow-300 flex items-center disabled:opacity-50">
                    {isMatchingStaff ? <Loader2 size={12} className="mr-1 animate-spin" /> : <Sparkles size={12} className="mr-1" />}
                    Auto-Match Fit
                  </button>
                )}
              </div>
              <input type="text" value={newSession.staffName} onChange={e=>setNewSession({...newSession, staffName: e.target.value})} className={schedulerStyles.input}/>
              {matchReason && newSession.category === 'clinical' && <p className="text-xs text-yellow-400 mt-2 bg-yellow-500/10 p-2 rounded border border-yellow-500/30 flex items-start"><Sparkles size={12} className="mr-1.5 mt-0.5 flex-shrink-0"/> {matchReason}</p>}
            </div>
            <div><label className="block text-sm font-bold text-slate-300 mb-1.5">Date</label><input required type="date" value={newSession.date} onChange={e=>setNewSession({...newSession, date: e.target.value})} className={schedulerStyles.input}/></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-bold text-slate-300 mb-1.5">Start Time</label><input required type="time" value={newSession.startTime} onChange={e=>setNewSession({...newSession, startTime: e.target.value})} className={schedulerStyles.input}/></div>
              <div><label className="block text-sm font-bold text-slate-300 mb-1.5">End Time</label><input required type="time" value={newSession.endTime} onChange={e=>setNewSession({...newSession, endTime: e.target.value})} className={schedulerStyles.input}/></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {newSession.category !== 'admin' ? (
                <div><label className="block text-sm font-bold text-slate-300 mb-1.5">Service Type</label><select value={newSession.type} onChange={e=>setNewSession({...newSession, type: e.target.value})} className={schedulerStyles.select}>{(config?.sessionTypes?.clinical || ['1:1 Therapy', 'Group Therapy', 'Parent Training']).map(t => <option key={t}>{t}</option>)}</select></div>
              ) : (
                <div><label className="block text-sm font-bold text-slate-300 mb-1.5">Work Type</label><select value={newSession.type} onChange={e=>setNewSession({...newSession, type: e.target.value})} className={schedulerStyles.select}>{(config?.sessionTypes?.admin || ['Prep / Planning', 'Drive Time', 'Meeting', 'Other Non-Billable']).map(t => <option key={t}>{t}</option>)}</select></div>
              )}
              <div><label className="block text-sm font-bold text-slate-300 mb-1.5">Location</label><input required type="text" value={newSession.location} onChange={e=>setNewSession({...newSession, location: e.target.value})} className={schedulerStyles.input}/></div>
            </div>
            <button type="submit" className={`w-full ${schedulerStyles.btnPrimary} py-3.5 mt-8 text-sm`}>{newSession.category === 'admin' ? 'Book Admin Work' : 'Book onto Master Grid'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
