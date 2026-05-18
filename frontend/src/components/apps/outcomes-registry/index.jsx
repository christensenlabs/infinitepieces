import { useState, useMemo } from 'react';
import {
  Database, ShieldCheck, AlertTriangle, FileCheck2, PackageCheck,
  CheckCircle2, XCircle, Bot, X, Eye, ArrowRight,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import {
  fetchRegistryCohorts,
  fetchRegistryTransformations,
  fetchCohortMetrics,
  fetchRegistryStats,
} from '@/api/apps';

const RISK_COLORS = {
  low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  high: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
};

const TONE_COLORS = {
  cyan: 'bg-purple-500/20 text-purple-300',
  emerald: 'bg-emerald-500/20 text-emerald-300',
  amber: 'bg-amber-500/20 text-amber-300',
  rose: 'bg-rose-500/20 text-rose-300',
};

const TONE_BAR_COLORS = {
  cyan: 'bg-purple-400',
  emerald: 'bg-emerald-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
};

const GOVERNANCE_STEPS = [
  { label: 'Consent verified', key: 'consent' },
  { label: 'Identifiers removed', key: 'identifiers' },
  { label: 'Small cells suppressed', key: 'cells' },
  { label: 'IRB review', key: 'irb' },
];

export default function DeidentifiedOutcomesRegistry() {
  const [selectedId, setSelectedId] = useState(null);
  const [isClickOpen, setIsClickOpen] = useState(false);

  const { data: cohorts } = useApiData(fetchRegistryCohorts);
  const { data: transformations } = useApiData(fetchRegistryTransformations);
  const { data: metrics } = useApiData(fetchCohortMetrics);
  const { data: stats } = useApiData(fetchRegistryStats);

  const totalRecords = useMemo(() => {
    if (!cohorts) return 0;
    return cohorts.reduce((sum, c) => sum + c.records, 0);
  }, [cohorts]);

  if (!cohorts || !transformations || !metrics || !stats) {
    return <div className="p-8 text-center text-slate-400">Loading...</div>;
  }

  const selected = cohorts.find((c) => c.id === selectedId) || cohorts[0];

  return (
    <div className="min-h-screen bg-brand-dark text-slate-200 font-sans relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInBottom4 {
          from { opacity: 0; transform: translateY(1rem); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.3s ease both; }
        .animate-slideInBottom4 { animation: slideInBottom4 0.35s ease both; }
      ` }} />

      {/* Header */}
      <div className="border-b border-slate-800 bg-brand-panel px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10">
            <Database className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              De-identified Outcomes Registry
            </h1>
            <p className="text-xs text-slate-400">
              Privacy-preserving outcomes research with cohort tracking
            </p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 px-6 py-4">
        <StatCard
          label="Eligible records"
          value={totalRecords}
          icon={Database}
          color="purple"
        />
        <StatCard
          label="Consent blocked"
          value={stats.consentBlocked}
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          label="Small-cell risks"
          value={stats.smallCellRisks}
          icon={ShieldCheck}
          color="amber"
        />
        <StatCard
          label="Governance packets"
          value={stats.governancePackets}
          icon={PackageCheck}
          color="emerald"
        />
      </div>

      {/* Main Content: Left Panel + Right Panel */}
      <div className="flex flex-col lg:flex-row gap-6 px-6 pb-6 animate-fadeIn">
        {/* Left Panel: Registry Cohorts (2/5) */}
        <div className="w-full lg:w-2/5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Registry Cohorts
          </h2>
          <div className="flex flex-col gap-3">
            {cohorts.map((cohort) => (
              <button
                key={cohort.id}
                onClick={() => setSelectedId(cohort.id)}
                className={`w-full text-left rounded-xl border p-4 transition-colors ${
                  selected.id === cohort.id
                    ? 'border-purple-500/40 bg-purple-950/20'
                    : 'border-slate-700 bg-brand-panel hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-white truncate">
                    {cohort.cohort}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${RISK_COLORS[cohort.risk]}`}>
                    {cohort.risk}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{cohort.domain}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {cohort.records} records
                  </span>
                  <span className="text-xs text-slate-500">{cohort.status}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Panel: Selected Cohort Detail (3/5) */}
        <div className="w-full lg:w-3/5 flex flex-col gap-5">
          {/* Cohort Header */}
          <div className="rounded-xl border border-slate-700 bg-brand-panel p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white">{selected.cohort}</h2>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${RISK_COLORS[selected.risk]}`}>
                {selected.risk} risk
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span>Domain: <span className="text-slate-200">{selected.domain}</span></span>
              <span>
                k-Anonymity:{' '}
                <span className={selected.kAnon >= 10 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {selected.kAnon}
                </span>
              </span>
              <span>Consent: <span className="text-slate-200">{selected.consent}</span></span>
            </div>
          </div>

          {/* De-identification Pipeline */}
          <div className="rounded-xl border border-slate-700 bg-brand-panel p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              De-identification Pipeline
            </h3>
            <div className="flex flex-col gap-2">
              {transformations.map((step) => (
                <div
                  key={step.name}
                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-800/40"
                >
                  {step.done ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className={`text-sm font-medium ${step.done ? 'text-white' : 'text-slate-400'}`}>
                      {step.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cohort Signals */}
          <div className="rounded-xl border border-slate-700 bg-brand-panel p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Cohort Signals</h3>
            <div className="grid grid-cols-2 gap-3">
              {metrics.map((m) => (
                <div
                  key={m.label}
                  className="rounded-lg border border-slate-700 bg-slate-800/30 p-3"
                >
                  <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${TONE_COLORS[m.tone]}`}>
                      {m.value}
                    </span>
                    <span className="text-xs text-slate-500">{m.trend}</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-700">
                    <div
                      className={`h-1.5 rounded-full ${TONE_BAR_COLORS[m.tone]}`}
                      style={{ width: `${Math.min(m.value * 2, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Governance Requirement Warning */}
          <div className="rounded-lg border border-amber-500/30 bg-amber-950/10 p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-300 mb-1">
                Governance Requirement
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                This cohort must complete all de-identification steps and pass IRB review
                before any data can be exported to the outcomes registry. Small-cell
                suppression thresholds are enforced automatically.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Governance Workflow */}
      <div className="px-6 pb-6">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-3">
          Governance Workflow
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {GOVERNANCE_STEPS.map((step, i) => {
            const passed = i < 2;
            return (
              <div
                key={step.key}
                className={`rounded-xl border p-4 text-center ${
                  passed
                    ? 'border-emerald-500/30 bg-emerald-950/10'
                    : 'border-slate-700 bg-brand-panel'
                }`}
              >
                <div className="flex justify-center mb-2">
                  {passed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <XCircle className="w-6 h-6 text-slate-500" />
                  )}
                </div>
                <p className={`text-sm font-medium ${passed ? 'text-emerald-300' : 'text-slate-400'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar: Registry Boundary Notice + Click AI */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isClickOpen && (
          <div className="animate-slideInBottom4 w-80 rounded-xl border border-purple-500/40 bg-brand-panel shadow-2xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-300" />
                <span className="text-sm font-semibold text-white">Click AI</span>
              </div>
              <button
                onClick={() => setIsClickOpen(false)}
                className="text-slate-500 hover:text-slate-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="rounded-lg border border-purple-500/20 bg-purple-950/10 p-3 mb-3">
              <p className="text-xs text-purple-300 font-semibold mb-1">Registry Boundary Notice</p>
              <p className="text-xs text-slate-300 leading-relaxed">
                All data in the outcomes registry has been de-identified per HIPAA Safe
                Harbor guidelines. Re-identification is prohibited without IRB approval.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <button className="w-full py-2 px-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2">
                <FileCheck2 className="w-4 h-4" />
                Generate Governance Packet
              </button>
              <button className="w-full py-2 px-3 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2">
                <ArrowRight className="w-4 h-4" />
                Prepare Registry Export
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setIsClickOpen((v) => !v)}
          className="w-12 h-12 rounded-full bg-brand-panel border-2 border-purple-500/60 flex items-center justify-center shadow-lg hover:border-purple-400 transition-colors"
        >
          <Bot className="w-5 h-5 text-purple-300" />
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  const colorMap = {
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  };
  const iconColorMap = {
    purple: 'text-purple-400',
    rose: 'text-rose-400',
    amber: 'text-amber-400',
    emerald: 'text-emerald-400',
  };

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${iconColorMap[color]}`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}
