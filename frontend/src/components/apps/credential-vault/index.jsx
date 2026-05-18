import { useState, useMemo } from 'react';
import {
  Users, AlertTriangle, CalendarOff, GraduationCap,
  Search, ShieldCheck, ShieldAlert, ShieldX,
  Clock, Bot, ChevronRight, Activity,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { fetchCredentialStaff, fetchCredentialStats } from '@/api/apps';

/* ── risk color helper ── */
const RISK_MAP = {
  rose: { bg: 'bg-rose-500', track: 'bg-rose-900/40', text: 'text-rose-400' },
  amber: { bg: 'bg-amber-500', track: 'bg-amber-900/40', text: 'text-amber-400' },
  emerald: { bg: 'bg-emerald-500', track: 'bg-emerald-900/40', text: 'text-emerald-400' },
};

function riskTier(days) {
  if (days <= 30) return 'rose';
  if (days <= 60) return 'amber';
  return 'emerald';
}

function riskBg(days) { return RISK_MAP[riskTier(days)].bg; }
function riskTrack(days) { return RISK_MAP[riskTier(days)].track; }
function riskText(days) { return RISK_MAP[riskTier(days)].text; }

/* ── status helpers ── */
const STATUS_CONFIG = {
  eligible: { label: 'Eligible', bg: 'bg-emerald-900/40', text: 'text-emerald-400', border: 'border-emerald-700/40', icon: ShieldCheck },
  watch:    { label: 'Watch',    bg: 'bg-amber-900/40',   text: 'text-amber-400',   border: 'border-amber-700/40',   icon: ShieldAlert },
  blocked:  { label: 'Blocked',  bg: 'bg-rose-900/40',    text: 'text-rose-400',     border: 'border-rose-700/40',    icon: ShieldX },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG.watch;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <Icon size={10} /> {cfg.label}
    </span>
  );
}

/* ── stat card ── */
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-brand-panel border border-slate-700/40 rounded-xl p-4 flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-black text-slate-100">{value}</p>
        <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
      </div>
    </div>
  );
}

