import { useState } from 'react';
import {
  Search, Shield, AlertTriangle, CheckCircle2, Clock,
  FileText, Bot, X, ChevronRight, Activity, ClipboardCheck,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import {
  fetchChartAuditQueue,
  fetchChartAuditStats,
  fetchRemediationChecklist,
} from '@/api/apps';

const SEVERITY_STYLES = {
  high: { pill: 'bg-rose-900/60 text-rose-300 border-rose-700/50', dot: 'bg-rose-500' },
  medium: { pill: 'bg-amber-900/60 text-amber-300 border-amber-700/50', dot: 'bg-amber-500' },
  low: { pill: 'bg-emerald-900/60 text-emerald-300 border-emerald-700/50', dot: 'bg-emerald-500' },
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'high', label: 'High' },
  { key: 'medium', label: 'Medium' },
  { key: 'low', label: 'Low' },
];

function ScoreRing({ score, size = 64 }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400';
  const strokeColor = score >= 80 ? 'stroke-emerald-400' : score >= 60 ? 'stroke-amber-400' : 'stroke-rose-400';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="currentColor"
          className="text-slate-800" strokeWidth={4}
        />
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" strokeWidth={4}
          className={strokeColor}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className={`absolute text-sm font-bold ${color}`}>{score}</span>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, accent = 'text-accent' }) {
  return (
    <div className="bg-brand-panel border border-slate-800 rounded p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-slate-400" />
        <span className="text-[11px] uppercase tracking-widest text-slate-400 font-bold">{label}</span>
      </div>
      <div className={`text-2xl font-bold leading-none ${accent}`}>{value}</div>
    </div>
  );
}

