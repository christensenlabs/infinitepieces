import React, { useState } from 'react';
import {
  BrainCircuit, BookOpen, Library, Save, Loader2, AlertCircle,
  ClipboardList, FileSearch,
  Menu, Lightbulb, Users,
  Globe, ShieldCheck,
  Camera, Languages,
  Book, FileText, ListTodo, HeartHandshake, GraduationCap, Zap
} from 'lucide-react';
import { callGemini } from '../../../lib/gemini';
import { useApiData } from '../../../hooks/useApiData';
import { fetchRbtMentorClients, fetchRbtMentorPermissions } from '../../../api/apps';

import { infiniteClinicalCore, tabTitles, fullBehaviorTemplates } from './constants';

import NavItem from './components/NavItem';
import SafeSnapView from './views/SafeSnapView';
import IEPDecoderView from './views/IEPDecoderView';
import SocialStoryView from './views/SocialStoryView';
import VisualScheduleView from './views/VisualScheduleView';
import SiblingExplainerView from './views/SiblingExplainerView';
import ObjectiveNoteView from './views/ObjectiveNoteView';
import QuickInterventionView from './views/QuickInterventionView';
import ABAnalyzerView from './views/ABAnalyzerView';
import ProgramMentorView from './views/ProgramMentorView';
import GenMatrixView from './views/GenMatrixView';
import JargonTranslatorView from './views/JargonTranslatorView';
import PlayIdeasView from './views/PlayIdeasView';
import ParentTrainingView from './views/ParentTrainingView';
import TemplatesView from './views/TemplatesView';
import ResultView from './views/ResultView';
import LibraryView from './views/LibraryView';

