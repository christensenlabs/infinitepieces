import React, { useEffect, useMemo, useState } from "react";
import { useApiData } from '@/hooks/useApiData';
import {
  fetchProgramTreePools,
  fetchProgramTreeFlagTypes,
  fetchProgramTreeDomains,
  fetchProgramTemplates,
  fetchAceCurriculum,
  fetchProgramTreeClients,
} from '@/api/apps';

import {
  DEFAULT_POOLS,
  DEFAULT_FLAG_TYPES,
  DEFAULT_DOMAINS,
  DEFAULT_PROGRAM_TEMPLATES,
  DEFAULT_ACE_CURRICULUM,
} from './constants';

import {
  STORAGE_KEY,
  ROLE_KEY,
  uid,
  cn,
  nowStamp,
  formatDate,
  getDefaultState,
  loadState,
  makeBlankProgram,
} from './utils';

import I from './components/Icon';
import Button from './components/Button';
import Select from './components/Select';
import TextInput from './components/TextInput';
import Metric from './components/Metric';
import PoolButton from './components/PoolButton';
import EmptyState from './components/EmptyState';

import ProgramCard from './views/ProgramCard';
import CaregiverPanel from './views/CaregiverPanel';
import FlagsPanel from './views/FlagsPanel';
import AuditPanel from './views/AuditPanel';
import EditorModal from './views/EditorModal';
import CurriculumBrowserModal from './views/CurriculumBrowserModal';
import ClinicalMentorModal from './views/ClinicalMentorModal';
import BaselineModal from './views/BaselineModal';
import FeedbackModal from './views/FeedbackModal';
import ClientModal from './views/ClientModal';
import SettingsModal from './views/SettingsModal';

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
          className="font-black text-brand-navy"
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
              <p className="text-sm font-black text-brand-navy">{client.name}</p>
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
    <div className="min-h-screen bg-surface font-sans text-slate-800 relative">
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
      <header className="sticky top-0 z-30 border-b border-white/10 bg-brand-navy px-4 py-4 text-white shadow-lg shadow-slate-900/10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <button
              className="rounded-2xl bg-white/10 p-3 text-white lg:hidden hover:bg-white/20 transition-colors"
              onClick={() => setMobileSidebar((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <I name="filter" />
            </button>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-gold-muted text-3xl shadow-inner">
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
                  role === r ? "bg-white text-brand-navy shadow" : "text-white hover:bg-white/20"
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
            <h3 className="text-2xl font-black text-brand-navy mb-2 flex items-center gap-2">
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
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-full bg-brand-navy px-6 py-3 text-sm font-black text-white shadow-2xl animate-in slide-in-from-bottom-4 flex items-center gap-2">
          <I name="check" className="text-emerald-400" /> {toast}
        </div>
      ) : null}
    </div>
  );
}
