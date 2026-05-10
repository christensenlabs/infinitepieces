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
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-y-auto mt-4">
           <h3 className="text-xl font-bold text-slate-800 mb-6">{currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
           {daySessions.length === 0 ? (
             <div className="text-center py-12 text-slate-400">No clinical sessions scheduled for this day.</div>
           ) : (
             <div className="space-y-3">
               {daySessions.map(session => (
                 <div key={session.id} onClick={() => requireAdmin(() => setSelectedSession(session))} className={`p-4 rounded-lg cursor-pointer transition-colors shadow-sm ${getStatusStyles(session.status)}`}>
                   <div className="flex justify-between items-start">
                     <div>
                       <span className="text-xs font-bold bg-white/60 px-2 py-1 rounded text-slate-700 shadow-sm">{session.startTime} - {session.endTime}</span>
                       <h4 className="font-bold text-slate-900 text-lg mt-2">{session.patientName}</h4>
                       <p className="text-sm text-slate-600 flex items-center mt-1"><MapPin size={14} className="mr-1"/> {session.location} | <Users size={14} className="ml-2 mr-1"/> Staff: {session.staffName || 'Unassigned'}</p>
                     </div>
                     {session.status === 'staff_callout' && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded uppercase flex items-center"><AlertTriangle size={12} className="mr-1"/> Staff Callout</span>}
                     {session.status === 'parent_cancel' && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded uppercase flex items-center"><AlertTriangle size={12} className="mr-1"/> Parent Cancelled</span>}
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
                <div className={`p-3 text-center rounded-t-xl border border-b-0 ${isToday ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
                  <p className={`text-xs font-bold uppercase tracking-widest ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>{day.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                  <p className={`text-2xl font-light ${isToday ? 'text-blue-700 font-bold' : 'text-slate-800'}`}>{day.getDate()}</p>
                </div>
                <div className={`flex-1 bg-white border border-slate-200 p-2 space-y-2 rounded-b-xl overflow-y-auto custom-scrollbar ${isToday ? 'bg-blue-50/20 border-blue-200' : ''}`}>
                  {daySessions.map(session => (
                    <div
                      key={session.id}
                      onClick={() => requireAdmin(() => setSelectedSession(session))}
                      className={`p-2.5 rounded cursor-pointer transition-colors shadow-sm ${getStatusStyles(session.status)}`}
                    >
                      <div className="text-[10px] font-bold text-slate-500 mb-1">{session.startTime}</div>
                      <div className="font-bold text-slate-800 text-sm leading-tight truncate">{session.patientName}</div>
                      <div className="text-[10px] text-slate-600 truncate mt-1">{session.staffName || 'Unassigned'}</div>
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
      <div className="flex flex-col lg:flex-row gap-4 lg:items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <button onClick={() => setCurrentDate(getToday())} className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-50">Today</button>
          <div className="flex items-center space-x-1 border border-slate-300 rounded-lg p-1">
            <button onClick={handlePrev} className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><ChevronLeft size={18} /></button>
            <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 rounded text-slate-600"><ChevronRight size={18} /></button>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-brand">
            {calView === 'week' ? `Week of ${getStartOfWeek(currentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}` : currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => requireAdmin(handleCheckConflicts)}
            disabled={isCheckingConflicts || sessions.length === 0}
            className="flex items-center px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg text-sm font-bold hover:bg-rose-100 disabled:opacity-50 transition-colors w-full sm:w-auto justify-center"
          >
            {isCheckingConflicts ? <Loader2 size={16} className="animate-spin mr-2"/> : <ShieldCheck size={16} className="mr-2"/>}
            Audit Schedule
          </button>

          <div className="flex bg-slate-100 rounded-lg p-1 border border-slate-200 w-full sm:w-auto">
            {['day', 'week'].map(v => (
              <button
                key={v} onClick={() => setCalView(v)}
                className={`flex-1 sm:px-6 py-1.5 text-sm font-bold rounded-md capitalize transition-colors ${calView === v ? 'bg-white shadow-sm text-blue-700' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {conflictReport && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start shadow-sm shrink-0 fade-in">
          <ShieldCheck className="text-rose-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-bold text-rose-800 uppercase tracking-wider mb-1">AI Schedule Audit Report</h4>
            <p className="text-sm text-rose-900 whitespace-pre-wrap">{conflictReport}</p>
            <button onClick={() => setConflictReport('')} className="mt-2 text-xs font-bold text-rose-600 hover:underline">Dismiss</button>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 overflow-hidden min-h-0 relative">
        {!isAdminAuthenticated && (
           <div className="absolute top-2 right-2 z-10 bg-slate-800/80 text-white px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase flex items-center shadow-md backdrop-blur-sm pointer-events-none">
             <Lock size={10} className="mr-1.5" /> Read Only Mode
           </div>
        )}
        {renderCalendar()}
      </div>
    </>
  );
}
