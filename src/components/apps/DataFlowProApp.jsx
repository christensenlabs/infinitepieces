import { useState, useEffect } from 'react';
import {
  Users, Activity, BookOpen, PlayCircle, Settings,
  CheckCircle2, Clock,
  AlertCircle, ChevronDown, ChevronUp,
  ShieldAlert, Sparkles, Loader2,
  RotateCcw, ChevronLeft, Menu, Save,
  Cpu,
  Calendar, ShieldCheck, Layout,
  Target, FileSignature, FileCheck, UserCheck, Power, Key,
  LayoutGrid
} from 'lucide-react';
import { callGemini } from '../../lib/gemini';
import { useApiData } from '../../hooks/useApiData';
import { fetchDataFlowClients, fetchDataFlowPrograms, fetchDataFlowConfig } from '../../api/apps';

// --- GLOBAL UTILITIES ---

// ==========================================
// MAIN APPLICATION
// ==========================================
export default function DataFlowProApp({ apiKey }) {
  const { data: seedClients, loading: clientsLoading } = useApiData(fetchDataFlowClients);
  const { data: seedPrograms, loading: programsLoading } = useApiData(fetchDataFlowPrograms);
  const { data: seedConfig, loading: configLoading } = useApiData(fetchDataFlowConfig);

  const [isLoaded, setIsLoaded] = useState(false);
  const [role, setRole] = useState('login');
  const [activeTab, setActiveTab] = useState('hub');
  const [toasts, setToasts] = useState([]);

  // App State
  const [clients, setClients] = useState([]);
  const [behaviors, setBehaviors] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [sessionNotes, setSessionNotes] = useState([]);
  const [activeClient, setActiveClient] = useState(null);
  const [sessionData, setSessionData] = useState({});
  const [behaviorData, setBehaviorData] = useState({});
  const [durationData, setDurationData] = useState({});
  const [systemSettings, setSystemSettings] = useState({ bcbaPin: '222222', rbtPin: '333333' });

  const [focusMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);

  // Initialize from mock API data once loaded
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (clientsLoading || programsLoading || configLoading) return;
    if (isLoaded) return;

    const initClients = seedClients || [];
    const initPrograms = seedPrograms || [];
    const initConfig = seedConfig || {};

    setClients(initClients);
    setPrograms(initPrograms);
    if (initConfig.systemSettings) {
      setSystemSettings(initConfig.systemSettings);
    }
    if (initClients.length > 0) {
      setActiveClient(initClients[0]);
    }
    setIsLoaded(true);
  }, [clientsLoading, programsLoading, configLoading, seedClients, seedPrograms, seedConfig, isLoaded]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleFactoryReset = () => {
    const defaultClients = seedClients || [];
    const defaultPrograms = seedPrograms || [];
    const defaultSettings = seedConfig?.systemSettings || { bcbaPin: '222222', rbtPin: '333333' };

    setClients(defaultClients); setBehaviors([]); setPrograms(defaultPrograms); setSessionNotes([]);
    setSessionData({}); setBehaviorData({}); setDurationData({}); setSystemSettings(defaultSettings);
    setActiveClient(defaultClients[0] || null); setShowResetModal(false); setActiveTab('clients');
    showToast("System reset to factory defaults.");
  };

  const markAsViewed = (id) => {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, isNew: false } : p));
  };

  if (!isLoaded) return <div className="h-screen bg-[#0A192F] flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={48} /></div>;

  if (role === 'login') return <LoginScreen setRole={setRole} setActiveTab={setActiveTab} systemSettings={systemSettings} />;

  const isBCBA = role === 'BCBA';

  const clientPrograms = activeClient ? programs.filter(p => p.clientId === activeClient.id) : [];
  const clientBehaviors = activeClient ? behaviors.filter(b => b.clientId === activeClient.id) : [];

  return (
    <div className="flex h-screen bg-[#0A192F] font-sans text-slate-300 overflow-hidden relative selection:bg-cyan-500/30">
      <style>{`
        .animate-in { animation-duration: 300ms; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn95; }
        .slide-in-from-top-2 { animation-name: slideInTop2; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInTop2 { from { opacity: 0; transform: translateY(-0.5rem); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* Global Toasts */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="animate-in fade-in flex items-center gap-2 bg-slate-800 text-white px-4 py-3 rounded-xl shadow-2xl pointer-events-auto border border-slate-600">
            {t.type === 'error' ? <AlertCircle size={16} className="text-rose-500" /> : <CheckCircle2 size={16} className="text-emerald-500" />}
            <span className="text-sm font-bold">{t.message}</span>
          </div>
        ))}
      </div>

      {/* SIDEBAR NAVIGATION */}
      {isSidebarOpen && !focusMode && (
        <aside className="w-64 bg-[#061224] flex flex-col z-50 shrink-0 border-r border-[#233554] shadow-2xl">
          <div className="p-6 border-b border-[#233554] flex flex-col items-center relative">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-4 border-2 border-slate-200">
               <svg viewBox="0 0 100 100" className="w-10 h-10"><rect x="20" y="60" width="12" height="20" rx="2" fill="#93c5fd"/><rect x="45" y="40" width="12" height="40" rx="2" fill="#60a5fa"/><rect x="70" y="20" width="12" height="60" rx="2" fill="#3b82f6" /><path d="M 15 70 L 45 45 L 60 55 L 85 20" fill="none" stroke="#22c55e" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <h1 className="text-xl font-black text-white tracking-tight leading-none">Data Flow <span className="text-cyan-400">Pro</span></h1>
            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><ChevronLeft size={18}/></button>
          </div>

          <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar">
            <NavItem icon={<Layout size={18}/>} label="Dashboard" active={activeTab === 'hub'} onClick={() => setActiveTab('hub')} />
            <NavItem icon={<Users size={18}/>} label={isBCBA ? "Clinic Roster" : "My Caseload"} active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />

            {isBCBA && (
              <>
                <div className="pt-4 pb-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Design</p></div>
                <NavItem icon={<AlertCircle size={18}/>} label="Behavior Plans" active={activeTab === 'behaviors'} onClick={() => setActiveTab('behaviors')} />
                <NavItem icon={<BookOpen size={18}/>} label="Program Library" active={activeTab === 'library'} onClick={() => setActiveTab('library')} />
              </>
            )}

            <div className="pt-4 pb-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Active Session</p></div>
            <NavItem icon={<PlayCircle size={18}/>} label="Data Collection" active={activeTab === 'session'} onClick={() => setActiveTab('session')} />
            <NavItem icon={<LayoutGrid size={18}/>} label="Virtual DTT" active={activeTab === 'virtual_dtt'} onClick={() => setActiveTab('virtual_dtt')} />
            <NavItem icon={<FileSignature size={18}/>} label="Session Notes" active={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />

            {isBCBA && (
              <>
                <div className="pt-4 pb-1"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-4 mb-2">Audits</p></div>
                <NavItem icon={<FileCheck size={18}/>} label="Approvals" active={activeTab === 'insurance'} onClick={() => setActiveTab('insurance')} />
                <NavItem icon={<Settings size={18}/>} label="PIN Security" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
              </>
            )}
          </nav>

          <div className="p-4 bg-slate-950/50 border-t border-[#233554] space-y-3">
             <button onClick={() => setShowResetModal(true)} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors"><RotateCcw size={14}/> Factory Reset</button>
             <button onClick={() => { setRole('login'); setActiveClient(null); }} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors"><Power size={14}/> Sign Out</button>
          </div>
        </aside>
      )}

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-[#061224]/80 backdrop-blur-md border-b border-[#233554] px-8 flex items-center justify-between shrink-0 z-40">
           <div className="flex items-center gap-4">
              {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-[#112240] rounded-lg text-cyan-400 border border-[#233554]"><Menu size={20}/></button>}
              <h2 className="font-bold text-white uppercase tracking-[0.2em] text-xs">{activeTab.replace('_', ' ')}</h2>
           </div>
           <div className="flex items-center gap-4">
              {activeClient && (
                 <div className="flex items-center gap-3 pl-4 border-l border-[#233554]">
                    <div className="text-right">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active File</p>
                       <p className="text-xs text-cyan-400 font-bold">{activeClient.name}</p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold border border-cyan-500/50">
                       {String(activeClient.name).charAt(0).toUpperCase()}
                    </div>
                 </div>
              )}
           </div>
        </header>

        <div className="flex-1 overflow-y-auto relative custom-scrollbar p-6 lg:p-10">
          {!activeClient && activeTab !== 'clients' && activeTab !== 'settings' && activeTab !== 'hub' ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 animate-in fade-in">
                <UserCheck size={64} className="opacity-20" />
                <p className="font-bold tracking-widest uppercase text-sm">Select a Client File to begin</p>
                <button onClick={() => setActiveTab('clients')} className="bg-cyan-500 text-[#061224] px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg">Open Roster</button>
             </div>
          ) : (
            <>
              {activeTab === 'hub' && <DashboardView clients={clients} activeClient={activeClient} setActiveClient={setActiveClient} setActiveTab={setActiveTab} />}
              {activeTab === 'clients' && <ClientsView clients={clients} setClients={setClients} activeClient={activeClient} setActiveClient={setActiveClient} isBCBA={isBCBA} showToast={showToast} />}
              {activeTab === 'behaviors' && <BehaviorsView behaviors={clientBehaviors} setBehaviors={setBehaviors} allBehaviors={behaviors} activeClient={activeClient} isBCBA={isBCBA} showToast={showToast} apiKey={apiKey} />}
              {activeTab === 'library' && <LibraryView programs={clientPrograms} setPrograms={setPrograms} allPrograms={programs} activeClient={activeClient} isBCBA={isBCBA} showToast={showToast} />}
              {activeTab === 'session' && <SessionView programs={clientPrograms} behaviors={clientBehaviors} activeClient={activeClient} sessionData={sessionData} setSessionData={setSessionData} behaviorData={behaviorData} setBehaviorData={setBehaviorData} durationData={durationData} setDurationData={setDurationData} markAsViewed={markAsViewed} />}
              {activeTab === 'virtual_dtt' && <VirtualDttView />}
              {activeTab === 'notes' && <SessionNotesView activeClient={activeClient} sessionData={sessionData} programs={clientPrograms} sessionNotes={sessionNotes} setSessionNotes={setSessionNotes} showToast={showToast} apiKey={apiKey} />}
              {activeTab === 'insurance' && isBCBA && <InsuranceHubView />}
              {activeTab === 'settings' && isBCBA && <SettingsView systemSettings={systemSettings} setSystemSettings={setSystemSettings} showToast={showToast} />}
            </>
          )}
        </div>
      </main>

      {/* Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-slate-900/80 z-[110] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
           <div className="bg-[#112240] p-8 rounded-[2rem] shadow-2xl max-w-md w-full border-t-8 border-rose-600 animate-in zoom-in-95">
              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2"><ShieldAlert className="text-rose-600" /> Factory Reset</h3>
              <p className="text-slate-400 mb-6 font-medium leading-relaxed">This will erase all clients and records to restore the blank slate. <strong>This cannot be undone.</strong></p>
              <div className="flex gap-4 justify-end">
                 <button onClick={() => setShowResetModal(false)} className="px-5 py-2.5 font-bold text-slate-300 bg-[#0A192F] rounded-xl transition-colors hover:bg-[#233554]">Cancel</button>
                 <button onClick={handleFactoryReset} className="px-5 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors">Confirm Reset</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS & VIEWS
// ==========================================

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-bold transition-all rounded-xl ${active ? 'bg-[#112240] text-cyan-400 border-r-4 border-cyan-500 shadow-inner' : 'hover:bg-white/5 hover:text-white text-slate-500'}`}>
      {icon} {label}
    </button>
  );
}