export default function ChartAuditApp() {
  const { data: queue } = useApiData(fetchChartAuditQueue);
  const { data: stats } = useApiData(fetchChartAuditStats);
  const { data: remediation } = useApiData(fetchRemediationChecklist);

  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});

  if (!queue || !stats) {
    return <div className="p-8 text-center text-slate-400">Loading...</div>;
  }

  const filtered = queue
    .filter(item => filter === 'all' || item.severity === filter)
    .filter(item =>
      !search || item.client.toLowerCase().includes(search.toLowerCase())
        || item.noteType.toLowerCase().includes(search.toLowerCase())
    );

  const selected = selectedId ? queue.find(i => i.id === selectedId) : null;

  const toggleCheck = (idx) => {
    setCheckedItems(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-mono relative overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-slate-800 bg-black/40 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-accent-gold/10 border border-accent-gold/30 rounded flex items-center justify-center shrink-0">
              <ClipboardCheck size={18} className="text-accent-gold" />
            </div>
            <div>
              <h1 className="text-lg font-bold uppercase tracking-widest text-accent-gold leading-tight">
                Clinical QA &amp; Chart Audit Sentinel
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[11px] text-slate-400 uppercase tracking-widest">
                  Review Queue Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stat Cards */}
      <div className="max-w-7xl mx-auto px-4 py-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={FileText} label="Charts in QA" value={stats.chartsInQA} accent="text-accent" />
        <StatCard icon={AlertTriangle} label="High Priority" value={stats.highPriority} accent="text-rose-400" />
        <StatCard icon={Activity} label="Avg QA Score" value={stats.avgQAScore} accent="text-accent-gold" />
        <StatCard icon={CheckCircle2} label="Audit Pkg Ready" value={stats.auditPackageReady} accent="text-emerald-400" />
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 pb-6 grid grid-cols-12 gap-4">

        {/* Left Panel: Review Queue */}
        <section className="col-span-12 lg:col-span-5 flex flex-col gap-3">
          {/* Filter Tabs */}
          <div className="flex gap-1 bg-black/40 border border-slate-800 rounded p-1">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase tracking-wider transition-colors ${
                  filter === tab.key
                    ? 'bg-accent-gold/10 text-accent-gold border border-accent-gold/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search by client or note type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-black/40 border border-slate-800 rounded pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent-gold/40"
            />
          </div>

          {/* Queue List */}
          <div className="bg-black/40 border border-slate-800 rounded divide-y divide-slate-800/60 overflow-y-auto max-h-[calc(100vh-340px)]">
            {filtered.length === 0 && (
              <div className="p-6 text-center text-slate-500 text-sm">No audit items match this filter.</div>
            )}
            {filtered.map(item => {
              const sev = SEVERITY_STYLES[item.severity] || SEVERITY_STYLES.low;
              const isSelected = selectedId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setSelectedId(item.id); setCheckedItems({}); }}
                  className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                    isSelected ? 'bg-accent-gold/5' : 'hover:bg-white/5'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full shrink-0 ${sev.dot}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-100 truncate">{item.client}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase border ${sev.pill}`}>
                        {item.severity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-400">{item.noteType}</span>
                      <span className="text-[10px] text-slate-600">|</span>
                      <span className="text-[11px] text-slate-500">{item.status}</span>
                    </div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 shrink-0" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Right Panel: Detail View */}
        <section className="col-span-12 lg:col-span-7 flex flex-col gap-4">
          {!selected ? (
            <div className="bg-black/40 border border-slate-800 rounded p-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <FileText size={32} className="text-slate-700" />
              <span className="text-sm">Select an audit item to view details</span>
            </div>
          ) : (
            <>
              {/* Detail Header */}
              <div className="bg-black/40 border border-slate-800 rounded p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-100">{selected.client}</h2>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>{selected.noteType}</span>
                      <span className="text-slate-600">|</span>
                      <span>Owner: {selected.owner}</span>
                      <span className="text-slate-600">|</span>
                      <Clock size={11} className="inline" />
                      <span>{selected.lastUpdated}</span>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${SEVERITY_STYLES[selected.severity]?.pill}`}>
                        {selected.severity} severity
                      </span>
                      <span className="ml-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase border border-slate-700 text-slate-300 bg-white/5">
                        {selected.status}
                      </span>
                    </div>
                  </div>
                  <ScoreRing score={selected.score} size={64} />
                </div>
              </div>

              {/* Detected Flags */}
              <div className="bg-black/40 border border-slate-800 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={14} className="text-rose-400" />
                  <span className="text-[11px] uppercase tracking-widest text-slate-300 font-bold">
                    Detected Flags
                  </span>
                  <span className="ml-auto text-[10px] text-slate-500">{selected.flags.length} found</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.flags.map((flag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded text-[11px] font-bold bg-rose-900/40 text-rose-300 border border-rose-700/40"
                    >
                      {flag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Evidence */}
              <div className="bg-black/40 border border-slate-800 rounded p-4">
                <div className="flex items-center gap-2 mb-3">
                  <FileText size={14} className="text-accent" />
                  <span className="text-[11px] uppercase tracking-widest text-slate-300 font-bold">
                    Evidence
                  </span>
                </div>
                <p className="text-[12px] text-slate-300 leading-relaxed">{selected.evidence}</p>
              </div>

              {/* Remediation Checklist */}
              {remediation && (
                <div className="bg-black/40 border border-slate-800 rounded p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span className="text-[11px] uppercase tracking-widest text-slate-300 font-bold">
                      Remediation Checklist
                    </span>
                  </div>
                  <div className="space-y-2">
                    {remediation.map((step, idx) => (
                      <label
                        key={idx}
                        className="flex items-start gap-2 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={!!checkedItems[idx]}
                          onChange={() => toggleCheck(idx)}
                          className="mt-0.5 accent-emerald-500"
                        />
                        <span className={`text-[12px] leading-relaxed transition-colors ${
                          checkedItems[idx] ? 'text-slate-500 line-through' : 'text-slate-300 group-hover:text-slate-100'
                        }`}>
                          {step}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Right Sidebar: Security Notice + AI Panel */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isAiOpen && (
          <div className="w-80 bg-brand-dark border border-accent rounded shadow-2xl shadow-accent/10">
            <div className="flex items-center justify-between px-4 py-3 border-b border-accent/30">
              <div className="flex items-center gap-2">
                <Bot size={14} className="text-accent" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                  Click AI Assistant
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
              {/* Security Boundary Notice */}
              <div className="flex items-start gap-2 p-2 rounded bg-amber-900/20 border border-amber-800/30">
                <Shield size={12} className="text-amber-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-amber-300 leading-relaxed">
                  PHI boundary enforced. AI outputs are advisory only and must be reviewed by a qualified clinician before action.
                </p>
              </div>

              <button className="w-full text-left px-3 py-2 rounded border border-accent/40 bg-accent/5 hover:bg-accent/10 text-[11px] font-bold text-accent uppercase tracking-wider transition-colors">
                Summarize Selected Chart Flags
              </button>
              <button className="w-full text-left px-3 py-2 rounded border border-slate-700 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-300 uppercase tracking-wider transition-colors">
                Generate Remediation Plan
              </button>
              <button className="w-full text-left px-3 py-2 rounded border border-slate-700 bg-white/5 hover:bg-white/10 text-[11px] font-bold text-slate-300 uppercase tracking-wider transition-colors">
                Prepare Audit Package
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsAiOpen(prev => !prev)}
          className="flex items-center gap-2 px-4 py-2.5 rounded border border-accent bg-brand-dark hover:bg-accent/10 text-accent font-bold text-[12px] uppercase tracking-wider shadow-lg shadow-accent/20 transition-colors"
        >
          <Bot size={16} />
          Click AI
        </button>
      </div>
    </div>
  );
}
