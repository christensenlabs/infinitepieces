import {
  DollarSign, Activity,
  Shield, CheckCircle,
  RefreshCw
} from 'lucide-react';
import ShiftCard from '../components/ShiftCard';

export default function MarketView({
  availableShifts,
  claimedShifts,
  activeRole,
  defaultBounty,
  config,
  onClaim,
  onBoost,
  onAIAction,
  onScanMarket
}) {
  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#040811] to-[#040811] relative z-10">

      {/* Market Stats Bar */}
      <div className="p-4 sm:p-6 shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0A1220] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-full hidden sm:flex items-center justify-center"><Activity size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Open Shifts</p>
            <p className="text-xl sm:text-2xl font-black text-white leading-none">{availableShifts.length}</p>
          </div>
        </div>
        <div className="bg-[#0A1220] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full hidden sm:flex items-center justify-center"><CheckCircle size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Claimed Today</p>
            <p className="text-xl sm:text-2xl font-black text-white leading-none">{claimedShifts.length}</p>
          </div>
        </div>
        <div className="bg-[#0A1220] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hidden sm:flex">
          <div className="w-10 h-10 bg-[#FFC800]/20 text-[#FFC800] rounded-full flex items-center justify-center"><DollarSign size={20} /></div>
          <div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Bounties Paid</p>
            <p className="text-xl sm:text-2xl font-black text-white leading-none">${claimedShifts.reduce((sum, s) => sum + (s.bounty || 0), 0)}</p>
          </div>
        </div>
        {activeRole === 'scheduler' && (
          <button onClick={onScanMarket} className="bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors p-4 rounded-2xl flex flex-col items-center justify-center group hidden sm:flex">
            <RefreshCw size={20} className="text-cyan-400 mb-1 group-hover:rotate-180 transition-transform duration-500" />
            <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">AI Market Scan</p>
          </button>
        )}
      </div>

      {/* Shift Board */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 custom-scrollbar">
        <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-white/5 pb-2">Live Trading Board</h2>

        {availableShifts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Shield size={48} className="text-emerald-500 mb-4" />
            <p className="text-xl font-black text-white">Grid is Secure.</p>
            <p className="text-sm font-medium mt-2 text-slate-400">No dropped shifts at this time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {availableShifts.map(shift => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                activeRole={activeRole}
                defaultBounty={defaultBounty}
                config={config}
                onClaim={onClaim}
                onBoost={onBoost}
                onAIAction={onAIAction}
              />
            ))}
          </div>
        )}

        {/* Display recently claimed at bottom */}
        {claimedShifts.length > 0 && (
          <div className="mt-8 pt-6 border-t border-white/10">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500" /> Recently Claimed
            </h2>
            <div className="space-y-2">
              {claimedShifts.map(shift => (
                <div key={shift.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between items-center opacity-60">
                  <div>
                    <p className="text-sm font-bold text-white">{shift.clientName || shift.patientName}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Claimed by: {shift.claimedBy} ({shift.claimedRole?.toUpperCase()})</p>
                  </div>
                  {shift.convertedToTelehealth && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/30">
                      Telehealth Pivot
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
