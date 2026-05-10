import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { fetchComplianceConfig } from '@/api/apps';
import { cn, uid, nowStamp } from './utils';
import Icon from './components/Icon';
import Modal from './components/Modal';
import Overview from './views/Overview';
import ClaimScrubber from './views/ClaimScrubber';
import AuthTracker from './views/AuthTracker';
import Providers from './views/Providers';
import HipaaLogs from './views/HipaaLogs';

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
      <div className="flex flex-col items-center justify-center h-screen bg-surface text-brand-navy">
        <Loader2 className="animate-spin mb-4" size={48} />
        <h2 className="text-xl font-bold">Initializing Sentinel Engine...</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface text-slate-900 font-sans p-4 md:p-8 relative">
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
            <h1 className="text-3xl md:text-5xl font-black text-brand-navy tracking-tight">Compliance & Audit OS</h1>
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
              className="bg-brand-navy text-white px-5 py-3 rounded-2xl font-black text-sm flex items-center gap-2 shadow-md hover:bg-blue-900 transition"
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
                activeTab === tab.id ? "bg-white text-brand-navy border-t border-l border-r border-slate-200 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] relative top-[1px]" : "bg-transparent text-slate-500 hover:text-brand-navy hover:bg-white/50"
              )}
            >
              <Icon name={tab.icon} className={activeTab === tab.id ? 'text-accent-gold-muted' : ''} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 pb-20">

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <Overview
            claimsOnHold={claimsOnHold}
            claimsClean={claimsClean}
            providersAtRisk={providersAtRisk}
            supervisionThreshold={supervisionThreshold}
            auditLogs={auditLogs}
            alerts={alerts}
            setAlerts={setAlerts}
          />
        )}

        {/* TAB 2: CLAIM SCRUBBER */}
        {activeTab === 'billing' && (
          <ClaimScrubber
            claims={claims}
            deleteClaim={deleteClaim}
            onAddClaim={() => setShowClaimModal(true)}
          />
        )}

        {/* TAB 3: AUTHS */}
        {activeTab === 'auths' && (
          <AuthTracker
            auths={auths}
            deleteAuth={deleteAuth}
            onAddAuth={() => setShowAuthModal(true)}
          />
        )}

        {/* TAB 4: PROVIDERS */}
        {activeTab === 'bacb' && (
          <Providers
            providers={providers}
            deleteProvider={deleteProvider}
            onAddProvider={() => setShowProviderModal(true)}
            supervisionThreshold={supervisionThreshold}
          />
        )}

        {/* TAB 5: HIPAA LOGS */}
        {activeTab === 'hipaa' && (
          <HipaaLogs auditLogs={auditLogs} />
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
              <label className="flex items-center gap-2 text-sm font-bold text-brand-navy cursor-pointer"><input type="checkbox" checked={claimForm.modifier} onChange={e=>setClaimForm({...claimForm, modifier: e.target.checked})} className="w-4 h-4 accent-brand-navy" /> Has Modifier (e.g. XP) attached?</label>
              <label className="flex items-center gap-2 text-sm font-bold text-brand-navy cursor-pointer"><input type="checkbox" checked={claimForm.sig} onChange={e=>setClaimForm({...claimForm, sig: e.target.checked})} className="w-4 h-4 accent-brand-navy" /> Signatures Complete?</label>
              <label className="flex items-center gap-2 text-sm font-bold text-brand-navy cursor-pointer"><input type="checkbox" checked={claimForm.gps} onChange={e=>setClaimForm({...claimForm, gps: e.target.checked})} className="w-4 h-4 accent-brand-navy" /> GPS Clock-in Matches?</label>
            </div>
            <button type="submit" className="w-full bg-brand-navy text-white py-3 rounded-xl font-black mt-4 transition-colors hover:bg-blue-900 active:scale-95 shadow-md">Save Claim to Queue</button>
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
            <button type="submit" className="w-full bg-brand-navy text-white py-3 rounded-xl font-black mt-4 transition-colors hover:bg-blue-900 active:scale-95 shadow-md">Save Authorization</button>
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
              <label className="flex items-center gap-2 text-sm font-bold text-brand-navy cursor-pointer"><input type="checkbox" checked={provForm.oigCleared} onChange={e=>setProvForm({...provForm, oigCleared: e.target.checked})} className="w-4 h-4 accent-brand-navy" /> Cleared OIG/Medicaid Exclusion List</label>
            </div>
            <button type="submit" className="w-full bg-brand-navy text-white py-3 rounded-xl font-black mt-4 transition-colors hover:bg-blue-900 active:scale-95 shadow-md">Save Provider</button>
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-brand-navy text-white px-6 py-3 rounded-full font-black shadow-2xl z-[100] animate-in slide-in-from-bottom-5 text-sm flex items-center gap-2 border border-slate-700">
          <Icon name="checkCircle" className="text-emerald-400" /> {toast}
        </div>
      )}

    </div>
  );
}
