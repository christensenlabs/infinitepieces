import { useState } from 'react';
import {
  FileCode2, Cloud, WalletCards, KeyRound, PlugZap,
  CheckCircle2, AlertTriangle, Clock, Activity,
  ShieldCheck, Lock, FlaskConical, ScrollText,
  Bot, X,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import {
  fetchIntegrationCatalog,
  fetchIntegrationJobs,
  fetchServiceCodeMappings,
  fetchIntegrationStats,
} from '@/api/apps';

const ICON_MAP = { FileCode2, Cloud, WalletCards, KeyRound, PlugZap };

const GUARDRAILS = [
  { icon: ShieldCheck, label: 'Backend Cloud Functions only', desc: 'No browser-side API keys' },
  { icon: Lock, label: 'Managed secrets', desc: 'Vault-backed credential storage' },
  { icon: FlaskConical, label: 'Sandbox testing', desc: 'All integrations start in sandbox' },
  { icon: ScrollText, label: 'Audit events', desc: 'Every call logged with actor + timestamp' },
];

function statusTone(status) {
  if (!status) return 'slate';
  if (/Ready|Connected/i.test(status)) return 'emerald';
  if (/Blocked|Needs/i.test(status)) return 'rose';
  if (/Mapping|review/i.test(status)) return 'amber';
  return 'slate';
}

const TONE_STYLES = {
  emerald: 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300',
  rose: 'bg-rose-500/20 border-rose-500/30 text-rose-300',
  amber: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
  slate: 'bg-slate-500/20 border-slate-500/30 text-slate-300',
};

const TONE_ICON = {
  emerald: 'text-emerald-400',
  rose: 'text-rose-400',
  amber: 'text-amber-400',
  slate: 'text-slate-400',
};

const TONE_VALUE = {
  emerald: 'text-emerald-300',
  rose: 'text-rose-300',
  amber: 'text-amber-300',
  slate: 'text-slate-300',
};

const COLOR_ICON_BG = {
  cyan: 'bg-cyan-500/10',
  slate: 'bg-slate-500/10',
  gold: 'bg-amber-500/10',
  emerald: 'bg-emerald-500/10',
};

const COLOR_ICON_TEXT = {
  cyan: 'text-cyan-400',
  slate: 'text-slate-400',
  gold: 'text-amber-400',
  emerald: 'text-emerald-400',
};

function StatusPill({ status }) {
  const tone = statusTone(status);
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${TONE_STYLES[tone]}`}>
      {status}
    </span>
  );
}

export default function APIIntegrationHub() {
  const { data: catalog } = useApiData(fetchIntegrationCatalog);
  const { data: jobs } = useApiData(fetchIntegrationJobs);
  const { data: mappings } = useApiData(fetchServiceCodeMappings);
  const { data: stats } = useApiData(fetchIntegrationStats);

  const [selectedId, setSelectedId] = useState(null);
  const [isClickOpen, setIsClickOpen] = useState(false);

  if (!catalog || !jobs || !mappings || !stats) {
    return <div className="p-8 text-center text-slate-400">Loading...</div>;
  }

  const selected = catalog.find(i => i.id === selectedId) || catalog[0];
  const SelectedIcon = ICON_MAP[selected?.icon];

  const statCards = [
    { label: 'Connected / Sandbox', value: stats.connectedCount, icon: Activity, tone: 'emerald' },
    { label: 'Pending Mappings', value: stats.pendingMappings, icon: Clock, tone: 'amber' },
    { label: 'Failed Jobs', value: stats.failedJobs, icon: AlertTriangle, tone: 'rose' },
    { label: 'Last Sync', value: stats.lastSuccessfulSync, icon: CheckCircle2, tone: 'slate' },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-slate-200 font-sans relative">
      {/* Header */}
      <div className="border-b border-slate-800 bg-brand-panel px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <PlugZap className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              API / Integration Hub
            </h1>
            <p className="text-xs text-slate-400">
              Clearinghouse, payroll, and identity integrations
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(card => {
          const CardIcon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-xl border border-slate-700 bg-brand-panel p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <CardIcon className={`w-4 h-4 ${TONE_ICON[card.tone]}`} />
                <span className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">
                  {card.label}
                </span>
              </div>
              <div className={`text-2xl font-bold ${TONE_VALUE[card.tone]}`}>
                {card.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content: Catalog + Detail */}
      <div className="max-w-7xl mx-auto px-6 pb-6 grid grid-cols-5 gap-6">
        {/* Left: Integration Catalog (2/5) */}
        <div className="col-span-5 lg:col-span-2">
          <div className="rounded-xl border border-slate-700 bg-brand-panel overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                Integration Catalog
              </span>
            </div>
            <div className="divide-y divide-slate-800">
              {catalog.map(integration => {
                const Icon = ICON_MAP[integration.icon];
                const isActive = integration.id === selected?.id;
                return (
                  <button
                    key={integration.id}
                    onClick={() => setSelectedId(integration.id)}
                    className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                      isActive
                        ? 'bg-cyan-500/10 border-l-2 border-cyan-400'
                        : 'hover:bg-slate-800/40 border-l-2 border-transparent'
                    }`}
                  >
                    {Icon && (
                      <div className={`p-1.5 rounded ${COLOR_ICON_BG[integration.color] || COLOR_ICON_BG.slate}`}>
                        <Icon className={`w-4 h-4 ${COLOR_ICON_TEXT[integration.color] || COLOR_ICON_TEXT.slate}`} />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {integration.name}
                      </div>
                      <div className="text-[11px] text-slate-500">{integration.category}</div>
                    </div>
                    <StatusPill status={integration.status} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Selected Detail (3/5) */}
        <div className="col-span-5 lg:col-span-3 flex flex-col gap-5">
          {/* Selected integration header */}
          <div className="rounded-xl border border-slate-700 bg-brand-panel p-5">
            <div className="flex items-center gap-3 mb-4">
              {SelectedIcon && (
                <div className={`p-2 rounded-lg ${COLOR_ICON_BG[selected.color] || COLOR_ICON_BG.slate}`}>
                  <SelectedIcon className={`w-5 h-5 ${COLOR_ICON_TEXT[selected.color] || COLOR_ICON_TEXT.slate}`} />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-base font-bold text-white">{selected.name}</h2>
                <p className="text-xs text-slate-400">{selected.category}</p>
              </div>
              <StatusPill status={selected.status} />
            </div>
            <div className="text-sm text-slate-300 mb-4">
              <span className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Next step: </span>
              {selected.next}
            </div>

            {/* Integration Guardrails */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Integration Guardrails
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {GUARDRAILS.map(g => {
                  const GIcon = g.icon;
                  return (
                    <div
                      key={g.label}
                      className="flex items-start gap-2 rounded-lg border border-slate-700 bg-slate-900/40 p-3"
                    >
                      <GIcon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs font-medium text-slate-200">{g.label}</div>
                        <div className="text-[11px] text-slate-500">{g.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payer / Service Code Map */}
            <div className="mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-3">
                Payer / Service Code Map
              </h3>
              <div className="rounded-lg border border-slate-700 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-900/60">
                      <th className="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                      <th className="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Code</th>
                      <th className="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Payer</th>
                      <th className="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Rule</th>
                      <th className="text-left px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mappings.map(m => (
                      <tr key={`${m.code}-${m.payer}`} className="border-b border-slate-800 last:border-0">
                        <td className="px-3 py-2 text-xs text-slate-300">{m.service}</td>
                        <td className="px-3 py-2 text-xs font-mono text-slate-300">{m.code}</td>
                        <td className="px-3 py-2 text-xs text-slate-300">{m.payer}</td>
                        <td className="px-3 py-2 text-xs text-slate-400">{m.rule}</td>
                        <td className="px-3 py-2">
                          {m.ready ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold uppercase">
                              Ready
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-[10px] font-semibold uppercase">
                              Not Ready
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <button className="w-full py-2.5 px-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm font-medium hover:bg-cyan-500/20 transition-colors">
              Open Backend Setup Checklist
            </button>
          </div>
        </div>
      </div>

      {/* Integration Job Queue */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="rounded-xl border border-slate-700 bg-brand-panel overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-700">
            <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              Integration Job Queue
            </span>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobs.map(job => {
              const tone = statusTone(job.status);
              return (
                <div
                  key={job.id}
                  className="rounded-lg border border-slate-700 bg-slate-900/40 p-4"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white">{job.name}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{job.target}</div>
                    </div>
                    <StatusPill status={job.status} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Queued: <span className="text-slate-200 font-medium">{job.count}</span>
                    </span>
                    <span className={`text-[10px] font-semibold uppercase ${TONE_ICON[tone]}`}>
                      {job.risk} risk
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Click AI Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isClickOpen && (
          <div className="w-80 rounded-xl border border-cyan-500/40 bg-brand-panel shadow-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-accent" />
                <span className="text-sm font-semibold text-white">Click AI</span>
              </div>
              <button
                onClick={() => setIsClickOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-3">
              <span className="text-cyan-400 font-medium">Office Ally</span> sandbox is ready
              for a test 837P batch. 42 claims are queued. Want me to trigger a dry-run export?
            </p>
            <div className="space-y-2">
              <button className="w-full py-2 px-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/20 transition-colors">
                Trigger Sandbox Dry-Run
              </button>
              <button className="w-full py-2 px-3 rounded-lg border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-800 transition-colors">
                Review Mapping Gaps
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsClickOpen(prev => !prev)}
          className="w-12 h-12 rounded-full bg-brand-panel border-2 border-accent/60 flex items-center justify-center shadow-lg hover:border-accent transition-colors"
        >
          <Bot className="w-5 h-5 text-accent" />
        </button>
      </div>

      {/* Security Boundary Notice (right sidebar overlay) */}
      <div className="fixed top-24 right-6 w-56 z-40 hidden xl:block">
        <div className="rounded-xl border border-slate-700 bg-brand-panel p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lock className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-amber-300">
              Security Boundary
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All integration credentials are stored server-side. No API keys or tokens
            are exposed to the browser. Every integration call is routed through
            backend cloud functions with full audit logging.
          </p>
        </div>
      </div>
    </div>
  );
}
