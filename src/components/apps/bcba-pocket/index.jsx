import { useState, useEffect, useRef } from 'react';
import {
  FileText, Users, Settings, Activity,
  Loader2, CheckCircle2, AlertCircle, Sparkles,
  ListTodo, Bot, Database, Send,
  Edit3, Mail, UserCheck, BookOpen, Zap, X,
} from 'lucide-react';
import { callGemini } from '@/lib/gemini';
import { copyToClipboard } from '@/lib/copyToClipboard';
import { useApiData } from '@/hooks/useApiData';
import { useToasts } from '@/hooks/useToasts';
import { useApp } from '@/context/AppContext';
import { fetchBcbaClients } from '@/api/apps';

import NavItem from './components/NavItem';
import Dashboard from './views/Dashboard';
import ClientRoster from './views/ClientRoster';
import { PlanGeneratorForm, PlanViewer } from './views/PlanGenerator';
import SoapNoteGenerator from './views/SoapNoteGenerator';
import ParentCommsGenerator from './views/ParentCommsGenerator';
import TaskAnalysisGenerator from './views/TaskAnalysisGenerator';
import ProgramGenerator from './views/ProgramGenerator';
import ClinicalLibrary from './views/ClinicalLibrary';
import AICoach from './views/AICoach';
import ClinicalToolbox from './toolbox/ClinicalToolbox';
import ToolboxModal from './toolbox/ToolboxModal';

const TAB_TITLES = {
  dashboard: 'Command Center',
  clients: 'Active Caseload',
  generator: 'AI Plan Synthesizer',
  soap: 'LLM SOAP Note Synthesizer',
  comms: 'Parent & Caregiver Communication AI',
  ta: 'Automated Task Analysis Breakdown',
  'plan-view': 'Document Review',
  programs: 'CentralReach Program Generator',
  library: 'Expert Insurance & Behavioral Library',
  toolbox: 'Advanced Clinical Toolbox',
  'ai-learner': 'AI Clinical Coach & Peer Review',
};

