import React from 'react';
import { Icons } from '../Icons';
import Badge from '../ui/Badge';

/**
 * @param {Object} props
 * @param {Object|null} props.shifts - shift data from API { openShifts[], surgeActive, surgeLevel }
 * @param {Object} props.surge - useGeminiAction hook instance { result, loading, execute, clear }
 */
export default function SubPoolSection({ shifts, surge }) {
  const openCount = shifts?.openShifts?.filter((s) => s.status === 'open').length ?? 0;
  const surgeActive = shifts?.surgeActive ?? false;

  return (
    <section className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-black text-brand">SubPool&trade;</h3>
          <Badge variant={surgeActive ? 'warning' : 'success'}>
            {openCount} Open Shift{openCount !== 1 ? 's' : ''} &bull;{' '}
            {surgeActive ? `Surge ${shifts?.surgeLevel ?? 'Active'}` : 'Surge Inactive'}
          </Badge>
        </div>
        <button className="text-xs font-bold text-slate-500 hover:text-brand transition-colors">
          Filter shifts <Icons.Search className="w-3 h-3 inline ml-1" />
        </button>
      </div>

      {/* Shift list */}
      {openCount > 0 && (
        <div className="space-y-3 mb-6">
          {shifts.openShifts.map((shift) => (
            <ShiftRow key={shift.id} shift={shift} />
          ))}
        </div>
      )}

      {/* AI Surge Forecast */}
      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-10 flex flex-col items-center justify-center text-center relative min-h-[200px]">
        {surge.loading ? (
          <div className="animate-pulse flex flex-col items-center">
            <Icons.Sparkles className="w-8 h-8 text-emerald-500 mb-3" />
            <p className="text-sm font-bold text-emerald-600">
              AI is analyzing schedule patterns and call-out history...
            </p>
          </div>
        ) : surge.result ? (
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-xl max-w-2xl shadow-sm">
            <h4 className="text-sm font-black text-emerald-800 flex items-center justify-center gap-2 mb-3">
              <Icons.Sparkles className="w-4 h-4" /> AI Risk Forecast
            </h4>
            <p className="text-sm text-emerald-700 leading-relaxed font-medium">{surge.result}</p>
            <button
              onClick={surge.clear}
              className="mt-5 text-xs font-bold text-emerald-600 hover:text-emerald-800 underline underline-offset-2"
            >
              Clear Forecast
            </button>
          </div>
        ) : (
          <>
            {openCount === 0 ? (
              <>
                <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Icons.CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-brand mb-2">All shifts covered</h4>
                <p className="text-sm text-slate-500 max-w-sm mb-6">
                  Network utilization is currently optimal. No coverage gaps detected.
                </p>
              </>
            ) : (
              <p className="text-sm text-slate-500 max-w-sm mb-6">
                {openCount} open shift{openCount !== 1 ? 's' : ''} awaiting coverage.
              </p>
            )}
            <button
              onClick={() =>
                surge.execute(
                  "Act as an ABA clinic operations AI. Give a 2-sentence prediction of staff call-out risk for tomorrow based on general industry trends (assume tomorrow is a typical Friday), and recommend a starting SubPool bounty amount (e.g., $10, $15). Keep it professional and analytical.",
                  'You are a data-driven clinic operations AI predicting staffing needs.',
                )
              }
              className="bg-emerald-100 text-emerald-700 px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-emerald-200 transition-colors shadow-sm"
            >
              <Icons.Sparkles className="w-4 h-4" /> AI Forecast Tomorrow&apos;s Risk
            </button>
          </>
        )}
      </div>
    </section>
  );
}

function ShiftRow({ shift }) {
  const isOpen = shift.status === 'open';
  return (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-5 py-3">
      <div className="flex items-center gap-4">
        <div
          className={`w-2 h-2 rounded-full ${isOpen ? 'bg-amber-500' : 'bg-emerald-500'}`}
        />
        <div>
          <p className="text-sm font-bold text-brand">{shift.patient}</p>
          <p className="text-xs text-slate-500">
            {shift.time} &bull; {shift.role}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {shift.bounty > 0 && (
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
            ${shift.bounty} Bounty
          </span>
        )}
        <span
          className={`text-xs font-bold px-2 py-1 rounded ${
            isOpen
              ? 'text-amber-700 bg-amber-50 border border-amber-200'
              : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
          }`}
        >
          {isOpen ? 'Open' : `Claimed by ${shift.claimedBy}`}
        </span>
      </div>
    </div>
  );
}
