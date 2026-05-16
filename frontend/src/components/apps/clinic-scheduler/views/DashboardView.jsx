import React from 'react';
import { Sparkles, Loader2, ClipboardList } from 'lucide-react';
import { schedulerStyles } from '../styles';

export default function DashboardView({
  sessions, shifts, config,
  eodReport, isGeneratingEod, handleGenerateEOD
}) {
  const totalSessions = sessions.length;
  const exceptionCount = shifts.filter(s => s.status === 'uncovered').length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  const multiplier = config?.billableHoursMultiplier || 2;
  const billableHours = (totalSessions - exceptionCount) * multiplier;
  const fillRate = totalSessions > 0 ? Math.round(((totalSessions - exceptionCount) / totalSessions) * 100) : 100;

  return (
    <div className="space-y-6 fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-sched-panel p-5 rounded-xl border border-sched-border flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Schedule Fill Rate</h3>
          <p className="text-3xl font-bold text-white">{fillRate}%</p>
        </div>
        <div className="bg-sched-panel p-5 rounded-xl border border-sched-border flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Total Exceptions</h3>
          <p className="text-3xl font-bold text-red-400">{exceptionCount}</p>
        </div>
        <div className="bg-sched-panel p-5 rounded-xl border border-sched-border flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Completed Sessions</h3>
          <p className="text-3xl font-bold text-white">{completed}</p>
        </div>
        <div className="bg-sched-panel p-5 rounded-xl border border-sched-border flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-2">Est. Billable Hours</h3>
          <p className="text-3xl font-bold text-green-400">{billableHours}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-sched-panel rounded-xl border border-sched-border p-6 flex flex-col">
          <h3 className="font-bold text-white mb-4">Operations Status</h3>
          {totalSessions === 0 ? (
            <p className="text-slate-400 text-sm">No scheduling data available. Add sessions to populate metrics.</p>
          ) : (
            <div className="space-y-4">
               <p className="text-sm text-slate-300"><strong className="text-white">Database Active:</strong> Connected to real-time clinical index.</p>
               <p className="text-sm text-slate-300"><strong className="text-white">Total Scheduled Events:</strong> {totalSessions}</p>
               <p className="text-sm text-slate-300"><strong className="text-white">System Health:</strong> Awaiting action on {exceptionCount} exceptions.</p>
            </div>
          )}
        </div>

        <div className="bg-sched-panel rounded-xl border border-sched-border p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Executive Reporting</h3>
            <button
              onClick={handleGenerateEOD} disabled={isGeneratingEod}
              className={`${schedulerStyles.btnAction} px-3 py-1.5 text-xs disabled:opacity-50`}
            >
              {isGeneratingEod ? <Loader2 size={14} className="mr-1.5 animate-spin"/> : <Sparkles size={14} className="mr-1.5"/>}
              Generate EOD Summary
            </button>
          </div>
          {eodReport ? (
            <div className="bg-sched-bg p-4 rounded-lg border border-sched-border text-sm text-slate-300 whitespace-pre-wrap flex-1 leading-relaxed fade-in">{eodReport}</div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-sched-border rounded-lg p-6 bg-sched-bg">
              <ClipboardList className="text-slate-600 mb-2" size={24}/>
              <p className="text-sm text-slate-400 text-center px-4">Click to generate an AI-powered End-of-Day summary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
