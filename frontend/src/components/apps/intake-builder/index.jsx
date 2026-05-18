import { useState, useMemo } from 'react';
import {
  ClipboardList,
  Search,
  AlertTriangle,
  CheckCircle2,
  Lock,
  FileText,
  Bot,
  Shield,
  ChevronRight,
  CircleDot,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import {
  fetchIntakeCases,
  fetchIntakeStages,
  fetchAssessmentDomains,
  fetchPlanSections,
  fetchIntakeStats,
} from '@/api/apps';

export default function IntakeBuilder() {
  const { data: cases } = useApiData(fetchIntakeCases);
  const { data: stages } = useApiData(fetchIntakeStages);
  const { data: domains } = useApiData(fetchAssessmentDomains);
  const { data: planSections } = useApiData(fetchPlanSections);
  const { data: stats } = useApiData(fetchIntakeStats);

  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [checkedSections, setCheckedSections] = useState({});

  const overallCompletion = useMemo(() => {
    if (!domains || domains.length === 0) return 0;
    const totalProbes = domains.reduce((sum, d) => sum + d.probes, 0);
    const totalComplete = domains.reduce((sum, d) => sum + d.complete, 0);
    return totalProbes > 0 ? Math.round((totalComplete / totalProbes) * 100) : 0;
  }, [domains]);

  if (!cases || !stages || !domains || !planSections || !stats) {
    return <div className="p-8 text-center text-slate-400">Loading...</div>;
  }

  const filtered = cases.filter(
    (c) => c.client.toLowerCase().includes(search.toLowerCase())
  );

  const selected = cases.find((c) => c.id === selectedId) || null;

  const toggleSection = (idx) => {
    setCheckedSections((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const priorityColor = (p) => {
    if (p === 'high') return 'text-rose-400';
    if (p === 'medium') return 'text-amber-400';
    return 'text-slate-400';
  };

  const stageIndex = selected ? stages.indexOf(selected.stage) : -1;

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans flex flex-col overflow-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        .intake-scroll::-webkit-scrollbar { width: 5px; }
        .intake-scroll::-webkit-scrollbar-track { background: transparent; }
        .intake-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        .intake-scroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}} />

      {/* Header */}
      <header className="h-14 bg-brand-panel border-b border-white/5 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
            <ClipboardList size={16} />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-wide">Intake, Assessment & Treatment Plan Builder</h1>
            <p className="text-[10px] text-slate-500 tracking-widest uppercase">Referral-to-Active Pipeline</p>
          </div>
        </div>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 px-4 py-3 bg-brand-dark border-b border-white/5">
        <StatCard label="Open Referrals" value={stats.openReferrals} color="text-cyan-400" />
        <StatCard label="Plans Ready" value={stats.plansReady} color="text-emerald-400" />
        <StatCard label="Consent Gaps" value={stats.consentGaps} color="text-rose-400" />
        <StatCard label="Assessment Completion" value={`${overallCompletion}%`} color="text-accent-gold" />
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">

        {/* Left panel: Intake Pipeline */}
        <aside className="w-80 shrink-0 border-r border-white/5 bg-brand-panel flex flex-col">
          <div className="px-3 py-3 border-b border-white/5">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search clients..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-brand-dark border border-white/10 rounded pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto intake-scroll">
            {filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors ${
                  selectedId === c.id
                    ? 'bg-cyan-500/10 border-l-2 border-l-cyan-400'
                    : 'hover:bg-white/5 border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-100">{c.client}</span>
                  <span className={`text-[10px] font-bold uppercase ${priorityColor(c.priority)}`}>
                    {c.priority}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">{c.stage}</span>
                  <span>{c.payer}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                  <span>{c.days}d in stage</span>
                  {c.missing.length > 0 && (
                    <span className="flex items-center gap-1 text-amber-400">
                      <AlertTriangle size={10} />
                      {c.missing.length} missing
                    </span>
                  )}
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="p-6 text-center text-sm text-slate-600">No cases found.</div>
            )}
          </div>
        </aside>

        {/* Center: Intake Workspace */}
        <main className="flex-1 overflow-y-auto intake-scroll p-5 space-y-5">
          {!selected ? (
            <div className="flex items-center justify-center h-full text-slate-600 text-sm">
              Select a case from the pipeline to begin.
            </div>
          ) : (
            <>
              {/* Case header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-white">{selected.client}</h2>
                  <p className="text-xs text-slate-400">{selected.payer} &middot; {selected.days} days in {selected.stage}</p>
                </div>
                {selected.missing.length > 0 && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30">
                    <AlertTriangle size={12} className="text-amber-400" />
                    <span className="text-[11px] text-amber-300 font-medium">{selected.missing.join(', ')}</span>
                  </div>
                )}
              </div>

              {/* Stage pipeline */}
              <div className="bg-brand-panel border border-white/5 rounded-lg p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Stage Pipeline</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {stages.map((stage, i) => {
                    let pillClass;
                    if (stageIndex < 0) {
                      pillClass = 'bg-slate-800 text-slate-500 border-slate-700';
                    } else if (i < stageIndex) {
                      pillClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
                    } else if (i === stageIndex) {
                      pillClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50';
                    } else {
                      pillClass = 'bg-slate-800/60 text-slate-500 border-slate-700/50';
                    }
                    return (
                      <div key={stage} className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${pillClass} flex items-center gap-1`}>
                          {i < stageIndex && <CheckCircle2 size={10} />}
                          {i === stageIndex && <CircleDot size={10} />}
                          {i > stageIndex && <Lock size={10} />}
                          {stage}
                        </span>
                        {i < stages.length - 1 && <ChevronRight size={12} className="text-slate-700" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Assessment Shell */}
              <div className="bg-brand-panel border border-white/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Assessment Shell</div>
                  <span className="text-[11px] text-accent-gold font-bold">{overallCompletion}% complete</span>
                </div>
                <div className="space-y-3">
                  {domains.map((d) => {
                    const pct = d.probes > 0 ? Math.round((d.complete / d.probes) * 100) : 0;
                    return (
                      <div key={d.domain}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-200">{d.domain}</span>
                          <span className="text-[10px] text-slate-400">{d.complete}/{d.probes} probes &middot; {pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">{d.note}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Treatment Plan Sections */}
              <div className="bg-brand-panel border border-white/5 rounded-lg p-4">
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-3">Treatment Plan Sections</div>
                <div className="space-y-2">
                  {planSections.map((section, idx) => (
                    <label
                      key={idx}
                      className="flex items-center gap-2.5 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={!!checkedSections[idx]}
                        onChange={() => toggleSection(idx)}
                        className="w-3.5 h-3.5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 focus:ring-offset-0"
                      />
                      <span className={`text-xs transition-colors ${checkedSections[idx] ? 'text-slate-400 line-through' : 'text-slate-200 group-hover:text-white'}`}>
                        {section}
                      </span>
                    </label>
                  ))}
                </div>
                <button className="mt-4 px-4 py-2 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold uppercase tracking-wider hover:bg-cyan-500/30 transition-colors">
                  Open Plan Builder
                </button>
              </div>
            </>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="w-64 shrink-0 border-l border-white/5 bg-brand-panel flex flex-col p-4 gap-4">
          {/* Licensing guardrail */}
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={14} className="text-amber-400" />
              <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Licensing Guardrail</span>
            </div>
            <p className="text-[11px] text-amber-200/80 leading-relaxed">
              All assessment instruments and treatment recommendations must be reviewed and signed by a licensed BCBA before submission.
            </p>
          </div>

          {/* Click AI Assistant */}
          <div className="bg-brand-dark border border-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={14} className="text-cyan-400" />
              <span className="text-[10px] uppercase tracking-widest text-cyan-400 font-bold">Click AI Assistant</span>
            </div>
            <div className="space-y-2">
              <button className="w-full text-left px-3 py-2 rounded border border-cyan-500/30 bg-cyan-500/5 hover:bg-cyan-500/10 text-[11px] font-medium text-cyan-300 transition-colors flex items-center gap-2">
                <FileText size={12} />
                Draft Medical Necessity
              </button>
              <button className="w-full text-left px-3 py-2 rounded border border-slate-700 bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-300 transition-colors flex items-center gap-2">
                <FileText size={12} />
                Suggest Goals from Assessment
              </button>
              <button className="w-full text-left px-3 py-2 rounded border border-slate-700 bg-white/5 hover:bg-white/10 text-[11px] font-medium text-slate-300 transition-colors flex items-center gap-2">
                <FileText size={12} />
                Check Consent Completeness
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }) {
  return (
    <div className="bg-brand-panel border border-white/5 rounded-lg px-4 py-3">
      <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
