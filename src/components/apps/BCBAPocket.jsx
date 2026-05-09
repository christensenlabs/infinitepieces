import { useState, useEffect, useRef } from 'react';
import {
  FileText, Users, Settings, Activity,
  ChevronRight, Save, Loader2, CheckCircle2, AlertCircle, Sparkles,
  Target, ListTodo, Bot, Download, Database, Send, Network,
  BarChart2, Edit3, Mail, UserCheck, BookOpen, Search, Plus, X, Zap
} from 'lucide-react';
import { callGemini } from '../../lib/gemini';
import { useApiData } from '../../hooks/useApiData';
import { fetchBcbaClients } from '../../api/apps';

// --- Global Utilities ---
const renderMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const bullet = line.match(/^[*-]\s*(.*)/);
    const content = bullet ? `\u2022 ${bullet[1]}` : line;
    const parts = content.split(/(\*\*.*?\*\*|\*.*?\*)/g).map((seg, j) => {
      if (seg.startsWith('**') && seg.endsWith('**')) return <strong key={j}>{seg.slice(2, -2)}</strong>;
      if (seg.startsWith('*') && seg.endsWith('*')) return <em key={j}>{seg.slice(1, -1)}</em>;
      return seg;
    });
    return <p key={i}>{parts}</p>;
  });
};

