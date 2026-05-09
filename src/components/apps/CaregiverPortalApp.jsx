import React, { useEffect, useState, useRef } from "react";
import {
  AlertTriangle, CheckCircle2, Brain,
  BookOpen, RefreshCw, Loader2,
  Sparkles, Shield, Clock, Heart, Users, Activity, Mic, X,
  Calendar, MapPin, Search, Menu, MessageSquare, Target,
  Lightbulb
} from 'lucide-react';
import { callGemini } from '../../lib/gemini';
import { useApiData } from '../../hooks/useApiData';
import { fetchCaregiverClients, fetchCaregiverLibrary, fetchCaregiverSessionConfig } from '../../api/apps';

// --- VOICE RECOGNITION HOOK ---
function useVoiceRecognition(value, onChange) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          const currentVal = valueRef.current || '';
          const space = (currentVal && !currentVal.endsWith(' ')) ? ' ' : '';
          onChangeRef.current({ target: { value: currentVal + space + finalTranscript.trim() } });
        }
      };
      recognition.onerror = (event) => { console.error('Speech recognition error', event.error); setIsRecording(false); };
      recognition.onend = () => { setIsRecording(false); };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        setVoiceError('Voice dictation is not supported in this browser.');
        setTimeout(() => setVoiceError(''), 3000);
        return;
      }
      try { recognitionRef.current.start(); setIsRecording(true); } catch(e) { console.error(e); }
    }
  };

  return { isRecording, toggleRecording, voiceError };
}

