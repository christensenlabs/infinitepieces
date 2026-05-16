import { useState } from 'react';
import {
  ShieldCheck,
  Activity,
  AlertCircle,
  Bot,
  X,
  TrendingDown,
  TrendingUp,
  CheckCircle2,
  ChevronRight,
  BrainCircuit,
  HeartHandshake,
  FileCheck2,
  Minus,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { fetchIntegrityStaff, fetchIntegrityChecklist } from '@/api/apps';

function TrendIcon({ trend }) {
  if (trend === 'up') return <TrendingUp size={14} className="text-emerald-400" />;
  if (trend === 'down') return <TrendingDown size={14} className="text-rose-400" />;
  return <Minus size={14} className="text-slate-400" />;
}

function StatusDot({ status }) {
  const color =
    status === 'good'
      ? 'bg-emerald-400'
      : status === 'warning'
        ? 'bg-amber-400'
        : 'bg-rose-400';
  return <span className={`inline-block w-2 h-2 rounded-full ${color} shrink-0`} />;
}

function IoaBadge({ method }) {
  return (
    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 border border-slate-600">
      {method}
    </span>
  );
}

function KpiCard({ label, value, sub, accent }) {
  const accentMap = {
    indigo: 'border-indigo-500/40 shadow-indigo-500/10',
    cyan: 'border-cyan-500/40 shadow-cyan-500/10',
    rose: 'border-rose-500/40 shadow-rose-500/10',
  };
  const valueMap = {
    indigo: 'text-indigo-300',
    cyan: 'text-cyan-300',
    rose: 'text-rose-400',
  };
  return (
    <div
      className={`bg-slate-900/70 border rounded-2xl p-4 shadow-lg ${accentMap[accent]}`}
    >
      <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-3xl font-bold mb-0.5 ${valueMap[accent]}`}>{value}</p>
      {sub && <p className="text-[11px] text-slate-500">{sub}</p>}
    </div>
  );
}

function ChecklistSection({ title, icon, items }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-slate-400">{icon}</span>
        <p className="text-xs font-semibold text-slate-300 uppercase tracking-widest">{title}</p>
      </div>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item.id} className="flex items-start gap-2">
            {item.scored ? (
              <CheckCircle2 size={15} className="text-emerald-400 mt-0.5 shrink-0" />
            ) : (
              <X size={15} className="text-rose-400 mt-0.5 shrink-0" />
            )}
            <span className="text-sm text-slate-300 leading-snug">{item.step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function TreatmentIntegrityLab() {
  const { data: staffData } = useApiData(fetchIntegrityStaff);
  const { data: checklist } = useApiData(fetchIntegrityChecklist);

  const [activeTab, setActiveTab] = useState('fidelity');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isAiOpen, setIsAiOpen] = useState(false);

  if (!staffData || !checklist) {
    return <div className="p-8 text-center text-slate-400">Loading...</div>;
  }

  const assentItems = checklist.filter(
    (c) => c.category === 'Assent & Readiness',
  );
  const technicalItems = checklist.filter(
    (c) => c.category !== 'Assent & Readiness',
  );

  const tabs = [
    { id: 'fidelity', label: 'Procedural Fidelity' },
    { id: 'ioa', label: 'IOA Matrix' },
  ];

  return (
    <div className="min-h-full bg-[#02050A] text-slate-100 font-sans relative overflow-x-hidden">
      {/* Background blur decorations */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-cyan-500/8 blur-[150px]" />
      </div>

      <div className="relative z-10 p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0.2)]">
              <BrainCircuit size={22} className="text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white leading-tight">
                Clinical Integrity Engine™
              </h1>
              <p className="text-[11px] text-indigo-400 font-mono tracking-widest uppercase">
                BACB 2026 Standard Compliant
              </p>
            </div>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-800 rounded-xl p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left column */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            {/* KPI cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <KpiCard
                label="Global Fidelity"
                value="88%"
                sub="Avg across all practitioners"
                accent="indigo"
              />
              <KpiCard
                label="Global IOA"
                value="91%"
                sub="Across all active programs"
                accent="cyan"
              />
              <KpiCard
                label="Drift / Ethics Alerts"
                value="1 Staff"
                sub="Assent criteria breached"
                accent="rose"
              />
            </div>

            {/* Clinical Drift Radar table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="px-5 py-4 border-b border-slate-800 flex items-center gap-2">
                <Activity size={16} className="text-indigo-400" />
                <h2 className="text-sm font-semibold text-slate-200 tracking-wide">
                  Clinical Drift Radar
                </h2>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 px-5 py-2.5 border-b border-slate-800/60 text-[11px] font-semibold uppercase tracking-widest text-slate-500">
                <span>Practitioner</span>
                <span>Composite</span>
                <span>Technical</span>
                <span>Assent</span>
                <span>IOA Score</span>
                <span />
              </div>

              {/* Table rows */}
              {staffData.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() =>
                    setSelectedStaff(
                      selectedStaff?.id === staff.id ? null : staff,
                    )
                  }
                  className={`w-full grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-3 items-center px-5 py-3.5 border-b border-slate-800/40 last:border-b-0 text-left transition-all hover:bg-slate-800/40 ${
                    selectedStaff?.id === staff.id
                      ? 'bg-indigo-500/10 border-l-2 border-l-indigo-500'
                      : ''
                  }`}
                >
                  {/* Practitioner */}
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusDot status={staff.status} />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-100 truncate">{staff.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {staff.role} &middot; {staff.lastCheck}
                      </p>
                    </div>
                  </div>

                  {/* Composite fidelity + trend */}
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-sm font-semibold ${
                        staff.metrics.total >= 85
                          ? 'text-emerald-400'
                          : staff.metrics.total >= 75
                            ? 'text-amber-400'
                            : 'text-rose-400'
                      }`}
                    >
                      {staff.metrics.total}%
                    </span>
                    <TrendIcon trend={staff.trend} />
                  </div>

                  {/* Technical */}
                  <span
                    className={`text-sm font-medium ${
                      staff.metrics.technical >= 85
                        ? 'text-slate-300'
                        : 'text-amber-400'
                    }`}
                  >
                    {staff.metrics.technical}%
                  </span>

                  {/* Assent */}
                  <span
                    className={`text-sm font-medium ${
                      staff.metrics.assent >= 80
                        ? 'text-slate-300'
                        : 'text-rose-400'
                    }`}
                  >
                    {staff.metrics.assent}%
                  </span>

                  {/* IOA */}
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-slate-300">
                      {staff.ioa.score}%
                    </span>
                    <IoaBadge method={staff.ioa.method} />
                  </div>

                  {/* Chevron */}
                  <ChevronRight
                    size={16}
                    className={`text-slate-600 transition-transform ${
                      selectedStaff?.id === staff.id ? 'rotate-90 text-indigo-400' : ''
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 xl:col-span-4">
            {selectedStaff ? (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                {/* Staff detail header */}
                <div className="px-5 py-4 border-b border-slate-800 bg-indigo-500/5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-base font-bold text-white leading-tight">
                        {selectedStaff.name}
                      </h3>
                      <p className="text-[11px] text-indigo-400 font-mono mt-0.5">
                        Live Observation Sync
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedStaff(null)}
                      className="text-slate-500 hover:text-slate-300 transition-colors mt-0.5"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[60vh]">
                  {/* Ethical alert */}
                  {selectedStaff.metrics.assent < 80 && (
                    <div className="flex items-start gap-2.5 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3">
                      <AlertCircle size={15} className="text-rose-400 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-rose-300 mb-0.5">
                          Ethics Alert — Assent Criteria
                        </p>
                        <p className="text-[11px] text-rose-400/80 leading-snug">
                          Assent score is below 80%. Review BACB Ethics Code 4.06 and
                          document a corrective action.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Assent & Readiness checklist */}
                  {assentItems.length > 0 && (
                    <ChecklistSection
                      title="Assent & Readiness"
                      icon={<HeartHandshake size={14} />}
                      items={assentItems}
                    />
                  )}

                  {/* Technical Execution + Reinforcement */}
                  {technicalItems.length > 0 && (
                    <ChecklistSection
                      title="Technical Execution"
                      icon={<BrainCircuit size={14} />}
                      items={technicalItems}
                    />
                  )}
                </div>

                {/* Footer action */}
                <div className="px-5 py-4 border-t border-slate-800">
                  <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors shadow-[0_0_12px_rgba(99,102,241,0.25)]">
                    <FileCheck2 size={15} />
                    Log Supervision Target
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-3 py-16 px-8 text-center h-full min-h-[280px]">
                <div className="p-4 rounded-full bg-slate-800/60 border border-slate-700">
                  <ShieldCheck size={28} className="text-slate-500" />
                </div>
                <p className="text-base font-semibold text-slate-400">Observation Sandbox</p>
                <p className="text-xs text-slate-600 max-w-[180px] leading-relaxed">
                  Select a practitioner from the drift radar to review their checklist.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Clinical Copilot floating button */}
      {!isAiOpen && (
        <button
          onClick={() => setIsAiOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-[#02050A] border border-cyan-500/50 text-cyan-400 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:border-cyan-400/70 transition-all font-semibold text-sm"
        >
          <Bot size={18} />
          Clinical Copilot
        </button>
      )}

      {/* Copilot popup */}
      {isAiOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.2)] overflow-hidden">
          {/* Popup header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-cyan-500/5">
            <div className="flex items-center gap-2">
              <Bot size={16} className="text-cyan-400" />
              <span className="text-sm font-bold text-white">Clinical Copilot</span>
            </div>
            <button
              onClick={() => setIsAiOpen(false)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          {/* Message */}
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-start gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 shrink-0 mt-0.5">
                <AlertCircle size={13} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-300 mb-1">
                  Drift Detection — Devon K.
                </p>
                <p className="text-[12px] text-slate-300 leading-relaxed">
                  Devon K. has shown a{' '}
                  <span className="text-rose-400 font-semibold">30% assent drop</span> over
                  the last 3 sessions. This may implicate{' '}
                  <span className="text-amber-300 font-medium">BACB Ethics Code 4.06</span>{' '}
                  (right to effective treatment). Recommend immediate BST review.
                </p>
              </div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold py-2 px-3 rounded-xl transition-colors shadow-[0_0_10px_rgba(6,182,212,0.2)]">
              <FileCheck2 size={13} />
              Draft BST Protocol
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