// --- MAIN APPLICATION ---
// eslint-disable-next-line no-unused-vars
export default function App({ apiKey, onClose }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [generatedProgram, setGeneratedProgram] = useState('');
  const [error, setError] = useState('');
  const [toasts, setToasts] = useState([]);
  const [activeModal, setActiveModal] = useState(null);

  // Copilot State
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([
    { role: 'ai', text: 'Dr. Smith, I am your Pocket BCBA Copilot. I have live access to 10,000+ ABA research articles, 2026 BACB guidelines, and all major insurance funder manuals. How can I assist you today?' }
  ]);
  const copilotEndRef = useRef(null);

  // Fetch mock data
  const { data: fetchedClients } = useApiData(fetchBcbaClients);
  // Use fetched clients or fallback
  const clients = fetchedClients || [
    { id: 1, initials: 'J.D.', age: '5 yrs 2 mo', diagnosis: 'F84.0', authExpiry: '2026-05-15', status: 'Active', intensity: '30 hrs/wk' },
    { id: 2, initials: 'A.M.', age: '3 yrs 8 mo', diagnosis: 'F84.0', authExpiry: '2026-04-28', status: 'Expiring Soon', intensity: '15 hrs/wk' },
    { id: 3, initials: 'S.R.', age: '8 yrs 1 mo', diagnosis: 'F84.0, F90.0', authExpiry: '2026-08-20', status: 'Active', intensity: '20 hrs/wk' },
    { id: 4, initials: 'E.B.', age: '4 yrs 5 mo', diagnosis: 'F84.0', authExpiry: '2026-05-02', status: 'Auth Pending', intensity: '25 hrs/wk' },
  ];

  const [clientData, setClientData] = useState({
    initials: '', age: '', diagnosis: '', assessments: '', behaviors: '', skills: '', caregiverGoals: '', intensity: '',
    includeAssent: true, traumaInformed: true
  });

  const [programData, setProgramData] = useState({
    domain: 'Communication',
    target: '',
    type: 'DTT (Discrete Trial Training)',
    promptStrategy: 'Least-to-Most (LTM)',
    mastery: '80% across 3 consecutive sessions'
  });

  const [soapData, setSoapData] = useState({ clientInitials: '', sessionLength: '120 mins', rawNotes: '' });
  const [generatedSoap, setGeneratedSoap] = useState('');

  // --- Auto Scroll for Copilot ---
  useEffect(() => {
    if (isCopilotOpen && copilotEndRef.current) {
      copilotEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotMessages, isCopilotOpen]);

  // --- State Handlers ---
  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setClientData({ ...clientData, [e.target.name]: value });
  };

  const handleProgramInputChange = (e) => {
    setProgramData({ ...programData, [e.target.name]: e.target.value });
  };

  const loadClientIntoGenerator = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClientData({
        ...clientData, initials: client.initials, age: client.age, diagnosis: client.diagnosis, intensity: client.intensity, assessments: 'VB-MAPP, PFA/SBT'
      });
      setActiveTab('generator');
      showToast(`Loaded ${client.initials}'s demographic data.`);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast("Copied to clipboard!");
    }).catch(() => {
      // Fallback for iFrame restrictions
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      showToast("Copied to clipboard!");
    });
  };

  // --- AI API Calls ---
  const handleCopilotSend = async () => {
    if (!copilotInput.trim()) return;
    const userText = copilotInput;
    setCopilotInput('');

    setCopilotMessages(prev => [...prev, { role: 'user', text: userText }]);
    setCopilotMessages(prev => [...prev, { role: 'ai', text: 'Synthesizing...', isLoading: true }]);

    const historyContext = copilotMessages.filter(m => !m.isLoading).map(m => `${m.role === 'ai' ? 'Pocket BCBA' : 'User'}: ${m.text}`).join('\n');
    const fullPrompt = `History:\n${historyContext}\n\nUser: ${userText}\nPocket BCBA:`;
    const systemPrompt = "You are Pocket BCBA, an elite BCBA-D AI Copilot with access to a massive database of 10,000+ peer-reviewed ABA articles, CPT billing codes, insurance regulations, and the 2026 BACB Ethics code. Provide precise, doctorate-level answers with citations where appropriate. Keep it conversational but clinical.";

    try {
      const responseText = await callGemini(fullPrompt, apiKey, systemPrompt);
      setCopilotMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'ai', text: responseText || "I encountered an error analyzing that request." };
        return newMsgs;
      });
    } catch {
      setCopilotMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'ai', text: "Network error connecting to the secure LLM database." };
        return newMsgs;
      });
    }
  };

  const generateTreatmentPlan = async () => {
    if (!clientData.initials || !clientData.behaviors) {
      setError("Please fill in at least the client initials and target behaviors.");
      return;
    }
    setIsGenerating(true);
    setError('');
    setGeneratedPlan('');
    setActiveTab('plan-view');

    const systemPrompt = `You are Pocket BCBA, an elite BCBA-D operating in 2026. Write an ABA treatment plan. Use Markdown.
    Include: Medical Necessity, Operational Definitions, BIP summary, Skill Goals (SMART), Parent Goals, Fading Criteria.
    ${clientData.includeAssent ? 'Explicitly detail Assent-Withdrawal criteria based on 2026 ethics.' : ''}
    ${clientData.traumaInformed ? 'Use a trauma-informed lens. Emphasize choice-making and enriched environments.' : ''}`;

    const userPrompt = `Generate a 6-month ABA treatment plan:\nInitials: ${clientData.initials}, Age: ${clientData.age}, Diagnosis: ${clientData.diagnosis}, Behaviors: ${clientData.behaviors}, Skills: ${clientData.skills}, Caregiver: ${clientData.caregiverGoals}`;

    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) { setGeneratedPlan(text); showToast("2026 Compliant Plan Synthesized"); }
      else throw new Error("Invalid AI response.");
    } catch {
      setError("Failed to generate plan. Try again.");
      setActiveTab('generator');
    } finally { setIsGenerating(false); }
  };

  const generateSoapNote = async () => {
    if (!soapData.rawNotes) {
      showToast("Please enter raw session notes first.", "error");
      return;
    }
    setIsGenerating(true);
    setGeneratedSoap('');

    const userPrompt = `Client: ${soapData.clientInitials}\nSession Length: ${soapData.sessionLength}\nRaw Notes:\n${soapData.rawNotes}\n\nPlease convert these raw notes into a professional SOAP (Subjective, Objective, Assessment, Plan) note suitable for medical billing audits.`;
    const systemPrompt = "You are an elite BCBA. Transform messy session notes into clinical, objective, and precise SOAP notes utilizing proper ABA terminology.";

    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) { setGeneratedSoap(text); showToast("SOAP Note successfully synthesized!"); }
    } catch { showToast("Failed to generate SOAP note.", "error"); }
    finally { setIsGenerating(false); }
  };

  const generateProgramSheet = async () => {
    if (!programData.target) return;
    setIsGenerating(true);
    const userPrompt = `Generate a CentralReach-compatible ABA program sheet.
      Domain: ${programData.domain}
      Target Skill: ${programData.target}
      Teaching Method: ${programData.type}
      Prompting Strategy: ${programData.promptStrategy}
      Mastery Criteria: ${programData.mastery}

      Include:
      1. Operational Definition
      2. Discriminative Stimulus (SD)
      3. Expected Response
      4. Prompting & Fading Plan
      5. Error Correction Procedure
      6. Reinforcement Schedule
      7. Mastery & Generalization Criteria.
      Use professional markdown formatting.`;

    try {
      const text = await callGemini(userPrompt, apiKey);
      if (text) setGeneratedProgram(text);
    } catch { showToast("Error generating program", "error"); }
    finally { setIsGenerating(false); }
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      <style>{`
        .animate-in { animation-duration: 300ms; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-in { animation-name: fadeIn; }
        .slide-in-from-top-4 { animation-name: slideInTop4; }
        .slide-in-from-right { animation-name: slideInRight; }
        .zoom-in-95 { animation-name: zoomIn95; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInTop4 { from { opacity: 0; transform: translateY(-1rem); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
        @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>

      <div className="fixed top-4 right-4 z-[70] space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className="animate-in slide-in-from-top-4 fade-in duration-300 flex items-center space-x-2 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl">
            {toast.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-red-500" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {activeModal && <ToolboxModal type={activeModal} onClose={() => setActiveModal(null)} apiKey={apiKey} />}

      {/* Sidebar Navigation */}
      <div className="w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800 flex flex-col z-20 shrink-0">
        <div className="p-6 flex items-center space-x-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white block leading-tight">Pocket BCBA</span>
            <span className="text-[10px] text-indigo-400 font-mono tracking-widest uppercase">Master Build</span>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-2 overflow-y-auto pb-4 custom-scrollbar">
          <NavItem icon={<Activity size={18} />} label="Command Center" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={<Users size={18} />} label="Active Caseload" active={activeTab === 'clients'} onClick={() => setActiveTab('clients')} />

          <div className="pt-4 pb-1"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4">Generators & Programs</p></div>
          <NavItem icon={<FileText size={18} />} label="Plan Synthesizer" active={activeTab === 'generator' || activeTab === 'plan-view'} onClick={() => setActiveTab('generator')} />
          <NavItem icon={<Edit3 size={18} />} label="SOAP Note AI" active={activeTab === 'soap'} onClick={() => setActiveTab('soap')} />
          <NavItem icon={<Mail size={18} />} label="Parent Comms AI" active={activeTab === 'comms'} onClick={() => setActiveTab('comms')} />
          <NavItem icon={<ListTodo size={18} />} label="Task Analysis AI" active={activeTab === 'ta'} onClick={() => setActiveTab('ta')} />
          <NavItem icon={<Database size={18} />} label="Program Creator" active={activeTab === 'programs'} onClick={() => setActiveTab('programs')} />

          <div className="pt-4 pb-1"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4">Expert Science & Database</p></div>
          <NavItem icon={<BookOpen size={18} />} label="Library Compendium" active={activeTab === 'library'} onClick={() => setActiveTab('library')} badge="10k+" badgeColor="indigo" />
          <NavItem icon={<Zap size={18} />} label="Clinical Toolbox" active={activeTab === 'toolbox'} onClick={() => setActiveTab('toolbox')} />
          <NavItem icon={<UserCheck size={18} />} label="AI Clinical Coach" active={activeTab === 'ai-learner'} onClick={() => setActiveTab('ai-learner')} />
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <button className="w-full flex items-center justify-between bg-slate-800 hover:bg-slate-700 border border-slate-700 p-2 rounded-xl transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-500 flex items-center justify-center shadow-inner"><span className="text-xs font-bold text-white">DS</span></div>
              <div className="text-left"><p className="text-sm font-medium text-white leading-tight">Dr. Smith</p><p className="text-[10px] text-emerald-400 font-medium">BCBA-D</p></div>
            </div>
            <Settings size={16} className="text-slate-400" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto bg-slate-950 relative custom-scrollbar">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none"></div>

        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-100 flex items-center tracking-wide">
            {activeTab === 'dashboard' && 'Command Center'}
            {activeTab === 'clients' && 'Active Caseload'}
            {activeTab === 'generator' && 'AI Plan Synthesizer'}
            {activeTab === 'soap' && 'LLM SOAP Note Synthesizer'}
            {activeTab === 'comms' && 'Parent & Caregiver Communication AI'}
            {activeTab === 'ta' && 'Automated Task Analysis Breakdown'}
            {activeTab === 'plan-view' && 'Document Review'}
            {activeTab === 'programs' && 'CentralReach Program Generator'}
            {activeTab === 'library' && 'Expert Insurance & Behavioral Library'}
            {activeTab === 'toolbox' && 'Advanced Clinical Toolbox'}
            {activeTab === 'ai-learner' && 'AI Clinical Coach & Peer Review'}
          </h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setIsCopilotOpen(!isCopilotOpen)}
              className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl transition-all border font-bold ${
                isCopilotOpen ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'
              }`}
            >
              <Sparkles size={16} className={isCopilotOpen ? "animate-pulse" : ""} />
              <span className="text-sm">Pocket Professor</span>
            </button>
          </div>
        </header>

        <main className="p-8 max-w-[90rem] mx-auto relative z-10">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'clients' && <ClientRoster clients={clients} onSelect={loadClientIntoGenerator} />}
          {activeTab === 'generator' && <PlanGeneratorForm data={clientData} onChange={handleInputChange} onGenerate={generateTreatmentPlan} error={error} />}
          {activeTab === 'soap' && <SoapNoteGenerator data={soapData} onChange={(e) => setSoapData({...soapData, [e.target.name]: e.target.value})} onGenerate={generateSoapNote} generated={generatedSoap} isLoading={isGenerating} onCopy={copyToClipboard} />}
          {activeTab === 'comms' && <ParentCommsGenerator apiKey={apiKey} onCopy={copyToClipboard} showToast={showToast} />}
          {activeTab === 'ta' && <TaskAnalysisGenerator apiKey={apiKey} onCopy={copyToClipboard} showToast={showToast} />}
          {activeTab === 'plan-view' && <PlanViewer plan={generatedPlan} isLoading={isGenerating} onCopy={() => copyToClipboard(generatedPlan)} onBack={() => setActiveTab('generator')} />}
          {activeTab === 'programs' && <ProgramGenerator data={programData} onChange={handleProgramInputChange} onGenerate={generateProgramSheet} generated={generatedProgram} isLoading={isGenerating} onCopy={copyToClipboard} onExport={(p) => showToast(`Exported to ${p}`)} />}
          {activeTab === 'library' && <ClinicalLibrary apiKey={apiKey} showToast={showToast} onCopy={copyToClipboard} />}
          {activeTab === 'toolbox' && <ClinicalToolbox onOpenModal={setActiveModal} />}
          {activeTab === 'ai-learner' && <AICoach apiKey={apiKey} showToast={showToast} />}
        </main>
      </div>

      {/* Persistent AI Copilot Panel */}
      {isCopilotOpen && (
        <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col z-50 animate-in slide-in-from-right duration-300 shadow-2xl shrink-0">
          <div className="p-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-500/10 rounded-lg"><Bot className="text-indigo-400" size={20} /></div>
              <div><span className="font-bold text-white block leading-tight">Ally Copilot</span><span className="text-[10px] text-slate-400">Trained on 100 yrs of ABA data</span></div>
            </div>
            <button onClick={() => setIsCopilotOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
            {copilotMessages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'ai' ? 'items-start' : 'items-end'}`}>
                <div className={`px-4 py-3 rounded-2xl max-w-[90%] text-sm leading-relaxed ${
                  msg.role === 'ai' ? 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/50 shadow-sm' : 'bg-indigo-600 text-white rounded-tr-none shadow-md'
                }`}>
                  {msg.isLoading ? <Loader2 size={16} className="animate-spin text-indigo-400" /> : msg.text}
                </div>
              </div>
            ))}
            <div ref={copilotEndRef} />
          </div>

          <div className="p-4 bg-slate-950/80 backdrop-blur border-t border-slate-800">
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-inner">
              <input
                type="text"
                value={copilotInput}
                onChange={(e) => setCopilotInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()}
                placeholder="Ask your pocket professor..."
                className="flex-1 bg-transparent border-none text-sm text-slate-200 px-2 py-2 focus:outline-none"
              />
              <button onClick={handleCopilotSend} className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors">
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Navigation Item Component ---
function NavItem({ icon, label, active, onClick, badge, badgeColor="emerald" }) {
  const bColor = badgeColor === 'indigo' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-slate-950';
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${active ? 'bg-slate-800/80 text-white border border-slate-700/50 shadow-sm' : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200 border border-transparent'}`}>
      <div className="flex items-center space-x-3">
        <div className={`${active ? (badgeColor==='indigo'?'text-indigo-400':'text-emerald-400') : 'group-hover:text-slate-200 transition-colors'}`}>{icon}</div>
        <span className="font-medium text-sm tracking-wide">{label}</span>
      </div>
      {badge && <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? bColor : 'bg-slate-700 text-slate-300'}`}>{badge}</span>}
    </button>
  );
}

// --- MODULE COMPONENTS ---

function Dashboard({ onNavigate }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-950 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <Bot className="mr-3 text-indigo-400" size={28} /> Welcome to Pocket BCBA
            </h2>
            <p className="text-slate-400 text-sm max-w-md">Your Master Build BCBA Assistant. Powered by a 10,000+ document behavioral library.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <QuickActionButton icon={<BookOpen size={24}/>} label="Expert Library" onClick={() => onNavigate('library')} />
        <QuickActionButton icon={<FileText size={24}/>} label="Tx Plans" onClick={() => onNavigate('generator')} />
        <QuickActionButton icon={<Database size={24}/>} label="Program Creator" onClick={() => onNavigate('programs')} />
        <QuickActionButton icon={<Users size={24}/>} label="Caseload" onClick={() => onNavigate('clients')} />
      </div>
    </div>
  );
}

function QuickActionButton({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-6 bg-slate-900/50 hover:bg-indigo-500/10 border border-slate-800 hover:border-indigo-500/30 rounded-2xl text-slate-300 hover:text-indigo-400 transition-all shadow-lg hover:shadow-indigo-500/10">
      <div className="mb-3">{icon}</div><span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function ClientRoster({ clients, onSelect }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div><h2 className="text-2xl font-bold text-white">Active Caseload</h2><p className="text-slate-400 text-sm mt-1">Manage auths and trigger workflows.</p></div>
        <button className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"><Plus size={16}/><span>Add Client</span></button>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400"><th className="p-4 pl-6">Client</th><th className="p-4">Auth Expiry</th><th className="p-4">Status</th><th className="p-4 text-right pr-6">Actions</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="p-4 pl-6 font-medium text-slate-200">{client.initials} <span className="text-xs text-slate-500 block">{client.diagnosis}</span></td>
                <td className="p-4 text-slate-300">{client.authExpiry}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-medium border ${client.status==='Active'?'bg-emerald-500/10 text-emerald-400 border-emerald-500/20':'bg-red-500/10 text-red-400 border-red-500/20'}`}>{client.status}</span></td>
                <td className="p-4 text-right pr-6">
                  <button onClick={() => onSelect(client.id)} className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">Draft Plan</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PlanGeneratorForm({ data, onChange, onGenerate, error }) {
  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-500">
      <div><h2 className="text-2xl font-bold text-white mb-2">2026 Treatment Plan Synthesizer</h2><p className="text-slate-400 text-sm">Input data. Your Pocket Professor will construct a bulletproof, 2026 compliant plan.</p></div>
      {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-center"><AlertCircle size={18} className="mr-2"/> <span className="text-sm font-medium">{error}</span></div>}

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="flex space-x-6 mb-4">
          <label className="flex items-center space-x-2 text-sm text-emerald-400 font-bold cursor-pointer"><input type="checkbox" name="includeAssent" checked={data.includeAssent} onChange={onChange} className="rounded bg-slate-900 border-slate-700 text-emerald-500"/><span>Assent-Based Criteria</span></label>
          <label className="flex items-center space-x-2 text-sm text-indigo-400 font-bold cursor-pointer"><input type="checkbox" name="traumaInformed" checked={data.traumaInformed} onChange={onChange} className="rounded bg-slate-900 border-slate-700 text-indigo-500"/><span>Trauma-Informed</span></label>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <InputField label="Initials" name="initials" value={data.initials} onChange={onChange} />
          <InputField label="Age" name="age" value={data.age} onChange={onChange} />
          <InputField label="Diagnosis" name="diagnosis" value={data.diagnosis} onChange={onChange} />
        </div>
        <TextAreaField label="Target Behaviors (Raw Data)" name="behaviors" value={data.behaviors} onChange={onChange} rows={2} />
        <TextAreaField label="Skill Domains" name="skills" value={data.skills} onChange={onChange} rows={2} />
        <TextAreaField label="Caregiver Goals" name="caregiverGoals" value={data.caregiverGoals} onChange={onChange} rows={2} />
      </div>
      <div className="flex justify-end">
        <button onClick={onGenerate} className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition-all"><Sparkles size={18}/><span>Synthesize Plan</span></button>
      </div>
    </div>
  );
}