// eslint-disable-next-line no-unused-vars
export default function ABAPocketRBTMentor({ apiKey, onClose }) {
  const [activeTab, setActiveTab] = useState('abAnalyzer');
  const [role, setRole] = useState('RBT'); // Options: RBT, Parent
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generatedResult, setGeneratedResult] = useState('');
  const [savedLibrary, setSavedLibrary] = useState([]);
  const [saveMessage, setSaveMessage] = useState('');

  // Safe-Snap Camera State
  const [cameraStep, setCameraStep] = useState('idle'); // idle, scanning, flagged, safe, posted

  // Forms
  const [mentorForm, setMentorForm] = useState({ clientName: '', programName: '', target: '', interests: '' });
  // eslint-disable-next-line no-unused-vars
  const [behaviorForm, setBehaviorForm] = useState({ targetBehavior: '', function: 'Unknown / Multiple', context: '' });
  const [quickIntForm, setQuickIntForm] = useState({ behavior: '', function: 'Unknown / Multiple' });
  const [abForm, setAbForm] = useState({ antecedent: '', behavior: '' });
  const [playForm, setPlayForm] = useState({ situation: '', interests: '', targetGoal: '' });
  const [parentTrainingForm, setParentTrainingForm] = useState({ topic: '', parentLevel: 'Beginner' });
  const [genForm, setGenForm] = useState({ skill: '', settings: '' });
  const [jargonForm, setJargonForm] = useState({ text: '' });
  const [storyForm, setStoryForm] = useState({ clientName: '', age: '', topic: '' });
  const [obsNoteForm, setObsNoteForm] = useState({ draft: '' });
  const [scheduleForm, setScheduleForm] = useState({ routine: '', age: '' });
  const [siblingForm, setSiblingForm] = useState({ concept: '', siblingAge: '' });
  const [iepForm, setIepForm] = useState({ goal: '' });

  // Fetch mock data
  const { data: mockClients } = useApiData(fetchRbtMentorClients);
  const { data: mockPermissions } = useApiData(fetchRbtMentorPermissions);

  // Use fetched permissions or fallback to hardcoded defaults
  const permissions = mockPermissions || {
    RBT: ['quick', 'abAnalyzer', 'programMentor', 'genMatrix', 'playIdeas', 'socialStory', 'visualSchedule', 'objectiveNote', 'safeSnap', 'templates', 'library', 'result'],
    Parent: ['playIdeas', 'genMatrix', 'socialStory', 'visualSchedule', 'siblingExplainer', 'parentTraining', 'jargonTranslator', 'iepDecoder', 'library', 'result']
  };

  // Use the full hardcoded behavior templates for the templates tab display
  const behaviorTemplates = fullBehaviorTemplates;

  // Client name-to-interests mapping from mock API
  const clientInterests = mockClients || {
    'Noah S.': 'Dinosaurs, kinetic sand, spinning objects, water play',
    'Emma W.': 'Baby Shark, bubbles, tickles, chase, light-up toys',
    'Liam T.': 'Trains, iPad games, lining up blocks, snacks'
  };

  const handleTabChange = (tab) => {
    if (permissions[role]?.includes(tab) || tab === 'templates' || tab === 'library' || tab === 'result' || tab === 'safeSnap') {
      setActiveTab(tab);
      setIsMobileMenuOpen(false);
      setError('');
      // Reset camera if switching tabs
      if (tab !== 'safeSnap') setCameraStep('idle');
    }
  };

  const executeGeneration = async (prompt) => {
    setIsGenerating(true);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      const res = await callGemini(prompt, apiKey, infiniteClinicalCore);
      setGeneratedResult(res);
      setActiveTab('result');
    } catch {
      setError("AI Generation failed. Please check connection.");
    }
    setIsGenerating(false);
  };

  // Safe-Snap Simulation Handlers
  const handleSimulateCapture = () => {
    setCameraStep('scanning');
    setTimeout(() => setCameraStep('flagged'), 2000);
  };

  const handleSimulateBlur = () => setCameraStep('safe');
  const handleSimulatePost = () => setCameraStep('posted');

  const copyToClipboard = (content) => {
    try {
      navigator.clipboard.writeText(content);
      setSaveMessage('Copied!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setSaveMessage('Copied!');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const saveToLibrary = () => {
    if (!generatedResult) return;
    let title = 'Generated Program';
    if (activeTab === 'programMentor') title = `Mentor: ${mentorForm.programName?.substring(0,15) || 'Guide'}...`;
    else if (activeTab === 'behavior') title = `BIP: ${behaviorForm.targetBehavior?.substring(0,15) || 'Plan'}...`;
    else if (activeTab === 'quick') title = `Quick Int: ${quickIntForm.behavior?.substring(0,15) || 'Strategy'}...`;
    else if (activeTab === 'abAnalyzer') title = `A-B Analysis: ${abForm.behavior?.substring(0,20) || 'Log'}...`;
    else if (activeTab === 'playIdeas') title = `Play Ideas: ${playForm.situation?.substring(0,15) || 'NET'}...`;
    else if (activeTab === 'parentTraining') title = `Parent Training: ${parentTrainingForm.topic?.substring(0,15) || 'Guide'}...`;
    else if (activeTab === 'genMatrix') title = `Gen: ${genForm.skill?.substring(0,15) || 'Matrix'}...`;
    else if (activeTab === 'jargonTranslator') title = `Jargon Translated`;
    else if (activeTab === 'socialStory') title = `Story: ${storyForm.topic?.substring(0,15) || 'Topic'}...`;
    else if (activeTab === 'objectiveNote') title = `Objective Note Translation`;
    else if (activeTab === 'visualSchedule') title = `Schedule: ${scheduleForm.routine?.substring(0,15) || 'Routine'}...`;
    else if (activeTab === 'siblingExplainer') title = `Sibling Guide: ${siblingForm.concept?.substring(0,15) || 'Concept'}...`;
    else if (activeTab === 'iepDecoder') title = `IEP Translation`;

    const newItem = {
      id: Date.now().toString(),
      title,
      content: generatedResult,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
    };
    setSavedLibrary(prev => [newItem, ...prev]);
    setSaveMessage('Saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const deleteFromLibrary = (id) => {
    setSavedLibrary(prev => prev.filter(item => item.id !== id));
  };

  const renderNavItem = (id, Icon, label) => {
    const isAllowed = permissions[role]?.includes(id) || id === 'templates' || id === 'library';
    if (!isAllowed) return null;
    return (
      <NavItem
        key={id}
        id={id}
        Icon={Icon}
        label={label}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    );
  };

  // Forms generation mapping with strict validation logic
  const runGeneration = (type) => {
    setError('');
    let prompt = '';
    let missing = false;

    switch (type) {
      case 'quick':
        if (!quickIntForm.behavior) missing = true;
        prompt = `Behavior: ${quickIntForm.behavior}\nFunction: ${quickIntForm.function}\nProvide a rapid, highly actionable intervention strategy.`;
        break;
      case 'ab':
        if (!abForm.antecedent || !abForm.behavior) missing = true;
        prompt = `Perform a clinical A-B data analysis based on radical behaviorism.\nAntecedent (A): ${abForm.antecedent}\nBehavior (B): ${abForm.behavior}`;
        break;
      case 'mentor':
        if (!mentorForm.clientName || !mentorForm.programName) missing = true;
        prompt = `The RBT is preparing to run an existing ABA program. Provide quick, actionable tips.\nClient: ${mentorForm.clientName}\nInterests: ${mentorForm.interests}\nProgram Name: ${mentorForm.programName}\nCurrent Target: ${mentorForm.target}`;
        break;
      case 'gen':
        if (!genForm.skill) missing = true;
        prompt = `Create a comprehensive Generalization Matrix for the currently mastered skill: "${genForm.skill}".\nCurrent Setting/Context: ${genForm.settings || 'Clinical setting with primary RBT'}`;
        break;
      case 'play':
        if (!playForm.situation) missing = true;
        prompt = `The therapist is "stuck in session". Provide a highly creative and specific clinical "Ideas for Play" strategy utilizing positive behavioral supports to re-engage the client.\nCurrent Situation: ${playForm.situation}\nClient Interests: ${playForm.interests || 'Not specified'}\nTarget Goal: ${playForm.targetGoal || 'General engagement'}`;
        break;
      case 'parent':
        if (!parentTrainingForm.topic) missing = true;
        prompt = `Create a structured Parent Training Guide utilizing the Behavioral Skills Training (BST) framework. \nTopic: ${parentTrainingForm.topic}\nParent's Baseline Understanding: ${parentTrainingForm.parentLevel}`;
        break;
      case 'jargon':
        if (!jargonForm.text) missing = true;
        prompt = `Translate this highly clinical ABA text into warm, empathetic, parent-friendly layman's terms without losing the core meaning: "${jargonForm.text}"`;
        break;
      case 'story':
        if (!storyForm.topic) missing = true;
        prompt = `Create a short, engaging Social Story for a ${storyForm.age || 'young'} year old named ${storyForm.clientName || 'the client'} about "${storyForm.topic}". Use evidence-based social story guidelines: include descriptive, perspective, and directive sentences. Keep it highly practical. Title it "Social Story: ${storyForm.topic}".`;
        break;
      case 'obsNote':
        if (!obsNoteForm.draft) missing = true;
        prompt = `Translate the following subjective session note into objective, observable, and measurable behavioral language. Remove all mentalistic assumptions.\nOriginal Draft: "${obsNoteForm.draft}"`;
        break;
      case 'schedule':
        if (!scheduleForm.routine) missing = true;
        prompt = `Create a step-by-step visual schedule for the following routine: "${scheduleForm.routine}". Learner Age: ${scheduleForm.age || 'young'}. Include exactly 5-8 clear, concise steps. For each step, provide an appropriate Emoji to act as a visual cue. Title the output "Visual Schedule: ${scheduleForm.routine}".`;
        break;
      case 'sibling':
        if (!siblingForm.concept) missing = true;
        prompt = `A parent needs to explain a clinical concept or behavioral situation to a neurotypical sibling/peer. Concept/Situation: "${siblingForm.concept}". Sibling's Age: ${siblingForm.siblingAge || 'young'}. Write a compassionate, age-appropriate script to validate feelings, explain the behavior simply without stigma, and give the sibling one positive way they can help. Title it "Peer Explanation Guide".`;
        break;
      case 'iep':
        if (!iepForm.goal) missing = true;
        prompt = `A parent received the following IEP or therapy goal for their child but finds the clinical language confusing: "${iepForm.goal}". Translate this goal into warm, simple layman's terms. Include: 1. What the goal actually means. 2. Why it is important for daily life. 3. Three (3) easy positive behavioral supports the parent can use at home during natural play. Title the output "IEP Goal Translation".`;
        break;
      default:
        missing = true;
    }

    if (missing) {
      setError("Please fill out all required fields to generate a comprehensive clinical artifact.");
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    executeGeneration(prompt);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row font-sans text-slate-900">
      <style>{`
        .animate-in { animation-duration: 300ms; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-in { animation-name: fadeIn; }
        .slide-in-from-bottom-4 { animation-name: slideInBottom4; }
        .slide-in-from-bottom-8 { animation-name: slideInBottom8; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInBottom4 { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInBottom8 { from { opacity: 0; transform: translateY(2rem); } to { opacity: 1; transform: translateY(0); } }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 lg:hidden fade-in" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`fixed inset-y-0 left-0 w-72 lg:w-80 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-40 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition duration-300 ease-in-out shrink-0`}>
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <BrainCircuit className="w-8 h-8 text-indigo-400" />
          <h1 className="text-xl font-bold text-white tracking-tight">ABA <span className="text-indigo-400">Pocket</span></h1>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto custom-scrollbar">
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Scope: {role}</div>
          <ul className="space-y-1 px-3 mb-6">
            {renderNavItem("quick", Zap, "Quick Intervention")}
            {renderNavItem("abAnalyzer", FileSearch, "A-B Data Analyzer")}
            {renderNavItem("programMentor", ClipboardList, "Program Mentor")}
            {renderNavItem("socialStory", Book, "Social Story Drafter")}
            {renderNavItem("visualSchedule", ListTodo, "Visual Schedule Builder")}
            {renderNavItem("iepDecoder", GraduationCap, "IEP Goal Decoder")}
            {renderNavItem("objectiveNote", FileText, "Objective Note Translator")}
            {renderNavItem("genMatrix", Globe, "Gen Builder")}
            {renderNavItem("jargonTranslator", Languages, "Jargon Translator")}
            {renderNavItem("playIdeas", Lightbulb, "Ideas for Play")}
            {renderNavItem("parentTraining", Users, "Parent Guide")}
            {renderNavItem("siblingExplainer", HeartHandshake, "Peer Explainer")}
            <div className="my-2 border-t border-slate-800"></div>
            {renderNavItem("safeSnap", Camera, "Safe-Snap Camera")}
          </ul>
          <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">History</div>
          <ul className="space-y-1 px-3">
            {renderNavItem("templates", BookOpen, "Behavior Templates")}
            {renderNavItem("library", Library, `Vault (${savedLibrary.length})`)}
          </ul>
        </nav>

        {/* Role Switcher (Mock Login) */}
        <div className="p-4 bg-slate-950 border-t border-slate-800">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] text-slate-500 font-bold uppercase">Switch Profile</label>
            <div className="flex gap-1">
              {['RBT', 'Parent'].map(r => (
                <button key={r} onClick={() => { setRole(r); setActiveTab('library'); }} className={`flex-1 text-[10px] py-1 rounded font-bold transition-all ${role === r ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] lg:h-screen overflow-hidden">
        <header className="bg-white border-b p-4 px-6 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <Menu className="w-5 h-5 text-indigo-500 lg:hidden cursor-pointer" onClick={() => setIsMobileMenuOpen(true)} />
            <h2 className="text-lg md:text-xl font-bold text-slate-800 capitalize">
              {tabTitles[activeTab] || activeTab}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-4 h-4 text-indigo-600" /> {role} Authorized
          </div>
          {activeTab === 'result' && generatedResult && (
             <div className="hidden sm:flex items-center gap-4">
               {saveMessage && <span className="text-emerald-600 font-medium text-sm animate-pulse">{saveMessage}</span>}
               <button onClick={saveToLibrary} className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg font-medium transition-colors border border-indigo-200 text-sm">
                  <Save className="w-4 h-4" /> Save
                </button>
             </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 relative custom-scrollbar">
          <div className="max-w-4xl mx-auto w-full pb-20">
            {error && (
              <div className="mb-6 p-4 bg-rose-50 border-l-4 border-rose-500 text-rose-700 flex items-start gap-3 rounded shadow-sm text-sm md:text-base animate-in fade-in">
                <AlertCircle className="w-5 h-5 flex-shrink-0" /> <p className="font-medium">{error}</p>
              </div>
            )}

            {isGenerating ? (
              <div className="flex flex-col items-center py-40">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <p className="mt-4 font-bold text-slate-600">Clinical AI processing...</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border p-6 md:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4">

                {activeTab === 'safeSnap' && (
                  <SafeSnapView
                    cameraStep={cameraStep}
                    setCameraStep={setCameraStep}
                    onSimulateCapture={handleSimulateCapture}
                    onSimulateBlur={handleSimulateBlur}
                    onSimulatePost={handleSimulatePost}
                  />
                )}

                {activeTab === 'iepDecoder' && (
                  <IEPDecoderView iepForm={iepForm} setIepForm={setIepForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'socialStory' && (
                  <SocialStoryView storyForm={storyForm} setStoryForm={setStoryForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'visualSchedule' && (
                  <VisualScheduleView scheduleForm={scheduleForm} setScheduleForm={setScheduleForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'siblingExplainer' && (
                  <SiblingExplainerView siblingForm={siblingForm} setSiblingForm={setSiblingForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'objectiveNote' && (
                  <ObjectiveNoteView obsNoteForm={obsNoteForm} setObsNoteForm={setObsNoteForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'quick' && (
                  <QuickInterventionView quickIntForm={quickIntForm} setQuickIntForm={setQuickIntForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'abAnalyzer' && (
                  <ABAnalyzerView abForm={abForm} setAbForm={setAbForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'programMentor' && (
                  <ProgramMentorView mentorForm={mentorForm} setMentorForm={setMentorForm} clientInterests={clientInterests} onGenerate={runGeneration} />
                )}

                {activeTab === 'genMatrix' && (
                  <GenMatrixView genForm={genForm} setGenForm={setGenForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'jargonTranslator' && (
                  <JargonTranslatorView jargonForm={jargonForm} setJargonForm={setJargonForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'playIdeas' && (
                  <PlayIdeasView playForm={playForm} setPlayForm={setPlayForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'parentTraining' && (
                  <ParentTrainingView parentTrainingForm={parentTrainingForm} setParentTrainingForm={setParentTrainingForm} onGenerate={runGeneration} />
                )}

                {activeTab === 'templates' && (
                  <TemplatesView behaviorTemplates={behaviorTemplates} setQuickIntForm={setQuickIntForm} onTabChange={handleTabChange} />
                )}

                {activeTab === 'result' && (
                  <ResultView
                    generatedResult={generatedResult}
                    permissions={permissions}
                    role={role}
                    setActiveTab={setActiveTab}
                    setGeneratedResult={setGeneratedResult}
                    copyToClipboard={copyToClipboard}
                    saveToLibrary={saveToLibrary}
                  />
                )}

                {activeTab === 'library' && (
                  <LibraryView
                    savedLibrary={savedLibrary}
                    copyToClipboard={copyToClipboard}
                    deleteFromLibrary={deleteFromLibrary}
                    setGeneratedResult={setGeneratedResult}
                    setActiveTab={setActiveTab}
                  />
                )}

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
