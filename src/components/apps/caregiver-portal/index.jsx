import React, { useState } from "react";
import {
  AlertTriangle, Brain,
  BookOpen, Loader2,
  Shield, Heart, Activity,
  Calendar, Menu, MessageSquare, Target,
  X
} from 'lucide-react';
import { callGemini } from '../../../lib/gemini';
import { useApiData } from '../../../hooks/useApiData';
import { useApp } from '../../../context/AppContext';
import { fetchCaregiverClients, fetchCaregiverLibrary, fetchCaregiverSessionConfig } from '../../../api/apps';

import NavButton from './components/NavButton';
import Dashboard from './views/Dashboard';
import StrategyCoach from './views/StrategyCoach';
import DailyFeed from './views/DailyFeed';
import Library from './views/Library';
import Programs from './views/Programs';

// --- PARENT CLINICAL CORE PERSONA ---
const parentClinicalCore = `[SYSTEM: INFINITY CLINICAL CORE ENGAGED]
You are an elite, doctorate-level BCBA-D acting as a supportive, empathetic, and brilliant coach for parents. You possess exhaustive knowledge of ABA, the 4 functions of behavior, and PBS.
CRITICAL INSTRUCTIONS:
1. ADAPTIVE LANGUAGE: Translate advanced clinical concepts into warm, jargon-free, layman's terms. Never use terms like "SD", "MO", "Extinction Burst", or "DRA" without explaining them simply.
2. VALIDATE THE PARENT: Parenting is hard. Always start by validating their effort and normalizing the child's behavior.
3. SCANNABILITY: Use short paragraphs, bullet points, and bold text for easy reading. Keep it under 200 words.
4. TIE TO THE BIP: Base your actionable advice strictly on the proactive and reactive strategies outlined in the provided Behavior Intervention Plan.`;

