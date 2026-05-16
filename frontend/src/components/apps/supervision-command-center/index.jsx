import { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Activity,
  AlertTriangle,
  FileSignature,
  TrendingUp,
  CheckCircle2,
  Bot,
  Clock,
  UserCheck,
  ChevronRight,
  X,
  Send,
  ClipboardCheck,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { fetchSupervisionRoster, fetchSupervisionConfig } from '@/api/apps';

function getStatusColor(status) {
  if (status === 'green') return 'bg-emerald-500';
  if (status === 'yellow') return 'bg-yellow-400';
  return 'bg-red-500';
}

export default function SupervisionCommandCenter() {
  const { data: rbtData } = useApiData(fetchSupervisionRoster);
  const { data: config } = useApiData(fetchSupervisionConfig);

  // activeTab reserved for future tab navigation
  const [activeTab] = useState('dashboard'); // eslint-disable-line no-unused-vars
  const [selectedRbt, setSelectedRbt] = useState(null);
  const [clickQuery, setClickQuery] = useState('');
  const [clickResponse, setClickResponse] = useState(null);
  const [isClickThinking, setIsClickThinking] = useState(false);

  if (!rbtData || !config) {
    return (
      <div className="p-8 text-center text-slate-400">Loading...</div>
    );
  }

  const capacityPct = Math.round(
    (config.bcbaCapacity.current / config.bcbaCapacity.max) * 100
  );

  const handleClickSend = (query) => {
    const q = (query ?? clickQuery).trim();
    if (!q) return;
    setClickQuery('');
    setIsClickThinking(true);
    setClickResponse(null);

    setTimeout(() => {
      const lower = q.toLowerCase();
      let response;

      if (lower.includes('missing') || lower.includes('risk')) {
        const atRisk = rbtData.filter((r) => r.status === 'red');
        response = {
          type: 'alert',
          title: 'At-Risk RBTs',
          body: atRisk.length
            ? atRisk
                .map(
                  (r) =>
                    `• ${r.name} — ${r.compliance}% compliance (${r.supHours} sup hrs billed)`
                )
                .join('\n')
            : 'No at-risk RBTs found at this time.',
        };
      } else if (
        lower.includes('feedback') ||
        lower.includes('draft') ||
        lower.includes('sarah')
      ) {
        response = {
          type: 'document',
          title: 'Supervision Feedback Summary',
          body:
            'Sarah C. — Observation #4 (04/28/2026)\n\nStrengths: Consistent use of DTT protocols, strong rapport with learner.\n\nAreas for Growth: Increase rate of reinforcement delivery; review error correction procedures for vocal targets.\n\nNext Steps: Schedule competency check on prompt fading by 05/15/2026.',
        };
      } else {
        response = {
          type: 'general',
          title: 'Click AI Response',
          body:
            'I can help you review RBT compliance status, identify supervision gaps, draft observation feedback, or summarize pending actions. Try asking about "missing hours", "at-risk staff", or request a "feedback draft for Sarah".',
        };
      }

      setClickResponse(response);
      setIsClickThinking(false);
    }, 1500);
  };

  const quickPrompts = [
    { label: 'Who is missing hours?', query: 'Who is missing supervision hours?' },
    { label: 'Draft Sarah feedback', query: 'Draft supervision feedback for Sarah' },
  ];

  return (
    <div className="min-h-full bg-[#040811] text-slate-100 font-sans p-6">
      <style dangerouslySetInnerHTML={{ __html: `
        .scc-scroll::-webkit-scrollbar { width: 5px; }
        .scc-scroll::-webkit-scrollbar-track { background: transparent; }
        .scc-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
        .scc-scroll::-webkit-scrollbar-thumb:hover { background: #334155; }
      ` }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/15 rounded-xl border border-indigo-500/25">
            <ShieldCheck size={22} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Supervision Command Center™
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              RBT oversight &amp; BACB compliance tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2">
          <UserCheck size={15} className="text-indigo-400" />
          <span className="text-xs text-slate-400">BCBA Capacity</span>
          <span
            className={`text-sm font-bold ml-1 ${
              capacityPct >= 90
                ? 'text-red-400'
                : capacityPct >= 70
                ? 'text-yellow-400'
                : 'text-emerald-400'
            }`}
          >
            {capacityPct}%
          </span>
          <span className="text-xs text-slate-500">
            ({config.bcbaCapacity.current}/{config.bcbaCapacity.max})
          </span>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  Clinic 5% Compliance
                </span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <p className="text-3xl font-bold text-white">94%</p>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
                <TrendingUp size={12} />
                Above threshold
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  At Risk Sub-5%
                </span>
                <AlertTriangle size={16} className="text-red-400" />
              </div>
              <p className="text-3xl font-bold text-red-400">2</p>
              <p className="text-xs text-slate-500 mt-1">RBTs below threshold</p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                  Pending Observations
                </span>
                <Clock size={16} className="text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-yellow-400">4</p>
              <p className="text-xs text-slate-500 mt-1">Due this billing period</p>
            </div>
          </div>

          {/* RBT Supervision Roster */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-800">
              <Users size={16} className="text-indigo-400" />
              <h2 className="text-sm font-semibold text-white">
                RBT Supervision Roster
              </h2>
              <span className="ml-auto text-xs text-slate-500">
                {rbtData.length} staff
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <th className="text-left px-5 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Name
                    </th>
                    <th className="text-center px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Billed Hrs
                    </th>
                    <th className="text-center px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Sup. Hrs
                    </th>
                    <th className="text-center px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Compliance%
                    </th>
                    <th className="text-center px-4 py-3 text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Obs/2
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {rbtData.map((rbt) => (
                    <tr
                      key={rbt.id}
                      onClick={() =>
                        setSelectedRbt(selectedRbt?.id === rbt.id ? null : rbt)
                      }
                      className={`border-b border-slate-800/50 cursor-pointer transition-colors ${
                        selectedRbt?.id === rbt.id
                          ? 'bg-indigo-500/10'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${getStatusColor(
                              rbt.status
                            )}`}
                          />
                          <span className="text-slate-200 font-medium">
                            {rbt.name}
                          </span>
                          {rbt.pip && (
                            <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded px-1.5 py-0.5">
                              PIP
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">
                        {rbt.totalHours}
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">
                        {rbt.supHours}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`font-semibold ${
                            rbt.compliance >= 5
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {rbt.compliance}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-300">
                        {rbt.obs}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ChevronRight
                          size={16}
                          className={`mx-auto transition-transform ${
                            selectedRbt?.id === rbt.id
                              ? 'rotate-90 text-indigo-400'
                              : 'text-slate-600'
                          }`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Click AI Copilot */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col h-[400px]">
            {/* Chat header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800 shrink-0">
              <div className="p-1.5 bg-indigo-500/15 rounded-lg">
                <Bot size={16} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-tight">
                  Click AI Copilot
                </p>
                <p className="text-[10px] text-slate-500">
                  Supervision intelligence
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 scc-scroll">
              {/* Initial message */}
              <div className="flex items-start gap-2">
                <div className="p-1 bg-indigo-500/10 rounded-md shrink-0 mt-0.5">
                  <Bot size={12} className="text-indigo-400" />
                </div>
                <p className="text-xs text-slate-300 bg-slate-800/60 border border-slate-700/50 rounded-xl rounded-tl-none px-3 py-2 leading-relaxed">
                  Hello! I can help you identify compliance gaps, surface at-risk
                  RBTs, and draft supervision documentation. What do you need?
                </p>
              </div>

              {/* Quick prompt buttons */}
              {!clickResponse && !isClickThinking && (
                <div className="flex flex-col gap-2 pl-7">
                  {quickPrompts.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handleClickSend(p.query)}
                      className="text-left text-xs text-indigo-300 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/25 rounded-lg px-3 py-2 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Thinking indicator */}
              {isClickThinking && (
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-indigo-500/10 rounded-md shrink-0 mt-0.5">
                    <Bot size={12} className="text-indigo-400" />
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl rounded-tl-none px-3 py-2">
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:0ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:150ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              {/* Response */}
              {clickResponse && (
                <div className="flex items-start gap-2">
                  <div className="p-1 bg-indigo-500/10 rounded-md shrink-0 mt-0.5">
                    <Bot size={12} className="text-indigo-400" />
                  </div>
                  <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl rounded-tl-none px-3 py-2 text-xs text-slate-300 leading-relaxed max-w-full">
                    {clickResponse.type === 'alert' && (
                      <p className="text-red-400 font-semibold mb-1 flex items-center gap-1">
                        <AlertTriangle size={11} />
                        {clickResponse.title}
                      </p>
                    )}
                    {clickResponse.type === 'document' && (
                      <p className="text-indigo-300 font-semibold mb-1 flex items-center gap-1">
                        <FileSignature size={11} />
                        {clickResponse.title}
                      </p>
                    )}
                    {clickResponse.type === 'general' && (
                      <p className="text-slate-400 font-semibold mb-1">
                        {clickResponse.title}
                      </p>
                    )}
                    <p className="whitespace-pre-line">{clickResponse.body}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-slate-800 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleClickSend();
                }}
                className="flex items-center gap-2 bg-slate-800/60 border border-slate-700 rounded-xl px-3 py-1.5 focus-within:border-indigo-500/60 transition-colors"
              >
                <input
                  type="text"
                  value={clickQuery}
                  onChange={(e) => setClickQuery(e.target.value)}
                  placeholder="Ask about supervision gaps…"
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isClickThinking || !clickQuery.trim()}
                  className="p-1.5 bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send size={13} />
                </button>
              </form>
            </div>
          </div>

          {/* Selected RBT detail */}
          {selectedRbt ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${getStatusColor(
                      selectedRbt.status
                    )}`}
                  />
                  <h3 className="text-sm font-semibold text-white">
                    {selectedRbt.name}
                  </h3>
                  {selectedRbt.pip && (
                    <span className="text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded px-1.5 py-0.5">
                      PIP
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setSelectedRbt(null)}
                  className="text-slate-600 hover:text-slate-300 transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <p className="text-slate-500 mb-1">Compliance</p>
                  <p
                    className={`text-lg font-bold ${
                      selectedRbt.compliance >= 5
                        ? 'text-emerald-400'
                        : 'text-red-400'
                    }`}
                  >
                    {selectedRbt.compliance}%
                  </p>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50">
                  <p className="text-slate-500 mb-1">Observations</p>
                  <p className="text-lg font-bold text-white">
                    {selectedRbt.obs}
                    <span className="text-xs text-slate-500 font-normal"> /2</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-4 text-xs">
                <Activity size={12} className="text-slate-500" />
                <span className="text-slate-500">Trend:</span>
                <span className="text-slate-300">{selectedRbt.trend}</span>
              </div>

              <div className="space-y-2">
                <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/25 rounded-xl transition-colors">
                  <ClipboardCheck size={14} />
                  Log Observation
                </button>
                <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl transition-colors">
                  <FileSignature size={14} />
                  Draft Review
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/40 border border-slate-800/60 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[160px]">
              <UserCheck size={24} className="text-slate-700" />
              <p className="text-xs text-slate-600">
                Select an RBT from the roster to view their detail card.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