function PlanViewer({ plan, isLoading, onCopy, onBack }) {
  if (isLoading) return <div className="flex flex-col items-center justify-center h-64 text-emerald-400"><Loader2 size={40} className="animate-spin mb-4"/><b>Synthesizing Data...</b></div>;
  return (
    <div className="max-w-4xl space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
        <button onClick={onBack} className="text-slate-400 hover:text-white text-sm flex items-center"><ChevronRight className="rotate-180 mr-1" size={16}/> Back</button>
        <button onClick={onCopy} className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center"><Save size={16} className="mr-2"/> Copy to Clipboard</button>
      </div>
      <div className="bg-slate-900/50 p-8 rounded-2xl border border-slate-800 prose prose-invert max-w-none text-slate-300">
        {plan ? <div>{renderMarkdown(plan)}</div> : "No plan generated."}
      </div>
    </div>
  );
}

// --- NEW MODULE: CLINICAL & INSURANCE COMPENDIUM ---
function ClinicalLibrary({ apiKey, showToast, onCopy }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const searchLibrary = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    setResults('');

    const userPrompt = `Search query: ${query}\n\nAct as a 10,000+ document semantic search engine. Search your knowledge base of the 2026 BACB Ethics Code, ABA CPT Medical Billing Codes, Tricare/Medicaid ABA requirements, and 100 years of JABA/JEAB behavioral literature. Provide a highly detailed, deeply researched, and authoritative answer. Cite sources, code numbers, or authors where applicable.`;
    const systemPrompt = "You are the BehaviorAlly Expert Library Engine. You possess infinite, highly accurate knowledge regarding Applied Behavior Analysis, medical necessity criteria, and ethics.";

    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) setResults(text);
      else throw new Error("Search failed.");
    } catch { showToast("Library search failed due to network error.", "error"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-6xl space-y-6 animate-in fade-in h-full flex flex-col">
      <div>
        <h2 className="text-3xl font-black text-white mb-2 flex items-center"><BookOpen className="mr-3 text-indigo-400" size={32}/> Expert Insurance & Clinical Library</h2>
        <p className="text-slate-400 text-sm max-w-3xl">Search a simulated database of over 10,000+ documents including Tricare/Medicaid Medical Necessity manuals, the 2026 BACB Ethics code, CPT coding guidelines, and deep behavioral science literature.</p>
      </div>

      <div className="flex items-center bg-slate-900/80 border-2 border-slate-700 rounded-2xl px-4 py-2 focus-within:border-indigo-500 transition-colors shadow-lg">
        <Search className="text-slate-500 mr-3" size={24} />
        <input
          type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchLibrary()}
          placeholder="e.g. What are the CPT codes for concurrent billing of 97153 and 97155?"
          className="flex-1 bg-transparent border-none text-lg text-white py-3 focus:outline-none"
        />
        <button onClick={searchLibrary} disabled={isLoading || !query} className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : "Deep Search"}
        </button>
      </div>

      <div className="flex-1 bg-slate-950 border border-slate-800 rounded-3xl flex flex-col overflow-hidden shadow-2xl relative">
         <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center z-10">
           <h3 className="font-bold text-white flex items-center"><Database size={16} className="mr-2 text-indigo-400"/> Library Extraction Results</h3>
           {results && <button onClick={() => onCopy(results)} className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center"><Save size={14} className="mr-2" /> Copy Extraction</button>}
         </div>
         <div className="p-8 overflow-y-auto prose prose-invert max-w-none text-sm leading-relaxed custom-scrollbar">
           {isLoading ? (
             <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4"><Loader2 size={40} className="animate-spin" /><span className="font-medium animate-pulse tracking-widest uppercase text-xs">Querying 10,000+ Documents...</span></div>
           ) : results ? (
             <div>{renderMarkdown(results)}</div>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-slate-600"><BookOpen size={64} className="mb-4 opacity-20" /><p className="text-lg">Database Ready.</p></div>
           )}
         </div>
      </div>
    </div>
  );
}

