import {
  Activity, RefreshCw, Shield, Users
} from 'lucide-react';

export default function DailyFeed({ client }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto h-full flex flex-col pb-10">
      <div className="bg-brand-panel/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 shadow-xl flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-black text-white text-2xl mb-1">Daily Feed</h3>
          <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest flex items-center gap-1.5"><Shield size={12}/> Safe-Snap Privacy Active</p>
        </div>
        <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"><RefreshCw size={20} /></button>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
        {client.feed.length === 0 ? (
          <div className="bg-brand-panel/60 backdrop-blur-md border border-white/5 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-lg h-64">
            <Activity className="w-16 h-16 text-slate-600 mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-white mb-2">Feed is Empty</h3>
            <p className="text-slate-400 text-sm max-w-sm">Updates and photos from the clinical team will appear here once the session begins.</p>
          </div>
        ) : (
          client.feed.map(item => (
            <div key={item.id} className="bg-brand-panel/60 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden flex flex-col shadow-lg transition-transform hover:-translate-y-1">
              <div className="p-5 flex items-center justify-between border-b border-white/5 bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">HQ</div>
                  <div>
                    <p className="text-sm font-bold text-white">Clinical Team</p>
                    <p className="text-[10px] text-slate-500 font-medium tracking-wide">{item.time}</p>
                  </div>
                </div>
                {item.type === 'photo' && <div className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-sm"><Shield size={12}/> Privacy Blurred</div>}
              </div>

              {item.type === 'photo' && (
                <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-slate-950 relative border-b border-white/5 overflow-hidden">
                  <img src={item.imgUrl} alt="Session Update" className="w-full h-full object-cover opacity-60 mix-blend-screen" />
                  <div className="absolute top-4 right-4 w-20 h-20 bg-slate-800/50 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl flex items-center justify-center">
                     <Users className="text-slate-400/50 w-8 h-8" />
                  </div>
                </div>
              )}
              <div className="p-6">
                <p className="text-base text-slate-300 font-medium leading-relaxed">{item.text}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