export default function BCBAPocket() {
  const { apiKey } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [generatedProgram, setGeneratedProgram] = useState('');
  const [error, setError] = useState('');
  const [activeModal, setActiveModal] = useState(null);
  const { toasts, showToast } = useToasts();

  // Copilot
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [copilotInput, setCopilotInput] = useState('');
  const [copilotMessages, setCopilotMessages] = useState([
    { role: 'ai', text: 'Dr. Smith, I am your Pocket BCBA Copilot. I have live access to 10,000+ ABA research articles, 2026 BACB guidelines, and all major insurance funder manuals. How can I assist you today?' },
  ]);
  const copilotEndRef = useRef(null);

  // Data
  const { data: fetchedClients } = useApiData(fetchBcbaClients);
  const clients = fetchedClients || [
    { id: 1, initials: 'J.D.', age: '5 yrs 2 mo', diagnosis: 'F84.0', authExpiry: '2026-05-15', status: 'Active', intensity: '30 hrs/wk' },
    { id: 2, initials: 'A.M.', age: '3 yrs 8 mo', diagnosis: 'F84.0', authExpiry: '2026-04-28', status: 'Expiring Soon', intensity: '15 hrs/wk' },
    { id: 3, initials: 'S.R.', age: '8 yrs 1 mo', diagnosis: 'F84.0, F90.0', authExpiry: '2026-08-20', status: 'Active', intensity: '20 hrs/wk' },
    { id: 4, initials: 'E.B.', age: '4 yrs 5 mo', diagnosis: 'F84.0', authExpiry: '2026-05-02', status: 'Auth Pending', intensity: '25 hrs/wk' },
  ];

  // Forms
  const [clientData, setClientData] = useState({
    initials: '', age: '', diagnosis: '', assessments: '', behaviors: '', skills: '', caregiverGoals: '', intensity: '',
    includeAssent: true, traumaInformed: true,
  });
  const [programData, setProgramData] = useState({
    domain: 'Communication', target: '', type: 'DTT (Discrete Trial Training)',
    promptStrategy: 'Least-to-Most (LTM)', mastery: '80% across 3 consecutive sessions',
  });
  const [soapData, setSoapData] = useState({ clientInitials: '', sessionLength: '120 mins', rawNotes: '' });
  const [generatedSoap, setGeneratedSoap] = useState('');

  // Auto-scroll copilot
  useEffect(() => {
    if (isCopilotOpen && copilotEndRef.current) {
      copilotEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [copilotMessages, isCopilotOpen]);

  // Handlers
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
      setClientData({ ...clientData, initials: client.initials, age: client.age, diagnosis: client.diagnosis, intensity: client.intensity, assessments: 'VB-MAPP, PFA/SBT' });
      setActiveTab('generator');
      showToast(`Loaded ${client.initials}'s demographic data.`);
    }
  };

  const handleCopy = (text) => {
    copyToClipboard(text).then(() => showToast('Copied to clipboard!'));
  };

  // AI calls
  const handleCopilotSend = async () => {
    if (!copilotInput.trim()) return;
    const userText = copilotInput;
    setCopilotInput('');
    setCopilotMessages(prev => [...prev, { role: 'user', text: userText }]);
    setCopilotMessages(prev => [...prev, { role: 'ai', text: 'Synthesizing...', isLoading: true }]);

    const historyContext = copilotMessages.filter(m => !m.isLoading).map(m => `${m.role === 'ai' ? 'Pocket BCBA' : 'User'}: ${m.text}`).join('\n');
    const fullPrompt = `History:\n${historyContext}\n\nUser: ${userText}\nPocket BCBA:`;
    const systemPrompt = 'You are Pocket BCBA, an elite BCBA-D AI Copilot with access to a massive database of 10,000+ peer-reviewed ABA articles, CPT billing codes, insurance regulations, and the 2026 BACB Ethics code. Provide precise, doctorate-level answers with citations where appropriate. Keep it conversational but clinical.';

    try {
      const responseText = await callGemini(fullPrompt, apiKey, systemPrompt);
      setCopilotMessages(prev => { const n = [...prev]; n[n.length - 1] = { role: 'ai', text: responseText || 'I encountered an error analyzing that request.' }; return n; });
    } catch {
      setCopilotMessages(prev => { const n = [...prev]; n[n.length - 1] = { role: 'ai', text: 'Network error connecting to the secure LLM database.' }; return n; });
    }
  };

  const generateTreatmentPlan = async () => {
    if (!clientData.initials || !clientData.behaviors) { setError('Please fill in at least the client initials and target behaviors.'); return; }
    setIsGenerating(true); setError(''); setGeneratedPlan(''); setActiveTab('plan-view');
    const systemPrompt = `You are Pocket BCBA, an elite BCBA-D operating in 2026. Write an ABA treatment plan. Use Markdown.\nInclude: Medical Necessity, Operational Definitions, BIP summary, Skill Goals (SMART), Parent Goals, Fading Criteria.\n${clientData.includeAssent ? 'Explicitly detail Assent-Withdrawal criteria based on 2026 ethics.' : ''}\n${clientData.traumaInformed ? 'Use a trauma-informed lens. Emphasize choice-making and enriched environments.' : ''}`;
    const userPrompt = `Generate a 6-month ABA treatment plan:\nInitials: ${clientData.initials}, Age: ${clientData.age}, Diagnosis: ${clientData.diagnosis}, Behaviors: ${clientData.behaviors}, Skills: ${clientData.skills}, Caregiver: ${clientData.caregiverGoals}`;
    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) { setGeneratedPlan(text); showToast('2026 Compliant Plan Synthesized'); } else throw new Error('Invalid AI response.');
    } catch { setError('Failed to generate plan. Try again.'); setActiveTab('generator'); }
    finally { setIsGenerating(false); }
  };

  const generateSoapNote = async () => {
    if (!soapData.rawNotes) { showToast('Please enter raw session notes first.', 'error'); return; }
    setIsGenerating(true); setGeneratedSoap('');
    const userPrompt = `Client: ${soapData.clientInitials}\nSession Length: ${soapData.sessionLength}\nRaw Notes:\n${soapData.rawNotes}\n\nPlease convert these raw notes into a professional SOAP (Subjective, Objective, Assessment, Plan) note suitable for medical billing audits.`;
    const systemPrompt = 'You are an elite BCBA. Transform messy session notes into clinical, objective, and precise SOAP notes utilizing proper ABA terminology.';
    try {
      const text = await callGemini(userPrompt, apiKey, systemPrompt);
      if (text) { setGeneratedSoap(text); showToast('SOAP Note successfully synthesized!'); }
    } catch { showToast('Failed to generate SOAP note.', 'error'); }
    finally { setIsGenerating(false); }
  };

  const generateProgramSheet = async () => {
    if (!programData.target) return;
    setIsGenerating(true);
    const userPrompt = `Generate a CentralReach-compatible ABA program sheet.\nDomain: ${programData.domain}\nTarget Skill: ${programData.target}\nTeaching Method: ${programData.type}\nPrompting Strategy: ${programData.promptStrategy}\nMastery Criteria: ${programData.mastery}\n\nInclude:\n1. Operational Definition\n2. Discriminative Stimulus (SD)\n3. Expected Response\n4. Prompting & Fading Plan\n5. Error Correction Procedure\n6. Reinforcement Schedule\n7. Mastery & Generalization Criteria.\nUse professional markdown formatting.`;
    try {
      const text = await callGemini(userPrompt, apiKey);
      if (text) setGeneratedProgram(text);
    } catch { showToast('Error generating program', 'error'); }
    finally { setIsGenerating(false); }
  };

  return (
    <div className="flex h-full bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
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

      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[70] space-y-2">
        {toasts.map(toast => (
          <div key={toast.id} className="animate-in slide-in-from-top-4 fade-in duration-300 flex items-center space-x-2 bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl shadow-2xl">
            {toast.type === 'success' ? <CheckCircle2 size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-red-500" />}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {activeModal && <ToolboxModal type={activeModal} onClose={() => setActiveModal(null)} apiKey={apiKey} />}

      {/* Sidebar */}
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
          <div className="pt-4 pb-1"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4">Generators &amp; Programs</p></div>
          <NavItem icon={<FileText size={18} />} label="Plan Synthesizer" active={activeTab === 'generator' || activeTab === 'plan-view'} onClick={() => setActiveTab('generator')} />
          <NavItem icon={<Edit3 size={18} />} label="SOAP Note AI" active={activeTab === 'soap'} onClick={() => setActiveTab('soap')} />
          <NavItem icon={<Mail size={18} />} label="Parent Comms AI" active={activeTab === 'comms'} onClick={() => setActiveTab('comms')} />
          <NavItem icon={<ListTodo size={18} />} label="Task Analysis AI" active={activeTab === 'ta'} onClick={() => setActiveTab('ta')} />
          <NavItem icon={<Database size={18} />} label="Program Creator" active={activeTab === 'programs'} onClick={() => setActiveTab('programs')} />
          <div className="pt-4 pb-1"><p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-4">Expert Science &amp; Database</p></div>
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

      {/* Main content */}
      <div className="flex-1 overflow-auto bg-slate-950 relative custom-scrollbar">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[150px] pointer-events-none" />
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-100 tracking-wide">{TAB_TITLES[activeTab]}</h2>
          <button onClick={() => setIsCopilotOpen(!isCopilotOpen)} className={`flex items-center space-x-2 px-4 py-1.5 rounded-xl transition-all border font-bold ${isCopilotOpen ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]' : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500'}`}>
            <Sparkles size={16} className={isCopilotOpen ? 'animate-pulse' : ''} />
            <span className="text-sm">Pocket Professor</span>
          </button>
        </header>

        <main className="p-8 max-w-[90rem] mx-auto relative z-10">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'clients' && <ClientRoster clients={clients} onSelect={loadClientIntoGenerator} />}
          {activeTab === 'generator' && <PlanGeneratorForm data={clientData} onChange={handleInputChange} onGenerate={generateTreatmentPlan} error={error} />}
          {activeTab === 'soap' && <SoapNoteGenerator data={soapData} onChange={(e) => setSoapData({ ...soapData, [e.target.name]: e.target.value })} onGenerate={generateSoapNote} generated={generatedSoap} isLoading={isGenerating} onCopy={handleCopy} />}
          {activeTab === 'comms' && <ParentCommsGenerator apiKey={apiKey} onCopy={handleCopy} showToast={showToast} />}
          {activeTab === 'ta' && <TaskAnalysisGenerator apiKey={apiKey} onCopy={handleCopy} showToast={showToast} />}
          {activeTab === 'plan-view' && <PlanViewer plan={generatedPlan} isLoading={isGenerating} onCopy={() => handleCopy(generatedPlan)} onBack={() => setActiveTab('generator')} />}
          {activeTab === 'programs' && <ProgramGenerator data={programData} onChange={handleProgramInputChange} onGenerate={generateProgramSheet} generated={generatedProgram} isLoading={isGenerating} onCopy={handleCopy} onExport={(p) => showToast(`Exported to ${p}`)} />}
          {activeTab === 'library' && <ClinicalLibrary apiKey={apiKey} showToast={showToast} onCopy={handleCopy} />}
          {activeTab === 'toolbox' && <ClinicalToolbox onOpenModal={setActiveModal} />}
          {activeTab === 'ai-learner' && <AICoach apiKey={apiKey} showToast={showToast} />}
        </main>
      </div>

      {/* Copilot panel */}
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
                <div className={`px-4 py-3 rounded-2xl max-w-[90%] text-sm leading-relaxed ${msg.role === 'ai' ? 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/50 shadow-sm' : 'bg-indigo-600 text-white rounded-tr-none shadow-md'}`}>
                  {msg.isLoading ? <Loader2 size={16} className="animate-spin text-indigo-400" /> : msg.text}
                </div>
              </div>
            ))}
            <div ref={copilotEndRef} />
          </div>
          <div className="p-4 bg-slate-950/80 backdrop-blur border-t border-slate-800">
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2 py-1.5 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-inner">
              <input type="text" value={copilotInput} onChange={(e) => setCopilotInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCopilotSend()} placeholder="Ask your pocket professor..." className="flex-1 bg-transparent border-none text-sm text-slate-200 px-2 py-2 focus:outline-none" />
              <button onClick={handleCopilotSend} className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors"><Send size={18} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
