import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, AlertTriangle, Shield as UserShield, FileText as FileSearch,
  Activity, Lock, Clock, CheckCircle, XCircle, Eye, Download, Scale as Filter,
  Mail, Zap, Banknote, BadgeCheck as BadgeIcon, Network, Brain, Server,
  RefreshCw, Link, Plus, Trash2, Loader2
} from 'lucide-react';
import { useApiData } from '../../hooks/useApiData';
import { fetchComplianceConfig } from '../../api/apps';

// ==========================================
// 1. ICONS & UTILS
// ==========================================
const ICONS = {
  shieldCheck: <ShieldCheck size={18} />, alertTriangle: <AlertTriangle size={18} />, userShield: <UserShield size={18} />, fileSearch: <FileSearch size={18} />,
  activity: <Activity size={18} />, lock: <Lock size={18} />, clock: <Clock size={18} />, checkCircle: <CheckCircle size={18} />, xCircle: <XCircle size={18} />,
  eye: <Eye size={18} />, download: <Download size={18} />, filter: <Filter size={18} />, mail: <Mail size={18} />, zap: <Zap size={18} />,
  banknote: <Banknote size={18} />, badge: <BadgeIcon size={18} />, network: <Network size={18} />, brain: <Brain size={18} />, server: <Server size={18} />,
  refresh: <RefreshCw size={18} />, link: <Link size={18} />, plus: <Plus size={18} />, trash: <Trash2 size={18} />
};

function Icon({ name, className = "" }) {
  return <span className={`inline-flex items-center justify-center ${className}`}>{ICONS[name] || <div className="w-4 h-4 rounded-full bg-slate-200"></div>}</span>;
}

function cn(...classes) { return classes.filter(Boolean).join(" "); }
function uid() { return Math.random().toString(36).substr(2, 9); }
function nowStamp() { return new Date().toLocaleString(); }