// --- LLM GENERATORS (Soap, Comms, TA, Program Creator) ---
function SoapNoteGenerator({ data, onChange, onGenerate, generated, isLoading, onCopy }) {
  return (
    <div className="max-w-6xl flex gap-6 animate-in fade-in h-full">
      <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
        <h3 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center"><Edit3 className="mr-2 text-indigo-400" size={20} /> Session Details</h3>
        <p className="text-slate-400 text-xs mb-4">Paste your raw shorthand notes. The AI will format them into an insurance-compliant SOAP structure.</p>
        <InputField label="Client Initials" name="clientInitials" value={data.clientInitials} onChange={onChange} placeholder="e.g. J.D." />
        <InputField label="Session Length" name="sessionLength" value={data.sessionLength} onChange={onChange} placeholder="e.g. 120 mins" />
        <TextAreaField label="Raw Shorthand Notes" name="rawNotes" value={data.rawNotes} onChange={onChange} placeholder="e.g. hit peer 3x. worked on FCT for breaks..." rows={8} />
        <button onClick={onGenerate} disabled={isLoading || !data.rawNotes} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex justify-center items-center transition-all shadow-[0_0_15px_rgba(99,102,241,0.2)]">
          {isLoading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Sparkles size={18} className="mr-2"/>} Synthesize SOAP Note
        </button>
      </div>
      <div className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Generated Medical Record</h3>
          {generated && <button onClick={() => onCopy(generated)} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center"><Save size={14} className="mr-2" /> Copy for EHR</button>}
        </div>
        <div className="p-8 overflow-y-auto prose prose-invert max-w-none text-sm custom-scrollbar">
          {isLoading ? <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4"><Loader2 size={32} className="animate-spin" /><span className="font-medium animate-pulse">Structuring clinical narrative...</span></div> : generated ? <div>{renderMarkdown(generated)}</div> : <div className="h-full flex flex-col items-center justify-center text-slate-600"><Edit3 size={48} className="mb-4 opacity-30" /><p>Awaiting raw notes...</p></div>}
        </div>
      </div>
    </div>
  );
}

function ParentCommsGenerator({ apiKey, showToast, onCopy }) {
  const [data, setData] = useState({ clientInitials: '', tone: 'Empathetic & Supportive', rawNotes: '' });
  const [generated, setGenerated] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!data.rawNotes) { showToast("Please enter incident details.", "error"); return; }
    setIsLoading(true);
    setGenerated('');
    const userPrompt = `Client: ${data.clientInitials}\nTone: ${data.tone}\nIncident Notes:\n${data.rawNotes}\n\nDraft an email to the caregiver. Translate behavioral jargon into empathetic, objective English. Do not blame the child.`;
    const systemPrompt = "You are an empathetic, highly professional BCBA communicating with parents.";
    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) { setGenerated(text); showToast("Email drafted!"); }
    } catch { showToast("Failed to draft email.", "error"); } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-6xl flex gap-6 animate-in fade-in h-full">
      <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
        <h3 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center"><Mail className="mr-2 text-blue-400" size={20} /> Parent Comms AI</h3>
        <p className="text-slate-400 text-xs mb-4">Translate rigid objective behavioral data into empathetic emails for parents.</p>
        <InputField label="Client Initials" name="clientInitials" value={data.clientInitials} onChange={(e) => setData({...data, clientInitials: e.target.value})} placeholder="e.g. J.D." />
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Communication Tone</label>
          <select value={data.tone} onChange={(e) => setData({...data, tone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-blue-500">
            <option>Empathetic & Supportive</option><option>Direct Incident Report</option><option>Celebratory & Positive</option><option>Collaboration Request</option>
          </select>
        </div>
        <TextAreaField label="Clinical Notes / Incident Details" name="rawNotes" value={data.rawNotes} onChange={(e) => setData({...data, rawNotes: e.target.value})} placeholder="e.g. J.D. engaged in 4 instances of SIB..." rows={6} />
        <button onClick={handleGenerate} disabled={isLoading || !data.rawNotes} className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex justify-center items-center transition-all">{isLoading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Sparkles size={18} className="mr-2"/>} Draft Email</button>
      </div>
      <div className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Generated Communication</h3>
          {generated && <button onClick={() => onCopy(generated)} className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/40 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center"><Save size={14} className="mr-2" /> Copy</button>}
        </div>
        <div className="p-8 overflow-y-auto prose prose-invert max-w-none text-sm custom-scrollbar">
          {isLoading ? <div className="h-full flex flex-col items-center justify-center text-blue-400 space-y-4"><Loader2 size={32} className="animate-spin" /><span className="font-medium animate-pulse">Translating jargon...</span></div> : generated ? <div>{renderMarkdown(generated)}</div> : <div className="h-full flex flex-col items-center justify-center text-slate-600"><Mail size={48} className="mb-4 opacity-30" /><p>Awaiting input...</p></div>}
        </div>
      </div>
    </div>
  );
}

function TaskAnalysisGenerator({ apiKey, showToast, onCopy }) {
  const [data, setData] = useState({ skill: '', level: 'Intermediate Learner', chaining: 'Forward Chaining' });
  const [generated, setGenerated] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async () => {
    if (!data.skill) { showToast("Please enter a target skill.", "error"); return; }
    setIsLoading(true);
    setGenerated('');
    const userPrompt = `Target Skill: ${data.skill}\nLearner Level: ${data.level}\nPreferred Chaining Method: ${data.chaining}\n\nPlease generate a highly detailed, step-by-step Task Analysis (TA) for this skill tailored to this learner's level. Include prerequisite skills, materials needed, and the numbered micro-steps. Format beautifully in markdown.`;
    const systemPrompt = "You are a BCBA writing precise and granular task analyses for skill acquisition programs. Break down complex behavior chains logically.";
    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) { setGenerated(text); showToast("Task Analysis Generated!"); }
    } catch { showToast("Failed to generate TA.", "error"); } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-6xl flex gap-6 animate-in fade-in h-full">
      <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
        <h3 className="font-bold text-white border-b border-slate-800 pb-2 flex items-center"><ListTodo className="mr-2 text-indigo-400" size={20} /> Task Analysis AI</h3>
        <p className="text-slate-400 text-xs mb-4">Automatically break down complex life skills into distinct, teachable micro-steps for TA programs.</p>
        <InputField label="Target Skill / Behavior Chain" name="skill" value={data.skill} onChange={(e) => setData({...data, skill: e.target.value})} placeholder="e.g. Washing Hands" />
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Learner Functioning Level</label>
          <select value={data.level} onChange={(e) => setData({...data, level: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>Beginner (Highly granular micro-steps)</option><option>Intermediate Learner</option><option>Advanced Learner (Chunked steps)</option>
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Chaining Method Preference</label>
          <select value={data.chaining} onChange={(e) => setData({...data, chaining: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>Forward Chaining</option><option>Backward Chaining</option><option>Total Task Presentation</option>
          </select>
        </div>
        <button onClick={handleGenerate} disabled={isLoading || !data.skill} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex justify-center items-center transition-all">{isLoading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Sparkles size={18} className="mr-2"/>} Break Down Skill</button>
      </div>
      <div className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Generated TA Sheet</h3>
          {generated && <button onClick={() => onCopy(generated)} className="bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/40 px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center"><Save size={14} className="mr-2" /> Copy</button>}
        </div>
        <div className="p-8 overflow-y-auto prose prose-invert max-w-none text-sm custom-scrollbar">
          {isLoading ? <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4"><Loader2 size={32} className="animate-spin" /><span className="font-medium animate-pulse">Analyzing behavior chain...</span></div> : generated ? <div>{renderMarkdown(generated)}</div> : <div className="h-full flex flex-col items-center justify-center text-slate-600"><ListTodo size={48} className="mb-4 opacity-30" /><p>Awaiting input...</p></div>}
        </div>
      </div>
    </div>
  );
}

function ProgramGenerator({ data, onChange, onGenerate, generated, isLoading, onCopy, onExport }) {
  return (
    <div className="max-w-6xl flex gap-6 animate-in fade-in h-full">
      <div className="w-1/3 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4 h-fit">
        <h3 className="font-bold text-white border-b border-slate-800 pb-2">Program Parameters</h3>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Domain</label>
          <select name="domain" value={data.domain} onChange={onChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>Communication</option>
            <option>Social Skills</option>
            <option>Adaptive / Daily Living</option>
            <option>Play & Leisure</option>
            <option>Motor Skills</option>
            <option>Executive Functioning</option>
          </select>
        </div>

        <InputField label="Target Skill" name="target" value={data.target} onChange={onChange} placeholder="e.g., Tacting colors, Hand washing..." />

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Teaching Method</label>
          <select name="type" value={data.type} onChange={onChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>DTT (Discrete Trial Training)</option>
            <option>NET (Natural Environment Teaching)</option>
            <option>TA (Task Analysis / Chaining)</option>
            <option>Shaping</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Prompting Strategy</label>
          <select name="promptStrategy" value={data.promptStrategy} onChange={onChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>Least-to-Most (LTM)</option>
            <option>Most-to-Least (MTL)</option>
            <option>Errorless (0s Time Delay)</option>
            <option>Progressive Time Delay</option>
            <option>Graduated Guidance</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400">Mastery Criteria</label>
          <select name="mastery" value={data.mastery} onChange={onChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500">
            <option>80% across 3 consecutive sessions</option>
            <option>90% across 2 consecutive sessions</option>
            <option>100% across 2 consecutive sessions</option>
            <option>First Trial Data (80% over 3 days)</option>
          </select>
        </div>

        <button onClick={onGenerate} disabled={isLoading || !data.target} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white py-3 rounded-xl font-bold flex justify-center items-center transition-all"><Database size={18} className="mr-2"/> Generate CR Protocol</button>
      </div>
      <div className="w-2/3 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-white">Generated CentralReach Protocol</h3>
          {generated && (
            <div className="flex space-x-2">
              <button onClick={() => onExport('CentralReach')} className="bg-emerald-600/20 text-emerald-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-600/30 flex items-center"><Download size={14} className="mr-1"/> Export</button>
              <button onClick={() => onCopy(generated)} className="bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-slate-700">Copy</button>
            </div>
          )}
        </div>
        <div className="p-8 overflow-y-auto prose prose-invert text-sm max-w-none custom-scrollbar">
          {isLoading ? <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4"><Loader2 size={32} className="animate-spin" /><span className="font-medium animate-pulse">Structuring CentralReach protocol...</span></div> : generated ? <div>{renderMarkdown(generated)}</div> : <div className="h-full flex flex-col items-center justify-center text-slate-600"><Database size={48} className="mb-4 opacity-30" /><p>Awaiting parameters...</p></div>}
        </div>
      </div>
    </div>
  );
}

function AICoach({ apiKey, showToast }) {
  const [clinicalText, setClinicalText] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReview = async () => {
    if (!clinicalText) return;
    setIsLoading(true);
    const userPrompt = `Review this clinical text (goal, BIP, or operational definition):\n\n${clinicalText}\n\nCritique it for: 1. Dead Man's Test. 2. Objectivity. 3. 2026 BACB Ethics (assent/trauma). Then suggest an improved rewrite.`;
    const systemPrompt = "You are a strict, highly ethical BCBA-D clinical supervisor.";
    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) { setFeedback(text); showToast("Peer review complete."); }
    } catch { showToast("Failed to run peer review.", "error"); } finally { setIsLoading(false); }
  };

  return (
    <div className="max-w-5xl space-y-6 animate-in fade-in h-full flex flex-col">
      <div><h2 className="text-2xl font-bold text-white">AI Clinical Coach & Peer Review</h2><p className="text-slate-400">Monitoring Treatment Integrity and actively auditing your clinical writing.</p></div>
      <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center space-x-6">
        <div className="p-4 bg-emerald-500/10 rounded-full text-emerald-400"><CheckCircle2 size={32} /></div>
        <div><h3 className="text-lg font-bold text-emerald-400 mb-1">Global Alignment Score: 94%</h3><p className="text-slate-300 text-sm">The AI has analyzed your past edits and learned your preference for DRA over DRO.</p></div>
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 min-h-0">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <h3 className="font-bold text-white mb-2 flex items-center"><UserCheck className="mr-2 text-indigo-400"/> AI Peer Review Request</h3>
          <p className="text-xs text-slate-400 mb-4">Paste a goal, operational definition, or BIP snippet here. The LLM will audit it against 2026 BACB standards.</p>
          <textarea value={clinicalText} onChange={(e)=>setClinicalText(e.target.value)} className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-none mb-4 custom-scrollbar" placeholder="e.g. J.D. will stop crying..."></textarea>
          <button onClick={handleReview} disabled={isLoading || !clinicalText} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex justify-center items-center disabled:opacity-50">{isLoading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Sparkles size={18} className="mr-2"/>} Run Clinical Audit</button>
        </div>
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 overflow-y-auto prose prose-invert text-sm custom-scrollbar">
          {isLoading ? <div className="h-full flex flex-col items-center justify-center text-indigo-400 space-y-4"><Loader2 size={32} className="animate-spin" /><span className="font-medium animate-pulse">Auditing compliance...</span></div> : feedback ? <div>{renderMarkdown(feedback)}</div> : <div className="h-full flex flex-col items-center justify-center text-slate-600"><Target size={48} className="mb-4 opacity-30" /><p>Awaiting text...</p></div>}
        </div>
      </div>
    </div>
  );
}

// --- CLINICAL TOOLBOX & MODALS ---
function ClinicalToolbox({ onOpenModal }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 h-full">
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8"><h2 className="text-3xl font-black text-white flex items-center"><Zap className="mr-3 text-indigo-400" size={32} /> Advanced Clinical Toolbox</h2><p className="text-slate-400 mt-2">Powered by 100 years of Applied Behavior Analysis.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ToolCard title="ABC Data Analyzer" desc="Paste raw ABC narrative data. The AI will extract patterns and hypothesize the behavioral function." icon={<Database size={24}/>} color="indigo" onLaunch={() => onOpenModal('abc')} />
        <ToolCard title="Matching Law Modeler" desc="Calculate relative rates of responding across concurrent schedules of reinforcement." icon={<BarChart2 size={24}/>} color="emerald" onLaunch={() => onOpenModal('matching')} />
        <ToolCard title="FA Synthesizer" desc="Determine behavioral function and isolate variables based on Iwata et al. (1982/1994)." icon={<Activity size={24}/>} color="purple" onLaunch={() => onOpenModal('fa')} />
        <ToolCard title="RFT Matrix Builder" desc="Build relational frames (Coordination) and generate derived relational responding targets." icon={<Network size={24}/>} color="indigo" onLaunch={() => onOpenModal('rft')} />
      </div>
    </div>
  );
}

function ToolCard({ title, desc, icon, color, onLaunch }) {
  const colorMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 hover:border-indigo-500/30 hover:bg-indigo-600',
    emerald: 'text-emerald-400 bg-emerald-500/10 hover:border-emerald-500/30 hover:bg-emerald-600',
    purple: 'text-purple-400 bg-purple-500/10 hover:border-purple-500/30 hover:bg-purple-600'
  };
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col transition-colors group">
      <div className={`p-3 rounded-xl w-fit mb-4 ${colorMap[color].split(' ')[0]} ${colorMap[color].split(' ')[1]}`}>{icon}</div>
      <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 flex-1">{desc}</p>
      <button onClick={onLaunch} className={`w-full bg-slate-800 text-white text-sm font-bold py-3 rounded-xl transition-colors ${colorMap[color].split(' ')[3]}`}>Launch Tool</button>
    </div>
  );
}

function ToolboxModal({ type, onClose, apiKey }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {type === 'abc' && 'ABC Data Pattern Analyzer'}
            {type === 'matching' && 'Matching Law Calculator'}
            {type === 'fa' && 'Functional Analysis Synthesizer'}
            {type === 'rft' && 'Relational Frame Theory Builder'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X size={20}/></button>
        </div>
        <div className="p-8">
          {type === 'abc' && <ABCAnalyzer apiKey={apiKey} />}
          {type === 'matching' && <MatchingLawCalc />}
          {type === 'fa' && <FAGrapher />}
          {type === 'rft' && <RFTBuilder />}
        </div>
      </div>
    </div>
  );
}

function MatchingLawCalc() {
  const [r1, setR1] = useState(10);
  const [r2, setR2] = useState(2);

  const totalR = r1 + r2;
  const b1 = totalR > 0 ? (r1 / totalR) * 100 : 0;
  const b2 = totalR > 0 ? (r2 / totalR) * 100 : 0;

  return (
    <div className="space-y-6">
      <p className="text-slate-400 text-sm">Input the rate of reinforcement for two concurrent schedules to predict choice behavior distribution.</p>
      <div className="grid grid-cols-2 gap-6">
        <div><label className="text-xs font-bold text-slate-500 uppercase">Rate of Reinforcement 1 (R1)</label><input type="number" min="0" value={r1} onChange={e=>setR1(Number(e.target.value))} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"/></div>
        <div><label className="text-xs font-bold text-slate-500 uppercase">Rate of Reinforcement 2 (R2)</label><input type="number" min="0" value={r2} onChange={e=>setR2(Number(e.target.value))} className="w-full mt-2 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-indigo-500 outline-none"/></div>
      </div>
      <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
        <h4 className="text-white font-bold mb-4">Predicted Behavioral Distribution</h4>
        <div className="w-full h-8 flex rounded-lg overflow-hidden font-bold text-xs text-white bg-slate-800">
          {b1 > 0 && <div className="bg-indigo-500 flex items-center justify-center transition-all duration-500 whitespace-nowrap overflow-hidden" style={{width: `${b1}%`}}>B1 ({b1.toFixed(1)}%)</div>}
          {b2 > 0 && <div className="bg-slate-600 flex items-center justify-center transition-all duration-500 whitespace-nowrap overflow-hidden" style={{width: `${b2}%`}}>B2 ({b2.toFixed(1)}%)</div>}
        </div>
      </div>
    </div>
  );
}

function FAGrapher() {
  const [ran, setRan] = useState(false);
  return (
    <div className="space-y-6 text-center">
      <p className="text-slate-400 text-sm">Simulate a multi-element experimental design based on Iwata&apos;s FA methodology.</p>
      <div className="h-48 bg-slate-950 border border-slate-800 rounded-2xl flex items-end justify-center space-x-6 p-6 pb-10 relative">
        <div className="absolute left-4 top-4 text-xs font-bold text-slate-500 -rotate-90 origin-left">Responses per Min</div>
        <div className="flex flex-col items-center w-12"><div className={`w-full bg-slate-600 rounded-t-md transition-all duration-1000 ${ran ? 'h-8' : 'h-2'}`}></div><span className="text-[10px] text-slate-400 mt-2 absolute bottom-2">Play</span></div>
        <div className="flex flex-col items-center w-12"><div className={`w-full bg-blue-500 rounded-t-md transition-all duration-1000 ${ran ? 'h-12' : 'h-2'}`}></div><span className="text-[10px] text-slate-400 mt-2 absolute bottom-2">Alone</span></div>
        <div className="flex flex-col items-center w-12"><div className={`w-full bg-yellow-500 rounded-t-md transition-all duration-1000 ${ran ? 'h-16' : 'h-2'}`}></div><span className="text-[10px] text-slate-400 mt-2 absolute bottom-2">Attention</span></div>
        <div className="flex flex-col items-center w-12"><div className={`w-full bg-red-500 rounded-t-md transition-all duration-1000 ${ran ? 'h-40' : 'h-2'}`}></div><span className="text-[10px] font-bold text-red-400 mt-2 absolute bottom-2">Escape</span></div>
      </div>
      <button onClick={() => setRan(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold transition-colors">Run Simulation</button>
      {ran && <p className="text-emerald-400 text-sm font-bold animate-in fade-in">Clear differentiation observed. Function: Social Negative Reinforcement (Escape).</p>}
    </div>
  );
}

function RFTBuilder() {
  const [a, setA] = useState('Spoken Word "Dog"');
  const [b, setB] = useState('Picture of Dog');
  const [c, setC] = useState('Text "D-O-G"');
  const [derived, setDerived] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <div><label className="text-xs font-bold text-slate-500">Stimulus A</label><input value={a} onChange={e=>setA(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" /></div>
        <div><label className="text-xs font-bold text-slate-500">Stimulus B</label><input value={b} onChange={e=>setB(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" /></div>
        <div><label className="text-xs font-bold text-slate-500">Stimulus C</label><input value={c} onChange={e=>setC(e.target.value)} className="w-full mt-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" /></div>
      </div>

      {!derived ? (
         <button onClick={()=>setDerived(true)} className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-bold transition-colors">Derive Relations</button>
      ) : (
        <div className="bg-slate-950 p-6 rounded-2xl border border-purple-500/30 animate-in zoom-in-95 space-y-4">
          <h4 className="text-white font-bold mb-2">Derived Relational Responding:</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800"><span className="text-slate-400 text-xs block mb-1">Mutual Entailment (Symmetry)</span><span className="text-purple-400 font-bold">{b} = {a}</span><br/><span className="text-purple-400 font-bold">{c} = {b}</span></div>
            <div className="bg-slate-900 p-3 rounded-lg border border-slate-800"><span className="text-slate-400 text-xs block mb-1">Combinatorial Entailment</span><span className="text-emerald-400 font-bold">{a} = {c}</span> (Transitivity)<br/><span className="text-emerald-400 font-bold">{c} = {a}</span> (Equivalence)</div>
          </div>
          <button onClick={()=>setDerived(false)} className="text-slate-400 text-xs hover:text-white underline w-full text-center mt-2">Reset Frame</button>
        </div>
      )}
    </div>
  );
}

function ABCAnalyzer({ apiKey }) {
  const [abcData, setAbcData] = useState('');
  const [analysis, setAnalysis] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const analyzeData = async () => {
    if (!abcData.trim()) return;
    setIsLoading(true);

    const userPrompt = `Analyze the following raw ABC (Antecedent-Behavior-Consequence) narrative data:\n\n${abcData}\n\nTask: 1. Identify the most likely hypothesized function(s) of the behavior (Escape, Attention, Access to Tangibles, Sensory/Automatic). 2. Provide a brief summary of the behavioral patterns and maintaining contingencies observed. Format nicely in markdown.`;
    const systemPrompt = "You are an elite Board Certified Behavior Analyst. Analyze raw behavioral data accurately and provide clinical insights based on operant conditioning.";

    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) setAnalysis(text);
    } catch {
      setAnalysis("Error analyzing data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!analysis ? (
        <>
          <p className="text-slate-400 text-sm">Paste your unstructured ABC narrative data below. The LLM will identify contingencies and hypothesize behavioral function.</p>
          <textarea
            value={abcData} onChange={(e) => setAbcData(e.target.value)}
            placeholder="e.g. A: Told to do math. B: Ripped paper. C: Sent to hall.&#10;A: Peer took toy. B: Hit peer. C: Got toy back."
            className="w-full h-40 bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-sm focus:border-indigo-500 outline-none resize-y custom-scrollbar"
          />
          <button onClick={analyzeData} disabled={isLoading || !abcData} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center">
            {isLoading ? <Loader2 size={18} className="animate-spin mr-2"/> : <Sparkles size={18} className="mr-2"/>} Extract Patterns
          </button>
        </>
      ) : (
        <div className="space-y-4">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 max-h-80 overflow-y-auto prose prose-invert text-sm custom-scrollbar">
            <div>{renderMarkdown(analysis)}</div>
          </div>
          <button onClick={() => setAnalysis('')} className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-3 rounded-xl transition-colors">Analyze New Data</button>
        </div>
      )}
    </div>
  );
}

// --- SMALL FORM HELPERS ---
function InputField({ label, name, value, onChange, placeholder }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-400">{label}</label>
      <input type="text" name={name} value={value} onChange={onChange} placeholder={placeholder} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-slate-200 text-sm focus:outline-none focus:border-indigo-500" />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, placeholder, rows }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-400">{label}</label>
      <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 text-sm focus:outline-none focus:border-indigo-500 resize-y custom-scrollbar" />
    </div>
  );
}
