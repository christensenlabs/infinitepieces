import React, { useEffect, useMemo, useState } from "react";
import {
  BrainCircuit, BookOpen, Flag, Sparkles, ShieldCheck, Edit,
  Archive, User, Users, Home, Heart, Clock, Search, Copy, Download,
  Upload, AlertCircle, Lock, Database, Wand2, FileText, Settings, BarChart2,
  Plus, Trash2, UserCircle, Target, Smartphone, RefreshCw, Filter, Star,
  ArrowRight, Lightbulb, GraduationCap, X, Check
} from 'lucide-react';
import { callGemini } from '../../lib/gemini';
import { useApiData } from '../../hooks/useApiData';
import {
  fetchProgramTreePools,
  fetchProgramTreeFlagTypes,
  fetchProgramTreeDomains,
  fetchProgramTemplates,
  fetchAceCurriculum,
  fetchProgramTreeClients,
} from '../../api/apps';

const STORAGE_KEY = "abaflow_program_library_live_app_v3";
const ROLE_KEY = "abaflow_program_library_role_v3";

const ICONS = {
  brain: <BrainCircuit size={18} />,
  library: <BookOpen size={18} />,
  flag: <Flag size={18} />,
  sparkles: <Sparkles size={18} />,
  shield: <ShieldCheck size={18} />,
  edit: <Edit size={18} />,
  check: <Check size={18} />,
  x: <X size={18} />,
  archive: <Archive size={18} />,
  user: <User size={18} />,
  family: <Users size={18} />,
  home: <Home size={18} />,
  heart: <Heart size={18} />,
  clock: <Clock size={18} />,
  search: <Search size={18} />,
  copy: <Copy size={18} />,
  download: <Download size={18} />,
  upload: <Upload size={18} />,
  alert: <AlertCircle size={18} />,
  lock: <Lock size={18} />,
  pool: <Database size={18} />,
  wand: <Wand2 size={18} />,
  note: <FileText size={18} />,
  settings: <Settings size={18} />,
  chart: <BarChart2 size={18} />,
  plus: <Plus size={18} />,
  trash: <Trash2 size={18} />,
  client: <UserCircle size={18} />,
  target: <Target size={18} />,
  phone: <Smartphone size={18} />,
  refresh: <RefreshCw size={18} />,
  filter: <Filter size={18} />,
  star: <Star size={18} />,
  arrow: <ArrowRight size={18} />,
  database: <Database size={18} />,
  lightbulb: <Lightbulb size={18} />,
  graduation: <GraduationCap size={18} />
};

function I({ name, className = "" }) {
  return (
    <span className={cn("inline-flex items-center justify-center", className)} aria-hidden="true">
      {ICONS[name] || <span className="w-4 h-4 rounded-full bg-slate-200"></span>}
    </span>
  );
}

function nowStamp() {
  return new Date().toISOString();
}

function formatDate(iso) {
  if (!iso) return "\u2014";
  try {
    return new Date(iso).toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Hardcoded fallback constants (overridden by API data when available)
const DEFAULT_POOLS = {
  approved: {
    label: "Active / Approved",
    short: "Approved",
    dot: "bg-emerald-500",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  baseline: {
    label: "Pending Baseline",
    short: "Baseline",
    dot: "bg-blue-500",
    className: "bg-blue-50 text-blue-800 border-blue-200",
  },
  candidate: {
    label: "BCBA Drafts",
    short: "Draft",
    dot: "bg-purple-500",
    className: "bg-purple-50 text-purple-800 border-purple-200",
  },
  revision: {
    label: "Needs Revision",
    short: "Revision",
    dot: "bg-amber-500",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  archived: {
    label: "Archived / Mastered",
    short: "Archived",
    dot: "bg-slate-400",
    className: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

const DEFAULT_FLAG_TYPES = {
  baselineData: "Baseline Data Logged",
  successRBT: "Working Well for RBT",
  successHome: "Working Well at Home",
  interest: "Interested in Running",
  newPlan: "Request New Target",
  wording: "Needs Clearer Wording",
  barrier: "Implementation Barrier",
  question: "Question for BCBA",
  stagnant: "Program Stagnant (No Progress)",
};

const DEFAULT_DOMAINS = [
  "Early Echoics",
  "Listener Responding (LR)",
  "Motor Imitation",
  "Tacting",
  "Manding",
  "Intraverbals",
  "Social & Play Skills",
  "Daily Living / Adaptive",
  "Behavior Reduction",
  "Tolerance & Coping",
  "Executive Functioning",
  "School Readiness"
];

const DEFAULT_PROGRAM_TEMPLATES = {
  DTT: {
    method: "DTT (Discrete Trial Training)",
    procedure: "1. Clear environment of extraneous distractors.\n2. Establish attending (e.g., 'Look', eye contact, or quiet body).\n3. Deliver SD clearly and neutrally without extra verbiage.\n4. Wait 3 seconds for response.",
    promptPlan: "0-second delay Errorless Learning for acquisition targets (Most-to-Least). Fade to 3-second delay once independent responses emerge.",
    reinforcementPlan: "FR-1: Deliver behavior-specific praise and access to highly preferred item within 0.5s of correct independent response. Differential (lesser) reinforcement for prompted responses.",
    errorCorrection: "4-Step Error Correction: Model -> Prompt -> Switch (2 mastered distractors) -> Repeat original SD.",
    dataCollection: "Trial-by-trial. Score: Independent (+), Prompted (P), Error (-).",
  },
  NET: {
    method: "NET (Natural Environment Teaching)",
    procedure: "1. Seed the environment with preferred items out of reach or in locked containers.\n2. Capture or contrive a Motivating Operation (MO).\n3. Wait for client to initiate/show interest.",
    promptPlan: "Least-to-Most (LTM). Utilize an expectant pause (3-5s). If no response, provide an indirect verbal prompt, then a direct verbal/model prompt.",
    reinforcementPlan: "Natural Contingency: Immediately deliver the specific item or action requested. Pair with natural social praise.",
    errorCorrection: "If maladaptive behavior occurs or incorrect mand, withhold item neutrally. Re-establish MO, and immediately prompt the correct response.",
    dataCollection: "Frequency of independent vs. prompted mands per session.",
  },
  PRT: {
    method: "PRT (Pivotal Response Treatment)",
    procedure: "1. Establish shared control via child-led play.\n2. Intersperse maintenance (easy) and acquisition (hard) tasks (80/20 ratio).\n3. Provide natural opportunities for target behavior within the play routine.",
    promptPlan: "Follow client's lead. Use time delay. Prompt only to facilitate access to the natural reinforcer.",
    reinforcementPlan: "Direct Natural Reinforcement. Reinforce clear *attempts* or approximations to shape terminal behavior, maintaining high behavioral momentum.",
    errorCorrection: "If no response, re-model the target playfully. Do not force compliance if motivation drops; pivot to a new shared activity to rebuild momentum.",
    dataCollection: "Probe data or rating scale on initiation and joint attention.",
  },
  TA: {
    method: "TA (Task Analysis)",
    procedure: "1. Ensure terminal environment is prepared (e.g., sink area for handwashing).\n2. Bring client to area and deliver initial SD ('Time to wash hands').\n3. Allow client to complete steps independently.",
    promptPlan: "Total Task Presentation with Least-to-Most prompting per step. Alternatively, Forward/Backward chaining depending on client baseline.",
    reinforcementPlan: "Provide brief, non-disruptive praise during intermediate steps. Deliver terminal reinforcement immediately upon completion of the final step.",
    errorCorrection: "If latency >3s or incorrect topography occurs on a step, physically prompt that specific step to completion, then allow independence on the next step.",
    dataCollection: "TA Data Sheet. Score independence level for each micro-step in the chain.",
  }
};

const DEFAULT_ACE_CURRICULUM = [
  { domain: "Manding", title: "Mand for Missing Item", method: "NET", desc: "Learner requests an item required to complete a task (e.g., spoon for yogurt)." },
  { domain: "Manding", title: "Mand for Information (Where/Who)", method: "NET", desc: "Learner asks 'Where is it?' when a preferred item is hidden." },
  { domain: "Tacting", title: "Tact 2-Component Noun-Verb", method: "DTT", desc: "Learner tacts pictures of actions (e.g., 'Boy running', 'Dog sleeping')." },
  { domain: "Tacting", title: "Tact Internal States", method: "NET", desc: "Learner identifies feeling hungry, thirsty, tired, or in pain." },
  { domain: "Listener Responding (LR)", title: "LR: Feature, Function, Class", method: "DTT", desc: "Learner selects items from an array based on FFC (e.g., 'Touch the one you eat with')." },
  { domain: "Listener Responding (LR)", title: "LR: Multi-step Directions", method: "NET", desc: "Learner follows 2-step related instructions (e.g., 'Get your shoes and put them on')." },
  { domain: "Social & Play Skills", title: "Initiate Peer Play", method: "PRT", desc: "Learner approaches a peer and asks 'Can I play?' or offers a toy." },
  { domain: "Tolerance & Coping", title: "Tolerate Denied Access", method: "NET", desc: "Learner accepts 'No' or 'Wait' without maladaptive behavior, using a visual timer." },
  { domain: "Daily Living / Adaptive", title: "Handwashing", method: "TA", desc: "Learner independently completes a 7-step handwashing chain." },
  { domain: "Behavior Reduction", title: "FCT for Escape", method: "NET", desc: "Learner hands a 'Break' card instead of eloping or engaging in property destruction." }
];

function getDefaultState(defaultClients) {
  const clients = defaultClients || [
    {
      id: 1,
      name: "Jane Doe",
      age: 5,
      profile:
        "Learner profile is blank. Add clinical strengths, barriers, communication style, reinforcers, and caregiver priorities here.",
    },
    {
      id: 2,
      name: "John Doe",
      age: 7,
      profile:
        "Learner profile is blank. Add current goals, behavior considerations, prompting needs, and generalization notes here.",
    },
  ];
  return {
    clients,
    programs: [],
    flags: [],
    selectedClientId: clients[0]?.id || 1,
    selectedPool: "all",
    audit: [
      {
        id: uid("audit"),
        type: "system",
        message: "Application created as a clean local trial workspace.",
        createdAt: nowStamp(),
      },
    ],
  };
}

function loadState(defaultClients) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState(defaultClients);
    const parsed = JSON.parse(raw);
    const defaults = getDefaultState(defaultClients);
    return {
      ...defaults,
      ...parsed,
      clients: Array.isArray(parsed.clients) && parsed.clients.length ? parsed.clients : defaults.clients,
      programs: Array.isArray(parsed.programs) ? parsed.programs : [],
      flags: Array.isArray(parsed.flags) ? parsed.flags : [],
      audit: Array.isArray(parsed.audit) ? parsed.audit : [],
    };
  } catch {
    return getDefaultState(defaultClients);
  }
}

function Badge({ children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
        className
      )}
    >
      {children}
    </span>
  );
}

function Field({ label, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-400">{hint}</span> : null}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold outline-none transition focus:border-[#12214A] focus:ring-4 focus:ring-blue-100",
        props.className
      )}
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#12214A] focus:ring-4 focus:ring-blue-100 custom-scrollbar",
        props.className
      )}
    />
  );
}

