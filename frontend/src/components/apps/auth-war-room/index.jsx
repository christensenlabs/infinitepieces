import { useState } from 'react';
import { AlertTriangle, Bot, X, Shield } from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { fetchAuthWarRoomData } from '@/api/apps';

const TABS = [
  { key: 'all', label: 'Full Theater' },
  { key: 'danger', label: 'Critical' },
  { key: 'under', label: 'Under-Utilized' },
];

const HEATMAP_BLOCKS = [
  { label: 'North', bg: 'bg-rose-900/60', border: 'border-rose-700/50' },
  { label: 'South', bg: 'bg-amber-900/60', border: 'border-amber-700/50' },
  { label: 'East', bg: 'bg-emerald-900/60', border: 'border-emerald-700/50' },
  { label: 'West', bg: 'bg-rose-950/80', border: 'border-rose-800/50' },
];

export default function AuthWarRoom() {
  const { data: authData } = useApiData(fetchAuthWarRoomData);
  const [currentTab, setCurrentTab] = useState('all');
  const [isAiOpen, setIsAiOpen] = useState(false);

  if (!authData) return <div className="p-8 text-center text-slate-400">Loading...</div>;

  const dangerItems = authData.filter(a => a.status === 'danger');
  const underItems = authData.filter(a => a.status === 'under');
  const filtered = currentTab === 'all' ? authData : authData.filter(a => a.status === currentTab);

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-mono relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes warPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes barPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        .war-pulse { animation: warPulse 1.4s ease-in-out infinite; }
        .bar-pulse { animation: barPulse 1.2s ease-in-out infinite; }
      `}} />

      {/* Header */}
      <header className="border-b border-rose-900/40 bg-black/40 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            {/* Custom icon: rose square with cross lines */}
            <div className="relative w-10 h-10 bg-rose-950 border border-rose-700 rounded flex items-center justify-center shrink-0">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-px bg-rose-600/70" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-full w-px bg-rose-600/70" />
              </div>
              <Shield size={14} className="text-rose-400 relative z-10" />
            </div>
            <div>
              <h1 className="text-lg font-bold italic uppercase tracking-widest text-rose-400 leading-tight">
                Auth War Room v4.0
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="war-pulse w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span className="text-[11px] text-slate-400 uppercase tracking-widest">
                  Terminal Active: Operational Intelligence
                </span>
              </div>
            </div>
          </div>

          {/* Tab nav */}
          <nav className="flex gap-1 bg-black/40 border border-rose-900/30 rounded p-1">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setCurrentTab(tab.key)}
                className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  currentTab === tab.key
                    ? 'bg-rose-800/60 text-rose-300 border border-rose-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main grid */}
      <main className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-12 gap-6">

        {/* Sidebar */}
        <aside className="col-span-12 lg:col-span-4 flex flex-col gap-4">

          {/* Critical Expirations */}
          <div className="bg-black/40 border border-rose-900/50 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-rose-500" />
              <span className="text-[11px] uppercase tracking-widest text-rose-400 font-bold">
                Critical Expirations
              </span>
            </div>
            <div className="text-4xl font-bold text-rose-400 leading-none mb-1">
              {dangerItems.length}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Authorizations burning at dangerous velocity. Immediate action required to prevent service gap.
            </p>
          </div>

          {/* Utilization Risk */}
          <div className="bg-black/40 border border-amber-900/50 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={14} className="text-amber-500" />
              <span className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">
                Utilization Risk
              </span>
            </div>
            <div className="text-4xl font-bold text-amber-400 leading-none mb-1">
              {underItems.length}
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Under-utilized authorizations at risk of payer clawback or medical necessity denial on renewal.
            </p>
          </div>

          {/* Regional Intensity Heatmap */}
          <div className="bg-black/40 border border-slate-800 rounded p-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mb-3">
              Regional Intensity
            </div>
            <div className="grid grid-cols-2 gap-2">
              {HEATMAP_BLOCKS.map(block => (
                <div
                  key={block.label}
                  className={`${block.bg} border ${block.border} rounded p-3 text-center`}
                >
                  <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                    {block.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Content */}
        <section className="col-span-12 lg:col-span-8">
          <div className="bg-black/40 border border-slate-800 rounded">
            {/* Card header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-[11px] uppercase tracking-widest text-slate-300 font-bold">
                Operations Grid: Burn Tracker
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-900/50 border border-rose-700/50 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                CPT:97153
              </span>
            </div>

            {/* Auth items */}
            <div className="divide-y divide-slate-800/60">
              {filtered.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-sm">No records for this filter.</div>
              )}
              {filtered.map(item => {
                const pct = Math.round((item.used / item.total) * 100);
                const isDanger = item.status === 'danger';
                const isUnder = item.status === 'under';

                return (
                  <div key={item.id} className="px-4 py-4 space-y-2">
                    {/* Top row */}
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm text-slate-100">{item.name}</span>
                        <span className="text-[10px] text-slate-500 border border-slate-700 rounded px-1.5 py-0.5">
                          {item.code}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {item.velocity}x velocity
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-bold ${isDanger ? 'text-rose-400' : 'text-slate-400'}`}>
                          Exp: {item.expire}
                        </span>
                        {isDanger && (
                          <span className="px-2 py-0.5 rounded bg-rose-900/60 border border-rose-700/50 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                            Critical
                          </span>
                        )}
                        {isUnder && (
                          <span className="px-2 py-0.5 rounded bg-amber-900/60 border border-amber-700/50 text-[10px] font-bold text-amber-300 uppercase tracking-wider">
                            Under-Utilized
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-[10px] text-slate-500">
                          {item.used} / {item.total} hrs
                        </span>
                        <span className={`text-[10px] font-bold ${isDanger ? 'text-rose-400' : isUnder ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isDanger
                              ? 'bg-gradient-to-r from-rose-700 to-rose-500 bar-pulse'
                              : isUnder
                              ? 'bg-gradient-to-r from-amber-700 to-amber-500'
                              : 'bg-gradient-to-r from-emerald-700 to-emerald-500'
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      {/* Floating AI Copilot */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isAiOpen && (
          <div className="w-80 bg-brand-dark border border-accent rounded shadow-2xl shadow-accent/10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-accent/30">
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-accent" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                  AI Copilot
                </span>
              </div>
              <button
                onClick={() => setIsAiOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-[12px] text-slate-300 leading-relaxed">
                <span className="font-bold text-rose-400">Liam M.</span> is tracking at{' '}
                <span className="font-bold text-rose-400">108% velocity</span> against their
                current auth. At this burn rate, units will be exhausted in approximately
                8 days — well before expiration. Immediate action advised.
              </p>
              <button className="w-full text-left px-3 py-2 rounded border border-accent/40 bg-accent/5 hover:bg-accent/10 text-[11px] font-bold text-accent uppercase tracking-wider transition-colors">
                Build Medical Necessity Packet
              </button>
              <button className="w-full text-left px-3 py-2 rounded border border-slate-700 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-300 uppercase tracking-wider transition-colors">
                View Data Flow Graphs
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsAiOpen(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2.5 rounded border border-accent bg-brand-dark hover:bg-accent/10 text-accent font-bold text-[12px] uppercase tracking-wider shadow-lg shadow-accent/20 transition-colors"
        >
          <Bot size={16} />
          AI Copilot
        </button>
      </div>
    </div>
  );
}