/* ── credential meter ── */
function CredentialMeter({ label, daysRemaining }) {
  const pct = Math.min(100, Math.max(0, (daysRemaining / 365) * 100));

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold text-slate-300">{label}</span>
        <span className={`text-xs font-bold ${riskText(daysRemaining)}`}>
          {daysRemaining}d
        </span>
      </div>
      <div className={`h-2 rounded-full ${riskTrack(daysRemaining)}`}>
        <div
          className={`h-full rounded-full ${riskBg(daysRemaining)} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/* ── staff card (roster list) ── */
function StaffCard({ member, selected, onSelect }) {
  const isSelected = selected?.id === member.id;
  return (
    <button
      onClick={() => onSelect(member)}
      className={`w-full text-left p-3 rounded-xl border transition-all ${
        isSelected
          ? 'bg-cyan-900/20 border-cyan-700/50'
          : 'bg-brand-panel border-slate-700/30 hover:border-slate-600/50'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div>
          <p className="text-sm font-bold text-slate-100">{member.name}</p>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">{member.role}</p>
        </div>
        <StatusPill status={member.status} />
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span>Competency: <span className={member.clientCompetency >= 80 ? 'text-emerald-400' : 'text-rose-400'}>{member.clientCompetency}%</span></span>
        {member.blockers.length > 0 && (
          <span className="text-rose-400 flex items-center gap-1">
            <AlertTriangle size={10} /> {member.blockers.length} blocker{member.blockers.length > 1 ? 's' : ''}
          </span>
        )}
      </div>
    </button>
  );
}

/* ── main export ── */
export default function CompetencyCredentialVault() {
  const { data: staff, loading: staffLoading } = useApiData(fetchCredentialStaff);
  const { data: stats, loading: statsLoading } = useApiData(fetchCredentialStats);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [filterTab, setFilterTab] = useState('all');
  const [search, setSearch] = useState('');

  const filteredStaff = useMemo(() => {
    if (!staff) return [];
    let list = staff;
    if (filterTab !== 'all') list = list.filter(m => m.status.toLowerCase() === filterTab);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(m => m.name.toLowerCase().includes(q) || m.role.toLowerCase().includes(q));
    }
    return list;
  }, [staff, filterTab, search]);

  const loading = staffLoading || statsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-brand-dark text-slate-400">
        <Activity className="animate-spin mr-3" size={24} />
        <span className="font-bold">Loading Credential Vault...</span>
      </div>
    );
  }

  const selected = selectedStaff || (filteredStaff.length > 0 ? filteredStaff[0] : null);

  const FILTER_TABS = [
    { key: 'all', label: 'All' },
    { key: 'eligible', label: 'Eligible' },
    { key: 'watch', label: 'Watch' },
    { key: 'blocked', label: 'Blocked' },
  ];

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        .vault-scroll::-webkit-scrollbar { width: 4px; }
        .vault-scroll::-webkit-scrollbar-track { background: transparent; }
        .vault-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}} />

      {/* ── Header ── */}
      <header className="border-b border-slate-700/50 bg-brand-panel/60 backdrop-blur px-6 py-5">
        <div className="max-w-[1400px] mx-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-400 mb-1">
            Infinite Suite
          </p>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-100">
            Competency & Credential Vault
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Staff credential expiration tracking and schedule eligibility management.
          </p>
        </div>
      </header>

      <div className="max-w-[1400px] mx-auto p-4 md:p-6 space-y-5">
        {/* ── Stat Cards ── */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard icon={Users} label="Active Staff" value={stats.activeStaff} accent="bg-cyan-700" />
            <StatCard icon={Clock} label="Expiring 30 Days" value={stats.expiring30Days} accent="bg-amber-700" />
            <StatCard icon={CalendarOff} label="Blocked Shifts" value={stats.blockedShifts} accent="bg-rose-700" />
            <StatCard icon={GraduationCap} label="Competency Complete" value={stats.competencyComplete} accent="bg-emerald-700" />
          </div>
        )}

        {/* ── Main Content ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

          {/* ── Left: Staff Roster ── */}
          <div className="lg:col-span-4 bg-brand-panel border border-slate-700/40 rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700/40">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-300 mb-3">Staff Roster</h2>

              {/* Filter tabs */}
              <div className="flex gap-1 mb-3 bg-brand-dark rounded-lg p-1">
                {FILTER_TABS.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setFilterTab(tab.key)}
                    className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider transition-colors ${
                      filterTab === tab.key
                        ? 'bg-cyan-800/50 text-cyan-300'
                        : 'text-slate-500 hover:text-slate-300'
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
                  placeholder="Search staff..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-brand-dark border border-slate-700/50 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-700/60"
                />
              </div>
            </div>

            <div className="p-3 space-y-2 overflow-y-auto vault-scroll" style={{ maxHeight: '520px' }}>
              {filteredStaff.length === 0 && (
                <p className="text-center text-sm text-slate-600 py-8">No staff match this filter.</p>
              )}
              {filteredStaff.map(member => (
                <StaffCard
                  key={member.id}
                  member={member}
                  selected={selected}
                  onSelect={setSelectedStaff}
                />
              ))}
            </div>
          </div>

          {/* ── Center: Staff Detail ── */}
          <div className="lg:col-span-5 bg-brand-panel border border-slate-700/40 rounded-xl p-5 space-y-5">
            {selected ? (
              <>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-black text-slate-100">{selected.name}</h2>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{selected.role}</p>
                  </div>
                  <StatusPill status={selected.status} />
                </div>

                <div className="text-xs text-slate-400 flex items-center gap-2">
                  <Activity size={12} />
                  Schedule Eligibility:
                  <span className={selected.status.toLowerCase() === 'eligible' ? 'text-emerald-400 font-bold' : selected.status.toLowerCase() === 'blocked' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
                    {selected.status.toLowerCase() === 'eligible' ? 'Cleared' : selected.status.toLowerCase() === 'blocked' ? 'Blocked' : 'Conditional'}
                  </span>
                </div>

                {/* Credential Meters */}
                <div className="space-y-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Credentials</h3>
                  <div className="space-y-3">
                    <CredentialMeter label="CPR Certification" daysRemaining={selected.cprDays} />
                    <CredentialMeter label="BACB Certification" daysRemaining={selected.bacbDays} />
                    <CredentialMeter label="Background Check" daysRemaining={selected.backgroundDays} />
                    <CredentialMeter label="HIPAA Training" daysRemaining={selected.hipaaTrainingDays} />
                  </div>
                </div>

                {/* Client Competency */}
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-2">Client Competency</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-300">Completion</span>
                      <span className={`text-xs font-bold ${selected.clientCompetency >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {selected.clientCompetency}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-700/50">
                      <div
                        className={`h-full rounded-full transition-all ${selected.clientCompetency >= 80 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                        style={{ width: `${selected.clientCompetency}%` }}
                      />
                    </div>
                    {selected.clientCompetency < 80 && (
                      <p className="text-[10px] text-rose-400 mt-1">Below 80% threshold for independent scheduling.</p>
                    )}
                  </div>
                </div>

                {/* Payer Eligibility */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Payer Eligible:</span>
                  {selected.payerEligible ? (
                    <span className="text-emerald-400 font-bold flex items-center gap-1"><ShieldCheck size={12} /> Yes</span>
                  ) : (
                    <span className="text-rose-400 font-bold flex items-center gap-1"><ShieldX size={12} /> No</span>
                  )}
                </div>

                {/* Active Blockers */}
                {selected.blockers.length > 0 && (
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-rose-400 mb-2 flex items-center gap-1">
                      <AlertTriangle size={12} /> Active Blockers
                    </h3>
                    <ul className="space-y-1.5">
                      {selected.blockers.map((blocker, i) => (
                        <li key={i} className="flex items-start gap-2 bg-rose-900/20 border border-rose-800/30 rounded-lg px-3 py-2 text-xs text-rose-300">
                          <ChevronRight size={12} className="mt-0.5 shrink-0" />
                          {blocker}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 py-16">
                <Users size={32} className="mb-3" />
                <p className="text-sm font-semibold">Select a staff member to view details</p>
              </div>
            )}
          </div>

          {/* ── Right Sidebar ── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Scheduling Guardrail */}
            <div className="bg-brand-panel border border-slate-700/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert size={16} className="text-amber-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Scheduling Guardrails</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Staff with expired credentials or competency below 80% are automatically blocked from new shift assignments.
                Resolve blockers to restore scheduling eligibility.
              </p>
              <div className="bg-amber-900/20 border border-amber-800/30 rounded-lg p-3 text-[11px] text-amber-300 font-medium">
                {stats ? stats.blockedShifts : 0} shift{stats?.blockedShifts !== 1 ? 's' : ''} currently blocked due to credential gaps.
              </div>
            </div>

            {/* AI Assistant Stub */}
            <div className="bg-brand-panel border border-slate-700/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bot size={16} className="text-cyan-400" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-300">Click AI Assistant</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-3">
                Ask AI to forecast credential expirations, generate renewal reminders, or suggest optimal scheduling around credential gaps.
              </p>
              <div className="space-y-2">
                <button className="w-full bg-cyan-900/30 border border-cyan-800/40 text-cyan-300 text-xs font-bold py-2 rounded-lg hover:bg-cyan-900/50 transition-colors">
                  Forecast Expirations
                </button>
                <button className="w-full bg-cyan-900/30 border border-cyan-800/40 text-cyan-300 text-xs font-bold py-2 rounded-lg hover:bg-cyan-900/50 transition-colors">
                  Generate Renewal Alerts
                </button>
                <button className="w-full bg-cyan-900/30 border border-cyan-800/40 text-cyan-300 text-xs font-bold py-2 rounded-lg hover:bg-cyan-900/50 transition-colors">
                  Optimize Schedule Coverage
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
