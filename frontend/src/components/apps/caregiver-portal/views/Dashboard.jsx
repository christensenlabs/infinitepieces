import {
  AlertTriangle, CheckCircle2, Shield,
  Clock, Users, Calendar, MapPin
} from 'lucide-react';

export default function Dashboard({
  client,
  cancelState,
  setCancelState,
  isProcessingCancel,
  submitCancellation,
  cancellationFee,
  sessionTime,
  makeupSlots,
}) {
  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 h-full flex flex-col">

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 shrink-0">
        <div className="bg-brand-panel/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/20 shrink-0"><Clock size={28}/></div>
          <div><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Auth Remaining</p><p className="text-2xl font-black text-white">{client.authTotal - client.authUsed} Hrs</p></div>
        </div>
        <div className="bg-brand-panel/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20 shrink-0"><CheckCircle2 size={28}/></div>
          <div><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Mastered Skills</p><p className="text-2xl font-black text-white">0</p></div>
        </div>
        <div className="bg-brand-panel/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl flex items-center gap-5">
          <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20 shrink-0"><Users size={28}/></div>
          <div><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Care Team</p><p className="text-2xl font-black text-white">0 Active</p></div>
        </div>
      </div>

      {/* Schedule Card (The Revenue Trap) */}
      <div className="flex-1 bg-brand-panel/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

        {cancelState === "idle" && (
          <div className="max-w-2xl mx-auto w-full text-center animate-in zoom-in-95 duration-300">
            <div className="inline-block bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-slate-700">Upcoming Session</div>
            <div className="flex justify-center items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-cyan-500/20 text-cyan-400 rounded-3xl flex items-center justify-center border border-cyan-500/30 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                <Calendar size={36} />
              </div>
              <div className="text-left">
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Today</h3>
                <p className="text-lg md:text-xl font-bold text-cyan-400 mt-2">{sessionTime}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm md:text-base font-medium text-slate-300 bg-slate-900/50 p-6 rounded-3xl border border-white/5 inline-flex">
              <span className="flex items-center gap-2"><Users className="text-slate-500"/> RBT: Emma R.</span>
              <span className="w-px h-6 bg-slate-700 hidden sm:block"></span>
              <span className="flex items-center gap-2"><MapPin className="text-slate-500"/> Home Session</span>
            </div>

            <div className="max-w-md mx-auto">
              <button onClick={() => setCancelState('penalty')} className="w-full bg-slate-800 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 text-rose-400 py-4 rounded-2xl font-bold transition-all hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                Cancel Session
              </button>
            </div>
          </div>
        )}

        {cancelState === "penalty" && (
          <div className="max-w-xl mx-auto w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
              <AlertTriangle size={36} />
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-white mb-3">Late Cancellation</h3>
            <p className="text-slate-400 text-sm md:text-base mb-8">Canceling within 24 hours incurs a <span className="font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">${cancellationFee} fee</span> per clinic policy.</p>

            <div className="bg-slate-900/80 border border-amber-500/30 p-6 rounded-3xl mb-8 text-left shadow-inner relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Shield size={14}/> Insurance Notice</p>
              <p className="text-sm leading-relaxed text-slate-300">{client.name} is nearing his 85% utilization minimum. Falling below this may trigger a permanent reduction in authorized care hours by the funding source.</p>
            </div>

            <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Waive fee instantly by rebooking:</p>
            <div className="grid sm:grid-cols-2 gap-4 mb-6">
              {makeupSlots.map((slot, idx) => (
                <button key={idx} onClick={() => submitCancellation(slot)} disabled={isProcessingCancel} className="bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 p-5 rounded-2xl flex flex-col items-center justify-center transition-all group shadow-sm disabled:opacity-50 h-28">
                  <span className="font-bold text-slate-200 text-lg group-hover:text-emerald-400 transition-colors mb-2">{slot}</span>
                  <span className="text-[10px] font-black bg-emerald-500 text-slate-900 px-3 py-1 rounded shadow-sm">1-CLICK MAKEUP</span>
                </button>
              ))}
            </div>

            <button onClick={() => submitCancellation('Accepted Fee - No Makeup')} disabled={isProcessingCancel} className="w-full text-center text-slate-500 hover:text-rose-400 text-xs font-bold underline py-2 transition-colors disabled:opacity-50">
              {isProcessingCancel ? 'Processing...' : `Accept $${cancellationFee} fee & risk authorized hours`}
            </button>
          </div>
        )}

        {cancelState === "done" && (
          <div className="max-w-md mx-auto w-full text-center animate-in zoom-in-95 duration-300">
            <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-3xl font-black text-white mb-3">Schedule Updated</h3>
            <p className="text-slate-400 text-base mb-8 leading-relaxed">The clinical team has been alerted and the master schedule has been automatically updated.</p>
            <button onClick={() => setCancelState('idle')} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors">Return to Dashboard</button>
          </div>
        )}
      </div>
    </div>
  );
}
