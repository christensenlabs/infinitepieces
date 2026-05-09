const STORAGE_KEY = "abaflow_program_library_live_app_v3";
const ROLE_KEY = "abaflow_program_library_role_v3";

function uid(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cn(...classes) {
  return classes.filter(Boolean).join(" ");
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

export {
  STORAGE_KEY,
  ROLE_KEY,
  uid,
  cn,
  nowStamp,
  formatDate,
  getDefaultState,
  loadState,
  makeBlankProgram,
};
