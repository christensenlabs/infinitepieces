import React from 'react';
import {
  ChevronLeft, ChevronRight, ShieldCheck, Loader2, Lock,
  MapPin, Users, AlertTriangle
} from 'lucide-react';
import { getToday, getStartOfWeek, addDays, formatDate, getStatusStyles } from '../utils';

export default function ScheduleView({
  sessions, currentDate, setCurrentDate, calView, setCalView,
  requireAdmin, setSelectedSession, isAdminAuthenticated,
  isCheckingConflicts, handleCheckConflicts, conflictReport, setConflictReport
}) {
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (calView === 'day') newDate.setDate(newDate.getDate() - 1);
    if (calView === 'week') newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (calView === 'day') newDate.setDate(newDate.getDate() + 1);
    if (calView === 'week') newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const startWeek = getStartOfWeek(currentDate);
    const days = Array.from({ length: 7 }).map((_, i) => addDays(startWeek, i));
    const clinicalSessions = sessions.filter(s => s.category !== 'admin');

    if (calView === 'day') {
      const dayStr = formatDate(currentDate);
      const daySessions = clinicalSessions.filter(s => s.date === dayStr);
      return (
        <div className="flex-1 bg-sched-panel rounded-xl border border-sched-border p-6 overflow-y-auto mt-4">
           <h3 className="text-xl font-bold text-white mb-6">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
           {daySessions.length === 0 ? (
             <div className="text-center py-12 text-slate-400">No clinical sessions scheduled for this day.</div>
           ) : (
             <div className="space-y-3">
               {daySessions.map(session => (
                 <div key={session.id} onClick={() => requireAdmin(() => setSelectedSession(session))} className={`p-4 rounded-lg cursor-pointer transition-colors ${getStatusStyles(session.status)}`}>
                   <div className="flex justify-between items-start">
                     <div>
                       <span className="text-xs font-bold bg-sched-bg/60 px-2 py-1 rounded text-slate-300">{session.startTime} - {session.endTime}</span>
                       <h4 className="font-bold text-white text-lg mt-2">{session.patientName}</h4>
                       <p className="text-sm text-slate-400 flex items-center mt-1"><MapPin size={14} className="mr-1"/> {session.location} | <Users size={14} className="ml-2 mr-1"/> Staff: {session.staffName || 'Unassigned'}</p>
                     </div>
                     {session.status === 'staff_callout' && <span className="bg-red-900/40 text-red-400 text-xs font-bold px-2 py-1 rounded uppercase flex items-center border border-red-700/50"><AlertTriangle size={12} className="mr-1"/> Staff Callout</span>}
                     {session.status === 'parent_cancel' && <span className="bg-orange-900/40 text-orange-400 text-xs font-bold px-2 py-1 rounded uppercase flex items-center border border-orange-700/50"><AlertTriangle size={12} className="mr-1"/> Parent Cancelled</span>}
                   </div>
                 </div>
               ))}
             </div>
           )}
        </div>
      );
    }

    if (calView === 'week') {
      return (
        <div className="grid grid-cols-7 gap-3 flex-1 overflow-y-auto min-h-0 mt-4 custom-scrollbar">
          {days.map((day, i) => {
            const dayStr = formatDate(day);
            const daySessions = clinicalSessions.filter(s => s.date === dayStr);
            const isToday = day.toDateString() === getToday().toDateString();

            return (
              <div key={`col-${i}`} className="flex flex-col h-full min-w-[120px]">
                <div className={`p-3 text-center rounded-t-xl border border-b-0 ${isToday ? 'bg-yellow-500/10 border-yellow-500/30' : 'bg-sched-panel border-sched-border'}`}>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-yellow-400' : 'text-slate-400'}`}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <p className={`text-2xl font-light ${isToday ? 'text-yellow-400 font-bold' : 'text-white'}`}>{day.getDate()}</p>
                </div>
                <div className={`flex-1 border p-2 space-y-2 rounded-b-xl overflow-y-auto custom-scrollbar ${isToday ? 'bg-yellow-500/5 border-yellow-500/30' : 'bg-sched-panel border-sched-border'}`}>
                  {daySessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => requireAdmin(() => setSelectedSession(session))}
                      className={`p-2.5 rounded cursor-pointer transition-colors ${getStatusStyles(session.status)}`}
                    >
                      <div className="text-[10px] font-bold text-slate-400 mb-1">{session.startTime}</div>
                      <div className="font-bold text-white text-sm leading-tight truncate">{session.patientName}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-1">{session.staffName || 'Unassigned'}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-sched-panel p-4 rounded-xl border border-sched-border shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => setCurrentDate(getToday())} className="px-4 py-2 border border-sched-border text-slate-300 rounded-lg text-sm font-bold hover:text-white hover:border-yellow-500/50 transition-colors">Today</button>
          <div className="flex items-center space-x-1 border border-sched-border rounded-lg p-1">
            <button onClick={handlePrev} className="p-1.5 hover:bg-sched-bg rounded text-slate-400 hover:text-white transition-colors"><ChevronLeft size={18} /></button>
            <button onClick={handleNext} className="p-1.5 hover:bg-sched-bg rounded text-slate-400 hover:text-white transition-colors"><ChevronRight size={18} /></button>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-yellow-400">
            {calView === 'week' ? `Week of ${getStartOfWeek(currentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => requireAdmin(handleCheckConflicts)}
            disabled={isCheckingConflicts || sessions.length === 0}
            className="flex items-center px-4 py-2 bg-red-900/30 text-red-400 border border-red-700/50 rounded-lg text-sm font-bold hover:bg-red-900/50 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
          >
            {isCheckingConflicts ? <Loader2 size={16} className="animate-spin mr-2"/> : <ShieldCheck size={16} className="mr-2"/>}
            Audit Schedule
          </button>

          <div className="flex bg-sched-bg rounded-lg p-1 border border-sched-border w-full sm:w-auto">
            {['day', 'week'].map(v => (
              <button
                key={v} onClick={() => setCalView(v)}
                className={`flex-1 sm:px-6 py-1.5 text-sm font-bold rounded-md capitalize transition-colors ${calView === v ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-slate-400 hover:text-white'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {conflictReport && (
        <div className="bg-red-900/20 border border-red-700/50 p-4 rounded-xl flex items-start shrink-0 fade-in">
          <ShieldCheck className="text-red-400 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-red-400 uppercase tracking-wider mb-1">AI Schedule Audit Report</h4>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{conflictReport}</p>
            <button onClick={() => setConflictReport('')} className="mt-2 text-xs font-bold text-red-400 hover:underline">Dismiss</button>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden min-h-0 relative">
        {!isAdminAuthenticated && (
           <div className="absolute top-2 right-2 z-10 bg-sched-bg/90 text-slate-300 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center border border-sched-border backdrop-blur-sm pointer-events-none">
             <Lock size={10} className="mr-1.5" /> Read Only Mode
           </div>
        )}
        {renderCalendar()}
      </div>
    </>
  );
}