// ==========================================
// 2. UI COMPONENTS
// ==========================================
function Badge({ children, tone = "slate", icon }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    red: "bg-rose-50 text-rose-800 border-rose-200",
    gold: "bg-amber-50 text-amber-800 border-amber-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
    dark: "bg-[#12214A] text-white border-[#12214A]",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-black uppercase tracking-wider", tones[tone])}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}

function Card({ children, className = "" }) {
  return <div className={cn("bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm", className)}>{children}</div>;
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xl font-black text-[#12214A]">{title}</h3>
          <button onClick={onClose} className="p-2 bg-slate-200 rounded-full hover:bg-slate-300 text-slate-600 transition-colors"><Icon name="xCircle" /></button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. MAIN APPLICATION
// ==========================================
export default function ComplianceSentinelApp() {
  const { data: config, loading: configLoading } = useApiData(useCallback(() => fetchComplianceConfig(), []));

  const [activeTab, setActiveTab] = useState('overview');
  const [toast, setToast] = useState(null);

  // Live Database States (local state)
  const [claims, setClaims] = useState([]);
  const [auths, setAuths] = useState([]);
  const [providers, setProviders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Modal States
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Form States — initialized from config once loaded
  const [claimForm, setClaimForm] = useState({ client: '', date: '', code1: '97153', code2: '', modifier: false, sig: true, gps: true });
  const [authForm, setAuthForm] = useState({ client: '', payer: '', code: '97153', total: 100, used: 0, expire: '' });
  const [provForm, setProvForm] = useState({ name: '', role: 'RBT', bacbExp: '', oigCleared: true, supPercent: 5.0 });

  // Apply config defaults once loaded (one-time initialization from async config)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (config) {
      if (config.defaultClaimForm) setClaimForm(config.defaultClaimForm);
      if (config.defaultAuthForm) setAuthForm(config.defaultAuthForm);
      if (config.defaultProviderForm) setProvForm(config.defaultProviderForm);
    }
  }, [config]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const addAuditLog = (action, target, risk = 'Low') => {
    const newLog = { id: uid(), timestamp: nowStamp(), user: "Compliance Admin", action, target, ip: "Secure Session", risk };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const wipeData = () => {
    setClaims([]); setAuths([]); setProviders([]); setAuditLogs([]); setAlerts([]);
    addAuditLog("System Wipe", "All Databases", "High");
    showToast("System reset to blank slate.");
    setShowResetModal(false);
  };

  // --- SUBMIT HANDLERS ---
  const handleAddClaim = (e) => {
    e.preventDefault();
    const newClaim = {
      id: `CLM-${uid()}`, ...claimForm,
      codes: [claimForm.code1, claimForm.code2].filter(Boolean),
      status: 'Pending Scrub', error: null
    };
    setClaims([newClaim, ...claims]);
    addAuditLog("Created Claim Record", `Claim ID: ${newClaim.id}`);
    setShowClaimModal(false);
    showToast("Claim added to queue.");
  };

  const handleAddAuth = (e) => {
    e.preventDefault();
    const newAuth = { id: `AUTH-${uid()}`, ...authForm };
    setAuths([newAuth, ...auths]);
    addAuditLog("Created Authorization", `Client: ${newAuth.client}, Code: ${newAuth.code}`);
    setShowAuthModal(false);
    showToast("Authorization tracking initialized.");
  };

  const handleAddProvider = (e) => {
    e.preventDefault();
    const newProv = { id: `PRV-${uid()}`, ...provForm };
    setProviders([newProv, ...providers]);
    addAuditLog("Added Provider Profile", `Provider: ${newProv.name}`);
    setShowProviderModal(false);
    showToast("Provider added.");
  };

  // --- THE LIVE SCRUBBING ENGINE ---
  const runLiveScrub = () => {
    addAuditLog("Initiated Pre-Billing Scrub", `Target: ${claims.length} claims`, "Medium");

    let newAlerts = [];
    const scrubbedClaims = claims.map(claim => {
      let errors = [];

      // 1. Basic Compliance Rule Checks
      if (!claim.sig) errors.push("Missing Provider Signature");
      if (!claim.gps) errors.push("GPS Location Mismatch / Unverified");

      // 2. Concurrent Billing Conflict Check (97153 + 97155 without modifier)
      if (claim.codes.includes('97153') && claim.codes.includes('97155') && !claim.modifier) {
        errors.push("Concurrent codes 97153/97155 require modifier (e.g., XP)");
      }

      // 3. Live Authorization Cross-Reference
      const relatedAuth = auths.find(a => a.client.toLowerCase() === claim.client.toLowerCase() && a.code === claim.codes[0]);

      if (!relatedAuth) {
        errors.push(`No active authorization found for ${claim.codes[0]}`);
      } else {
        if (Number(relatedAuth.used) >= Number(relatedAuth.total)) {
          errors.push(`Auth units exhausted for ${claim.codes[0]}`);
        }
        if (claim.date && relatedAuth.expire && new Date(claim.date) > new Date(relatedAuth.expire)) {
          errors.push(`Date of service past auth expiration (${relatedAuth.expire})`);
        }
      }

      // Process Results
      if (errors.length > 0) {
        newAlerts.push({ id: uid(), type: 'critical', title: `Claim Held: ${claim.client}`, desc: errors.join(' | '), time: nowStamp() });
        return { ...claim, status: 'Hold', error: errors[0] }; // Show primary error on table
      }
      return { ...claim, status: 'Clean', error: null };
    });

    setClaims(scrubbedClaims);
    if(newAlerts.length > 0) setAlerts(prev => [...newAlerts, ...prev]);
    showToast(`Scrub complete. ${newAlerts.length} issues flagged.`);
  };

  const deleteClaim = (id) => { setClaims(claims.filter(c => c.id !== id)); addAuditLog("Deleted Claim", `ID: ${id}`); };
  const deleteAuth = (id) => { setAuths(auths.filter(a => a.id !== id)); addAuditLog("Deleted Auth", `ID: ${id}`); };
  const deleteProvider = (id) => { setProviders(providers.filter(p => p.id !== id)); addAuditLog("Deleted Provider", `ID: ${id}`); };

  // --- STATS ---
  const supervisionThreshold = config?.supervisionThreshold ?? 5.0;
  const claimsOnHold = claims.filter(c => c.status === 'Hold').length;
  const claimsClean = claims.filter(c => c.status === 'Clean').length;
  const providersAtRisk = providers.filter(p => p.role === 'RBT' && Number(p.supPercent) < supervisionThreshold).length;

  if (configLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#F7F8FB] text-[#12214A]">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold">Initializing Sentinel Engine...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F8FB] text-slate-900 font-sans p-4 md:p-8 relative">
      <style>{`
        .animate-in { animation-duration: 300ms; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn95; }
        .slide-in-from-bottom-4 { animation-name: slideInBottom4; }
        .slide-in-from-bottom-5 { animation-name: slideInBottom5; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInBottom4 { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInBottom5 { from { opacity: 0; transform: translateY(1.25rem); } to { opacity: 1; transform: translateY(0); } }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-rose-600 flex items-center gap-2">
                <Icon name="lock" /> Live Prototype
              </p>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-[#12214A] tracking-tight">Compliance & Audit OS</h1>
            <p className="text-slate-500 mt-3 max-w-2xl text-sm font-medium leading-relaxed">
              Real-time cross-app auditing. Add data, run the scrubber, and watch the engine catch missing signatures, overlapping codes, and authorization cliffs.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <button onClick={() => setShowResetModal(true)} className="bg-white border border-rose-200 text-rose-600 px-4 py-2 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-rose-50 shadow-sm transition">
              <Icon name="trash" /> Wipe Trial Data
            </button>
            <button
              onClick={runLiveScrub}
              className="bg-[#12214A] text-white px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-md hover:bg-blue-900 transition"
            >
              <Icon name="refresh" /> Run Live Deep Scrub
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide border-b border-slate-200">
          {[
            { id: 'overview', label: 'Command Center', icon: 'server' },
            { id: 'billing', label: `Claim Scrubber (${claims.length})`, icon: 'banknote' },
            { id: 'auths', label: `Auth Tracker (${auths.length})`, icon: 'activity' },
            { id: 'bacb', label: `Providers & BACB (${providers.length})`, icon: 'badge' },
            { id: 'hipaa', label: 'HIPAA Audit Logs', icon: 'network' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-t-2xl text-sm font-black transition-all whitespace-nowrap",
                activeTab === tab.id ? "bg-white text-[#12214A] border-t border-l border-r border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative top-[1px]" : "bg-transparent text-slate-500 hover:text-[#12214A] hover:bg-white/50"
              )}
            >
              <Icon name={tab.icon} className={activeTab === tab.id ? 'text-[#D7A83F]' : ''} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 pb-20">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="flex flex-col justify-between">
                <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Icon name="banknote"/> Claims Held</p><p className="text-3xl font-black text-[#12214A] mt-2">{claimsOnHold}</p></div>
                <p className="text-xs text-rose-600 font-bold mt-3 bg-rose-50 p-2 rounded-lg">Blocked by Scrubber</p>
              </Card>
              <Card className="flex flex-col justify-between">
                <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Icon name="checkCircle"/> Clean Claims</p><p className="text-3xl font-black text-[#12214A] mt-2">{claimsClean}</p></div>
                <p className="text-xs text-emerald-600 font-bold mt-3 bg-emerald-50 p-2 rounded-lg">Ready for Clearinghouse</p>
              </Card>
              <Card className="flex flex-col justify-between">
                <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Icon name="userShield"/> {supervisionThreshold}% Rule Fails</p><p className="text-3xl font-black text-[#12214A] mt-2">{providersAtRisk}</p></div>
                <p className="text-xs text-amber-600 font-bold mt-3 bg-amber-50 p-2 rounded-lg">RBTs below threshold</p>
              </Card>
              <Card className="flex flex-col justify-between">
                <div><p className="text-slate-500 text-xs font-bold uppercase tracking-wider flex items-center gap-1"><Icon name="network"/> Audit Events</p><p className="text-3xl font-black text-[#12214A] mt-2">{auditLogs.length}</p></div>
                <p className="text-xs text-blue-600 font-bold mt-3 bg-blue-50 p-2 rounded-lg">Immutable logs captured</p>
              </Card>
            </div>

            <Card>
              <h3 className="text-xl font-black text-[#12214A] flex items-center gap-2 mb-6">
                <Icon name="link" className="text-rose-500" /> Active System Alerts
              </h3>
              {alerts.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
                  <Icon name="checkCircle" className="text-emerald-400 text-4xl mb-3 block" />
                  <p className="font-black text-slate-600 text-lg">No Active Alerts</p>
                  <p className="text-sm text-slate-500 mt-1">Run the Live Scrub to generate real alerts based on your data.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {alerts.map(alert => (
                    <div key={alert.id} className="flex flex-col sm:flex-row items-start gap-4 p-5 rounded-[1.5rem] border bg-rose-50/50 border-rose-200">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <Badge tone="red">Scrubber Alert</Badge>
                          <span className="text-[10px] font-bold text-slate-500">{alert.time}</span>
                        </div>
                        <h4 className="font-black text-lg text-rose-900">{alert.title}</h4>
                        <p className="text-sm mt-1 text-rose-700">{alert.desc}</p>
                      </div>
                      <button onClick={() => setAlerts(alerts.filter(a => a.id !== alert.id))} className="w-full sm:w-auto bg-white border border-rose-200 text-rose-700 px-4 py-2 rounded-xl text-xs font-black hover:bg-rose-50 shadow-sm transition mt-2 sm:mt-0">
                        Dismiss
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* TAB 2: CLAIM SCRUBBER */}
        {activeTab === 'billing' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
             <Card>
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                 <div>
                   <h3 className="text-xl font-black text-[#12214A]">Pre-Billing Scrubber</h3>
                   <p className="text-sm text-slate-500 mt-1">Add raw claims below. Click &ldquo;Run Deep Scrub&rdquo; at the top to process them.</p>
                 </div>
                 <button onClick={() => setShowClaimModal(true)} className="bg-[#D7A83F] text-white px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-sm hover:bg-amber-500"><Icon name="plus"/> Add Claim</button>
               </div>

               {claims.length === 0 ? (
                 <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-medium">Zero claims in system. Click &ldquo;Add Claim&rdquo; to begin.</div>
               ) : (
                 <div className="overflow-x-auto custom-scrollbar pb-4">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead>
                       <tr className="border-b border-slate-200 text-slate-500">
                         <th className="py-3 font-black uppercase text-[10px] tracking-wider">Date / Client</th>
                         <th className="py-3 font-black uppercase text-[10px] tracking-wider">Codes Billed</th>
                         <th className="py-3 font-black uppercase text-[10px] tracking-wider">Scrubber Result</th>
                         <th className="py-3 font-black uppercase text-[10px] tracking-wider">Status</th>
                         <th className="py-3 font-black uppercase text-[10px] tracking-wider text-right">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {claims.map(claim => (
                         <tr key={claim.id} className={claim.status === 'Hold' ? 'bg-rose-50/30' : ''}>
                           <td className="py-4"><p className="font-bold text-[#12214A]">{claim.date}</p><p className="text-slate-500 text-xs">{claim.client}</p></td>
                           <td className="py-4">
                              {claim.codes.map(c => <Badge key={c} tone="slate" className="mr-1">{c}</Badge>)}
                              {claim.modifier && <Badge tone="gold">Mod applied</Badge>}
                           </td>
                           <td className="py-4">
                             {claim.status === 'Pending Scrub' && <span className="text-slate-400 font-bold text-xs"><Icon name="clock"/> Awaiting Scrub</span>}
                             {claim.status === 'Clean' && <span className="text-emerald-600 font-bold flex items-center gap-1 text-xs"><Icon name="checkCircle"/> Audit Passed</span>}
                             {claim.status === 'Hold' && <span className="text-rose-600 font-bold flex items-center gap-1 text-xs"><Icon name="alertTriangle"/> {claim.error}</span>}
                           </td>
                           <td className="py-4"><Badge tone={claim.status === 'Clean' ? 'green' : claim.status === 'Hold' ? 'red' : 'slate'}>{claim.status}</Badge></td>
                           <td className="py-4 text-right"><button onClick={() => deleteClaim(claim.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"><Icon name="trash"/></button></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               )}
             </Card>
          </div>
        )}

        {/* TAB 3: AUTHS */}
        {activeTab === 'auths' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <Card>
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className="text-xl font-black text-[#12214A]">Authorization Database</h3>
                   <p className="text-sm text-slate-500 mt-1">Required for the scrubber to verify claims.</p>
                 </div>
                 <button onClick={() => setShowAuthModal(true)} className="bg-[#D7A83F] text-white px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-sm hover:bg-amber-500"><Icon name="plus"/> Add Auth</button>
               </div>

               {auths.length === 0 ? (
                 <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-medium">Zero authorizations in system. Claims will fail scrub until auths are added.</div>
               ) : (
                 <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                   {auths.map(auth => {
                     const percent = (auth.used / auth.total) * 100;
                     return (
                       <div key={auth.id} className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 relative">
                         <button onClick={() => deleteAuth(auth.id)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 bg-white p-1.5 rounded-lg border shadow-sm transition-colors"><Icon name="trash"/></button>
                         <p className="font-black text-lg text-[#12214A]">{auth.client}</p>
                         <p className="text-xs font-bold text-slate-500 mb-4">{auth.payer} • Code: {auth.code}</p>
                         <div className="flex justify-between text-xs font-bold mb-1">
                           <span className="text-[#12214A]">{auth.used} used</span>
                           <span className="text-slate-500">{auth.total} total</span>
                         </div>
                         <div className="w-full bg-slate-200 rounded-full h-2 mb-3 overflow-hidden">
                           <div className={cn("h-2 rounded-full transition-all duration-1000", percent >= 100 ? "bg-rose-500" : percent > 75 ? "bg-amber-500" : "bg-emerald-500")} style={{width: `${Math.min(percent, 100)}%`}}></div>
                         </div>
                         <Badge tone={new Date(auth.expire) < new Date() ? 'red' : 'slate'}>Exp: {auth.expire}</Badge>
                       </div>
                     )
                   })}
                 </div>
               )}
            </Card>
          </div>
        )}

        {/* TAB 4: PROVIDERS */}
        {activeTab === 'bacb' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <Card>
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className="text-xl font-black text-[#12214A]">Providers & Supervision</h3>
                   <p className="text-sm text-slate-500 mt-1">Live tracking of {supervisionThreshold}% rule and BACB expirations.</p>
                 </div>
                 <button onClick={() => setShowProviderModal(true)} className="bg-[#D7A83F] text-white px-4 py-2 rounded-xl font-black text-sm flex items-center gap-2 shadow-sm hover:bg-amber-500"><Icon name="plus"/> Add Provider</button>
               </div>

               {providers.length === 0 ? (
                 <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-medium">Zero providers in system.</div>
               ) : (
                 <div className="overflow-x-auto custom-scrollbar pb-4">
                   <table className="w-full text-left text-sm whitespace-nowrap">
                     <thead>
                       <tr className="border-b border-slate-200 text-slate-500">
                         <th className="py-3 font-black uppercase text-[10px] tracking-wider">Provider</th>
                         <th className="py-3 font-black uppercase text-[10px] tracking-wider">BACB Expiration</th>
                         <th className="py-3 font-black uppercase text-[10px] tracking-wider">OIG Status</th>
                         <th className="py-3 font-black uppercase text-[10px] tracking-wider">{supervisionThreshold}% Rule Status</th>
                         <th className="py-3 font-black uppercase text-[10px] tracking-wider text-right">Action</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                       {providers.map(prov => {
                         const supPass = Number(prov.supPercent) >= supervisionThreshold;
                         const isExp = new Date(prov.bacbExp) < new Date();
                         return (
                           <tr key={prov.id} className={!supPass || isExp ? 'bg-rose-50/30' : ''}>
                             <td className="py-4">
                               <p className="font-bold text-[#12214A]">{prov.name}</p>
                               <p className="text-[10px] font-bold uppercase text-slate-500">{prov.role}</p>
                             </td>
                             <td className="py-4"><Badge tone={isExp ? 'red' : 'green'}>{prov.bacbExp}</Badge></td>
                             <td className="py-4"><Badge tone={prov.oigCleared ? 'green' : 'red'}>{prov.oigCleared ? 'Cleared' : 'Flagged'}</Badge></td>
                             <td className="py-4">
                               {prov.role === 'RBT' ? (
                                 <div className="flex items-center gap-3">
                                   <div className="w-24 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                                     <div className={cn("h-1.5 rounded-full transition-all duration-1000", supPass ? 'bg-emerald-500' : 'bg-rose-500')} style={{width: `${Math.min((prov.supPercent/supervisionThreshold)*100, 100)}%`}}></div>
                                   </div>
                                   <span className={cn("text-xs font-black", supPass ? 'text-emerald-600' : 'text-rose-600')}>{prov.supPercent}%</span>
                                 </div>
                               ) : <span className="text-xs text-slate-400">—</span>}
                             </td>
                             <td className="py-4 text-right"><button onClick={() => deleteProvider(prov.id)} className="text-rose-500 hover:text-rose-700 p-2 rounded-lg hover:bg-rose-50 transition-colors"><Icon name="trash"/></button></td>
                           </tr>
                         )
                       })}
                     </tbody>
                   </table>
                 </div>
               )}
            </Card>
          </div>
        )}

        {/* TAB 5: HIPAA LOGS */}
        {activeTab === 'hipaa' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-6">
            <Card>
              <div className="flex justify-between items-center mb-6">
                 <div>
                   <h3 className="text-xl font-black text-[#12214A]">Immutable Access & Security Logs</h3>
                   <p className="text-sm text-slate-500 mt-1">Live tracking of every action taken within this prototype.</p>
                 </div>
               </div>

               {auditLogs.length === 0 ? (
                 <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 font-medium">Log is empty. Actions taken in the app will appear here automatically.</div>
               ) : (
                 <div className="space-y-3">
                   {auditLogs.map(log => (
                     <div key={log.id} className="flex flex-col md:flex-row justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl text-sm">
                       <div className="flex gap-4 items-start">
                         <div className="text-slate-400 mt-1"><Icon name="userShield"/></div>
                         <div>
                           <p className="font-bold text-[#12214A]">{log.user} <span className="font-normal text-slate-500">performed:</span> {log.action}</p>
                           <p className="text-xs text-slate-500 mt-1">Target: <span className="font-bold text-[#12214A]">{log.target}</span></p>
                         </div>
                       </div>
                       <div className="mt-3 md:mt-0 md:text-right flex flex-row md:flex-col justify-between items-end">
                         <Badge tone={log.risk === 'High' ? 'red' : log.risk === 'Medium' ? 'gold' : 'slate'}>{log.risk} Risk</Badge>
                         <p className="text-[10px] text-slate-400 mt-2 font-mono">{log.timestamp}</p>
                       </div>
                     </div>
                   ))}
                 </div>
               )}
            </Card>
          </div>
        )}

      </div>

      {/* MODALS */}
      {showClaimModal && (
        <Modal title="Add Raw Claim" onClose={() => setShowClaimModal(false)}>
          <form onSubmit={handleAddClaim} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-slate-500">Client Name</label><input required type="text" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={claimForm.client} onChange={e=>setClaimForm({...claimForm, client: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500">Date of Service</label><input required type="date" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={claimForm.date} onChange={e=>setClaimForm({...claimForm, date: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-slate-500">Primary Code</label>
                <select className="w-full border border-slate-200 rounded-xl p-3 mt-1 bg-white" value={claimForm.code1} onChange={e=>setClaimForm({...claimForm, code1: e.target.value})}>
                  {(config?.cptCodes || ['97153 (Direct Tech)', '97155 (Protocol Mod)', '97151 (Assessment)']).map(code => {
                    const val = code.split(' ')[0];
                    return <option key={val} value={val}>{code}</option>;
                  })}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500">Concurrent Code (Optional)</label>
                <select className="w-full border border-slate-200 rounded-xl p-3 mt-1 bg-white" value={claimForm.code2} onChange={e=>setClaimForm({...claimForm, code2: e.target.value})}>
                  <option value="">None</option>
                  {(config?.cptCodes || ['97153 (Direct Tech)', '97155 (Protocol Mod)']).map(code => {
                    const val = code.split(' ')[0];
                    return <option key={val} value={val}>{code}</option>;
                  })}
                </select>
              </div>
            </div>
            <div className="space-y-2 mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 text-sm font-bold text-[#12214A] cursor-pointer"><input type="checkbox" checked={claimForm.modifier} onChange={e=>setClaimForm({...claimForm, modifier: e.target.checked})} className="w-4 h-4 accent-[#12214A]" /> Has Modifier (e.g. XP) attached?</label>
              <label className="flex items-center gap-2 text-sm font-bold text-[#12214A] cursor-pointer"><input type="checkbox" checked={claimForm.sig} onChange={e=>setClaimForm({...claimForm, sig: e.target.checked})} className="w-4 h-4 accent-[#12214A]" /> Signatures Complete?</label>
              <label className="flex items-center gap-2 text-sm font-bold text-[#12214A] cursor-pointer"><input type="checkbox" checked={claimForm.gps} onChange={e=>setClaimForm({...claimForm, gps: e.target.checked})} className="w-4 h-4 accent-[#12214A]" /> GPS Clock-in Matches?</label>
            </div>
            <button type="submit" className="w-full bg-[#12214A] text-white py-3 rounded-xl font-black mt-4 transition-colors hover:bg-blue-900 active:scale-95 shadow-md">Save Claim to Queue</button>
          </form>
        </Modal>
      )}

      {showAuthModal && (
        <Modal title="Add Authorization" onClose={() => setShowAuthModal(false)}>
          <form onSubmit={handleAddAuth} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-slate-500">Client Name</label><input required type="text" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={authForm.client} onChange={e=>setAuthForm({...authForm, client: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500">Payer (e.g., BCBS)</label><input required type="text" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={authForm.payer} onChange={e=>setAuthForm({...authForm, payer: e.target.value})} /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-xs font-bold text-slate-500">CPT Code</label><input required type="text" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={authForm.code} onChange={e=>setAuthForm({...authForm, code: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500">Total Units</label><input required type="number" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={authForm.total} onChange={e=>setAuthForm({...authForm, total: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500">Used Units</label><input required type="number" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={authForm.used} onChange={e=>setAuthForm({...authForm, used: e.target.value})} /></div>
            </div>
            <div><label className="text-xs font-bold text-slate-500">Expiration Date</label><input required type="date" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={authForm.expire} onChange={e=>setAuthForm({...authForm, expire: e.target.value})} /></div>
            <button type="submit" className="w-full bg-[#12214A] text-white py-3 rounded-xl font-black mt-4 transition-colors hover:bg-blue-900 active:scale-95 shadow-md">Save Authorization</button>
          </form>
        </Modal>
      )}

      {showProviderModal && (
        <Modal title="Add Provider Profile" onClose={() => setShowProviderModal(false)}>
          <form onSubmit={handleAddProvider} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-slate-500">Provider Name</label><input required type="text" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={provForm.name} onChange={e=>setProvForm({...provForm, name: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500">Role</label>
                <select className="w-full border border-slate-200 rounded-xl p-3 mt-1 bg-white" value={provForm.role} onChange={e=>setProvForm({...provForm, role: e.target.value})}>
                  {(config?.providerRoles || ['RBT', 'BCBA']).map(role => (
                    <option key={role}>{role}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs font-bold text-slate-500">BACB Expiration Date</label><input required type="date" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={provForm.bacbExp} onChange={e=>setProvForm({...provForm, bacbExp: e.target.value})} /></div>
              <div><label className="text-xs font-bold text-slate-500">Current Sup % (RBT only)</label><input type="number" step="0.1" className="w-full border border-slate-200 rounded-xl p-3 mt-1" value={provForm.supPercent} onChange={e=>setProvForm({...provForm, supPercent: e.target.value})} disabled={provForm.role !== 'RBT'} /></div>
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2 text-sm font-bold text-[#12214A] cursor-pointer"><input type="checkbox" checked={provForm.oigCleared} onChange={e=>setProvForm({...provForm, oigCleared: e.target.checked})} className="w-4 h-4 accent-[#12214A]" /> Cleared OIG/Medicaid Exclusion List</label>
            </div>
            <button type="submit" className="w-full bg-[#12214A] text-white py-3 rounded-xl font-black mt-4 transition-colors hover:bg-blue-900 active:scale-95 shadow-md">Save Provider</button>
          </form>
        </Modal>
      )}

      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-md w-full border-t-8 border-rose-600 animate-in zoom-in-95">
              <h3 className="text-2xl font-black text-slate-900 mb-2 flex items-center gap-2">
                <AlertTriangle className="text-rose-600" />
                Factory Reset
              </h3>
              <p className="text-slate-600 mb-6 font-medium leading-relaxed">
                Are you sure you want to completely erase all live claims, authorizations, providers, and audit logs?
                <br/><br/>
                This will instantly clear all data. <strong>This cannot be undone.</strong>
              </p>
              <div className="flex gap-4 justify-end">
                 <button onClick={() => setShowResetModal(false)} className="px-5 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors">Cancel</button>
                 <button onClick={wipeData} className="px-5 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition-colors">Yes, Erase Everything</button>
              </div>
           </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#12214A] text-white px-6 py-3 rounded-full font-black shadow-2xl z-[100] animate-in slide-in-from-bottom-5 text-sm flex items-center gap-2 border border-slate-700">
          <Icon name="checkCircle" className="text-emerald-400" /> {toast}
        </div>
      )}

    </div>
  );
}
