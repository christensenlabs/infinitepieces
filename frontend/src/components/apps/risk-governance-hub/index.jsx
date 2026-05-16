import { useState } from 'react';
import {
  Shield, FileWarning, Lock, BadgeAlert,
  Bot, X, CheckCircle2, AlertTriangle, FileSignature, UploadCloud,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { fetchRiskIncidents, fetchRiskCredentials, fetchRiskConsents } from '@/api/apps';

const TABS = [
  { id: 'incidents', label: 'Incident Reports', icon: FileWarning },
  { id: 'credentials', label: 'Credential Vault', icon: Lock },
  { id: 'consent', label: 'Consent Vault', icon: FileSignature },
];

export default function RiskGovernanceHub() {
  const [activeTab, setActiveTab] = useState('incidents');
  const [isClickOpen, setIsClickOpen] = useState(false);

  const { data: incidents } = useApiData(fetchRiskIncidents);
  const { data: credentials } = useApiData(fetchRiskCredentials);
  const { data: consents } = useApiData(fetchRiskConsents);

  if (!incidents || !credentials || !consents) {
    return <div className="p-8 text-center text-slate-400">Loading...</div>;
  }

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
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <Shield className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Risk &amp; Governance Hub™
            </h1>
            <p className="text-xs text-slate-400">Enterprise compliance and incident management</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === id
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 animate-fadeIn">
        {activeTab === 'incidents' && (
          <IncidentsTab incidents={incidents} />
        )}
        {activeTab === 'credentials' && (
          <CredentialsTab credentials={credentials} />
        )}
        {activeTab === 'consent' && (
          <ConsentTab consents={consents} />
        )}
      </div>

      {/* Floating Click AI Widget */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        {isClickOpen && (
          <div className="animate-slideInBottom4 w-80 rounded-xl border border-cyan-500/40 bg-brand-panel shadow-2xl p-4">
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
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              I detected 2 items requiring immediate action:
              <br /><br />
              <span className="text-rose-400 font-medium">Emma R.</span> — CPR certification expired 14 days ago. She is currently locked out of direct client contact per policy 4.2B.
              <br /><br />
              <span className="text-amber-400 font-medium">Noah T.</span> — An elopement incident occurred today at 10:42 AM. A mandatory incident report must be filed within 24 hours.
            </p>
            <button className="w-full py-2 px-3 rounded-lg bg-accent/10 border border-accent/30 text-accent text-sm font-medium hover:bg-accent/20 transition-colors">
              Draft Incident Report
            </button>
          </div>
        )}
        <button
          onClick={() => setIsClickOpen((v) => !v)}
          className="w-12 h-12 rounded-full bg-brand-panel border-2 border-accent/60 flex items-center justify-center shadow-lg hover:border-accent transition-colors"
        >
          <Bot className="w-5 h-5 text-accent" />
        </button>
      </div>
    </div>
  );
}

function IncidentsTab({ incidents }) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {/* Left: Critical Incident Board (2/3 width) */}
      <div className="col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <FileWarning className="w-4 h-4 text-rose-400" />
            Critical Incident Board
          </h2>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium hover:bg-rose-500/20 transition-colors">
            <UploadCloud className="w-4 h-4" />
            File Report
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="rounded-xl border border-rose-500/20 bg-rose-950/10 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold uppercase tracking-wide">
                      {incident.type}
                    </span>
                    <span className="text-slate-400 text-xs">{incident.time}</span>
                  </div>
                  <p className="text-sm font-medium text-white truncate">{incident.client}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{incident.note}</p>
                </div>
                <button className="shrink-0 px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-300 text-xs font-medium hover:bg-rose-500/10 transition-colors">
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Regulatory Mandates (1/3 width) */}
      <div className="col-span-1">
        <div className="rounded-xl border border-amber-500/20 bg-amber-950/10 p-5 h-full">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-amber-300">Regulatory Mandates</h3>
          </div>
          <ul className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-amber-400 font-bold shrink-0">§4.2B</span>
              Staff with expired CPR/First Aid credentials must be removed from direct client contact immediately.
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400 font-bold shrink-0">§7.1</span>
              Elopement and self-injury incidents require a written report within 24 hours and supervisor sign-off within 48 hours.
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400 font-bold shrink-0">§12.4</span>
              All consent forms must be re-signed annually. Unsigned consents block billing for associated services.
            </li>
            <li className="flex gap-2">
              <span className="text-amber-400 font-bold shrink-0">§9.3</span>
              RBT certifications must remain active. Lapses beyond 30 days trigger a full re-competency evaluation.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CredentialsTab({ credentials }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-4 h-4 text-amber-400" />
        <h2 className="text-base font-semibold text-white">Credential Vault</h2>
      </div>
      <div className="rounded-xl border border-slate-700 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-brand-panel">
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Staff Member
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                RBT Cert
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                CPR / First Aid
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {credentials.map((staff) => {
              const cprExpired = staff.cprStatus === 'expired';
              return (
                <tr
                  key={staff.id}
                  className={`border-b border-slate-800 last:border-0 transition-colors ${
                    cprExpired ? 'bg-rose-950/10' : 'bg-transparent hover:bg-slate-800/30'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xs font-bold text-amber-300">
                        {staff.initials}
                      </div>
                      <span className="text-white font-medium">{staff.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-300">{staff.rbtCert}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {cprExpired && (
                        <BadgeAlert className="w-4 h-4 text-rose-400 shrink-0" />
                      )}
                      <span className={cprExpired ? 'text-rose-400 font-medium' : 'text-slate-300'}>
                        {staff.cprCert}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {staff.status === 'Suspended' ? (
                      <span className="px-2 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                        Suspended
                      </span>
                    ) : (
                      <span className="px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                        Cleared
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ConsentTab({ consents }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <FileSignature className="w-4 h-4 text-amber-400" />
        <h2 className="text-base font-semibold text-white">Consent Vault</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {consents.map((consent) => (
          <div
            key={consent.id}
            className={`rounded-xl border p-4 ${
              consent.signed
                ? 'border-emerald-500/20 bg-emerald-950/10'
                : 'border-rose-500/20 bg-rose-950/10'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {consent.signed ? (
                    <FileSignature className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className={`text-xs font-semibold uppercase tracking-wide ${consent.signed ? 'text-emerald-300' : 'text-rose-300'}`}>
                    {consent.type}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">{consent.client}</p>
                <p className="text-xs text-slate-400 mt-0.5">{consent.date}</p>
              </div>
              <div className="shrink-0">
                {consent.signed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400" />
                )}
              </div>
            </div>
            {!consent.signed && (
              <button className="mt-3 w-full py-1.5 px-3 rounded-lg border border-rose-500/30 text-rose-300 text-xs font-medium hover:bg-rose-500/10 transition-colors">
                Request Signature
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
