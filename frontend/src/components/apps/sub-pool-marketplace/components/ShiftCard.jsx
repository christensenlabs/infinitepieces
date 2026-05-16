import {
  Clock, MapPin, Activity,
  Zap, Shield, Car,
  TrendingUp, Video, Calendar,
  Sparkles
} from 'lucide-react';

export default function ShiftCard({ shift, activeRole, defaultBounty, config, onClaim, onBoost, onAIAction }) {
  return (
    <div className="bg-pool-panel border border-white/10 hover:border-cyan-500/30 rounded-2xl p-5 shadow-lg transition-all fade-in flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-pool-bg rounded-xl flex items-center justify-center shrink-0">
            {shift.location?.toLowerCase().includes('clinic') ? <Shield className="text-blue-400" /> : <Car className="text-emerald-400" />}
          </div>
          <div>
            <h3 className="text-lg font-black text-white">{shift.clientName || shift.patientName || 'Unassigned Session'}</h3>
            <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
              <Calendar size={12} /> {shift.date || 'Today'} <span className="mx-1">•</span> <Clock size={12}/> {shift.startTime || 'TBD'}
            </p>
          </div>
        </div>
        <div className="bg-accent-gold/10 border border-accent-gold/30 px-3 py-1.5 rounded-lg text-right shrink-0">
          <p className="text-[9px] text-accent-gold uppercase font-black tracking-widest mb-0.5">Bounty</p>
          <p className="text-lg font-black text-accent-gold leading-none">+${shift.bounty || defaultBounty}</p>
        </div>
      </div>

      <div className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-4 bg-black/20 p-2.5 rounded-lg border border-white/5">
        <MapPin size={14} className="text-rose-400 shrink-0" />
        <span className="truncate">{shift.location || 'Unknown Location'}</span>
      </div>

      {/* Action Buttons */}
      <div className="mt-auto flex flex-col gap-2">
        <div className="flex gap-2">
          {activeRole === 'scheduler' ? (
            <>
              <button disabled className="flex-1 bg-white/5 text-slate-400 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2">
                <Activity size={14}/> Waiting...
              </button>
              <button onClick={() => onBoost(shift)} className="flex-1 bg-accent-gold/10 hover:bg-accent-gold/20 text-accent-gold font-black py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <TrendingUp size={14}/> Boost +${config?.bountyBoost || 15}
              </button>
            </>
          ) : activeRole === 'bcba' ? (
            <>
              <button onClick={() => onClaim(shift, false)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-pool-bg font-black py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                <Zap size={14}/> Claim 1:1
              </button>
              <button onClick={() => onClaim(shift, true)} className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1">
                <Video size={14}/> Pivot to Telehealth
              </button>
            </>
          ) : (
            <button onClick={() => onClaim(shift, false)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-pool-bg font-black py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2">
              <Zap size={14}/> Claim Shift & Bounty
            </button>
          )}
        </div>

        {/* Dynamic AI Copilot Buttons based on Role */}
        <div className="pt-2 border-t border-white/5">
          {activeRole === 'scheduler' && (
            <button onClick={() => onAIAction('match', shift)} className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
              <Sparkles size={14} /> AI Smart Match
            </button>
          )}
          {activeRole === 'bcba' && (
            <button onClick={() => onAIAction('telehealth', shift)} className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
              <Sparkles size={14} /> Auto-Draft Telehealth Plan
            </button>
          )}
          {activeRole === 'rbt' && (
            <button onClick={() => onAIAction('analyze', shift)} className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
              <Sparkles size={14} /> Analyze Shift Fit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