export default function CaregiverPortalApp() {
  const { apiKey } = useApp();
  const [view, setView] = useState("home"); // home, strategy, feed, library, programs
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Home View / Cancellation State
  const [cancelState, setCancelState] = useState("idle"); // idle, penalty, done
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Strategy Generator State
  const [strategyForm, setStrategyForm] = useState({ antecedent: '', behavior: '', consequence: '' });
  const [generatedStrategy, setGeneratedStrategy] = useState('');
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);

  // --- Load data from mock API ---
  const { data: clientsData, loading: clientsLoading } = useApiData(fetchCaregiverClients);
  const { data: libraryData } = useApiData(fetchCaregiverLibrary);
  const { data: sessionConfig } = useApiData(fetchCaregiverSessionConfig);

  const client = clientsData?.[0] || {
    id: 'loading', name: 'Loading...', guardian: '', avatar: '--', focus: '',
    nextSession: '', authUsed: 0, authTotal: 0, cliffDate: '', risk: '',
    bip: { approvedBy: '', targetBehaviors: [], functionHypothesis: '', prevention: [], replacement: [], reinforcement: [], escalation: '' },
    feed: []
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- ACTIONS ---
  const handleGenerateStrategy = async () => {
    if (!strategyForm.antecedent || !strategyForm.behavior) {
      showToast("Please fill in what happened before (Antecedent) and what the child did (Behavior).");
      return;
    }
    setIsGeneratingStrategy(true);
    setGeneratedStrategy('');

    const userPrompt = `
      Child's Behavior Intervention Plan (BIP): ${JSON.stringify(client.bip)}

      Incident Report from Parent:
      What happened right before (Antecedent): "${strategyForm.antecedent}"
      What the child did (Behavior): "${strategyForm.behavior}"
      How I responded (Consequence): "${strategyForm.consequence || 'Not provided'}"

      Please analyze this using the 4 functions of behavior, validate my experience, and give me 3 specific, easy-to-do strategies for next time based on the BIP.
    `;

    try {
      const response = await callGemini(userPrompt, apiKey, parentClinicalCore);
      setGeneratedStrategy(response || "No response generated.");
    } catch {
      setGeneratedStrategy("I'm sorry, I couldn't connect to the clinical core right now. Please try again in a moment.");
    } finally {
      setIsGeneratingStrategy(false);
    }
  };

  const submitCancellation = async () => {
    setIsProcessingCancel(true);
    try {
      // Simulate network delay
      await new Promise(res => setTimeout(res, 500));
      setCancelState("done");
    } catch (e) {
      console.error("Error dispatching cancellation", e);
      showToast("Failed to connect to the clinic. Please try again later.");
    } finally {
      setIsProcessingCancel(false);
    }
  };

  const handleNav = (id) => {
    setView(id);
    setIsSidebarOpen(false);
    if (id === 'home') setCancelState('idle');
  };

  const cancellationFee = sessionConfig?.cancellationFee ?? 75;
  const sessionTime = sessionConfig?.sessionTime ?? '2:00 PM - 5:00 PM';
  const makeupSlots = sessionConfig?.makeupSlots ?? ['Thursday, 4:00 PM', 'Friday, 3:00 PM'];

  if (clientsLoading && !clientsData) {
    return (
      <div className="flex h-full items-center justify-center bg-[#040811] text-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#040811] text-slate-200 font-sans overflow-hidden selection:bg-cyan-500/30 relative w-full">
      <style>{`
        .animate-in { animation-duration: 300ms; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn95; }
        .slide-in-from-bottom-4 { animation-name: slideInBottom4; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInBottom4 { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* Global Toast */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[100] bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in fade-in">
          <AlertTriangle size={16} className="text-amber-400" />
          <span className="text-sm font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Background Cinematic Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-900/10 blur-[120px] rounded-full mix-blend-screen"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wMykiLz48L3N2Zz4=')] opacity-50"></div>
      </div>

      {/* MOBILE SIDEBAR OVERLAY */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/80 z-[80] md:hidden backdrop-blur-sm transition-opacity fade-in" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* SIDEBAR NAVIGATION */}
      <div className={`fixed inset-y-0 left-0 transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 w-[80vw] md:w-80 bg-[#0A1220]/95 backdrop-blur-xl border-r border-white/5 flex flex-col z-[90] transition-transform duration-300 shadow-2xl shrink-0`}>
        <div className="p-6 md:p-8 flex items-center justify-between border-b border-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,229,255,0.4)] border border-cyan-400/30">
              <Heart className="w-5 h-5 text-[#040811] fill-current" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-white leading-none">Caregiver <span className="text-cyan-400">Portal</span></h1>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mt-1">Infinite Pieces AI</p>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden bg-slate-800 p-2 rounded-full text-slate-400"><X size={16}/></button>
        </div>

        <div className="p-6 shrink-0">
          <div className="bg-[#12214A]/40 border border-blue-500/20 p-4 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-xl font-black text-blue-400 border border-blue-500/30">{client.avatar}</div>
            <div>
              <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Active Plan</p>
              <p className="font-bold text-white text-lg">{client.name}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-6">
          <NavButton id="home" icon={Calendar} label="Dashboard & Schedule" view={view} onNav={handleNav} />
          <NavButton id="strategy" icon={Brain} label="AI Strategy Coach" view={view} onNav={handleNav} />
          <NavButton id="feed" icon={Activity} label="Daily Feed" view={view} onNav={handleNav} />
          <NavButton id="library" icon={BookOpen} label="ABA Library" view={view} onNav={handleNav} />
          <NavButton id="programs" icon={Target} label="Clinical Programs" view={view} onNav={handleNav} />
        </nav>

        <div className="p-6 border-t border-white/5 shrink-0">
          <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3 rounded-xl transition-colors font-bold text-sm">
            <MessageSquare size={16} /> Contact Clinic
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">

        {/* Header Overlay */}
        <header className="px-6 py-4 md:py-6 flex items-center justify-between border-b border-white/5 bg-[#0A1220]/50 backdrop-blur-md sticky top-0 z-40 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 bg-slate-800 rounded-lg text-slate-300 hover:text-white transition-colors border border-slate-700">
              <Menu size={20} />
            </button>
            <div>
              <h2 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                {view === 'home' && 'Dashboard'}
                {view === 'strategy' && 'AI Strategy Coach'}
                {view === 'feed' && 'Daily Feed'}
                {view === 'library' && 'ABA Knowledge Library'}
                {view === 'programs' && 'Clinical Programs'}
              </h2>
              <p className="text-[10px] md:text-xs text-cyan-400 font-bold tracking-widest uppercase mt-1 flex items-center gap-1.5">
                <Shield size={12} className="hidden sm:inline" /> Connected to Clinical Team
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-bold">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> Live Sync
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-white font-bold text-sm overflow-hidden">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=1e293b" alt="Parent" className="w-full h-full object-cover" />
             </div>
          </div>
        </header>

        {/* Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
          <div className="max-w-6xl mx-auto h-full">

            {view === "home" && (
              <Dashboard
                client={client}
                cancelState={cancelState}
                setCancelState={setCancelState}
                isProcessingCancel={isProcessingCancel}
                submitCancellation={submitCancellation}
                cancellationFee={cancellationFee}
                sessionTime={sessionTime}
                makeupSlots={makeupSlots}
              />
            )}

            {view === "strategy" && (
              <StrategyCoach
                client={client}
                strategyForm={strategyForm}
                setStrategyForm={setStrategyForm}
                generatedStrategy={generatedStrategy}
                setGeneratedStrategy={setGeneratedStrategy}
                isGeneratingStrategy={isGeneratingStrategy}
                handleGenerateStrategy={handleGenerateStrategy}
              />
            )}

            {view === "feed" && (
              <DailyFeed client={client} />
            )}

            {view === "library" && (
              <Library libraryData={libraryData} />
            )}

            {view === "programs" && (
              <Programs />
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
