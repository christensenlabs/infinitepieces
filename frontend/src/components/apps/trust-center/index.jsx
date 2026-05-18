import { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Activity,
  Monitor,
  Smartphone,
  Laptop,
  Clock,
  CheckCircle2,
  Circle,
  FileText,
  Lock,
  UserX,
  Download,
  AlertTriangle,
  Bot,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import {
  fetchSecurityEvents,
  fetchDeviceSessions,
  fetchResponseChecklist,
  fetchTrustCenterStats,
} from '@/api/apps';

const RISK_STYLES = {
  low: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/40',
  medium: 'bg-amber-900/40 text-amber-400 border border-amber-700/40',
  high: 'bg-rose-900/40 text-rose-400 border border-rose-700/40',
};

const STATUS_STYLES = {
  Active: 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/40',
  'Auto-logged out': 'bg-amber-900/40 text-amber-400 border border-amber-700/40',
  Blocked: 'bg-rose-900/40 text-rose-400 border border-rose-700/40',
};

const EVENT_ICONS = {
  login: Lock,
  export: Download,
  access: FileText,
  session: Monitor,
  failed_login: UserX,
  alert: AlertTriangle,
};

function StatCard({ icon: Icon, label, value, accent }) {
  const accents = {
    emerald: 'text-emerald-400 bg-emerald-900/30 border-emerald-700/30',
    amber: 'text-amber-400 bg-amber-900/30 border-amber-700/30',
    cyan: 'text-accent bg-cyan-900/30 border-cyan-700/30',
    rose: 'text-rose-400 bg-rose-900/30 border-rose-700/30',
  };
  return (
    <div className="bg-brand-panel border border-slate-700/40 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-lg flex items-center justify-center border ${accents[accent]}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-100">{value}</p>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

export default function HIPAATrustCenter() {
  const { data: events } = useApiData(fetchSecurityEvents);
  const { data: devices } = useApiData(fetchDeviceSessions);
  const { data: checklist } = useApiData(fetchResponseChecklist);
  const { data: stats } = useApiData(fetchTrustCenterStats);

  const [selectedEvent, setSelectedEvent] = useState(null);

  if (!events || !devices || !checklist || !stats) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-400">
          <RefreshCw size={20} className="animate-spin" />
          <span className="text-sm font-medium">Initializing Trust Center...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark text-slate-100 font-sans">
      <style dangerouslySetInnerHTML={{ __html: `
        .tc-scrollbar::-webkit-scrollbar { width: 5px; }
        .tc-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .tc-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .tc-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}} />

      <div className="max-w-7xl mx-auto px-4 py-8 lg:flex lg:gap-6">
        {/* Main content area */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-brand-panel border border-slate-700/50 rounded-lg flex items-center justify-center">
              <ShieldCheck size={20} className="text-accent" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">HIPAA Trust Center & Security Admin</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">Compliance Dashboard</p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <StatCard
              icon={ShieldCheck}
              label="Security Posture"
              value={`${stats.securityPosture}%`}
              accent="emerald"
            />
            <StatCard
              icon={ShieldAlert}
              label="Failed Logins"
              value={stats.failedLogins}
              accent="rose"
            />
            <StatCard
              icon={Activity}
              label="Active Sessions"
              value={stats.activeSessions}
              accent="cyan"
            />
            <StatCard
              icon={Download}
              label="Exports Today"
              value={stats.exportsToday}
              accent="amber"
            />
          </div>

          {/* Security Event Timeline + Event Detail */}
          <div className="flex gap-4 mb-6">
            {/* Left: Event Timeline */}
            <div className="w-3/5 bg-brand-panel border border-slate-700/40 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/40 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">Security Event Timeline</h2>
                <span className="text-xs text-slate-500">{events.length} events</span>
              </div>
              <div className="max-h-80 overflow-y-auto tc-scrollbar">
                {events.map(evt => {
                  const EvtIcon = EVENT_ICONS[evt.type] || Shield;
                  const isSelected = selectedEvent?.id === evt.id;
                  return (
                    <button
                      key={evt.id}
                      onClick={() => setSelectedEvent(evt)}
                      className={`w-full text-left px-5 py-3.5 flex items-center gap-3 border-b border-slate-800/60 transition-colors ${
                        isSelected
                          ? 'bg-slate-700/30'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <EvtIcon size={16} className="text-slate-400 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{evt.actor}</p>
                        <p className="text-xs text-slate-500 truncate">{evt.target}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${RISK_STYLES[evt.risk]}`}>
                          {evt.risk}
                        </span>
                        <span className="text-[10px] text-slate-500">{evt.time}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Event Detail */}
            <div className="w-2/5 bg-brand-panel border border-slate-700/40 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/40">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">Event Detail</h2>
              </div>
              {selectedEvent ? (
                <div className="p-5 space-y-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Actor</p>
                      <p className="text-sm font-medium text-slate-200">{selectedEvent.actor}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Target</p>
                      <p className="text-sm text-slate-300">{selectedEvent.target}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Type</p>
                      <p className="text-sm text-slate-300 capitalize">{selectedEvent.type.replace('_', ' ')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Time</p>
                      <p className="text-sm text-slate-300">{selectedEvent.time}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Risk Level</p>
                      <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-full ${RISK_STYLES[selectedEvent.risk]}`}>
                        {selectedEvent.risk}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Detail</p>
                      <p className="text-sm text-slate-400 leading-relaxed">{selectedEvent.detail}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 bg-brand-navy/60 hover:bg-brand-navy text-slate-200 text-xs font-bold py-2.5 rounded-lg border border-slate-600/40 transition-colors flex items-center justify-center gap-1.5">
                      <FileText size={13} /> Open Audit Trail
                    </button>
                    <button className="flex-1 bg-rose-900/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold py-2.5 rounded-lg border border-rose-700/40 transition-colors flex items-center justify-center gap-1.5">
                      <UserX size={13} /> Revoke Session
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <Shield size={32} className="text-slate-700 mb-3" />
                  <p className="text-sm text-slate-500">Select an event to view details</p>
                </div>
              )}
            </div>
          </div>

          {/* Device Sessions + Incident Response Checklist */}
          <div className="grid grid-cols-2 gap-4">
            {/* Device Sessions */}
            <div className="bg-brand-panel border border-slate-700/40 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/40 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">Device Sessions</h2>
                <span className="text-xs text-slate-500">{devices.length} devices</span>
              </div>
              <div className="max-h-72 overflow-y-auto tc-scrollbar">
                {devices.map(dev => {
                  const DevIcon = dev.device.toLowerCase().includes('phone') || dev.device.toLowerCase().includes('iphone')
                    ? Smartphone
                    : dev.device.toLowerCase().includes('laptop') || dev.device.toLowerCase().includes('mac')
                      ? Laptop
                      : Monitor;
                  return (
                    <div
                      key={dev.id}
                      className="px-5 py-3.5 border-b border-slate-800/60 flex items-center gap-3"
                    >
                      <DevIcon size={16} className="text-slate-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{dev.device}</p>
                        <p className="text-xs text-slate-500 truncate">{dev.user}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[dev.status] || 'bg-slate-800 text-slate-400'}`}>
                          {dev.status}
                        </span>
                        <span className="text-[10px] text-slate-600 flex items-center gap-1">
                          <Clock size={9} /> {dev.lastSeen}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Incident Response Checklist */}
            <div className="bg-brand-panel border border-slate-700/40 rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-700/40">
                <h2 className="text-sm font-bold uppercase tracking-wide text-slate-300">Incident Response Checklist</h2>
              </div>
              <div className="max-h-72 overflow-y-auto tc-scrollbar">
                {checklist.map(item => (
                  <div
                    key={item.id}
                    className="px-5 py-3.5 border-b border-slate-800/60 flex items-center gap-3"
                  >
                    {item.done ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <Circle size={16} className="text-slate-600 shrink-0" />
                    )}
                    <span className={`text-sm ${item.done ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right sidebar */}
        <aside className="w-72 shrink-0 mt-6 lg:mt-0 space-y-4">
          {/* Trust Center boundary notice */}
          <div className="bg-brand-panel border border-slate-700/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Shield size={16} className="text-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-300">Trust Boundary</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              All data within this dashboard is governed by HIPAA Security Rule administrative,
              physical, and technical safeguards. Access is logged and subject to audit.
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase">
              <ShieldCheck size={12} /> Encryption at rest &amp; in transit
            </div>
          </div>

          {/* Admin Actions */}
          <div className="bg-brand-panel border border-slate-700/40 rounded-xl p-5 space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-slate-300 mb-3">Admin Actions</h3>
            <button className="w-full bg-brand-navy/60 hover:bg-brand-navy text-slate-200 text-xs font-bold py-2.5 rounded-lg border border-slate-600/40 transition-colors flex items-center justify-center gap-2">
              <Lock size={13} /> Force Password Reset
            </button>
            <button className="w-full bg-brand-navy/60 hover:bg-brand-navy text-slate-200 text-xs font-bold py-2.5 rounded-lg border border-slate-600/40 transition-colors flex items-center justify-center gap-2">
              <UserX size={13} /> Revoke All Sessions
            </button>
            <button className="w-full bg-brand-navy/60 hover:bg-brand-navy text-slate-200 text-xs font-bold py-2.5 rounded-lg border border-slate-600/40 transition-colors flex items-center justify-center gap-2">
              <Download size={13} /> Export Audit Log
            </button>
          </div>

          {/* AI Assistant stub */}
          <div className="bg-brand-panel border border-slate-700/40 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Bot size={16} className="text-accent" />
              <h3 className="text-xs font-bold uppercase tracking-wide text-slate-300">Click AI Assistant</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">Ask questions about your security posture, compliance status, or audit history.</p>
            <button className="w-full bg-accent/10 hover:bg-accent/20 text-accent text-xs font-bold py-2.5 rounded-lg border border-accent/20 transition-colors flex items-center justify-center gap-2">
              <ChevronRight size={13} /> Open Assistant
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
