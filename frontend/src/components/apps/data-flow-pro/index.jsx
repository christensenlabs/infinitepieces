import { useState, useEffect } from 'react';
import {
  Users, BookOpen, PlayCircle, Settings,
  CheckCircle2,
  AlertCircle, ShieldAlert, Loader2,
  RotateCcw, ChevronLeft, Menu,
  Layout,
  FileSignature, FileCheck, UserCheck, Power,
  LayoutGrid
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { fetchDataFlowClients, fetchDataFlowPrograms, fetchDataFlowConfig } from '@/api/apps';

import { dfpStyles } from './styles';
import NavItem from './components/NavItem';
import LoginScreen from './views/LoginScreen';
import DashboardView from './views/DashboardView';
import ClientsView from './views/ClientsView';
import BehaviorsView from './views/BehaviorsView';
import LibraryView from './views/LibraryView';
import SessionView from './views/SessionView';
import VirtualDttView from './views/VirtualDttView';
import SessionNotesView from './views/SessionNotesView';
import InsuranceHubView from './views/InsuranceHubView';
import SettingsView from './views/SettingsView';

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
    setSessionData({}); setSystemSettings(defaultSettings);
    setActiveClient(defaultClients[0] || null); setShowResetModal(false); setActiveTab('clients');
    showToast("System reset to factory defaults.");
  };

  if (!isLoaded) return <div className="h-screen bg-dfp flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" size={48} /></div>;

  if (role === 'login') return <LoginScreen setRole={setRole} setActiveTab={setActiveTab} systemSettings={systemSettings} />;

  const isBCBA = role === 'BCBA';

  const clientPrograms = activeClient ? programs.filter(p => p.clientId === activeClient.id) : [];
  const clientBehaviors = activeClient ? behaviors.filter(b => b.clientId === activeClient.id) : [];

  return (
    <div className="flex h-screen bg-dfp font-sans text-slate-300 overflow-hidden relative selection:bg-cyan-500/30">
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
        <aside className={dfpStyles.sidebar}>
          <div className="p-6 border-b border-dfp-border flex flex-col items-center relative">
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

          <div className="p-4 bg-slate-950/50 border-t border-dfp-border space-y-3">
             <button onClick={() => setShowResetModal(true)} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors"><RotateCcw size={14}/> Factory Reset</button>
             <button onClick={() => { setRole('login'); setActiveClient(null); }} className="w-full flex items-center justify-center gap-2 py-2 text-xs font-bold text-slate-500 hover:text-rose-400 transition-colors"><Power size={14}/> Sign Out</button>
          </div>
        </aside>
      )}

      {/* MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className={dfpStyles.header}>
           <div className="flex items-center gap-4">
              {!isSidebarOpen && <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-dfp-light rounded-lg text-cyan-400 border border-dfp-border"><Menu size={20}/></button>}
              <h2 className="font-bold text-white uppercase tracking-[0.2em] text-xs">{activeTab.replace('_', ' ')}</h2>
           </div>
           <div className="flex items-center gap-4">
              {activeClient && (
                 <div className="flex items-center gap-3 pl-4 border-l border-dfp-border">
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
                <button onClick={() => setActiveTab('clients')} className="bg-cyan-500 text-dfp-dark px-8 py-3 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg">Open Roster</button>
             </div>
          ) : (
            <>
              {activeTab === 'hub' && <DashboardView clients={clients} activeClient={activeClient} setActiveClient={setActiveClient} setActiveTab={setActiveTab} />}
              {activeTab === 'clients' && <ClientsView clients={clients} setClients={setClients} activeClient={activeClient} setActiveClient={setActiveClient} isBCBA={isBCBA} showToast={showToast} />}
              {activeTab === 'behaviors' && <BehaviorsView behaviors={clientBehaviors} setBehaviors={setBehaviors} activeClient={activeClient} isBCBA={isBCBA} showToast={showToast} apiKey={apiKey} />}
              {activeTab === 'library' && <LibraryView programs={clientPrograms} activeClient={activeClient} />}
              {activeTab === 'session' && <SessionView programs={clientPrograms} activeClient={activeClient} sessionData={sessionData} setSessionData={setSessionData} />}
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
           <div className="bg-dfp-light p-8 rounded-[2rem] shadow-2xl max-w-md w-full border-t-8 border-rose-600 animate-in zoom-in-95">
              <h3 className="text-2xl font-black text-white mb-2 flex items-center gap-2"><ShieldAlert className="text-rose-600" /> Factory Reset</h3>
              <p className="text-slate-400 mb-6 font-medium leading-relaxed">This will erase all clients and records to restore the blank slate. <strong>This cannot be undone.</strong></p>
              <div className="flex gap-4 justify-end">
                 <button onClick={() => setShowResetModal(false)} className="px-5 py-2.5 font-bold text-slate-300 bg-dfp rounded-xl transition-colors hover:bg-dfp-border">Cancel</button>
                 <button onClick={handleFactoryReset} className="px-5 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors">Confirm Reset</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
