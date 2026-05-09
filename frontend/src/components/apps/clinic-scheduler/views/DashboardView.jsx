import React from 'react';
import { Sparkles, Loader2, ClipboardList } from 'lucide-react';

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
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">Schedule Fill Rate</h3>
          <p className="text-3xl font-bold text-slate-800">{fillRate}%</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">Total Exceptions</h3>
          <p className="text-3xl font-bold text-red-600">{exceptionCount}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">Completed Sessions</h3>
          <p className="text-3xl font-bold text-slate-800">{completed}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-2">Est. Billable Hours</h3>
          <p className="text-3xl font-bold text-green-600">{billableHours}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <h3 className="font-bold text-slate-800 mb-4">Operations Status</h3>
          {totalSessions === 0 ? (
            <p className="text-slate-500 text-sm">No scheduling data available. Add sessions to populate metrics.</p>
          ) : (
            <div className="space-y-4">
               <p className="text-sm text-slate-700"><strong>Database Active:</strong> Connected to real-time clinical index.</p>
               <p className="text-sm text-slate-700"><strong>Total Scheduled Events:</strong> {totalSessions}</p>
               <p className="text-sm text-slate-700"><strong>System Health:</strong> Awaiting action on {exceptionCount} exceptions.</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800">Executive Reporting</h3>
            <button
              onClick={handleGenerateEOD} disabled={isGeneratingEod}
              className="text-xs bg-[#0b132b] text-yellow-400 px-3 py-1.5 rounded-lg font-bold flex items-center hover:bg-[#152243] disabled:opacity-50 transition-colors shadow-sm"
            >
              {isGeneratingEod ? <Loader2 size={14} className="mr-1.5 animate-spin"/> : <Sparkles size={14} className="mr-1.5"/>}
              Generate EOD Summary
            </button>
          </div>
          {eodReport ? (
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-700 whitespace-pre-wrap flex-1 leading-relaxed fade-in">{eodReport}</div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-lg p-6 bg-slate-50">
              <ClipboardList className="text-slate-300 mb-2" size={24}/>
              <p className="text-sm text-slate-500 text-center px-4">Click to generate an AI-powered End-of-Day summary.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
