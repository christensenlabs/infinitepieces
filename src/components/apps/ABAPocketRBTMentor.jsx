import React, { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit, BookOpen, Library, Save, Loader2, AlertCircle,
  ClipboardList, CheckCircle2, RefreshCw, Zap, FileSearch,
  Trash2, Copy, Menu, Lightbulb, Users,
  Globe, ShieldCheck, UserCircle,
  Camera, ShieldAlert, Image as ImageIcon, ScanFace, Languages,
  Book, FileText, ListTodo, HeartHandshake, GraduationCap, Mic
} from 'lucide-react';
import { callGemini } from '../../lib/gemini';
import { useApiData } from '../../hooks/useApiData';
import { fetchRbtMentorClients, fetchRbtMentorPermissions } from '../../api/apps';

// --- The "Infinity Clinical Core" Persona Definition ---
const infiniteClinicalCore = `[SYSTEM: INFINITY CLINICAL CORE ENGAGED]
You are an elite, doctorate-level BCBA-D acting as an immediate field mentor to RBTs and Parents. You possess exhaustive, instant recall of Applied Behavior Analysis, the 2026 BACB Ethics Code, JABA/JEAB literature, and clinical best practices.

CRITICAL INSTRUCTIONS TO ENSURE SPEED & QUALITY:
1. ADAPTIVE LANGUAGE: Analyze the user's input. Match their sophistication. If they use layman's terms, explain simply and empathetically. If they use clinical jargon, respond at a peer clinical level.
2. EXTREME SCANNABILITY: The user is in the field and needs answers INSTANTLY. Keep responses under 150 words. Use tight, punchy bullet points. NO introductory or concluding fluff.
3. VISUAL CLARITY: You MUST **bold key terms and actions** for rapid visual processing.
4. WHOLE GAMUT PBS: Always provide a comprehensive behavioral perspective: Proactive (Antecedent) modifications, Educative (Replacement/DRA/DRO), and safe Reactive (Consequence) procedures.
5. THE COACHING HINT: End every single response with a section titled "**Data Collection Hint:**". Write exactly one sentence teaching the user how to describe the behavior more objectively, observably, and measurably next time.`;

// --- Safe Markdown Renderer ---
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

// --- Core Voice Hook (Prevents crashing and state resets) ---
function useVoiceRecognition(value, onChange) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  // Keep refs updated without triggering re-renders of the recognition object
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
          // Safely update parent state
          onChangeRef.current({ target: { value: currentVal + space + finalTranscript.trim() } });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

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
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch(e) {
        console.error(e);
      }
    }
  };

  return { isRecording, toggleRecording, voiceError };
}