// --- VOICE TEXT AREA COMPONENT ---
function VoiceTextArea({ value, onChange, placeholder, rows = 3, className }) {
  const { isRecording, toggleRecording, voiceError } = useVoiceRecognition(value, onChange);
  return (
    <div className="relative w-full flex items-center">
      {voiceError && (
        <div className="absolute -top-8 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md animate-in fade-in z-10">
          {voiceError}
        </div>
      )}
      <textarea
        value={value}
        onChange={onChange}
        className={className || "w-full p-4 border border-slate-700 rounded-xl focus:ring-2 focus:ring-cyan-500 bg-slate-900/50 text-white placeholder-slate-500 shadow-inner font-medium pr-14 transition-all resize-none custom-scrollbar"}
        rows={rows}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={toggleRecording}
        className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors shadow-sm ${isRecording ? 'bg-rose-500/20 text-rose-400 animate-pulse border border-rose-500/50' : 'bg-slate-800 text-slate-400 hover:bg-cyan-500/20 hover:text-cyan-400 border border-slate-700'}`}
        title={isRecording ? "Tap to Stop" : "Tap to Speak"}
      >
        <Mic size={18} />
      </button>
    </div>
  );
}

// --- PARENT CLINICAL CORE PERSONA ---
const parentClinicalCore = `[SYSTEM: INFINITY CLINICAL CORE ENGAGED]
You are an elite, doctorate-level BCBA-D acting as a supportive, empathetic, and brilliant coach for parents. You possess exhaustive knowledge of ABA, the 4 functions of behavior, and PBS.
CRITICAL INSTRUCTIONS:
1. ADAPTIVE LANGUAGE: Translate advanced clinical concepts into warm, jargon-free, layman's terms. Never use terms like "SD", "MO", "Extinction Burst", or "DRA" without explaining them simply.
2. VALIDATE THE PARENT: Parenting is hard. Always start by validating their effort and normalizing the child's behavior.
3. SCANNABILITY: Use short paragraphs, bullet points, and bold text for easy reading. Keep it under 200 words.
4. TIE TO THE BIP: Base your actionable advice strictly on the proactive and reactive strategies outlined in the provided Behavior Intervention Plan.`;

// --- SHARED UI COMPONENTS ---
function classNames(...items) { return items.filter(Boolean).join(" "); }

function NavButton({ id, icon: IconCmp, label, view, onNav }) {
  return (
    <button
      onClick={() => onNav(id)}
      className={classNames(
        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm",
        view === id
          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
      )}
    >
      <IconCmp size={20} />
      {label}
    </button>
  );
}

// --- MAIN COMPONENT ---
export default function CaregiverPortalApp({ apiKey }) {
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
    // Replace Firebase write with local state transition
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

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      const bullet = line.match(/^[*-]\s*(.*)/);
      const content = bullet ? `• ${bullet[1]}` : line;
      const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((seg, j) => {
        if (seg.startsWith('**') && seg.endsWith('**')) return <strong key={j}>{seg.slice(2, -2)}</strong>;
        if (seg.startsWith('*') && seg.endsWith('*')) return <em key={j}>{seg.slice(1, -1)}</em>;
        return seg;
      });
      return <p key={i}>{parts}</p>;
    });
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

            {/* --- VIEW: HOME (Dashboard & Schedule) --- */}
            {view === "home" && (
              <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500 h-full flex flex-col">

                {/* Top KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 shrink-0">
                  <div className="bg-[#0A1220]/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl flex items-center gap-5">
                    <div className="w-14 h-14 bg-cyan-500/10 text-cyan-400 rounded-2xl flex items-center justify-center border border-cyan-500/20 shrink-0"><Clock size={28}/></div>
                    <div><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Auth Remaining</p><p className="text-2xl font-black text-white">{client.authTotal - client.authUsed} Hrs</p></div>
                  </div>
                  <div className="bg-[#0A1220]/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl flex items-center gap-5">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center border border-emerald-500/20 shrink-0"><CheckCircle2 size={28}/></div>
                    <div><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Mastered Skills</p><p className="text-2xl font-black text-white">0</p></div>
                  </div>
                  <div className="bg-[#0A1220]/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl flex items-center gap-5">
                    <div className="w-14 h-14 bg-purple-500/10 text-purple-400 rounded-2xl flex items-center justify-center border border-purple-500/20 shrink-0"><Users size={28}/></div>
                    <div><p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Care Team</p><p className="text-2xl font-black text-white">0 Active</p></div>
                  </div>
                </div>

                {/* Schedule Card (The Revenue Trap) */}
                <div className="flex-1 bg-[#0A1220]/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-10 shadow-2xl relative overflow-hidden flex flex-col justify-center">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none"></div>

                  {cancelState === "idle" && (
                    <div className="max-w-2xl mx-auto w-full text-center animate-in zoom-in-95 duration-300">
                      <div className="inline-block bg-slate-800 text-slate-300 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full mb-6 border border-slate-700">Upcoming Session</div>
                      <div className="flex justify-center items-center gap-6 mb-8">
                        <div className="w-20 h-20 bg-cyan-500/20 text-cyan-400 rounded-3xl flex items-center justify-center border border-cyan-500/30 shadow-[0_0_30px_rgba(0,229,255,0.2)]">
                          <Calendar size={36} />
                        </div>
                        <div className="text-left">
                          <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight">Today</h3>
                          <p className="text-lg md:text-xl font-bold text-cyan-400 mt-2">{sessionTime}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm md:text-base font-medium text-slate-300 bg-slate-900/50 p-6 rounded-3xl border border-white/5 inline-flex">
                        <span className="flex items-center gap-2"><Users className="text-slate-500"/> RBT: Emma R.</span>
                        <span className="w-px h-6 bg-slate-700 hidden sm:block"></span>
                        <span className="flex items-center gap-2"><MapPin className="text-slate-500"/> Home Session</span>
                      </div>

                      <div className="max-w-md mx-auto">
                        <button onClick={() => setCancelState('penalty')} className="w-full bg-slate-800 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 text-rose-400 py-4 rounded-2xl font-bold transition-all hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]">
                          Cancel Session
                        </button>
                      </div>
                    </div>
                  )}

                  {cancelState === "penalty" && (
                    <div className="max-w-xl mx-auto w-full text-center animate-in zoom-in-95 duration-300">
                      <div className="w-20 h-20 bg-rose-500/20 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/30 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
                        <AlertTriangle size={36} />
                      </div>
                      <h3 className="text-3xl md:text-4xl font-black text-white mb-3">Late Cancellation</h3>
                      <p className="text-slate-400 text-sm md:text-base mb-8">Canceling within 24 hours incurs a <span className="font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">${cancellationFee} fee</span> per clinic policy.</p>

                      <div className="bg-slate-900/80 border border-amber-500/30 p-6 rounded-3xl mb-8 text-left shadow-inner relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500"></div>
                        <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-2"><Shield size={14}/> Insurance Notice</p>
                        <p className="text-sm leading-relaxed text-slate-300">{client.name} is nearing his 85% utilization minimum. Falling below this may trigger a permanent reduction in authorized care hours by the funding source.</p>
                      </div>

                      <p className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">Waive fee instantly by rebooking:</p>
                      <div className="grid sm:grid-cols-2 gap-4 mb-6">
                        {makeupSlots.map((slot, idx) => (
                          <button key={idx} onClick={() => submitCancellation(slot)} disabled={isProcessingCancel} className="bg-slate-800 hover:bg-emerald-500/20 border border-slate-700 hover:border-emerald-500/50 p-5 rounded-2xl flex flex-col items-center justify-center transition-all group shadow-sm disabled:opacity-50 h-28">
                            <span className="font-bold text-slate-200 text-lg group-hover:text-emerald-400 transition-colors mb-2">{slot}</span>
                            <span className="text-[10px] font-black bg-emerald-500 text-slate-900 px-3 py-1 rounded shadow-sm">1-CLICK MAKEUP</span>
                          </button>
                        ))}
                      </div>

                      <button onClick={() => submitCancellation('Accepted Fee - No Makeup')} disabled={isProcessingCancel} className="w-full text-center text-slate-500 hover:text-rose-400 text-xs font-bold underline py-2 transition-colors disabled:opacity-50">
                        {isProcessingCancel ? 'Processing...' : `Accept $${cancellationFee} fee & risk authorized hours`}
                      </button>
                    </div>
                  )}

                  {cancelState === "done" && (
                    <div className="max-w-md mx-auto w-full text-center animate-in zoom-in-95 duration-300">
                      <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.3)]">
                        <CheckCircle2 size={48} />
                      </div>
                      <h3 className="text-3xl font-black text-white mb-3">Schedule Updated</h3>
                      <p className="text-slate-400 text-base mb-8 leading-relaxed">The clinical team has been alerted and the master schedule has been automatically updated.</p>
                      <button onClick={() => setCancelState('idle')} className="bg-slate-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-700 transition-colors">Return to Dashboard</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* --- VIEW: AI STRATEGY COACH --- */}
            {view === "strategy" && (
              <div className="h-full flex flex-col lg:flex-row gap-6 animate-in fade-in duration-500">
                <div className="w-full lg:w-5/12 bg-[#0A1220]/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-2xl flex flex-col shrink-0">
                  <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-6">
                    <div className="w-12 h-12 bg-cyan-500/20 rounded-2xl text-cyan-400 flex items-center justify-center border border-cyan-500/30 shadow-[0_0_15px_rgba(0,229,255,0.2)]"><Brain size={24} /></div>
                    <div>
                      <h3 className="font-black text-white text-xl">Behavior Coach</h3>
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">BIP-Tethered Guidance</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed mb-8 font-medium">Describe a challenging moment. The AI will cross-reference {client.name}&apos;s clinical behavior plan and provide empathetic, actionable advice.</p>

                  <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">1. What happened right before?</label>
                      <VoiceTextArea value={strategyForm.antecedent} onChange={(e) => setStrategyForm({...strategyForm, antecedent: e.target.value})} placeholder="e.g. I told him it was time to turn off the iPad..." rows={2} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">2. What did {client.name} do?</label>
                      <VoiceTextArea value={strategyForm.behavior} onChange={(e) => setStrategyForm({...strategyForm, behavior: e.target.value})} placeholder="e.g. He threw the iPad and started crying..." rows={2} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">3. How did you respond? (Optional)</label>
                      <VoiceTextArea value={strategyForm.consequence} onChange={(e) => setStrategyForm({...strategyForm, consequence: e.target.value})} placeholder="e.g. I gave it back for 5 more minutes..." rows={2} />
                    </div>
                  </div>

                  <div className="pt-6 mt-4 border-t border-white/5 shrink-0">
                    <button
                      onClick={handleGenerateStrategy}
                      disabled={isGeneratingStrategy || !strategyForm.antecedent || !strategyForm.behavior}
                      className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#040811] py-4 rounded-xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingStrategy ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                      {isGeneratingStrategy ? 'Consulting Behavior Plan...' : 'Generate Strategy'}
                    </button>
                  </div>
                </div>

                <div className="w-full lg:w-7/12 bg-[#0A1220]/50 backdrop-blur-md border border-white/5 rounded-[2.5rem] flex flex-col overflow-hidden shadow-2xl relative">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none"></div>
                  <div className="px-8 py-6 bg-slate-900/50 border-b border-white/5 flex items-center justify-between shrink-0">
                    <h3 className="font-bold text-white text-lg flex items-center gap-2"><Sparkles className="text-cyan-400 w-5 h-5"/> Coach Response</h3>
                    {generatedStrategy && (
                       <button onClick={() => setGeneratedStrategy('')} className="text-slate-500 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg"><X size={16}/></button>
                    )}
                  </div>
                  <div className="p-8 flex-1 overflow-y-auto custom-scrollbar prose prose-invert max-w-none text-sm leading-relaxed">
                    {isGeneratingStrategy ? (
                       <div className="h-full flex flex-col items-center justify-center text-cyan-500/50 space-y-4">
                         <Loader2 size={48} className="animate-spin" />
                         <span className="font-bold uppercase tracking-widest text-xs animate-pulse">Analyzing Clinical Data...</span>
                       </div>
                    ) : generatedStrategy ? (
                       <div className="animate-in fade-in slide-in-from-bottom-4">{renderMarkdown(generatedStrategy)}</div>
                    ) : (
                       <div className="h-full flex flex-col items-center justify-center text-slate-600 opacity-50">
                         <Brain size={64} className="mb-4" />
                         <p className="text-lg font-medium">Awaiting input...</p>
                       </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* --- VIEW: DAILY FEED (Safe-Snap Integration) --- */}
            {view === "feed" && (
              <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto h-full flex flex-col pb-10">
                <div className="bg-[#0A1220]/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 shadow-xl flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="font-black text-white text-2xl mb-1">Daily Feed</h3>
                    <p className="text-[10px] uppercase font-bold text-emerald-500 tracking-widest flex items-center gap-1.5"><Shield size={12}/> Safe-Snap Privacy Active</p>
                  </div>
                  <button className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"><RefreshCw size={20} /></button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto custom-scrollbar pr-2">
                  {client.feed.length === 0 ? (
                    <div className="bg-[#0A1220]/60 backdrop-blur-md border border-white/5 rounded-[2rem] p-12 flex flex-col items-center justify-center text-center shadow-lg h-64">
                      <Activity className="w-16 h-16 text-slate-600 mb-4 opacity-50" />
                      <h3 className="text-xl font-bold text-white mb-2">Feed is Empty</h3>
                      <p className="text-slate-400 text-sm max-w-sm">Updates and photos from the clinical team will appear here once the session begins.</p>
                    </div>
                  ) : (
                    client.feed.map(item => (
                      <div key={item.id} className="bg-[#0A1220]/60 backdrop-blur-md border border-white/5 rounded-[2rem] overflow-hidden flex flex-col shadow-lg transition-transform hover:-translate-y-1">
                        <div className="p-5 flex items-center justify-between border-b border-white/5 bg-slate-900/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-sm">HQ</div>
                            <div>
                              <p className="text-sm font-bold text-white">Clinical Team</p>
                              <p className="text-[10px] text-slate-500 font-medium tracking-wide">{item.time}</p>
                            </div>
                          </div>
                          {item.type === 'photo' && <div className="bg-emerald-500/10 text-emerald-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5 shadow-sm"><Shield size={12}/> Privacy Blurred</div>}
                        </div>

                        {item.type === 'photo' && (
                          <div className="w-full aspect-[16/9] sm:aspect-[21/9] bg-slate-950 relative border-b border-white/5 overflow-hidden">
                            <img src={item.imgUrl} alt="Session Update" className="w-full h-full object-cover opacity-60 mix-blend-screen" />
                            <div className="absolute top-4 right-4 w-20 h-20 bg-slate-800/50 backdrop-blur-xl rounded-full border border-white/10 shadow-2xl flex items-center justify-center">
                               <Users className="text-slate-400/50 w-8 h-8" />
                            </div>
                          </div>
                        )}
                        <div className="p-6">
                          <p className="text-base text-slate-300 font-medium leading-relaxed">{item.text}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* --- VIEW: ABA KNOWLEDGE LIBRARY --- */}
            {view === "library" && (
              <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col pb-10">
                <div className="bg-[#0A1220]/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-8 shadow-xl flex items-center gap-6 shrink-0 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
                  <div className="p-4 bg-purple-500/20 border border-purple-500/30 rounded-2xl text-purple-400 relative z-10 hidden sm:block"><BookOpen size={32} /></div>
                  <div className="relative z-10">
                    <h3 className="font-black text-white text-3xl mb-2">ABA Knowledge Library</h3>
                    <p className="text-sm text-slate-400 leading-relaxed max-w-2xl">Understanding the &quot;Why&quot; behind behavior is the first step. Every behavior serves one of four functions. We&apos;ve translated the science into simple, actionable strategies for home.</p>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4 space-y-12">

                  {/* Category 1: Core Functions */}
                  {libraryData?.functions && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center"><Target size={16}/></div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">The 4 Functions of Behavior</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {libraryData.functions.map((card, idx) => (
                          <LibraryCard key={idx} {...card} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 2: Proactive Strategies */}
                  {libraryData?.proactive && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center"><Shield size={16}/></div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Proactive Strategies (Before the Meltdown)</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {libraryData.proactive.map((card, idx) => (
                          <LibraryCard key={idx} {...card} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Category 3: Teaching & Responding */}
                  {libraryData?.teaching && (
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center"><Lightbulb size={16}/></div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-wider">Skill Building & Responding</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {libraryData.teaching.map((card, idx) => (
                          <LibraryCard key={idx} {...card} />
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )}

            {/* --- VIEW: CLINICAL PROGRAMS (ProgramTree Connection) --- */}
            {view === "programs" && (
              <div className="space-y-6 animate-in fade-in duration-500 h-full flex flex-col pb-10">
                <div className="bg-[#0A1220]/80 backdrop-blur-md border border-white/5 rounded-[2rem] p-6 shadow-xl flex items-center justify-between shrink-0">
                  <div>
                    <h3 className="font-black text-white text-2xl mb-1">Clinical Programs</h3>
                    <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest flex items-center gap-1.5"><Shield size={12}/> ProgramTree Sync Active</p>
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center text-center bg-[#0A1220]/60 backdrop-blur-md border border-white/5 rounded-[2rem] p-12 shadow-lg">
                  <Target className="w-16 h-16 text-indigo-500 mb-4 opacity-50" />
                  <h3 className="text-2xl font-bold text-white mb-3">ProgramTree Connection</h3>
                  <p className="text-slate-400 text-sm max-w-md leading-relaxed">
                    This tab will connect directly to the ProgramTree module to display live clinical goals, mastery criteria, and home practice generalization steps.
                  </p>
                  <button className="mt-8 bg-slate-800 text-slate-300 px-8 py-3.5 rounded-xl text-sm font-bold opacity-50 cursor-not-allowed uppercase tracking-widest">
                    Awaiting Module Link
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}

// Helper component for the library tab
function LibraryCard({ title, desc, howToTell, do: doText, dont, color }) {
  return (
    <div className="bg-[#0A1220]/60 backdrop-blur-md rounded-3xl border border-white/5 shadow-xl overflow-hidden flex flex-col transition-transform hover:-translate-y-1 hover:shadow-2xl">
      <div className={`${color} p-5 border-b font-black text-lg tracking-wide text-white`}>{title}</div>
      <div className="p-6 space-y-4 flex-1 flex flex-col">
        <p className="text-sm text-slate-300 font-medium leading-relaxed mb-2">{desc}</p>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50 shadow-inner mb-1 flex-1">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><Search size={14}/> Spot it / Use it</p>
          <p className="text-sm text-slate-300 leading-relaxed">{howToTell}</p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50 shadow-inner">
          <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><CheckCircle2 size={14}/> Do</p>
          <p className="text-sm text-slate-300 leading-relaxed">{doText}</p>
        </div>

        <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/50 shadow-inner">
          <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2 flex items-center gap-1.5"><AlertTriangle size={14}/> Don&apos;t</p>
          <p className="text-sm text-slate-300 leading-relaxed">{dont}</p>
        </div>
      </div>
    </div>
  );
}