function Select(props) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-[#12214A] focus:ring-4 focus:ring-blue-100",
        props.className
      )}
    />
  );
}

function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[#12214A] text-white hover:bg-blue-950 shadow-sm shadow-blue-950/20",
    gold: "bg-[#D7A83F] text-white hover:bg-amber-500 shadow-sm shadow-amber-600/20",
    green: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-700/20",
    red: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-700/20",
    purple: "bg-purple-700 text-white hover:bg-purple-800 shadow-sm shadow-purple-800/20",
    light: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    darkGhost: "bg-white/10 text-white hover:bg-white/20",
  };

  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

function ModalComponent({ title, subtitle, children, onClose, width = "max-w-2xl", icon = null }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={cn("my-8 w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-300", width)}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            {icon && <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-xl">{icon}</div>}
            <div>
              <h3 className="text-2xl font-black text-[#12214A]">{title}</h3>
              {subtitle ? <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p> : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-200 p-2 text-slate-600 transition hover:bg-slate-300"
            aria-label="Close modal"
          >
            <I name="x" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-6 md:p-8 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}

function makeBlankProgram(clientId) {
  return {
    id: uid("program"),
    clientId,
    pool: "candidate",
    domain: "",
    target: "",
    method: "",
    objective: "",
    procedure: "",
    promptPlan: "",
    reinforcementPlan: "",
    errorCorrection: "",
    masteryCriteria: "",
    generalization: "",
    caregiverPlainLanguage: "",
    materials: "",
    dataCollection: "",
    clinicalRiskNote: "",
    baselineData: "",
    createdAt: nowStamp(),
    updatedAt: nowStamp(),
    reviewNotes: [],
  };
}

export default function ProgramTreeApp({ apiKey }) {
  // Load config data from mock API
  const { data: apiPools } = useApiData(fetchProgramTreePools);
  const { data: apiFlagTypes } = useApiData(fetchProgramTreeFlagTypes);
  const { data: apiDomains } = useApiData(fetchProgramTreeDomains);
  const { data: apiTemplates } = useApiData(fetchProgramTemplates);
  const { data: apiCurriculum } = useApiData(fetchAceCurriculum);
  const { data: apiClients } = useApiData(fetchProgramTreeClients);

  // Resolve config with fallbacks
  const POOLS = apiPools || DEFAULT_POOLS;
  const FLAG_TYPES = apiFlagTypes || DEFAULT_FLAG_TYPES;
  const DOMAINS = apiDomains || DEFAULT_DOMAINS;
  const PROGRAM_TEMPLATES = apiTemplates || DEFAULT_PROGRAM_TEMPLATES;
  const ACE_CURRICULUM_DATABASE = apiCurriculum || DEFAULT_ACE_CURRICULUM;

  const [state, setState] = useState(() => loadState(apiClients));
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY) || "BCBA");
  const [activePanel, setActivePanel] = useState("programs");
  const [search, setSearch] = useState("");
  const [editorProgram, setEditorProgram] = useState(null);
  const [baselineProgram, setBaselineProgram] = useState(null);
  const [flagModal, setFlagModal] = useState(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [clientModal, setClientModal] = useState(null);
  const [curriculumBrowserOpen, setCurriculumBrowserOpen] = useState(false);
  const [mentorModalOpen, setMentorModalOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

  // Seed clients from API once loaded (only if localStorage was empty)
  const clientsLength = state.clients.length;
  useEffect(() => {
    if (apiClients && clientsLength === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time seed from async API data
      setState(prev => ({ ...prev, clients: apiClients, selectedClientId: apiClients[0]?.id || 1 }));
    }
  }, [apiClients, clientsLength]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    localStorage.setItem(ROLE_KEY, role);
  }, [role]);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const client = useMemo(() => {
    return state.clients.find((c) => Number(c.id) === Number(state.selectedClientId)) || state.clients[0];
  }, [state.clients, state.selectedClientId]);

  const clientPrograms = useMemo(() => {
    if (!client) return [];
    return state.programs.filter((p) => Number(p.clientId) === Number(client.id));
  }, [client, state.programs]);

  const clientFlags = useMemo(() => {
    if (!client) return [];
    return state.flags.filter((f) => Number(f.clientId) === Number(client.id));
  }, [client, state.flags]);

  const dashboard = useMemo(() => {
    const approved = clientPrograms.filter((p) => p.pool === "approved").length;
    const baseline = clientPrograms.filter((p) => p.pool === "baseline").length;
    const draft = clientPrograms.filter((p) => p.pool === "candidate").length;
    const revision = clientPrograms.filter((p) => p.pool === "revision").length;
    const openFlags = clientFlags.filter((f) => f.status === "Open").length;
    return { approved, baseline, draft, revision, openFlags, total: clientPrograms.length };
  }, [clientPrograms, clientFlags]);

  const isBCBA = role === "BCBA";
  const isCaregiver = role === "Caregiver";

  const visiblePrograms = useMemo(() => {
    return clientPrograms.filter((p) => {
      const poolMatch = state.selectedPool === "all" ? true : p.pool === state.selectedPool;
      const haystack = JSON.stringify(p).toLowerCase();
      const queryMatch = !search || haystack.includes(search.toLowerCase());
      return poolMatch && queryMatch;
    });
  }, [clientPrograms, search, state.selectedPool]);

  const showToast = (msg) => setToast(msg);

  const requestConfirm = (title, message, onConfirm) => {
    setConfirmState({ isOpen: true, title, message, onConfirm });
  };

  const executeConfirm = () => {
    if (confirmState.onConfirm) confirmState.onConfirm();
    setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null });
  };

  // eslint-disable-next-line no-unused-vars
  const addAudit = (message, type = "action") => {
    setState((prev) => ({
      ...prev,
      audit: [
        { id: uid("audit"), type, message, createdAt: nowStamp() },
        ...(prev.audit || []).slice(0, 79),
      ],
    }));
  };

  const saveProgram = (prog) => {
    setState((prev) => {
      const exists = prev.programs.some((p) => p.id === prog.id);
      const saved = { ...prog, updatedAt: nowStamp(), clientId: prog.clientId || client.id };
      const programs = exists
        ? prev.programs.map((p) => (p.id === prog.id ? saved : p))
        : [saved, ...prev.programs];
      return {
        ...prev,
        programs,
        audit: [
          {
            id: uid("audit"),
            type: "program",
            message: `${exists ? "Updated" : "Created"} program: ${saved.target || "Untitled target"}`,
            createdAt: nowStamp(),
          },
          ...(prev.audit || []).slice(0, 79),
        ],
      };
    });
    setEditorProgram(null);
    showToast("Program saved successfully.");
  };

  const cloneProgram = (program) => {
    const copy = {
      ...program,
      id: uid("program"),
      target: `${program.target || "Untitled target"} Copy`,
      pool: "candidate",
      createdAt: nowStamp(),
      updatedAt: nowStamp(),
      reviewNotes: [`Copied from ${program.target || "original program"} on ${formatDate(nowStamp())}`],
    };
    setState((prev) => ({
      ...prev,
      programs: [copy, ...prev.programs],
      audit: [
        { id: uid("audit"), type: "program", message: `Copied program: ${program.target}`, createdAt: nowStamp() },
        ...(prev.audit || []).slice(0, 79),
      ],
    }));
    showToast("Program copied into BCBA drafts.");
  };

  const deleteProgram = (programId) => {
    const program = state.programs.find((p) => p.id === programId);
    requestConfirm(
      "Delete Program",
      `Are you sure you want to delete ${program?.target || "this program"}? This only removes it from this local app.`,
      () => {
        setState((prev) => ({
          ...prev,
          programs: prev.programs.filter((p) => p.id !== programId),
          flags: prev.flags.filter((f) => f.programId !== programId),
          audit: [
            { id: uid("audit"), type: "program", message: `Deleted program: ${program?.target || programId}`, createdAt: nowStamp() },
            ...(prev.audit || []).slice(0, 79),
          ],
        }));
        showToast("Program deleted.");
      }
    );
  };

  const submitFlag = (flagData) => {
    const program = state.programs.find((p) => p.id === flagData.programId);
    const newFlag = {
      ...flagData,
      id: uid("flag"),
      clientId: client.id,
      status: "Open",
      createdAt: nowStamp(),
      reason: flagData.reason?.trim() || "No details entered.",
    };
    setState((prev) => ({
      ...prev,
      flags: [newFlag, ...prev.flags],
      audit: [
        {
          id: uid("audit"),
          type: "flag",
          message: `${flagData.requestedBy || role} submitted ${FLAG_TYPES[flagData.type] || "feedback"}${program ? ` for ${program.target}` : ""}.`,
          createdAt: nowStamp(),
        },
        ...(prev.audit || []).slice(0, 79),
      ],
    }));
    setFlagModal(null);
    showToast("Feedback sent to the team queue.");
  };

  const resolveFlag = (flagId) => {
    const flag = state.flags.find((f) => f.id === flagId);
    setState((prev) => ({
      ...prev,
      flags: prev.flags.map((f) => (f.id === flagId ? { ...f, status: "Resolved", resolvedAt: nowStamp() } : f)),
      audit: [
        { id: uid("audit"), type: "flag", message: `Resolved flag: ${FLAG_TYPES[flag?.type] || "Feedback"}`, createdAt: nowStamp() },
        ...(prev.audit || []).slice(0, 79),
      ],
    }));
    showToast("Flag marked resolved.");
  };

  const submitBaseline = (progId, dataStr, notes) => {
    const safeData = dataStr.trim() || "Baseline entered without score";
    setState((prev) => ({
      ...prev,
      programs: prev.programs.map((p) =>
        p.id === progId
          ? {
              ...p,
              baselineData: safeData,
              pool: "candidate",
              reviewNotes: [
                `Baseline recorded by RBT: ${safeData}. Notes: ${notes || "No notes entered."}`,
                ...(p.reviewNotes || []),
              ],
              updatedAt: nowStamp(),
            }
          : p
      ),
      flags: [
        {
          id: uid("flag"),
          clientId: client.id,
          programId: progId,
          type: "baselineData",
          requestedBy: "RBT",
          reason: `Baseline logged: ${safeData}${notes ? `. Notes: ${notes}` : ""}`,
          status: "Open",
          createdAt: nowStamp(),
        },
        ...prev.flags,
      ],
      audit: [
        { id: uid("audit"), type: "baseline", message: `Baseline logged: ${safeData}`, createdAt: nowStamp() },
        ...(prev.audit || []).slice(0, 79),
      ],
    }));
    setBaselineProgram(null);
    showToast("Baseline recorded and returned to BCBA draft review.");
  };

  const changeProgramPool = (program, newPool) => {
    setState((prev) => ({
      ...prev,
      programs: prev.programs.map((x) =>
        x.id === program.id ? { ...x, pool: newPool, updatedAt: nowStamp() } : x
      ),
      audit: [
        {
          id: uid("audit"),
          type: "program",
          message: `Moved ${program.target || "program"} to ${POOLS[newPool]?.label || newPool}.`,
          createdAt: nowStamp(),
        },
        ...(prev.audit || []).slice(0, 79),
      ],
    }));
    showToast(`Moved to ${POOLS[newPool]?.label || newPool}.`);
  };

  const saveClient = (draftClient) => {
    const normalized = {
      ...draftClient,
      id: draftClient.id || uid("client"),
      name: draftClient.name?.trim() || "Unnamed Client",
      age: draftClient.age || "",
      profile: draftClient.profile || "",
    };
    setState((prev) => {
      const exists = prev.clients.some((c) => c.id === normalized.id);
      return {
        ...prev,
        clients: exists ? prev.clients.map((c) => (c.id === normalized.id ? normalized : c)) : [normalized, ...prev.clients],
        selectedClientId: normalized.id,
        audit: [
          { id: uid("audit"), type: "client", message: `${exists ? "Updated" : "Added"} learner: ${normalized.name}`, createdAt: nowStamp() },
          ...(prev.audit || []).slice(0, 79),
        ],
      };
    });
    setClientModal(null);
    showToast("Learner saved.");
  };

  const resetTrial = () => {
    requestConfirm(
      "Reset Workspace",
      "Wipe all local app data and start from a blank slate? This cannot be undone.",
      () => {
        setState(getDefaultState(apiClients));
        setSearch("");
        setActivePanel("programs");
        showToast("Workspace reset to blank slate.");
        setSettingsOpen(false);
      }
    );
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `abaflow-program-library-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Data exported as JSON.");
  };

  const importData = async (file) => {
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setState({ ...getDefaultState(apiClients), ...parsed });
      showToast("Data imported.");
    } catch {
      showToast("That file could not be imported. Please use a JSON export from this app.");
    }
  };

  const exportVisiblePrograms = () => {
    const rows = [
      [
        "Client",
        "Pool",
        "Domain",
        "Target",
        "Objective",
        "Procedure",
        "Prompt Plan",
        "Error Correction",
        "Reinforcement",
        "Mastery Criteria",
        "Baseline",
      ],
      ...visiblePrograms.map((p) => [
        client.name,
        POOLS[p.pool]?.label || p.pool,
        p.domain || "",
        p.target || "",
        p.objective || "",
        p.procedure || "",
        p.promptPlan || "",
        p.errorCorrection || "",
        p.reinforcementPlan || "",
        p.masteryCriteria || "",
        p.baselineData || "",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${client.name.replace(/\s+/g, "-").toLowerCase()}-programs.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("Visible programs exported as CSV.");
  };

  const SidebarContent = (
    <aside className="space-y-5">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
            <I name="user" /> Learner
          </h2>
          <Button variant="ghost" className="px-3 py-2" onClick={() => setClientModal({ name: "", age: "", profile: "" })}>
            <I name="plus" />
          </Button>
        </div>
        <Select
          value={client?.id || ""}
          onChange={(e) => setState((p) => ({ ...p, selectedClientId: e.target.value }))}
          className="font-black text-[#12214A]"
        >
          {state.clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        {client ? (
          <div className="mt-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <p className="text-sm font-black text-[#12214A]">{client.name}</p>
              <button
                onClick={() => setClientModal(client)}
                className="rounded-full bg-white px-3 py-1 text-xs font-black text-slate-600 shadow-sm hover:bg-slate-100 transition-colors"
              >
                Edit
              </button>
            </div>
            <p className="text-xs font-bold text-slate-500">Age: {client.age || "\u2014"}</p>
            <p className="mt-3 line-clamp-5 text-sm leading-6 text-slate-600">{client.profile}</p>
          </div>
        ) : null}
      </div>

      <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
          <I name="chart" /> Dashboard
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Metric label="Approved" value={dashboard.approved} tone="emerald" />
          <Metric label="Baseline" value={dashboard.baseline} tone="blue" />
          <Metric label="Drafts" value={dashboard.draft} tone="purple" />
          <Metric label="Flags" value={dashboard.openFlags} tone="amber" />
        </div>
      </div>

      {!isCaregiver ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-500">
            <I name="pool" /> Program Pools
          </h2>
          <div className="space-y-2">
            <PoolButton
              active={state.selectedPool === "all"}
              label="All Programs"
              count={clientPrograms.length}
              onClick={() => setState((p) => ({ ...p, selectedPool: "all" }))}
            />
            {Object.entries(POOLS).map(([key, meta]) => (
              <PoolButton
                key={key}
                active={state.selectedPool === key}
                label={meta.label}
                count={clientPrograms.filter((p) => p.pool === key).length}
                dot={meta.dot}
                onClick={() => setState((p) => ({ ...p, selectedPool: key }))}
              />
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );

  return (
    <div className="min-h-screen bg-[#F7F8FB] font-sans text-slate-800 relative">
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
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* GLOBAL HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#12214A] px-4 py-4 text-white shadow-lg shadow-slate-900/10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              className="rounded-2xl bg-white/10 p-3 text-white lg:hidden hover:bg-white/20 transition-colors"
              onClick={() => setMobileSidebar((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <I name="filter" />
            </button>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D7A83F] text-3xl shadow-inner">
              <I name="library" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight md:text-3xl">ACE Program Library</h1>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-blue-300">
                Master Curriculum & Clinical Mentor
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-white/10 p-1.5 shadow-inner">
            {["BCBA", "RBT", "Caregiver"].map((r) => (
              <button
                key={r}
                onClick={() => {
                  setRole(r);
                  setActivePanel(r === "Caregiver" ? "caregiver" : "programs");
                  setState((p) => ({ ...p, selectedPool: r === "Caregiver" ? "approved" : p.selectedPool }));
                }}
                className={cn(
                  "rounded-2xl px-4 py-2.5 text-sm font-black transition-all",
                  role === r ? "bg-white text-[#12214A] shadow" : "text-white hover:bg-white/20"
                )}
              >
                {r}
              </button>
            ))}
            <button
              onClick={() => setSettingsOpen(true)}
              className="rounded-2xl px-3 py-2.5 text-white transition hover:bg-white/20"
              aria-label="Settings"
            >
              <I name="settings" />
            </button>
          </div>
        </div>
      </header>

      {mobileSidebar ? <div className="border-b border-slate-200 bg-white p-4 lg:hidden animate-in fade-in">{SidebarContent}</div> : null}

      <main className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 p-4 md:p-8 lg:grid-cols-[320px_1fr]">
        <div className="hidden lg:block">{SidebarContent}</div>

        <section className="min-w-0 space-y-6">

          {/* TOP ACTION BAR */}
          <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {!isCaregiver ? (
                  <>
                    <Button
                      variant={activePanel === "programs" ? "primary" : "light"}
                      onClick={() => setActivePanel("programs")}
                    >
                      <I name="library" /> Program Pools
                    </Button>
                    <Button
                      variant={activePanel === "flags" ? "primary" : "light"}
                      onClick={() => setActivePanel("flags")}
                    >
                      <I name="flag" /> Feedback Queue ({dashboard.openFlags})
                    </Button>
                    <Button
                      variant={activePanel === "audit" ? "primary" : "light"}
                      onClick={() => setActivePanel("audit")}
                    >
                      <I name="shield" /> Activity Log
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" onClick={() => setActivePanel("caregiver")}>
                    <I name="family" /> Home Library
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {isBCBA ? (
                  <>
                    <Button variant="green" onClick={() => setCurriculumBrowserOpen(true)}>
                      <I name="database" /> ACE Database
                    </Button>
                    <Button variant="gold" onClick={() => setEditorProgram(makeBlankProgram(client.id))}>
                      <I name="sparkles" /> Draft Custom Target
                    </Button>
                    <Button variant="purple" onClick={() => setMentorModalOpen(true)}>
                      <I name="graduation" /> Clinical Mentor
                    </Button>
                  </>
                ) : (
                  <Button variant="light" onClick={() => setFlagModal({ requestedBy: role, type: "newPlan" })}>
                    <I name="plus" /> Request Target
                  </Button>
                )}
                <Button variant="light" onClick={exportVisiblePrograms} title="Export to CSV for Data Collection App">
                  <I name="download" /> CSV
                </Button>
              </div>
            </div>
          </div>

          {/* MAIN PANELS */}
          {activePanel === "programs" && !isCaregiver ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 md:flex-row md:items-center">
                  <div className="relative flex-1">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <I name="search" />
                    </span>
                    <TextInput
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search targets, domains, procedures, prompt plans, baseline data..."
                      className="pl-11"
                    />
                  </div>
                  <Select
                    value={state.selectedPool}
                    onChange={(e) => setState((p) => ({ ...p, selectedPool: e.target.value }))}
                    className="md:max-w-xs"
                  >
                    <option value="all">All pools</option>
                    {Object.entries(POOLS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>

              {visiblePrograms.length === 0 ? (
                <EmptyState
                  role={role}
                  onDraft={() => setEditorProgram(makeBlankProgram(client.id))}
                  onDatabase={() => setCurriculumBrowserOpen(true)}
                />
              ) : (
                <div className="space-y-4">
                  {visiblePrograms.map((p) => (
                    <ProgramCard
                      key={p.id}
                      program={p}
                      role={role}
                      pools={POOLS}
                      onEdit={() => setEditorProgram(p)}
                      onClone={() => cloneProgram(p)}
                      onDelete={() => deleteProgram(p.id)}
                      onBaseline={() => setBaselineProgram(p)}
                      onFlag={(type) => setFlagModal({ programId: p.id, requestedBy: role, type })}
                      onStatusChange={(newPool) => changeProgramPool(p, newPool)}
                      showToast={showToast}
                      apiKey={apiKey}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {activePanel === "caregiver" || isCaregiver ? (
            <CaregiverPanel
              client={client}
              programs={clientPrograms.filter((p) => p.pool === "approved")}
              onFlag={(program, type) => setFlagModal({ programId: program.id, requestedBy: "Caregiver", type })}
            />
          ) : null}

          {activePanel === "flags" && !isCaregiver ? (
            <FlagsPanel
              flags={clientFlags}
              programs={clientPrograms}
              flagTypes={FLAG_TYPES}
              isBCBA={isBCBA}
              onResolve={resolveFlag}
              onOpenProgram={(program) => setEditorProgram(program)}
            />
          ) : null}

          {activePanel === "audit" && !isCaregiver ? <AuditPanel audit={state.audit || []} /> : null}
        </section>
      </main>

      {/* --- MODALS --- */}

      {/* Confirmation Modal */}
      {confirmState.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full border-t-8 border-rose-500 animate-in zoom-in-95">
            <h3 className="text-2xl font-black text-[#12214A] mb-2 flex items-center gap-2">
              <I name="alert" className="text-rose-500" />
              {confirmState.title}
            </h3>
            <p className="text-slate-600 mb-6 font-medium leading-relaxed">
              {confirmState.message}
            </p>
            <div className="flex gap-4 justify-end">
              <button onClick={() => setConfirmState({ isOpen: false, title: "", message: "", onConfirm: null })} className="px-5 py-2.5 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={executeConfirm} className="px-5 py-2.5 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition-colors">
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {editorProgram ? (
        <EditorModal
          program={editorProgram}
          apiKey={apiKey}
          client={client}
          domains={DOMAINS}
          pools={POOLS}
          programTemplates={PROGRAM_TEMPLATES}
          onClose={() => setEditorProgram(null)}
          onSave={saveProgram}
          showToast={showToast}
        />
      ) : null}

      {curriculumBrowserOpen ? (
        <CurriculumBrowserModal
          domains={DOMAINS}
          curriculum={ACE_CURRICULUM_DATABASE}
          onClose={() => setCurriculumBrowserOpen(false)}
          onSelectProgram={(preset) => {
            setCurriculumBrowserOpen(false);
            setEditorProgram({ ...makeBlankProgram(client.id), ...preset, pool: 'candidate' });
          }}
        />
      ) : null}

      {mentorModalOpen ? (
        <ClinicalMentorModal
          apiKey={apiKey}
          client={client}
          onClose={() => setMentorModalOpen(false)}
          showToast={showToast}
        />
      ) : null}

      {baselineProgram ? (
        <BaselineModal
          program={baselineProgram}
          apiKey={apiKey}
          onClose={() => setBaselineProgram(null)}
          onSubmit={submitBaseline}
          showToast={showToast}
        />
      ) : null}

      {flagModal ? (
        <FeedbackModal data={flagModal} program={state.programs.find((p) => p.id === flagModal.programId)} flagTypes={FLAG_TYPES} onClose={() => setFlagModal(null)} onSubmit={submitFlag} />
      ) : null}

      {clientModal ? <ClientModal client={clientModal} onClose={() => setClientModal(null)} onSave={saveClient} /> : null}

      {settingsOpen ? (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          onReset={resetTrial}
          onExport={exportData}
          onImport={importData}
        />
      ) : null}

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-[#12214A] px-6 py-3 text-sm font-black text-white shadow-2xl animate-in slide-in-from-bottom-4 flex items-center gap-2">
          <I name="check" className="text-emerald-400" /> {toast}
        </div>
      ) : null}
    </div>
  );
}

// --- SUB-COMPONENTS ---

function Metric({ label, value, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-100",
    blue: "bg-blue-50 text-blue-800 border-blue-100",
    purple: "bg-purple-50 text-purple-800 border-purple-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
  };
  return (
    <div className={cn("rounded-2xl border p-4 transition-all hover:shadow-sm", tones[tone] || tones.blue)}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
    </div>
  );
}

function PoolButton({ active, label, count, dot, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition-all",
        active ? "bg-[#12214A] text-white shadow-md scale-[1.02]" : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200"
      )}
    >
      <span className="flex items-center gap-2">
        {dot ? <span className={cn("h-2.5 w-2.5 rounded-full shadow-inner", dot)} /> : null}
        {label}
      </span>
      <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>{count}</span>
    </button>
  );
}

function EmptyState({ role, onDraft, onDatabase }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm md:p-14 animate-in fade-in">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-indigo-50 text-5xl">
        <I name="library" className="text-indigo-500" />
      </div>
      <h3 className="text-2xl font-black text-[#12214A]">Blank Slate Ready</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
        No programs match this view yet. BCBAs can build custom treatment targets or import pre-built evidence-based templates from the ACE Curriculum Database.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {role === "BCBA" ? (
          <>
            <Button variant="green" onClick={onDatabase}>
              <I name="database" /> Open Curriculum DB
            </Button>
            <Button variant="gold" onClick={onDraft}>
              <I name="sparkles" /> Draft Custom Target
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}

function ProgramCard({ program, role, pools, onEdit, onClone, onDelete, onBaseline, onFlag, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const isBCBA = role === "BCBA";
  const isRBT = role === "RBT";
  const pool = pools[program.pool] || pools.candidate;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md animate-in slide-in-from-bottom-4">
      <div className="border-b border-slate-100 p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className={pool.className}>{pool.short}</Badge>
              {program.domain ? <Badge className="border-slate-200 bg-slate-100 text-slate-600">{program.domain}</Badge> : null}
              {program.method ? <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">{program.method}</Badge> : null}
              {program.baselineData ? (
                <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">BL: {program.baselineData}</Badge>
              ) : null}
            </div>
            <h3 className="text-xl font-black text-[#12214A] md:text-2xl">{program.target || "Untitled Target"}</h3>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
              {program.objective || "No objective set."}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-xs xl:justify-end">
            {isBCBA ? (
              <>
                <Button variant="light" onClick={onEdit}>
                  <I name="edit" /> Edit
                </Button>
                <Button variant="light" onClick={onClone}>
                  <I name="copy" /> Copy
                </Button>
                {program.pool !== "approved" ? (
                  <Button variant="green" onClick={() => onStatusChange("approved")}>
                    <I name="check" /> Approve
                  </Button>
                ) : (
                  <Button variant="light" onClick={() => onStatusChange("archived")}>
                    <I name="archive" /> Archive
                  </Button>
                )}
              </>
            ) : null}

            {isRBT && program.pool === "baseline" ? (
              <Button variant="primary" onClick={onBaseline}>
                <I name="chart" /> Run Baseline
              </Button>
            ) : null}
            {isRBT && program.pool === "approved" ? (
              <Button variant="light" onClick={() => onFlag("successRBT")}>
                <I name="check" className="text-emerald-500" /> Working Well
              </Button>
            ) : null}
            {isRBT ? (
              <>
                <Button variant="light" onClick={() => onFlag("barrier")}>
                  <I name="alert" className="text-rose-500" /> Barrier
                </Button>
                <Button variant="light" onClick={() => onFlag("stagnant")}>
                  <I name="chart" className="text-amber-500" /> Stagnant Data
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 bg-slate-50 p-5 text-sm text-slate-700 md:grid-cols-2 md:p-6">
        <InfoBlock title="Procedure (SD/Setup)" text={program.procedure || "\u2014"} />
        <InfoBlock title="Prompt & Reinforcement" text={`Prompting: ${program.promptPlan || "\u2014"}\n\nReinforcement: ${program.reinforcementPlan || "\u2014"}`} />
        {expanded ? (
          <>
            <InfoBlock title="Error Correction" text={program.errorCorrection || "\u2014"} />
            <InfoBlock title="Data Collection & Mastery" text={`Data: ${program.dataCollection || "\u2014"}\n\nMastery: ${program.masteryCriteria || "\u2014"}`} />
            <InfoBlock title="Generalization" text={program.generalization || "\u2014"} />
            <InfoBlock title="Caregiver Plain Language" text={program.caregiverPlainLanguage || "\u2014"} />
            {program.reviewNotes?.length ? (
              <div className="md:col-span-2">
                <InfoBlock title="Review Notes" text={program.reviewNotes.join("\n")} />
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <p className="text-xs font-bold text-slate-400">Updated {formatDate(program.updatedAt || program.createdAt)}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" className="px-3 py-2" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Hide Details" : "Show Details"}
          </Button>
          {isBCBA ? (
            <>
              <Select
                value={program.pool}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-auto min-w-[190px] py-2"
              >
                {Object.entries(pools).map(([k, v]) => (
                  <option key={k} value={k}>
                    Move: {v.label}
                  </option>
                ))}
              </Select>
              <Button variant="ghost" className="px-3 py-2 text-rose-600 hover:bg-rose-50" onClick={onDelete}>
                <I name="trash" /> Delete
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm h-full">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-indigo-500">{title}</span>
      <p className="whitespace-pre-line text-sm font-medium leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}

function CaregiverPanel({ client, programs, onFlag }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white shadow-lg shadow-blue-950/10">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-blue-200 flex items-center gap-2">
          <I name="home" /> Caregiver View
        </p>
        <h2 className="text-3xl font-black">Home Practice Library</h2>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-blue-100">
          Approved programs for {client?.name || "this learner"} are converted into everyday language so caregivers
          can understand what to practice, what to notice, and what to flag back to the clinical team.
        </p>
      </div>

      {programs.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-5xl">
            <I name="family" className="text-blue-500" />
          </div>
          <h3 className="text-xl font-black text-[#12214A]">No approved home programs yet</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Once the BCBA approves a program, it will appear here in caregiver-friendly language.
          </p>
        </div>
      ) : (
        programs.map((p) => (
          <div key={p.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge className="border-blue-200 bg-blue-50 text-blue-800">{p.domain || "Home Practice"}</Badge>
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">Approved</Badge>
                </div>
                <h3 className="text-2xl font-black text-[#12214A]">{p.target}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="light" onClick={() => onFlag(p, "successHome")}>
                  <I name="heart" className="text-rose-500" /> Works at Home
                </Button>
                <Button variant="light" onClick={() => onFlag(p, "barrier")}>
                  <I name="alert" className="text-amber-500" /> Home Barrier
                </Button>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoBlock title="How to practice" text={p.caregiverPlainLanguage || "Practice during normal daily routines. Prompt only as much as needed and reinforce success quickly."} />
              <InfoBlock title="What the team is teaching" text={p.objective || "\u2014"} />
              <InfoBlock title="Helpful prompting" text={p.promptPlan || "\u2014"} />
              <InfoBlock title="Reinforcement" text={p.reinforcementPlan || "\u2014"} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function FlagsPanel({ flags, programs, flagTypes, isBCBA, onResolve, onOpenProgram }) {
  const sorted = [...flags].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {sorted.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-5xl">
            <I name="flag" className="text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-[#12214A]">Feedback queue is empty</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">RBT and caregiver flags will appear here for BCBA review.</p>
        </div>
      ) : (
        sorted.map((f) => {
          const program = programs.find((p) => p.id === f.programId);
          return (
            <div key={f.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge className={f.status === "Resolved" ? "border-slate-200 bg-slate-100 text-slate-600" : "border-amber-200 bg-amber-50 text-amber-800"}>
                      {f.status}
                    </Badge>
                    <Badge className="border-blue-200 bg-blue-50 text-blue-800">{flagTypes[f.type] || f.type}</Badge>
                  </div>
                  <p className="text-lg font-black text-[#12214A]">{f.reason}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    From: {f.requestedBy || "Team"} - {formatDate(f.createdAt)}
                  </p>
                  {program ? <p className="mt-2 text-sm font-black text-blue-700">Program: {program.target}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {program ? (
                    <Button variant="light" onClick={() => onOpenProgram(program)}>
                      <I name="edit" /> Open Program
                    </Button>
                  ) : null}
                  {isBCBA && f.status === "Open" ? (
                    <Button variant="green" onClick={() => onResolve(f.id)}>
                      <I name="check" /> Resolve
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

function AuditPanel({ audit }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#12214A]">Activity Log</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Local audit-style history for this prototype workspace.</p>
        </div>
        <Badge className="border-slate-200 bg-slate-100 text-slate-600">{audit.length} Events</Badge>
      </div>
      {audit.length === 0 ? (
        <p className="text-sm font-medium text-slate-500 text-center py-10">No activity yet.</p>
      ) : (
        <div className="space-y-3">
          {audit.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg shadow-sm border border-slate-200 shrink-0 text-slate-500">
                <I name={item.type === "flag" ? "flag" : item.type === "program" ? "target" : item.type === "client" ? "client" : "shield"} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">{item.message}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{formatDate(item.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- MODALS ---

function CurriculumBrowserModal({ domains, curriculum, onClose, onSelectProgram }) {
  const [activeDomain, setActiveDomain] = useState(domains[0]);

  const filteredPrograms = curriculum.filter(p => p.domain === activeDomain || (activeDomain === "All" && p));

  return (
    <ModalComponent title="ACE Curriculum Database" subtitle="Browse and import evidence-based treatment templates." onClose={onClose} width="max-w-5xl" icon={<I name="database" className="text-indigo-500" />}>
      <div className="flex flex-col md:flex-row gap-6 h-full min-h-[50vh]">
        {/* Sidebar Categories */}
        <div className="w-full md:w-64 bg-slate-50 rounded-2xl border border-slate-200 p-4 shrink-0 overflow-y-auto custom-scrollbar">
          <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 px-2">Skill Domains</h4>
          <div className="space-y-1">
            <button
              onClick={() => setActiveDomain("All")}
              className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors", activeDomain === "All" ? "bg-indigo-100 text-indigo-800" : "text-slate-600 hover:bg-slate-200")}
            >
              All Domains
            </button>
            {domains.map(d => (
              <button
                key={d}
                onClick={() => setActiveDomain(d)}
                className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors", activeDomain === d ? "bg-indigo-100 text-indigo-800" : "text-slate-600 hover:bg-slate-200")}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Program List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <I name="target" className="text-4xl mb-2 opacity-50" />
              <p className="font-bold">No templates found for this domain.</p>
            </div>
          ) : (
            filteredPrograms.map((prog, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
                <div>
                  <Badge tone="blue" className="mb-2">{prog.method}</Badge>
                  <h4 className="text-lg font-black text-slate-800">{prog.title}</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{prog.desc}</p>
                </div>
                <Button variant="primary" className="shrink-0" onClick={() => onSelectProgram(prog)}>
                  <I name="plus" /> Import Draft
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </ModalComponent>
  );
}

function ClinicalMentorModal({ apiKey, client, onClose, showToast }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askMentor = async () => {
    if (!apiKey) { showToast("Gemini API key required in Settings."); return; }
    if (!question.trim()) return;

    setLoading(true);
    setResponse("");
    const sysPrompt = "You are a Master BCBA-D mentoring a newer BCBA. The user is asking for programming advice, domain ideas, or troubleshooting help. Provide a highly clinical, evidence-based response using radical behaviorism. Keep it under 200 words, highly scannable with bullets.";
    const userPrompt = `Client Profile: ${client.profile}\n\nQuestion from BCBA: "${question}"`;

    try {
      const res = await callGemini(userPrompt, apiKey, sysPrompt);
      if (res) setResponse(res);
    } catch {
      setResponse("Error connecting to Clinical Core.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalComponent title="Clinical Mentor AI" subtitle="Ask for program ideas, troubleshooting, or methodological advice." onClose={onClose} width="max-w-3xl" icon={<I name="graduation" className="text-purple-600" />}>
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-start gap-4">
          <I name="brain" className="text-3xl mt-1 text-indigo-500" />
          <p className="text-sm text-indigo-900 leading-relaxed font-medium">
            I am your BCBA-D Professor. Tell me where you are stuck, or ask for program recommendations based on {client?.name || "this learner"}&apos;s profile.
          </p>
        </div>

        <Field label="Your Question">
          <TextArea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., 'What are 3 prerequisite programs I should run before teaching intraverbal fill-ins for a 5yo?'"
          />
        </Field>

        <Button variant="primary" className="w-full" onClick={askMentor} disabled={loading || !question}>
          {loading ? "Consulting Literature..." : "Ask Clinical Mentor"}
        </Button>

        {response && (
          <div className="mt-6 bg-slate-900 p-6 rounded-3xl border border-slate-700 text-slate-200 prose prose-invert text-sm max-w-none shadow-inner animate-in slide-in-from-bottom-4">
            <h4 className="text-xs font-black uppercase text-indigo-400 tracking-widest mb-3 border-b border-slate-700 pb-2 flex items-center gap-2">
              <I name="sparkles" /> Mentor Advice
            </h4>
            {response.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        )}
      </div>
    </ModalComponent>
  );
}

function EditorModal({ program, client, apiKey, domains, pools, programTemplates, onClose, onSave, showToast }) {
  const [draft, setDraft] = useState(program);
  const [aiTarget, setAiTarget] = useState(program.target || "");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
const [usedOffline, setUsedOffline] = useState(false);
  const [simplifying, setSimplifying] = useState(false);
  const [generatingIep, setGeneratingIep] = useState(false);
  const [generatingDataSheet, setGeneratingDataSheet] = useState(false);
  const [generatingMaterials, setGeneratingMaterials] = useState(false);

  const update = (key, value) => setDraft((p) => ({ ...p, [key]: value }));

  const applyTemplate = (methodType) => {
    const template = programTemplates[methodType];
    if (!template) return;
    setDraft(p => ({
      ...p,
      method: template.method,
      procedure: template.procedure,
      promptPlan: template.promptPlan,
      reinforcementPlan: template.reinforcementPlan,
      errorCorrection: template.errorCorrection,
      dataCollection: template.dataCollection
    }));
  };

  const simplifyCaregiver = async () => {
    if (!apiKey) { showToast("Please add your Gemini API Key in Settings to use the caregiver translator."); return; }
    if (!draft.procedure && !draft.objective) { showToast("Please fill out the Procedure or Objective first."); return; }
    setSimplifying(true);
    try {
      const prompt = `Translate this clinical ABA program into warm, empathetic, 6th-grade reading level instructions for a parent to practice at home.\nObjective: ${draft.objective}\nProcedure: ${draft.procedure}\nReturn ONLY the plain text instructions.`;
      const res = await callGemini(prompt, apiKey, "You are a warm, supportive BCBA explaining a program to a parent.");
      if (res) update("caregiverPlainLanguage", res.trim());
    } catch { showToast("Failed to simplify text."); }
    finally { setSimplifying(false); }
  };

  const generateIepGoal = async () => {
    if (!apiKey) { showToast("Please add your Gemini API Key in Settings."); return; }
    if (!draft.target) { showToast("Please add a target first."); return; }
    setGeneratingIep(true);
    try {
      const prompt = `Translate this clinical ABA target into a SMART IEP Goal suitable for a public school setting.\nTarget: ${draft.target}\nProcedure: ${draft.procedure || 'N/A'}\nReturn ONLY the plain text IEP Goal.`;
      const res = await callGemini(prompt, apiKey, "You are a special education teacher and BCBA writing an IEP goal.");
      if (res) update("objective", res.trim());
    } catch { showToast("Failed to generate IEP goal."); }
    finally { setGeneratingIep(false); }
  };

  const generateDataSheet = async () => {
    if (!apiKey) { showToast("Please add your Gemini API Key in Settings."); return; }
    if (!draft.target) { showToast("Please add a target first."); return; }
    setGeneratingDataSheet(true);
    try {
      const prompt = `Create a concise data collection protocol (1-2 sentences) for the ABA target: ${draft.target}. Include the metric (frequency, duration, percentage, etc.) and how to score it.`;
      const res = await callGemini(prompt, apiKey, "You are a BCBA writing instructions for RBTs.");
      if (res) update("dataCollection", res.trim());
    } catch { showToast("Failed to generate data sheet instructions."); }
    finally { setGeneratingDataSheet(false); }
  };

  const generateMaterials = async () => {
    if (!apiKey) { showToast("Please add your Gemini API Key in Settings."); return; }
    if (!draft.target) { showToast("Please add a target first."); return; }
    setGeneratingMaterials(true);
    try {
      const prompt = `Suggest a list of 5 specific, engaging toys or materials to use for teaching the ABA target: ${draft.target} to a ${client.age} year old. Return a simple comma-separated list.`;
      const res = await callGemini(prompt, apiKey, "You are a playful pediatric occupational therapist and BCBA.");
      if (res) update("materials", res.trim());
    } catch { showToast("Failed to generate materials."); }
    finally { setGeneratingMaterials(false); }
  };

  // Fallback offline generator for the editor
  const getReadablePlan = (t) => {
    return {
      target: t,
      objective: `Learner will demonstrate ${t} across 3 consecutive sessions.`,
      procedure: "1. Present SD.\n2. Wait 3s.\n3. Score response.",
      promptPlan: "Least-to-Most prompting.",
      reinforcementPlan: "FR-1 for independent responses.",
      errorCorrection: "4-step error correction.",
      masteryCriteria: "80% accuracy over 3 sessions.",
      dataCollection: "Trial by trial percentage.",
    };
  };

  const generate = async () => {
    const target = aiTarget.trim();
    if (!target) { showToast("Enter a target idea first."); return; }

    setLoading(true);
    setUsedOffline(false);
    try {
      let parsed = null;
      if (apiKey) {
        const prompt = `Generate an ABA program as valid JSON only for learner profile: ${client?.profile || "blank"}. Target idea: ${target}. Required keys: domain, target, method, objective, procedure, promptPlan, reinforcementPlan, errorCorrection, masteryCriteria, generalization, caregiverPlainLanguage, materials, dataCollection, clinicalRiskNote.`;
        const res = await callGemini(prompt, apiKey, "Return valid JSON only.");
        if (res) {
          const cleaned = res.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
          parsed = JSON.parse(cleaned);
        }
      }
      if (!parsed) {
        parsed = getReadablePlan(target);
        setUsedOffline(true);
      }
      setDraft((p) => ({
        ...p,
        ...parsed,
        target: parsed.target || target,
        domain: parsed.domain || p.domain,
        pool: p.pool || "candidate",
        updatedAt: nowStamp(),
      }));
    } catch {
      const fallback = getReadablePlan(target);
      setDraft((p) => ({ ...p, ...fallback, target: fallback.target || target, updatedAt: nowStamp() }));
      setUsedOffline(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalComponent title="Program Draft Builder" subtitle="Create, edit, approve, or format a program." onClose={onClose} width="max-w-6xl" icon={<I name="edit" className="text-blue-500" />}>
      <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-[#12214A] to-blue-950 p-6 text-white shadow-lg">
        <h4 className="text-xs font-black uppercase tracking-widest text-blue-300 mb-3 flex items-center gap-2"><I name="sparkles" /> AI Auto-Builder</h4>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <TextInput
              value={aiTarget}
              onChange={(e) => setAiTarget(e.target.value)}
              placeholder="e.g. Manding for break, Tacting colors..."
              className="text-slate-900 border-none shadow-inner"
            />
          </div>
          <Button variant="gold" onClick={generate} disabled={loading} className="py-3 lg:min-w-[180px]">
            {loading ? <><I name="refresh" /> Building...</> : <>Auto-Build</>}
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <span className="text-[10px] font-black uppercase text-slate-500 w-full mb-1">Load Methodology Template:</span>
        {Object.keys(programTemplates).map(key => (
          <button
            key={key}
            onClick={() => applyTemplate(key)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:border-indigo-400 hover:text-indigo-700 transition-colors shadow-sm"
          >
            {key} Template
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Domain">
          <Select value={draft.domain || ""} onChange={(e) => update("domain", e.target.value)}>
            <option value="">Select domain</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Target Name">
          <TextInput value={draft.target || ""} onChange={(e) => update("target", e.target.value)} placeholder="e.g. Tacts 3 colors" />
        </Field>
        <Field label="Teaching Method">
          <TextInput value={draft.method || ""} onChange={(e) => update("method", e.target.value)} placeholder="NET, DTT, FCT, BST, TA, etc." />
        </Field>
        <Field label="Pool Status">
          <Select value={draft.pool || "candidate"} onChange={(e) => update("pool", e.target.value)}>
            {Object.entries(pools).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="relative md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <Field label="Objective / IEP Goal">
            <TextArea rows={2} value={draft.objective || ""} onChange={(e) => update("objective", e.target.value)} />
          </Field>
          <button
            onClick={generateIepGoal}
            disabled={generatingIep}
            className="absolute top-4 right-4 text-[10px] font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
          >
            {generatingIep ? "Drafting..." : "AI: Draft SMART IEP Goal"}
          </button>
        </div>

        <div className="md:col-span-2">
          <Field label="Procedure (Setup & SD)">
            <TextArea rows={3} value={draft.procedure || ""} onChange={(e) => update("procedure", e.target.value)} />
          </Field>
        </div>
        <Field label="Prompt & Fading Plan">
          <TextArea rows={3} value={draft.promptPlan || ""} onChange={(e) => update("promptPlan", e.target.value)} />
        </Field>
        <Field label="Reinforcement Schedule">
          <TextArea rows={3} value={draft.reinforcementPlan || ""} onChange={(e) => update("reinforcementPlan", e.target.value)} />
        </Field>
        <Field label="Error Correction">
          <TextArea rows={2} value={draft.errorCorrection || ""} onChange={(e) => update("errorCorrection", e.target.value)} />
        </Field>

        <div className="relative md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <Field label="Data Collection Protocol">
            <TextArea rows={2} value={draft.dataCollection || ""} onChange={(e) => update("dataCollection", e.target.value)} />
          </Field>
          <button
            onClick={generateDataSheet}
            disabled={generatingDataSheet}
            className="absolute top-4 right-4 text-[10px] font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
          >
            {generatingDataSheet ? "Drafting..." : "AI: Generate Protocol"}
          </button>
        </div>

        <Field label="Mastery Criteria">
          <TextArea rows={2} value={draft.masteryCriteria || ""} onChange={(e) => update("masteryCriteria", e.target.value)} />
        </Field>
        <Field label="Generalization">
          <TextArea rows={2} value={draft.generalization || ""} onChange={(e) => update("generalization", e.target.value)} />
        </Field>

        <div className="relative md:col-span-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
          <Field label="Required Materials & Toys">
            <TextArea rows={2} value={draft.materials || ""} onChange={(e) => update("materials", e.target.value)} />
          </Field>
          <button
            onClick={generateMaterials}
            disabled={generatingMaterials}
            className="absolute top-4 right-4 text-[10px] font-bold bg-emerald-200 text-emerald-900 hover:bg-emerald-300 px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
          >
            {generatingMaterials ? "Brainstorming..." : "AI: Suggest Materials"}
          </button>
        </div>

        <div className="relative md:col-span-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
          <Field label="Caregiver Plain Language (For Parent App)">
            <TextArea rows={3} value={draft.caregiverPlainLanguage || ""} onChange={(e) => update("caregiverPlainLanguage", e.target.value)} />
          </Field>
          <button
            onClick={simplifyCaregiver}
            disabled={simplifying}
            className="absolute top-4 right-4 text-[10px] font-bold bg-indigo-200 text-indigo-800 hover:bg-indigo-300 px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
          >
            {simplifying ? "Translating..." : "AI: Simplify for Parents"}
          </button>
        </div>

        <div className="md:col-span-2">
          <Field label="Clinical Risk / Review Note">
            <TextArea rows={2} value={draft.clinicalRiskNote || ""} onChange={(e) => update("clinicalRiskNote", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-slate-200 pt-6">
        <Button variant="light" onClick={onClose} className="px-8">
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSave(draft)} className="px-10 py-4 shadow-lg">
          <I name="check" /> Save Program Protocol
        </Button>
      </div>
    </ModalComponent>
  );
}

function BaselineModal({ program, apiKey, onClose, onSubmit, showToast }) {
  const [data, setData] = useState("");
  const [notes, setNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeData = async () => {
    if (!apiKey) {
      showToast("Please add your Gemini API Key in Settings to use AI analysis.");
      return;
    }
    if (!data) {
      showToast("Please enter a baseline score first.");
      return;
    }
    setAnalyzing(true);
    try {
      const prompt = `I am an RBT taking baseline data for the target: "${program.target}". The raw data score is: "${data}". Write a 2-sentence clinical qualitative note describing this baseline performance to the BCBA. Return ONLY the plain text.`;
      const res = await callGemini(prompt, apiKey, "You are a highly observant RBT writing a concise clinical note.");
      if (res) {
        setNotes(res.trim());
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to analyze data.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ModalComponent title="Log Baseline Data" subtitle={`Target: ${program.target}`} onClose={onClose} width="max-w-lg" icon={<I name="chart" className="text-blue-500" />}>
      <div className="space-y-4">
        <Field label="Score / Data" hint="Examples: 0/5 independent, 15%, 2 prompts across 8 opportunities">
          <TextInput value={data} onChange={(e) => setData(e.target.value)} autoFocus />
        </Field>

        <div className="relative">
          <Field label="Qualitative Notes">
            <TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe prompts needed, barriers, motivation, behavior, or context." />
          </Field>
          <button
            onClick={analyzeData}
            disabled={analyzing || !data}
            className="absolute top-0 right-0 text-[10px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded transition flex items-center gap-1"
          >
            {analyzing ? "Analyzing..." : "Auto-Draft Note"}
          </button>
        </div>

        <Button variant="primary" className="w-full py-4 mt-4" onClick={() => onSubmit(program.id, data, notes)}>
          <I name="chart" /> Submit Baseline to BCBA
        </Button>
      </div>
    </ModalComponent>
  );
}

function FeedbackModal({ data, program, flagTypes, onClose, onSubmit }) {
  const [type, setType] = useState(data.type || "question");
  const [reason, setReason] = useState("");
  return (
    <ModalComponent title="Submit Feedback" subtitle="Send a flag to the BCBA queue." onClose={onClose} width="max-w-md" icon={<I name="flag" className="text-amber-500" />}>
      <div className="space-y-5">
        {program ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-black uppercase tracking-widest text-blue-500">Program</p>
            <p className="mt-1 font-black text-[#12214A]">{program.target}</p>
          </div>
        ) : null}
        <Field label="Flag Type">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(flagTypes).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Reason / Details">
          <TextArea rows={5} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus placeholder="Describe what happened, what worked, what was confusing, or what support is needed." />
        </Field>
        <Button variant="primary" className="w-full py-4" onClick={() => onSubmit({ ...data, type, reason })}>
          <I name="flag" /> Submit Feedback
        </Button>
      </div>
    </ModalComponent>
  );
}

function ClientModal({ client, onClose, onSave }) {
  const [draft, setDraft] = useState(client);
  return (
    <ModalComponent title={client.id ? "Edit Learner" : "Add Learner"} subtitle="Use placeholders for demos. Avoid real PHI in this local prototype." onClose={onClose} width="max-w-lg" icon={<I name="user" className="text-indigo-500" />}>
      <div className="space-y-5">
        <Field label="Name">
          <TextInput value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Jane Doe" autoFocus />
        </Field>
        <Field label="Age">
          <TextInput value={draft.age || ""} onChange={(e) => setDraft({ ...draft, age: e.target.value })} placeholder="5" />
        </Field>
        <Field label="Clinical Profile / Notes">
          <TextArea rows={6} value={draft.profile || ""} onChange={(e) => setDraft({ ...draft, profile: e.target.value })} placeholder="Strengths, barriers, communication system, reinforcers, caregiver priorities..." />
        </Field>
        <Button variant="primary" className="w-full py-4 mt-2" onClick={() => onSave(draft)}>
          <I name="check" /> Save Learner
        </Button>
      </div>
    </ModalComponent>
  );
}

function SettingsModal({ onClose, onReset, onExport, onImport }) {
  return (
    <ModalComponent title="Application Settings" subtitle="Local data, exports, and workspace management." onClose={onClose} width="max-w-2xl" icon={<I name="settings" className="text-slate-500" />}>
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
          <h4 className="flex items-center gap-2 text-lg font-black text-[#12214A] mb-2">
            <I name="wand" /> AI Intelligence Core
          </h4>
          <p className="text-sm font-medium leading-relaxed text-slate-600 mb-5">
            This app works perfectly using the built-in offline smart generator. The AI key is managed by the parent application and is automatically available when configured.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button variant="light" onClick={onExport} className="py-4">
            <I name="download" /> Export JSON Backup
          </Button>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 shadow-sm active:scale-95">
            <I name="upload" /> Import JSON Backup
            <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
          </label>
        </div>

        <div className="rounded-[2rem] border border-amber-100 bg-amber-50 p-6 mt-6">
          <h4 className="flex items-center gap-2 text-lg font-black text-amber-900 mb-2">
            <I name="alert" /> Prototype Safety
          </h4>
          <p className="text-sm font-medium leading-relaxed text-amber-900/80">
            This is a usable local application prototype, not a production HIPAA system. Add authentication, role-based access controls, encrypted backend storage, formal audit logs, BAA-covered vendors, and clinical governance before using real client data.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6 mt-2">
          <Button variant="red" className="w-full py-4" onClick={onReset}>
            <I name="trash" /> Wipe Local Data & Reset
          </Button>
        </div>
      </div>
    </ModalComponent>
  );
}