// --- Reusable Voice-Enabled Text Area ---
function VoiceTextArea({ value, onChange, placeholder, rows = 2 }) {
  const { isRecording, toggleRecording, voiceError } = useVoiceRecognition(value, onChange);
  return (
    <div className="relative w-full">
      {voiceError && (
        <div className="absolute -top-8 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md animate-in fade-in z-10">
          {voiceError}
        </div>
      )}
      <textarea
        value={value}
        onChange={onChange}
        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm font-medium text-slate-800 pr-14 transition-all resize-none custom-scrollbar"
        rows={rows}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={toggleRecording}
        className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors shadow-sm ${isRecording ? 'bg-rose-100 text-rose-600 animate-pulse border border-rose-200' : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 border border-slate-200'}`}
        title={isRecording ? "Tap to Stop" : "Tap to Speak"}
      >
        <Mic size={18} />
      </button>
    </div>
  );
}

// --- Reusable Voice-Enabled Input ---
function VoiceInput({ value, onChange, placeholder }) {
  const { isRecording, toggleRecording, voiceError } = useVoiceRecognition(value, onChange);
  return (
    <div className="relative w-full">
      {voiceError && (
        <div className="absolute -top-8 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md animate-in fade-in z-10">
          {voiceError}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={onChange}
        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm font-medium text-slate-800 pr-14 transition-all"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={toggleRecording}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors shadow-sm ${isRecording ? 'bg-rose-100 text-rose-600 animate-pulse border border-rose-200' : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 border border-slate-200'}`}
        title={isRecording ? "Tap to Stop" : "Tap to Speak"}
      >
        <Mic size={18} />
      </button>
    </div>
  );
}

// --- UI Dictionary ---
const tabTitles = {
  abAnalyzer: 'A-B Data Analyzer',
  programMentor: 'Program Mentor',
  genMatrix: 'Generalization Builder',
  jargonTranslator: 'Jargon Translator',
  playIdeas: 'Ideas for Play',
  parentTraining: 'Parent Training Guide',
  socialStory: 'Social Story Drafter',
  objectiveNote: 'Objective Note Translator',
  visualSchedule: 'Visual Schedule Builder',
  siblingExplainer: 'Peer/Sibling Explainer',
  iepDecoder: 'IEP Goal Decoder',
  safeSnap: 'Safe-Snap Protocol',
  quick: 'Rapid Intervention Strategy',
  templates: 'Behavior Templates',
  library: 'My Saved Artifacts',
  result: 'Clinical Output Generated'
};

// --- Hardcoded behavior templates (full clinical detail) ---
const fullBehaviorTemplates = [
  {
    name: 'Physical Aggression (Multiple Functions)',
    function: 'Unknown / Multiple',
    context: 'Topography: Hitting with open/closed fist, kicking, biting, or scratching others. \nPutative Functions: Synthesized Social Positive (Attention) & Social Negative (Escape). \nIntervention Guidelines: Implement synthesized contingencies. \nAntecedents: FCT for "break" and "attention", prespecified reinforcer periods, high-P request sequences. \nConsequence (if Escape-maintained in moment): Continue demand presentation, block safely (Escape Extinction). \nConsequence (if Attention-maintained in moment): Planned ignoring, block safely without eye contact or vocalizations (Attention Extinction).'
  },
  {
    name: 'Elopement (Multiple Functions)',
    function: 'Unknown / Multiple',
    context: 'Topography: Moving >10 feet away from designated instructional or safety area without permission. \nFunctions: Escape (from demands) & Access (to preferred areas/tangibles). \nAntecedents: Visual boundaries, Premack principle (First work, then go), enrich instructional environment. \nReplacement: FCT to mand "Can I go to X?" or "I need a break". \nConsequence: Shadow for safety. Block access to desired tangible/area. If escape-maintained, gently guide back to instructional area and represent demand without verbal reprimand.'
  },
  {
    name: 'Severe SIB (Head-Banging/Biting)',
    function: 'Sensory / Automatic',
    context: 'Topography: Forceful head-banging against hard surfaces, or biting own hands/arms causing tissue damage. \nFunction: Automatic Reinforcement (Sensory regulation). \nAntecedents: NCR (non-contingent access to sensory alternatives like joint compression/vibration), environmental padding. \nReplacement: DRA (teaching to mand for sensory input or use a safe chew tube/helmet). \nConsequences: Immediate response blocking for safety, absolute minimal attention/reaction, redirect to functionally equivalent sensory replacement.'
  },
  {
    name: 'Property Destruction',
    function: 'Unknown / Multiple',
    context: 'Topography: Throwing, sweeping, tearing, or intentionally breaking items resulting in damage. \nFunctions: Escape (destroying materials to end task) & Access to Tangible (destroying items when denied preferred item). \nAntecedents: Clear workspace, provide durable materials, visual timers for transitions. \nReplacement: FCT "I don\'t want this" or "I want [item]". \nConsequences: Block throwing safely. Require restitution/overcorrection (e.g., picking up thrown items) before returning to baseline or accessing any reinforcers.'
  },
  {
    name: 'Task Refusal / Dropping',
    function: 'Escape / Avoidance',
    context: 'Topography: Dropping to the floor to become "dead weight", putting head down on desk, or ignoring SDs when directive is given. \nFunction: Social Negative (Escape/Avoidance). \nAntecedents: Behavioral momentum (High-P to Low-P), choice-making (e.g., "Do you want to do math or reading first?"), reduce task response effort. \nReplacement: Manding for a break or assistance. \nConsequences: Escape Extinction. Do not remove demand. Use physical prompting (graduated guidance) if necessary and safe, or wait out with demand placed until compliance.'
  },
  {
    name: 'Spitting (At Others)',
    function: 'Unknown / Multiple',
    context: 'Topography: Expelling saliva from mouth directed at peers or staff. \nFunctions: Social Positive (Attention/Reaction) & Social Negative (Escape). \nAntecedents: Increase distance during high-stress demands, differential reinforcement of incompatible behaviors (DRI - chewing gum or holding a preferred item in mouth). \nConsequence: Neutral facial expression. Wipe away safely without comment. If escape, continue demand. If attention, immediately withdraw all social interaction for 30 seconds.'
  },
  {
    name: 'Pica (Ingesting non-edible items)',
    function: 'Sensory / Automatic',
    context: 'Topography: Placing non-edible, non-nutritive items (e.g., dirt, paper, small toys) into the mouth and swallowing. \nFunction: Automatic Reinforcement (Note: Medical rule-out for nutritional deficiencies is required). \nAntecedents: Sweep environment for hazards, provide constant access to safe oral stimulation (chewelry, crunchy snacks). \nReplacement: Manding for food/chews. \nConsequences: Response blocking (hand over mouth), physically remove item if safe, redirect to edible alternative without reprimand.'
  },
  {
    name: 'Disrobing (Inappropriate)',
    function: 'Unknown / Multiple',
    context: 'Topography: Removing clothing (shirts, pants, underwear) in non-designated areas (e.g., classroom, living room). \nFunctions: Automatic (Sensory discomfort from clothes), Escape (from setting), or Attention. \nAntecedents: Ensure clothing is sensory-friendly, teach discrimination of private vs. public spaces. \nReplacement: FCT "I am hot/itchy" or teaching to go to the bathroom/bedroom to undress. \nConsequences: Neutral redirection. Prompt learner to redress immediately with physical guidance if necessary, zero eye contact or verbal reprimands.'
  },
  {
    name: 'Feces Smearing (Scatolia)',
    function: 'Unknown / Multiple',
    context: 'Topography: Handling, playing with, or smearing feces on walls, self, or objects. \nFunctions: Automatic (Sensory/Tactile) & Social Positive (Extreme Attention). \nAntecedents: Scheduled toileting, restrictive clothing (e.g., onesies worn backwards), provide high-tactile sensory play (play-doh, slime, shaving cream). \nReplacement: Requesting bathroom, independent toileting chain. \nConsequences: Emotionless clean-up. Do not display disgust. Use physical prompts to guide learner through cleaning themselves (overcorrection), followed by immediate handwashing.'
  },
  {
    name: 'Motor Stereotypy',
    function: 'Sensory / Automatic',
    context: 'Topography: Repetitive, non-functional motor movements (e.g., hand-flapping, body rocking, finger posturing). \nFunction: Automatic reinforcement. \nAntecedents: Enrich environment with competing stimuli. \nReplacement: Functionally equivalent or incompatible behaviors (e.g., squeezing a stress ball instead of flapping). \nConsequences: Usually ignore unless it impedes learning. If impeding, use Response Interruption and Redirection (RIRD) to a motor task (e.g., "Touch your nose, clap hands").'
  },
  {
    name: 'Vocal Stereotypy / Scripting',
    function: 'Sensory / Automatic',
    context: 'Topography: Repetitive vocalizations, echolalia, or delayed scripting of movies/videos non-contextually. \nFunction: Automatic reinforcement. \nAntecedents: High-density schedule of competing auditory stimuli (music, engaging conversation). \nReplacement: Teaching appropriate "time and place" for scripting, or expanding scripts into functional intraverbals. \nConsequences: RIRD (Response Interruption and Redirection) by asking 3 rapid-fire intraverbal questions to interrupt the vocal loop, then praise for correct answering.'
  },
  {
    name: 'Verbal Aggression / Threats',
    function: 'Unknown / Multiple',
    context: 'Topography: Using profanity, making statements of harm, or screaming insults at others. \nFunctions: Social Positive (Attention/Reaction) & Escape. \nAntecedents: Teach emotional regulation protocols (e.g., Zone of Regulation), priming for difficult tasks. \nReplacement: FCT "I am angry", "I need space", or appropriate disagreement. \nConsequences: Planned ignoring for the verbal content. Do not argue, negotiate, or react emotionally. If associated with a demand, follow through silently using visual prompts.'
  },
  {
    name: 'Mouthing',
    function: 'Sensory / Automatic',
    context: 'Topography: Placing non-edible items, toys, clothing, or body parts into the mouth past the plane of the lips (without swallowing). \nFunction: Automatic Sensory. \nAntecedents: Provide continuous access to safe chew-tubes or crunchy/cold edibles. \nReplacement: Manding for chew-tube. \nConsequences: Response blocking, differential reinforcement of incompatible behavior (DRI) by prompting hands-down or hands-busy activities.'
  },
  {
    name: 'Non-compliance (Passive)',
    function: 'Escape / Avoidance',
    context: 'Topography: Failing to follow an instruction or initiate a requested task within 5 seconds of the SD, without physical aggression. \nFunction: Escape/Avoidance. \nAntecedents: Ensure learner attending before SD, use clear/concise SDs (not phrased as questions), Token Economy. \nReplacement: Manding for a break or help. \nConsequences: 3-step prompting hierarchy (Vocal, Model, Physical). Do not repeat SD endlessly. Ensure compliance is met before access to reinforcement.'
  },
  {
    name: 'Environmental Manipulation (Rigidity)',
    function: 'Sensory / Automatic',
    context: 'Topography: Repeatedly opening/closing doors, turning lights on/off, lining up toys, or demanding items be in an exact spatial arrangement. \nFunction: Automatic/Control. \nAntecedents: Warn before transitions, visually structure the environment, teach tolerance to change/denial. \nReplacement: Flexibility training, functional play skills. \nConsequences: Interrupt the repetitive loop. Prompt learner to engage in a functional activity with the object (e.g., pushing the car instead of lining it up).'
  }
];

// eslint-disable-next-line no-unused-vars
export default function App({ apiKey, onClose }) {
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
      <li key={id}>
        <button onClick={() => handleTabChange(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-left ${activeTab === id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}>
          <Icon className="w-5 h-5 flex-shrink-0" />
          <span className="truncate">{label}</span>
        </button>
      </li>
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

                {/* SAFE-SNAP CAMERA SIMULATION UI */}
                {activeTab === 'safeSnap' && (
                  <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-inner relative flex flex-col">
                      {/* Header */}
                      <div className="bg-slate-950 p-3 flex justify-between items-center text-slate-400 text-xs font-mono">
                        <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500"/> HIPAA FIREWALL ACTIVE</span>
                        <span>v2.1 EDGE-AI</span>
                      </div>

                      {/* Viewfinder Simulation Area */}
                      <div className="h-64 sm:h-96 w-full bg-slate-800 relative flex items-center justify-center overflow-hidden">

                        {cameraStep === 'idle' && (
                          <div className="text-center p-6">
                            <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-400 font-medium">Ready to capture.</p>
                            <p className="text-slate-500 text-sm mt-1">Faces will be scanned instantly on-device.</p>
                          </div>
                        )}

                        {cameraStep === 'scanning' && (
                          <div className="text-center z-10">
                            <ScanFace className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
                            <p className="text-indigo-300 font-bold tracking-widest uppercase">Scanning Faces...</p>
                          </div>
                        )}

                        {(cameraStep === 'flagged' || cameraStep === 'safe' || cameraStep === 'posted') && (
                          <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
                            {/* Mock Photo Representation */}
                            <div className="w-3/4 h-3/4 bg-slate-600 rounded-lg relative flex items-center justify-around p-4 shadow-2xl">

                              {/* Child 1 (Authorized) */}
                              <div className="relative w-1/3 h-2/3 border-2 border-emerald-500 bg-slate-500 rounded flex items-center justify-center">
                                <span className="absolute -top-6 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">ID: #402 (Consent)</span>
                                <UserCircle className="w-12 h-12 text-slate-300" />
                              </div>

                              {/* Child 2 (Unauthorized) */}
                              <div className={`relative w-1/3 h-2/3 border-2 transition-all duration-500 bg-slate-500 rounded flex items-center justify-center ${cameraStep === 'flagged' ? 'border-rose-500' : 'border-emerald-500 blur-sm overflow-hidden'}`}>
                                {cameraStep === 'flagged' && <span className="absolute -top-6 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-bounce">ID: #881 (NO CONSENT)</span>}
                                {cameraStep !== 'flagged' && <span className="absolute -top-6 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded z-20">BLURRED</span>}
                                <UserCircle className="w-12 h-12 text-slate-300" />
                                {cameraStep !== 'flagged' && <div className="absolute inset-0 backdrop-blur-md bg-slate-400/50"></div>}
                              </div>

                            </div>

                            {/* Red Flag Overlay Overlay */}
                            {cameraStep === 'flagged' && (
                              <div className="absolute inset-0 bg-rose-900/80 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                                <ShieldAlert className="w-16 h-16 text-rose-300 mb-4" />
                                <h3 className="text-white font-bold text-xl uppercase tracking-wider">Privacy Risk Detected</h3>
                                <p className="text-rose-200 mt-2 max-w-sm">We detected Liam S. in this photo. He does not have Tier 2 Media Consent. You cannot post this raw image.</p>
                                <button onClick={handleSimulateBlur} className="mt-6 bg-white text-rose-900 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                                  Auto-Blur Peers
                                </button>
                              </div>
                            )}

                            {/* Success Overlay */}
                            {cameraStep === 'posted' && (
                              <div className="absolute inset-0 bg-emerald-900/90 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
                                <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                                <h3 className="text-white font-bold text-xl uppercase tracking-wider">Posted Safely</h3>
                                <p className="text-emerald-200 mt-2">Log: Prevention ID #992 generated.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Controls Footer */}
                      <div className="bg-slate-950 p-6 flex justify-center gap-4">
                        {cameraStep === 'idle' && (
                          <button onClick={handleSimulateCapture} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors">
                            <Camera className="w-5 h-5" /> Simulate Camera Capture
                          </button>
                        )}
                        {cameraStep === 'safe' && (
                          <button onClick={handleSimulatePost} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors animate-in slide-in-from-bottom-4">
                            <Globe className="w-5 h-5" /> Post to Community Feed
                          </button>
                        )}
                        {cameraStep === 'posted' && (
                          <button onClick={() => setCameraStep('idle')} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-full font-bold transition-colors">
                            Take Another
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Educational Pitch Context */}
                    <div className="bg-indigo-50 text-indigo-900 p-5 rounded-xl border border-indigo-100 text-sm">
                      <h4 className="font-bold mb-2 text-indigo-800 flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> The &ldquo;Liability Shield&rdquo; in Action</h4>
                      <p className="mb-2">This is the Safe-Snap protocol. If an RBT tries to capture an unauthorized peer, the on-device AI intercepts it before the photo is even saved to memory. </p>
                      <p>By forcing automatic anonymization, you retain parents with a Community Social Feed, without exposing the clinic to HIPAA violations.</p>
                    </div>
                  </div>
                )}

                {/* DYNAMIC FORMS FOR OTHER TOOLS (Voice Enabled) */}
                {activeTab === 'iepDecoder' && (
                  <>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start mb-6">
                      <GraduationCap className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-indigo-900">IEP Goal Decoder</h4>
                        <p className="text-sm text-indigo-800 mt-1">Translate confusing clinical goals from your child&apos;s IEP or therapy plan into simple, actionable strategies you can practice at home.</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Therapy or IEP Goal</label>
                      <VoiceTextArea placeholder="e.g., 'The student will independently mand for preferred items using 3-word phrases in 8/10 opportunities...'" value={iepForm.goal} onChange={e => setIepForm({...iepForm, goal: e.target.value})} rows={5} />
                    </div>
                    <button onClick={() => runGeneration('iep')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">Decode Goal</button>
                  </>
                )}

                {activeTab === 'socialStory' && (
                  <>
                    <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex gap-4 items-start mb-6">
                      <Book className="w-6 h-6 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-orange-900">Social Story Drafter</h4>
                        <p className="text-sm text-orange-800 mt-1">Prepare clients for novel events (haircuts, dentist, transitions) with an instant, personalized, evidence-based social story.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Client Name (Optional)</label>
                        <VoiceInput placeholder="e.g., Noah..." value={storyForm.clientName} onChange={e => setStoryForm({...storyForm, clientName: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Client Age</label>
                        <VoiceInput placeholder="e.g., 6..." value={storyForm.age} onChange={e => setStoryForm({...storyForm, age: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Story Topic / Event</label>
                      <VoiceTextArea placeholder="e.g., Going to the dentist, losing a board game..." value={storyForm.topic} onChange={e => setStoryForm({...storyForm, topic: e.target.value})} rows={3} />
                    </div>
                    <button onClick={() => runGeneration('story')} className="w-full py-4 bg-orange-500 hover:bg-orange-600 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">Generate Social Story</button>
                  </>
                )}

                {activeTab === 'visualSchedule' && (
                  <>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start mb-6">
                      <ListTodo className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-indigo-900">Visual Schedule Builder</h4>
                        <p className="text-sm text-indigo-800 mt-1">Generate a step-by-step visual schedule for any routine, complete with suggested emojis/icons for the learner.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Routine / Transition</label>
                        <VoiceTextArea placeholder="e.g., Morning routine, going to store..." value={scheduleForm.routine} onChange={e => setScheduleForm({...scheduleForm, routine: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Learner Age</label>
                        <VoiceInput placeholder="e.g., 5..." value={scheduleForm.age} onChange={e => setScheduleForm({...scheduleForm, age: e.target.value})} />
                      </div>
                    </div>
                    <button onClick={() => runGeneration('schedule')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">Generate Visual Schedule</button>
                  </>
                )}

                {activeTab === 'siblingExplainer' && (
                  <>
                    <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex gap-4 items-start mb-6">
                      <HeartHandshake className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-rose-900">Peer / Sibling Explainer</h4>
                        <p className="text-sm text-rose-800 mt-1">Generate a compassionate, age-appropriate script to help a neurotypical sibling or peer understand a clinical concept or behavior.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">What happened? / Concept</label>
                        <VoiceTextArea placeholder="e.g., Why he wears headphones, meltdown at store..." value={siblingForm.concept} onChange={e => setSiblingForm({...siblingForm, concept: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Sibling&apos;s Age</label>
                        <VoiceInput placeholder="e.g., 8..." value={siblingForm.siblingAge} onChange={e => setSiblingForm({...siblingForm, siblingAge: e.target.value})} />
                      </div>
                    </div>
                    <button onClick={() => runGeneration('sibling')} className="w-full py-4 bg-rose-600 hover:bg-rose-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">Generate Explanation Script</button>
                  </>
                )}

                {activeTab === 'objectiveNote' && (
                  <>
                    <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex gap-4 items-start mb-6">
                      <FileText className="w-6 h-6 text-slate-700 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-slate-900">Objective Note Translator</h4>
                        <p className="text-sm text-slate-700 mt-1">Convert subjective feelings (e.g., &ldquo;he was mad&rdquo;) into observable, measurable clinical terminology for your session notes.</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Subjective Draft</label>
                      <VoiceTextArea placeholder="e.g., Noah got really stubborn and mad when I took away the iPad. He cried for a long time." value={obsNoteForm.draft} onChange={e => setObsNoteForm({...obsNoteForm, draft: e.target.value})} rows={5} />
                    </div>
                    <button onClick={() => runGeneration('obsNote')} className="w-full py-4 bg-slate-800 hover:bg-slate-900 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">Translate to Objective Language</button>
                  </>
                )}

                {activeTab === 'quick' && (
                  <>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4 flex items-start gap-2">
                       <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0" />
                       <p className="text-xs text-yellow-800"><span className="font-bold">Hint:</span> Be specific! Use observable words (e.g., &ldquo;hit with open hand&rdquo;) instead of internal states (e.g., &ldquo;was angry&rdquo;).</p>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Target Behavior</h3>
                    <VoiceTextArea placeholder="Behavior topography... (e.g. throwing blocks)" value={quickIntForm.behavior} onChange={e => setQuickIntForm({...quickIntForm, behavior: e.target.value})} />
                    <button onClick={() => runGeneration('quick')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">Generate Strategy</button>
                  </>
                )}

                {activeTab === 'abAnalyzer' && (
                  <>
                    <h3 className="font-bold text-lg mb-2">A-B Contingency</h3>
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-xl mb-4 flex items-start gap-2">
                       <Lightbulb className="w-5 h-5 text-yellow-600 shrink-0" />
                       <p className="text-xs text-yellow-800"><span className="font-bold">Hint:</span> Describe exactly what happened immediately before (Antecedent) and exactly what the client did (Behavior).</p>
                    </div>
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Antecedent (A)</label>
                      <VoiceTextArea placeholder="What occurred prior?" value={abForm.antecedent} onChange={e => setAbForm({...abForm, antecedent: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Behavior (B)</label>
                      <VoiceTextArea placeholder="Specific topography observed?" value={abForm.behavior} onChange={e => setAbForm({...abForm, behavior: e.target.value})} />
                    </div>
                    <button onClick={() => runGeneration('ab')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">Analyze Consequence</button>
                  </>
                )}

                {activeTab === 'programMentor' && (
                  <>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex gap-4 items-start mb-6">
                      <UserCircle className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-indigo-900">Client Profile Sync</h4>
                        <p className="text-sm text-indigo-800 mt-1">Select your client to automatically pull their preferences. Generate actionable implementation tips and play ideas for the specific program you are running today.</p>
                      </div>
                    </div>

                    <h3 className="font-bold text-lg mb-2">1. Select Client Profile</h3>
                    <select
                      className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm font-medium mb-4"
                      onChange={(e) => {
                        setMentorForm({...mentorForm, clientName: e.target.value, interests: clientInterests[e.target.value] || ''});
                      }}
                    >
                      <option value="">-- Select Assigned Client --</option>
                      {Object.keys(clientInterests).map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Program Name</label>
                        <VoiceInput placeholder="e.g., Manding, Tying Shoes..." value={mentorForm.programName} onChange={e => setMentorForm({...mentorForm, programName: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Current Target / Goal</label>
                        <VoiceInput placeholder="e.g., Mands with 2 words..." value={mentorForm.target} onChange={e => setMentorForm({...mentorForm, target: e.target.value})} />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Client Interests (Auto-Synced)</label>
                      <VoiceTextArea placeholder="Client preferences..." value={mentorForm.interests} onChange={e => setMentorForm({...mentorForm, interests: e.target.value})} rows={2} />
                    </div>

                    <button onClick={() => runGeneration('mentor')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-6 shadow-md">Get Implementation Ideas</button>
                  </>
                )}

                {activeTab === 'genMatrix' && (
                  <>
                    <h3 className="font-bold text-lg mb-2">Generalization Builder</h3>
                    <VoiceTextArea placeholder="Mastered skill... (e.g. greetings)" value={genForm.skill} onChange={e => setGenForm({...genForm, skill: e.target.value})} rows={2} />
                    <button onClick={() => runGeneration('gen')} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">Build Matrix</button>
                  </>
                )}

                {activeTab === 'jargonTranslator' && (
                  <>
                    <div className="bg-sky-50 border border-sky-100 rounded-xl p-4 flex gap-4 items-start mb-6">
                      <Languages className="w-6 h-6 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-sky-900">Jargon Translator</h4>
                        <p className="text-sm text-sky-800 mt-1">Translate heavy clinical notes or treatment plans into warm, parent-friendly layman&apos;s terms.</p>
                      </div>
                    </div>
                    <h3 className="font-bold text-lg mb-2">Clinical Text</h3>
                    <VoiceTextArea placeholder="Paste ABA jargon here (e.g., 'Implemented DRI for property destruction...')" value={jargonForm.text} onChange={e => setJargonForm({...jargonForm, text: e.target.value})} rows={5} />
                    <button onClick={() => runGeneration('jargon')} className="w-full py-4 bg-sky-600 hover:bg-sky-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">Translate to Parent-Friendly</button>
                  </>
                )}

                {activeTab === 'playIdeas' && (
                  <>
                    <h3 className="font-bold text-lg mb-2">Ideas for Play</h3>
                    <div className="mb-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Current Situation</label>
                      <VoiceTextArea placeholder="Describe situation (e.g. client wandering)..." value={playForm.situation} onChange={e => setPlayForm({...playForm, situation: e.target.value})} rows={3} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Client Interests</label>
                      <VoiceInput placeholder="e.g. cars, trains..." value={playForm.interests} onChange={e => setPlayForm({...playForm, interests: e.target.value})} />
                    </div>
                    <button onClick={() => runGeneration('play')} className="w-full py-4 bg-yellow-500 hover:bg-yellow-600 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">Get Play Ideas</button>
                  </>
                )}

                {activeTab === 'parentTraining' && (
                  <>
                    <h3 className="font-bold text-lg mb-2">Parent Training Guide</h3>
                    <VoiceTextArea placeholder="Topic (e.g. Extinction)..." value={parentTrainingForm.topic} onChange={e => setParentTrainingForm({...parentTrainingForm, topic: e.target.value})} rows={2} />
                    <button onClick={() => runGeneration('parent')} className="w-full py-4 bg-teal-600 hover:bg-teal-700 hover:scale-[1.02] text-white rounded-xl font-bold transition-all mt-4">Generate Scripts</button>
                  </>
                )}

                {/* Templates Display */}
                {activeTab === 'templates' && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <p className="text-slate-600 mb-6 text-sm font-medium">Select a topography to pre-fill the Quick Intervention tool with clinical starting points.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {behaviorTemplates.map((template, idx) => (
                        <div key={idx} onClick={() => {
                            setQuickIntForm({ behavior: template.name, function: template.function });
                            handleTabChange('quick');
                          }}
                          className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md hover:border-indigo-400 hover:ring-1 hover:ring-indigo-400 transition-all cursor-pointer group"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-700 transition-colors">{template.name}</h3>
                          </div>
                          <span className="inline-block mb-3 text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md">{template.function}</span>
                          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{template.context}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Result Display */}
                {activeTab === 'result' && (
                  <div className="space-y-6 animate-in slide-in-from-bottom-8">
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      <p className="font-bold text-emerald-800">Generation Complete</p>
                    </div>
                    <div className="prose prose-sm md:prose-base max-w-none text-slate-700">{renderMarkdown(generatedResult)}</div>
                    <div className="flex flex-col sm:flex-row gap-4 border-t pt-6">
                      <button onClick={() => { setActiveTab(permissions[role]?.[0] || 'abAnalyzer'); setGeneratedResult(''); }} className="flex-1 bg-slate-100 hover:bg-slate-200 hover:scale-[1.02] transition-transform text-slate-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4"/> Start New</button>
                      <button onClick={() => copyToClipboard(generatedResult)} className="flex-1 bg-slate-100 hover:bg-slate-200 hover:scale-[1.02] transition-transform text-slate-800 py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Copy className="w-4 h-4"/> Copy</button>
                      <button onClick={saveToLibrary} className="flex-1 bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] transition-transform text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"><Save className="w-4 h-4"/> Save Artifact</button>
                    </div>
                  </div>
                )}

                {/* Vault Display */}
                {activeTab === 'library' && (
                  <div className="space-y-4">
                    {savedLibrary.length === 0 ? <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed text-slate-400"><Library className="mx-auto w-12 h-12 mb-2 opacity-50"/>Vault empty.</div> : savedLibrary.map(item => (
                      <div key={item.id} className="p-5 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-all bg-white">
                        <div>
                          <h4 className="font-bold text-slate-800">{item.title}</h4>
                          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.date}</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => copyToClipboard(item.content)} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg"><Copy className="w-4 h-4" /></button>
                          <button onClick={() => deleteFromLibrary(item.id)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                          <button onClick={() => { setGeneratedResult(item.content); setActiveTab('result'); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg ml-2 transition-colors">Open</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