function Card({ icon, label, value, color }) {
  return (
    <div className="bg-[#112240]/50 border border-[#233554] p-6 rounded-[2rem] shadow-sm flex flex-col justify-between hover:border-cyan-400/30 transition-colors">
      <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 ${color}`}>{icon}</div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
        <p className="text-3xl font-black text-white">{value}</p>
      </div>
    </div>
  );
}

function LoginScreen({ setRole, setActiveTab, systemSettings }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      if (pin === (systemSettings?.bcbaPin || '222222')) { setRole('BCBA'); setActiveTab('hub'); }
      else if (pin === (systemSettings?.rbtPin || '333333')) { setRole('RBT'); setActiveTab('hub'); }
      else if (pin === '111111') { setRole('Caregiver'); setActiveTab('hub'); }
      else {
        setError(true);
        setTimeout(() => setError(false), 1000);
        setPin("");
      }
      setIsAuthenticating(false);
    }, 600);
  };

  return (
    <div className="h-screen bg-[#0A192F] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className={`bg-[#112240]/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-[#233554] w-full max-w-sm shadow-2xl relative z-10 transition-transform ${error ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : ''}`}>
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl mx-auto flex items-center justify-center text-[#020617] mb-8 shadow-[0_0_30px_rgba(0,229,255,0.4)]">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-3xl font-black text-white text-center tracking-tight mb-2">Data Flow <span className="text-cyan-400">Pro</span></h1>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 text-center mb-8">Secure Access Required</p>
        <form onSubmit={handleLogin}>
          <input
            type="password" autoFocus required maxLength={6} placeholder="Enter PIN"
            value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-[#0A192F] border border-[#233554] rounded-2xl px-6 py-4 text-center text-2xl tracking-[0.5em] font-black text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner mb-6"
          />
          <button type="submit" disabled={isAuthenticating} className="w-full bg-cyan-500 text-[#020617] py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)] disabled:opacity-50 flex justify-center items-center h-14">
            {isAuthenticating ? <Loader2 className="animate-spin" size={24} /> : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}

function DashboardView({ clients, activeClient, setActiveClient, setActiveTab }) {
  const [goalsMastered] = useState(() => Math.floor(Math.random() * 20) + 5);
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <Card icon={<Activity/>} label="Active Trials" value={clients.length * 2} color="text-emerald-400" />
         <Card icon={<ShieldCheck/>} label="Note Compliance" value="100%" color="text-cyan-400" />
         <Card icon={<Users/>} label="Total Caseload" value={clients.length} color="text-blue-400" />
         <Card icon={<Target/>} label="Goals Mastered" value={goalsMastered} color="text-fuchsia-400" />
      </div>

      <section>
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-2"><Calendar size={16}/> Assigned Clients</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
           {clients.length === 0 ? (
             <div className="w-full text-center py-12 border border-[#233554] rounded-[2rem] border-dashed text-slate-500">No active clients in database.</div>
           ) : clients.map(c => (
             <button key={c.id} onClick={() => setActiveClient(c)} className={`min-w-[280px] p-6 rounded-[2.5rem] border-2 transition-all text-left ${activeClient?.id === c.id ? 'bg-[#112240] border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'bg-[#0A192F] border-[#233554] hover:border-cyan-400/50'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 font-black text-xl border border-cyan-500/30">{String(c.name).charAt(0)}</div>
                  <Cpu size={16} className="text-slate-600" />
                </div>
                <h4 className="text-2xl font-black text-white truncate mb-1">{c.name}</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold line-clamp-1">{c.profile}</p>
             </button>
           ))}
        </div>
      </section>

      <div className="bg-[#112240]/80 p-8 rounded-[3rem] border border-[#233554] shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-3"><Sparkles className="text-cyan-400"/> AI Session Insights</h2>
          <p className="text-sm text-slate-400 mt-2">Generate automatic SOAP notes from collected data.</p>
        </div>
        <button onClick={() => setActiveTab('notes')} className="bg-cyan-500 text-[#0A192F] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-cyan-500/20">Draft Note</button>
      </div>
    </div>
  );
}

function ClientsView({ clients, setClients, activeClient, setActiveClient, isBCBA, showToast }) {
  const [newClient, setNewClient] = useState({ name: '', age: '', profile: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;
    const client = { id: Date.now(), name: newClient.name.trim(), age: Number(newClient.age) || "", profile: newClient.profile.trim() };
    setClients(prev => [...prev, client]);
    if (!activeClient) setActiveClient(client);
    setNewClient({ name: '', age: '', profile: '' });
    showToast("Client profile initialized.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-[#233554] pb-4">
        <Users size={28} className="text-cyan-400" />
        <h2 className="text-3xl font-black text-white tracking-tight">Client Roster</h2>
      </div>

      {isBCBA && (
        <div className="bg-[#112240]/80 p-8 rounded-[2rem] border border-[#233554] shadow-lg">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-6">Initialize New Profile</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input className="bg-[#0A192F] border border-[#233554] text-white p-4 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm font-medium" placeholder="Subject Name" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})}/>
            <input className="bg-[#0A192F] border border-[#233554] text-white p-4 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm font-medium" type="number" placeholder="Age" value={newClient.age} onChange={e => setNewClient({...newClient, age: e.target.value})}/>
            <input className="bg-[#0A192F] border border-[#233554] text-white p-4 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm font-medium md:col-span-2" placeholder="Clinical Brief" value={newClient.profile} onChange={e => setNewClient({...newClient, profile: e.target.value})}/>
            <button type="submit" className="md:col-start-4 bg-cyan-500 text-[#0A192F] p-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]">Add Subject</button>
          </form>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="text-center py-20 border border-[#233554] rounded-[2.5rem] border-dashed text-slate-500 italic">No clients assigned yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {clients.map(c => (
            <div key={c.id} className={`p-8 rounded-[2rem] border-2 text-left flex flex-col transition-all ${activeClient?.id === c.id ? 'bg-[#112240] border-cyan-400 shadow-[0_0_30px_rgba(0,229,255,0.1)]' : 'bg-[#112240]/50 border-[#233554] hover:border-cyan-400/50'}`}>
              <div className="flex justify-between items-start w-full mb-4">
                <div>
                  <h4 className="font-black text-2xl text-white tracking-tight">{String(c.name)} <span className="text-xs text-cyan-400 font-mono ml-2 font-bold bg-[#0A192F] px-2 py-1 rounded border border-[#233554]">AGE {c.age}</span></h4>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed font-medium">{String(c.profile)}</p>
                </div>
              </div>
              <button onClick={() => setActiveClient(c)} disabled={activeClient?.id === c.id} className={`mt-auto text-xs font-bold px-4 py-3 rounded-xl transition-all ${activeClient?.id === c.id ? "bg-cyan-500 text-[#0A192F] shadow-[0_0_15px_rgba(0,229,255,0.4)]" : "bg-[#0A192F] text-slate-400 border border-[#233554] hover:text-white hover:bg-slate-800"}`}>
                {activeClient?.id === c.id ? "Active View" : "Set Active"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BehaviorsView({ behaviors, setBehaviors, activeClient, isBCBA, showToast, apiKey }) {
  const [newBx, setNewBx] = useState({ name: '', opDef: '', type: 'frequency' });
  const [isDrafting, setIsDrafting] = useState(false);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newBx.name.trim()) return;
    setBehaviors(prev => [...prev, { id: Date.now(), clientId: activeClient?.id, ...newBx }]);
    setNewBx({ name: '', opDef: '', type: 'frequency' });
    showToast("Behavior tracking protocol added.");
  };

  const draftDefinition = async (e) => {
    e.preventDefault();
    if (!newBx.name.trim()) return showToast("Enter a behavior name first.", "error");
    setIsDrafting(true);
    try {
      const prompt = `Write a clinical, one-sentence operational definition for the behavior: "${newBx.name}". Keep it objective and measurable. Exclude subjective terms. Do not include introductory text, just the definition.`;
      const result = await callGemini(prompt, apiKey, "You are a BCBA clinical assistant.");
      setNewBx({ ...newBx, opDef: (result || '').replace(/^"|"$/g, '').trim() });
    } catch (err) {
      showToast("AI draft failed: " + err.message, "error");
    }
    setIsDrafting(false);
  };

  if (!activeClient) return <div className="p-8 text-slate-500 text-center">Select a client first.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-[#233554] pb-4">
        <ShieldAlert size={28} className="text-rose-500" />
        <h2 className="text-3xl font-black text-white tracking-tight">Target Behaviors</h2>
      </div>
      {isBCBA && (
        <div className="bg-[#112240]/80 p-8 rounded-[2rem] border border-[#233554] shadow-lg">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-6">Create Target Behavior</h3>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input className="flex-1 bg-[#0A192F] border border-[#233554] text-white p-4 rounded-xl outline-none focus:border-cyan-400 text-sm font-bold uppercase" placeholder="Behavior Identifier (e.g. Elopement)" value={newBx.name} onChange={e => setNewBx({...newBx, name: e.target.value})}/>
              <select className="bg-[#0A192F] border border-[#233554] text-cyan-400 p-4 rounded-xl font-black text-sm outline-none focus:border-cyan-400" value={newBx.type} onChange={e => setNewBx({...newBx, type: e.target.value})}><option value="frequency">Count</option><option value="duration">Timer</option></select>
            </div>
            <div className="relative">
              <textarea className="w-full bg-[#0A192F] border border-[#233554] text-white p-4 rounded-xl outline-none focus:border-cyan-400 text-sm h-28 custom-scrollbar pr-40" placeholder="Operationalized Topography" value={newBx.opDef} onChange={e => setNewBx({...newBx, opDef: e.target.value})}/>
              <button onClick={draftDefinition} disabled={isDrafting} className="absolute right-3 top-3 bg-[#112240] hover:bg-[#233554] text-cyan-400 text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-colors border border-[#233554] disabled:opacity-50 flex items-center gap-1">
                {isDrafting ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {isDrafting ? 'Drafting...' : 'Auto-Draft'}
              </button>
            </div>
            <button type="submit" className="bg-rose-600 text-white px-8 py-3.5 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-rose-500 transition-all shadow-[0_0_15px_rgba(225,29,72,0.4)]">Add Protocol</button>
          </form>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {behaviors.map(b => (
          <div key={b.id} className="p-6 bg-[#112240]/50 rounded-[2rem] border border-[#233554] shadow-sm relative group">
            <span className="absolute top-0 right-0 text-[10px] font-black uppercase tracking-widest bg-rose-500/10 text-rose-500 border-b border-l border-rose-500/20 px-3 py-1 rounded-bl-xl">{b.type}</span>
            <h4 className="font-black text-xl text-white mt-1 pr-12">{b.name}</h4>
            <p className="text-sm text-slate-400 mt-2 font-medium border-l-2 border-rose-500 pl-3">{b.opDef}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function LibraryView({ programs, activeClient }) {
  const [expandedId, setExpandedId] = useState(null);

  if (!activeClient) return <div className="p-8 text-slate-500 text-center">Select a client first.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-[#233554] pb-4">
        <BookOpen size={28} className="text-cyan-400" />
        <h2 className="text-3xl font-black text-white tracking-tight">Curriculum Core</h2>
      </div>

      <div className="space-y-4">
        {programs.map(p => {
          const isOpen = expandedId === p.id;
          return (
            <div key={p.id} className={`bg-[#112240]/80 rounded-[2rem] border transition-all ${isOpen ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.1)]' : 'border-[#233554]'}`}>
              <div onClick={() => setExpandedId(isOpen ? null : p.id)} className="p-6 cursor-pointer flex justify-between items-start hover:bg-[#0A192F]/50 rounded-[2rem]">
                <div>
                  <h3 className="font-black text-xl text-white">{p.target}</h3>
                  <p className="text-xs font-bold text-cyan-400 mt-1 uppercase tracking-widest">{p.method} • {p.domain}</p>
                </div>
                {isOpen ? <ChevronUp className="text-cyan-400"/> : <ChevronDown className="text-slate-500"/>}
              </div>
              {isOpen && (
                <div className="p-6 bg-[#0A192F] border-t border-[#233554] rounded-b-[2rem] animate-in slide-in-from-top-2 text-sm text-slate-300">
                  <p className="mb-4"><strong>Procedure:</strong> {p.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SessionView({ programs, activeClient, sessionData, setSessionData }) {
  const [selectedId, setSelectedId] = useState(programs[0]?.id || null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (programs.length > 0 && !programs.find((p) => p.id === selectedId)) {
      setSelectedId(programs[0]?.id);
    }
  }, [programs, selectedId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!activeClient) return <div className="flex h-full items-center justify-center text-slate-500">Select a client first.</div>;
  if (programs.length === 0) return <div className="flex h-full items-center justify-center text-slate-500">No active programs.</div>;

  const activeP = programs.find(p => p.id === selectedId) || programs[0];
  const currentData = sessionData[selectedId] || { trials: [], stats: {} };
  const totalT = currentData.trials.length;

  const recordTrial = (type) => {
    if (!selectedId) return;
    const cur = sessionData[selectedId] || { trials: [], stats: {} };
    setSessionData({ ...sessionData, [selectedId]: { trials: [...cur.trials, type], stats: { ...cur.stats, [type]: (cur.stats[type] || 0) + 1 } } });
  };

  const removeLastTrial = () => {
    if (!selectedId || currentData.trials.length === 0) return;
    const type = currentData.trials[currentData.trials.length - 1];
    const nextTrials = currentData.trials.slice(0, -1);
    setSessionData({ ...sessionData, [selectedId]: { trials: nextTrials, stats: { ...currentData.stats, [type]: currentData.stats[type] - 1 } } });
  };

  return (
    <div className="h-full flex flex-col bg-[#0A192F] rounded-[2.5rem] border border-[#233554] shadow-2xl overflow-hidden animate-in zoom-in-95">
       <header className="h-16 bg-[#061224]/90 flex items-center justify-between px-6 border-b border-[#233554] shrink-0">
          <span className="font-black text-white text-sm tracking-widest uppercase">{activeClient?.name} <span className="text-cyan-400">SESSION</span></span>
       </header>

       <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-72 bg-[#112240]/50 border-r border-[#233554] overflow-y-auto custom-scrollbar p-4 space-y-2">
            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] mb-4">Target Buffer</div>
            {programs.map((p) => {
              const isSelected = p.id === selectedId;
              const pData = sessionData[p.id];
              const count = pData ? pData.trials.length : 0;
              return (
                <button key={p.id} onClick={() => setSelectedId(p.id)} className={`w-full text-left p-4 rounded-2xl transition-all border ${isSelected ? "bg-cyan-500/10 border-cyan-500/50" : "hover:bg-[#233554]/30 border-transparent"}`}>
                  <span className={`font-bold text-sm block truncate ${isSelected ? "text-white" : "text-slate-400"}`}>{p.target}</span>
                  {count > 0 && <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest mt-1 block">{count} Logs</span>}
                </button>
              );
            })}
          </div>

          {/* Main Area */}
          <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#112240] to-[#0A192F]">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-[#112240]/80 rounded-[2rem] border border-[#233554] p-8 relative">
                <div className="absolute top-0 right-0 bg-cyan-500/10 text-cyan-400 font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl border-b border-l border-cyan-500/20">{activeP?.method}</div>
                <h2 className="text-3xl font-black text-white mb-4 italic pr-16">{activeP?.target}</h2>
                <div className="bg-[#0A192F] p-4 rounded-xl border border-[#233554] text-sm text-slate-300 font-medium">
                  {activeP?.description}
                </div>
              </div>

              <div className="bg-[#112240]/80 rounded-[2.5rem] border border-[#233554] p-8">
                <div className="flex justify-between items-end mb-6">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">Record Data</div>
                  {totalT > 0 && <button onClick={removeLastTrial} className="text-[10px] font-black text-slate-400 hover:text-rose-500 flex items-center gap-1"><RotateCcw size={12}/> Undo Last</button>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {['IND', 'V', 'M', 'ERR'].map((label) => (
                    <button key={label} onClick={() => recordTrial(label)} className={`h-24 rounded-[2rem] border-b-[6px] flex flex-col items-center justify-center transition-all active:translate-y-1 active:border-b-0 shadow-lg ${label === 'IND' ? 'bg-[#22c55e] border-green-700 text-white' : label === 'ERR' ? 'bg-rose-500 border-rose-700 text-white' : 'bg-blue-500 border-blue-700 text-white'}`}>
                      <span className="font-black text-3xl">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-[#0A192F] rounded-2xl border border-[#233554] p-6 min-h-[100px] flex flex-wrap gap-2 items-start">
                  {currentData.trials.length === 0 ? <span className="text-sm text-slate-600 italic">Awaiting data...</span> : currentData.trials.map((t, i) => (
                    <span key={i} className={`px-3 py-1 rounded-lg text-xs font-black ${t === 'IND' ? 'bg-green-500/20 text-green-400' : t === 'ERR' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'}`}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
       </div>
    </div>
  );
}

function VirtualDttView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in">
      <LayoutGrid size={64} className="mb-4 opacity-20 text-cyan-400" />
      <h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">Virtual DTT Board</h2>
      <p className="font-medium text-sm">Select a client and start a session to render the virtual stimuli array.</p>
    </div>
  );
}

function SessionNotesView({ activeClient, sessionData, programs, sessionNotes, setSessionNotes, showToast, apiKey }) {
  const [draft, setDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!activeClient) return <div className="p-8 text-slate-500 text-center">Select a client first.</div>;

  const handleGenerate = async () => {
     setIsGenerating(true);

     // Compile data context for the prompt
     const stats = programs.map(p => {
        const data = sessionData[p.id];
        if (!data || data.trials.length === 0) return `- ${p.target}: No data collected today.`;
        const ind = data.trials.filter(t => t === 'IND').length;
        const total = data.trials.length;
        const pct = Math.round((ind / total) * 100);
        return `- ${p.target}: ${total} trials logged (${pct}% Independent).`;
     }).join('\n');

     const prompt = `You are a BCBA. Write a professional, clinical ABA SOAP note for client ${activeClient.name} (Age ${activeClient.age}).

     Client Profile Context: ${activeClient.profile}

     Data Collected Today:
     ${stats}

     Format the response strictly with the following headings:
     **Subjective:**
     **Objective:**
     **Assessment:**
     **Plan:**

     Keep the tone highly objective, clinical, and concise.`;

     try {
       const result = await callGemini(prompt, apiKey, "You are a BCBA clinical assistant.");
       setDraft(result || "AI returned no content.");
     } catch (err) {
       setDraft("AI Error: " + err.message);
     }
     setIsGenerating(false);
  };

  const handleSave = () => {
     if (!draft.trim()) {
       showToast("Note is empty.", "error");
       return;
     }
     setSessionNotes(prev => [...prev, { id: Date.now(), clientId: activeClient.id, date: new Date().toLocaleDateString(), text: draft }]);
     setDraft('');
     showToast("Session note finalized and secured.");
  };

  const clientNotes = sessionNotes.filter(n => n.clientId === activeClient.id);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-[#233554] pb-4">
        <FileSignature size={28} className="text-fuchsia-400" />
        <h2 className="text-3xl font-black text-white tracking-tight">Clinical Documentation</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Generator Section */}
        <div className="bg-[#112240]/80 p-8 rounded-[2.5rem] border border-[#233554] shadow-lg flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-fuchsia-400">SOAP Note Drafter</h3>
            <button onClick={handleGenerate} disabled={isGenerating} className="bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-fuchsia-500 hover:text-white transition-all flex items-center gap-2 disabled:opacity-50">
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Auto-Generate
            </button>
          </div>

          <textarea
            className="flex-1 w-full bg-[#0A192F] border border-[#233554] rounded-[1.5rem] p-6 text-sm text-slate-300 focus:outline-none focus:border-fuchsia-500 transition-all custom-scrollbar resize-none"
            placeholder="Click Auto-Generate to synthesize today's data into a clinical note, or type manually..."
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />

          <div className="mt-4 flex justify-end">
             <button onClick={handleSave} disabled={!draft.trim() || isGenerating} className="bg-cyan-500 text-[#061224] px-8 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-lg disabled:opacity-50 flex items-center gap-2">
                <Save size={16} /> Save to Vault
             </button>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-[#112240]/40 p-8 rounded-[2.5rem] border border-[#233554] overflow-y-auto custom-scrollbar h-[500px]">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6 sticky top-0 bg-[#112240]/40 py-2">Past Records</h3>
          {clientNotes.length === 0 ? (
            <div className="text-center py-10 text-slate-500 italic text-sm">No saved notes for this client.</div>
          ) : (
            <div className="space-y-4">
              {clientNotes.slice().reverse().map(note => (
                <div key={note.id} className="bg-[#0A192F] p-5 rounded-2xl border border-[#233554]">
                  <div className="text-[10px] font-bold text-cyan-400 mb-2 uppercase tracking-widest flex items-center gap-1.5"><Clock size={12}/> {note.date}</div>
                  <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InsuranceHubView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in">
      <FileCheck size={64} className="mb-4 opacity-20 text-emerald-400" />
      <h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">Insurance & Approvals</h2>
      <p className="font-medium text-sm">Pending BCBA sign-offs for clearinghouse transmission.</p>
    </div>
  );
}

function SettingsView({ systemSettings, setSystemSettings, showToast }) {
  const [bcbaPin, setBcbaPin] = useState(systemSettings?.bcbaPin || '222222');
  const [rbtPin, setRbtPin] = useState(systemSettings?.rbtPin || '333333');

  const handleSave = (e) => {
    e.preventDefault();
    setSystemSettings({ bcbaPin, rbtPin });
    showToast("Security settings updated successfully.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 border-b border-[#233554] pb-4">
        <Settings size={28} className="text-cyan-400" />
        <h2 className="text-3xl font-black text-white tracking-tight">System Settings</h2>
      </div>
      <div className="bg-[#112240] p-8 rounded-[3rem] border border-[#233554]">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2"><Key className="text-cyan-400"/> PIN Authentication (Prototype)</h3>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-widest block mb-2">BCBA Admin PIN</label>
              <input type="password" maxLength={6} required value={bcbaPin} onChange={e=>setBcbaPin(e.target.value.replace(/\D/g,''))} className="w-full bg-[#0A192F] border border-[#233554] rounded-xl p-4 text-2xl font-black text-cyan-400 tracking-[0.5em] text-center focus:border-cyan-400 outline-none transition-all" />
           </div>
           <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-widest block mb-2">RBT Field PIN</label>
              <input type="password" maxLength={6} required value={rbtPin} onChange={e=>setRbtPin(e.target.value.replace(/\D/g,''))} className="w-full bg-[#0A192F] border border-[#233554] rounded-xl p-4 text-2xl font-black text-cyan-400 tracking-[0.5em] text-center focus:border-cyan-400 outline-none transition-all" />
           </div>
           <button type="submit" className="md:col-span-2 bg-cyan-500 text-[#061224] py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:bg-white transition-all">Update Access Codes</button>
        </form>
      </div>
    </div>
  );
}
