import { useState } from 'react';
import {
  BarChart2, Target, TrendingUp, Globe, Bot, X,
  Activity, ArrowUpRight, ArrowDownRight, AlertCircle,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { fetchOutcomesKpis, fetchOutcomesStagnantTargets } from '@/api/apps';

function KpiCard({ label, value, unit, direction, note, rose }) {
  const baseCard = rose
    ? 'bg-rose-950/60 border border-rose-700/50'
    : 'bg-brand-panel border border-slate-700/50';

  const arrowColor = direction === 'up'
    ? 'text-emerald-400'
    : direction === 'down'
      ? 'text-rose-400'
      : 'text-amber-400';

  const ArrowIcon = direction === 'up' ? ArrowUpRight : ArrowDownRight;

  return (
    <div className={`rounded-xl p-5 flex flex-col gap-2 ${baseCard}`}>
      <span className={`text-xs font-semibold uppercase tracking-widest ${rose ? 'text-rose-300' : 'text-slate-400'}`}>
        {label}
      </span>
      <div className="flex items-end gap-2">
        <span className={`text-4xl font-bold tabular-nums ${rose ? 'text-rose-100' : 'text-white'}`}>
          {value}
        </span>
        <div className={`flex items-center gap-0.5 mb-1 text-sm font-medium ${arrowColor}`}>
          <span>{unit}</span>
          {direction !== 'alert' && <ArrowIcon size={16} />}
          {direction === 'alert' && <Activity size={16} />}
        </div>
      </div>
      {note && (
        <p className={`text-xs ${rose ? 'text-rose-300/80' : 'text-slate-500'}`}>{note}</p>
      )}
    </div>
  );
}

export default function OutcomesIntelligence() {
  const { data: kpis } = useApiData(fetchOutcomesKpis);
  const { data: stagnantTargets } = useApiData(fetchOutcomesStagnantTargets);
  const [isClickOpen, setIsClickOpen] = useState(false);

  if (!kpis || !stagnantTargets) {
    return <div className="p-8 text-center text-slate-400">Loading...</div>;
  }

  const mainKpis = kpis.slice(0, 3);
  const stagnantKpi = kpis[3] ?? null;

  return (
    <div className="relative min-h-screen bg-brand-dark text-white overflow-hidden">
      {/* Background blur accent */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #d946ef, transparent 70%)' }}
      />

      <div className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-fuchsia-900/40 border border-fuchsia-700/40">
            <BarChart2 size={28} className="text-fuchsia-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Outcomes Intelligence™
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Executive Clinical Dashboard</p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {mainKpis.map((kpi) => (
            <KpiCard
              key={kpi.key}
              label={kpi.label}
              value={kpi.value}
              unit={kpi.unit}
              direction={kpi.direction}
              note={kpi.note}
              rose={false}
            />
          ))}
          {stagnantKpi && (
            <KpiCard
              key={stagnantKpi.key}
              label={stagnantKpi.label}
              value={stagnantKpi.value}
              unit={stagnantKpi.unit}
              direction={stagnantKpi.direction}
              note={stagnantKpi.note}
              rose
            />
          )}
        </div>

        {/* Two-column grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Enterprise Data Moat */}
          <div className="relative h-80 rounded-xl bg-brand-panel border border-slate-700/50 p-6 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <Globe size={220} className="text-fuchsia-400" />
            </div>
            <div className="relative z-10 flex items-center gap-2 mb-3">
              <Target size={18} className="text-fuchsia-400" />
              <span className="text-sm font-semibold text-fuchsia-300 uppercase tracking-widest">
                Enterprise Data Moat
              </span>
            </div>
            <div className="relative z-10 flex-1 flex flex-col justify-center space-y-3">
              <p className="text-slate-300 text-sm leading-relaxed">
                Longitudinal outcome trajectories across your entire client population — aggregated,
                de-identified, and benchmarked against regional clinic norms.
              </p>
              <p className="text-slate-500 text-xs leading-relaxed">
                Trend modeling, cohort comparisons, and predictive discharge timelines will surface
                here as your data corpus grows. Each session logged compounds your competitive
                intelligence advantage.
              </p>
            </div>
            <div className="relative z-10 mt-4 inline-flex items-center gap-2 text-xs text-fuchsia-400/70 font-medium">
              <TrendingUp size={13} />
              <span>Longitudinal analytics — coming soon</span>
            </div>
          </div>

          {/* Right: Stagnant Target Detection */}
          <div className="rounded-xl bg-brand-panel border border-slate-700/50 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-rose-400" />
              <span className="text-sm font-semibold text-rose-300 uppercase tracking-widest">
                Stagnant Target Detection
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 max-h-64 pr-1">
              {stagnantTargets.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-rose-950/40 border border-rose-800/40 p-3 flex items-start justify-between gap-3"
                >
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-sm font-semibold text-white truncate">{item.target}</span>
                    <span className="text-xs text-slate-400">{item.client}</span>
                    {item.note && (
                      <span className="text-xs text-rose-300/80 mt-1">{item.note}</span>
                    )}
                  </div>
                  <button className="shrink-0 text-xs font-semibold px-3 py-1 rounded-md bg-rose-700/60 hover:bg-rose-600/80 text-rose-100 border border-rose-600/50 transition-colors">
                    Flag BCBA
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Click AI floating widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isClickOpen && (
          <div className="w-80 rounded-2xl bg-brand-deep border border-cyan-500/40 shadow-2xl shadow-cyan-900/40 p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot size={16} className="text-cyan-400" />
                <span className="text-sm font-semibold text-cyan-300">Click Intelligence</span>
              </div>
              <button
                onClick={() => setIsClickOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="text-xs text-slate-300 leading-relaxed space-y-2">
              <p>
                <span className="text-cyan-400 font-semibold">+12% target velocity</span> detected
                across the enterprise caseload over the last 30 days — driven primarily by gains in
                communication and daily living skills domains.
              </p>
              <p>
                <span className="text-rose-400 font-semibold">14 targets flagged</span> as
                stagnant (&gt;21 days without measurable progress). Recommend immediate BCBA
                program review and possible instructional modification or prerequisite assessment.
              </p>
              <p className="text-slate-500">
                Discharge readiness index trending upward for 3 clients. Review program trees for
                transition planning.
              </p>
            </div>
            <button className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors">
              Export Intelligence Report
            </button>
          </div>
        )}
        <button
          onClick={() => setIsClickOpen((prev) => !prev)}
          className="w-12 h-12 rounded-full bg-brand-deep border-2 border-cyan-500/60 hover:border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-900/50 hover:shadow-cyan-700/60 transition-all"
          style={{ boxShadow: '0 0 16px 2px rgba(6,182,212,0.25)' }}
        >
          <Bot size={22} className="text-cyan-400" />
        </button>
      </div>
    </div>
  );
}
