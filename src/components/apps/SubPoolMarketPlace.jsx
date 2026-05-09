import { useState, useEffect, useRef, useCallback } from 'react';
import {
  DollarSign, Clock, MapPin, Activity,
  MessageSquare, Send, Zap, Shield, Car, CheckCircle,
  TrendingUp, Users, Video, Calendar, Loader2, RefreshCw,
  Sparkles, X, BrainCircuit, FileText
} from 'lucide-react';
import { callGemini } from '../../lib/gemini';
import { useApiData } from '../../hooks/useApiData';
import { fetchSubPoolConfig } from '../../api/apps';

export default function SubPoolMarketPlace({ apiKey }) {
  const { data: config } = useApiData(fetchSubPoolConfig);

  // Cross-App Data (replaces Firebase collections)
  const [shifts, setShifts] = useState([]);
  const [chats, setChats] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // UI State
  const [activeRole, setActiveRole] = useState('rbt'); // 'scheduler', 'rbt', 'bcba'
  const chatEndRef = useRef(null);
  const msgIdRef = useRef(0);

  // New AI Action State
  const [aiActionState, setAiActionState] = useState({
    isOpen: false,
    loading: false,
    title: '',
    result: '',
    shift: null
  });

  // Role Mocks (from config or fallback)
  const profiles = config?.profiles || {
    scheduler: { name: 'Sam (Scheduler)', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    rbt: { name: 'Michael T. (RBT)', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    bcba: { name: 'Amanda R. (BCBA)', color: 'text-purple-400', bg: 'bg-purple-500/20' }
  };
  const currentUser = profiles[activeRole];

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // --- ACTIONS (local state instead of Firebase) ---

  const sendMessage = useCallback((text, isSystem = false) => {
    if (!text.trim()) return;
    msgIdRef.current += 1;
    const newMsg = {
      id: `msg_${msgIdRef.current}`,
      user: isSystem ? 'System AI' : currentUser.name,
      text: text.trim(),
      isSystem,
      timestamp: msgIdRef.current
    };
    setChats(prev => [...prev, newMsg]);
    setChatInput('');
  }, [currentUser.name]);

  const claimShift = (shift, asTelehealth = false) => {
    // Update shift status
    setShifts(prev => prev.map(s =>
      s.id === shift.id
        ? {
            ...s,
            status: 'claimed',
            claimedBy: currentUser.name,
            claimedRole: activeRole,
            claimedAt: Date.now(),
            convertedToTelehealth: asTelehealth
          }
        : s
    ));

    // Broadcast to chat
    const actionText = asTelehealth
      ? `converted ${shift.clientName || 'session'} to Telehealth Parent Training.`
      : `claimed the ${shift.clientName || 'session'} shift for +$${shift.bounty || 0} bounty!`;

    sendMessage(`⚡ ${currentUser.name} ${actionText}`, true);
  };

  const boostBounty = (shift) => {
    const boost = config?.bountyBoost || 15;
    const currentBounty = shift.bounty || 10;
    const newBounty = currentBounty + boost;

    setShifts(prev => prev.map(s =>
      s.id === shift.id
        ? { ...s, bounty: newBounty, status: 'dispatched' }
        : s
    ));

    sendMessage(`📈 Scheduler boosted bounty for ${shift.clientName || 'session'} to $${newBounty}!`, true);
  };

  const scanMarket = async () => {
    sendMessage(`🤖 AI Market Scan initiated by Scheduler...`, true);
    const uncovered = shifts.filter(s => s.status === 'uncovered' || s.status === 'dispatched');
    if(uncovered.length === 0) {
       setTimeout(() => sendMessage(`🤖 Market optimal. No pending shifts detected.`, true), 1000);
       return;
    }

    const prompt = `You are a SubPool AI. We have ${uncovered.length} uncovered shifts. Generate a 1 sentence hype message to the RBT pool to get them to pick up shifts. Say bounties are active.`;
    try {
      const aiText = await callGemini(prompt, apiKey, "You are the AI Market Maker for an ABA clinic SubPool. Keep responses extremely brief, punchy, and operational.");
      if(aiText) sendMessage(`🤖 ${aiText}`, true);
    } catch {
      sendMessage(`🤖 Market scan encountered an error. Please try again.`, true);
    }
  };

  // --- AI FEATURES ---
  const handleAIAction = async (actionType, shift) => {
    let title = '';
    let prompt = '';
    let instruction = '';

    if (actionType === 'match') {
      title = 'AI Smart Match Recommendation';
      instruction = 'You are a clinic scheduling AI. Keep it short and persuasive.';
      prompt = `For the uncovered shift with client "${shift.clientName || 'Unknown'}" at ${shift.time} in ${shift.location}. Invent a fictional RBT from the clinic roster who is a perfect fit based on this location. Write a 2-sentence persuasive text message to them offering the $${shift.bounty || 10} bounty.`;
    } else if (actionType === 'telehealth') {
      title = 'AI Telehealth Agenda Drafter';
      instruction = 'You are an expert BCBA. Format with markdown bullet points.';
      prompt = `Session for client "${shift.clientName || 'Unknown'}" is being pivoted to telehealth. Draft a rapid 3-bullet parent coaching agenda to ensure the session remains productive despite being remote.`;
    } else if (actionType === 'analyze') {
      title = 'AI Shift Fit Analyzer';
      instruction = 'You are an RBT mentor AI. Be highly encouraging and actionable.';
      prompt = `An RBT is considering claiming a shift for client "${shift.clientName || 'Unknown'}" at ${shift.time}, location: ${shift.location}. Give a 2-sentence encouraging summary of what to expect and 1 quick ABA tip for a successful session with a new client.`;
    }

    setAiActionState({ isOpen: true, loading: true, title, result: '', shift });

    try {
      const res = await callGemini(prompt, apiKey, instruction);
      setAiActionState(prev => ({ ...prev, loading: false, result: res || 'Failed to generate AI insight. Please try again.' }));
    } catch {
      setAiActionState(prev => ({ ...prev, loading: false, result: 'Failed to generate AI insight. Please try again.' }));
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

  const defaultBounty = config?.defaultBounty || 10;
  const availableShifts = shifts.filter(s => s.status === 'uncovered' || s.status === 'dispatched' || s.status === 'parent_cancel' || s.status === 'staff_callout');
  const claimedShifts = shifts.filter(s => s.status === 'claimed');

  return (
    <div className="h-screen bg-[#040811] flex flex-col font-sans text-slate-200 overflow-hidden selection:bg-cyan-500/30">

      <style>{`
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* TOP NAVIGATION */}
      <header className="h-16 bg-[#0A1220] border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/50 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
            <TrendingUp size={18} />
          </div>
          <div>
            <h1 className="font-black text-white tracking-widest uppercase text-sm">SubPool Marketplace</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Live Sync Active
            </p>
          </div>
        </div>

        {/* Role Switcher (For Prototype Testing) */}
        <div className="flex items-center gap-3 bg-black/40 p-1 rounded-xl border border-white/5">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 hidden sm:block">View As:</span>
          <button onClick={() => setActiveRole('scheduler')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeRole === 'scheduler' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>Scheduler</button>
          <button onClick={() => setActiveRole('rbt')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeRole === 'rbt' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>RBT</button>
          <button onClick={() => setActiveRole('bcba')} className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${activeRole === 'bcba' ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>BCBA</button>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        {/* LEFT/CENTER: MARKETPLACE BOARD */}
        <div className="flex-1 flex flex-col min-w-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/10 via-[#040811] to-[#040811] relative z-10">

          {/* Market Stats Bar */}
          <div className="p-4 sm:p-6 shrink-0 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0A1220] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-500/20 text-rose-400 rounded-full hidden sm:flex items-center justify-center"><Activity size={20} /></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Open Shifts</p>
                <p className="text-xl sm:text-2xl font-black text-white leading-none">{availableShifts.length}</p>
              </div>
            </div>
            <div className="bg-[#0A1220] border border-white/5 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full hidden sm:flex items-center justify-center"><CheckCircle size={20} /></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Claimed Today</p>
                <p className="text-xl sm:text-2xl font-black text-white leading-none">{claimedShifts.length}</p>
              </div>
            </div>
            <div className="bg-[#0A1220] border border-white/5 p-4 rounded-2xl flex items-center gap-4 hidden sm:flex">
              <div className="w-10 h-10 bg-[#FFC800]/20 text-[#FFC800] rounded-full flex items-center justify-center"><DollarSign size={20} /></div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1">Bounties Paid</p>
                <p className="text-xl sm:text-2xl font-black text-white leading-none">${claimedShifts.reduce((sum, s) => sum + (s.bounty || 0), 0)}</p>
              </div>
            </div>
            {activeRole === 'scheduler' && (
              <button onClick={scanMarket} className="bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition-colors p-4 rounded-2xl flex flex-col items-center justify-center group hidden sm:flex">
                <RefreshCw size={20} className="text-cyan-400 mb-1 group-hover:rotate-180 transition-transform duration-500" />
                <p className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">AI Market Scan</p>
              </button>
            )}
          </div>

          {/* Shift Board */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6 custom-scrollbar">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-white/5 pb-2">Live Trading Board</h2>

            {availableShifts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <Shield size={48} className="text-emerald-500 mb-4" />
                <p className="text-xl font-black text-white">Grid is Secure.</p>
                <p className="text-sm font-medium mt-2 text-slate-400">No dropped shifts at this time.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {availableShifts.map(shift => (
                  <div key={shift.id} className="bg-[#0A1220] border border-white/10 hover:border-cyan-500/30 rounded-2xl p-5 shadow-lg transition-all fade-in flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center shrink-0">
                          {shift.location?.toLowerCase().includes('clinic') ? <Shield className="text-blue-400" /> : <Car className="text-emerald-400" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-black text-white">{shift.clientName || shift.patientName || 'Unassigned Session'}</h3>
                          <p className="text-xs font-bold text-slate-400 flex items-center gap-1.5 mt-1">
                            <Calendar size={12} /> {shift.date || 'Today'} <span className="mx-1">•</span> <Clock size={12}/> {shift.startTime || 'TBD'}
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#FFC800]/10 border border-[#FFC800]/30 px-3 py-1.5 rounded-lg text-right shrink-0">
                        <p className="text-[9px] text-[#FFC800] uppercase font-black tracking-widest mb-0.5">Bounty</p>
                        <p className="text-lg font-black text-[#FFC800] leading-none">+${shift.bounty || defaultBounty}</p>
                      </div>
                    </div>

                    <div className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-4 bg-black/20 p-2.5 rounded-lg border border-white/5">
                      <MapPin size={14} className="text-rose-400 shrink-0" />
                      <span className="truncate">{shift.location || 'Unknown Location'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto flex flex-col gap-2">
                      <div className="flex gap-2">
                        {activeRole === 'scheduler' ? (
                          <>
                            <button disabled className="flex-1 bg-white/5 text-slate-400 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2">
                              <Activity size={14}/> Waiting...
                            </button>
                            <button onClick={() => boostBounty(shift)} className="flex-1 bg-[#FFC800]/10 hover:bg-[#FFC800]/20 text-[#FFC800] font-black py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                              <TrendingUp size={14}/> Boost +${config?.bountyBoost || 15}
                            </button>
                          </>
                        ) : activeRole === 'bcba' ? (
                          <>
                            <button onClick={() => claimShift(shift, false)} className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-[#040811] font-black py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                              <Zap size={14}/> Claim 1:1
                            </button>
                            <button onClick={() => claimShift(shift, true)} className="flex-1 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/50 text-purple-400 font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest transition-colors flex items-center justify-center gap-1">
                              <Video size={14}/> Pivot to Telehealth
                            </button>
                          </>
                        ) : (
                          <button onClick={() => claimShift(shift, false)} className="w-full bg-emerald-500 hover:bg-emerald-400 text-[#040811] font-black py-2.5 rounded-xl text-xs uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2">
                            <Zap size={14}/> Claim Shift & Bounty
                          </button>
                        )}
                      </div>

                      {/* Dynamic AI Copilot Buttons based on Role */}
                      <div className="pt-2 border-t border-white/5">
                        {activeRole === 'scheduler' && (
                          <button onClick={() => handleAIAction('match', shift)} className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                            <Sparkles size={14} /> AI Smart Match
                          </button>
                        )}
                        {activeRole === 'bcba' && (
                          <button onClick={() => handleAIAction('telehealth', shift)} className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                            <Sparkles size={14} /> Auto-Draft Telehealth Plan
                          </button>
                        )}
                        {activeRole === 'rbt' && (
                          <button onClick={() => handleAIAction('analyze', shift)} className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors">
                            <Sparkles size={14} /> Analyze Shift Fit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Display recently claimed at bottom */}
            {claimedShifts.length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/10">
                <h2 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                  <CheckCircle size={14} className="text-emerald-500" /> Recently Claimed
                </h2>
                <div className="space-y-2">
                  {claimedShifts.map(shift => (
                    <div key={shift.id} className="bg-white/5 border border-white/5 rounded-xl p-3 flex justify-between items-center opacity-60">
                      <div>
                        <p className="text-sm font-bold text-white">{shift.clientName || shift.patientName}</p>
                        <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-bold">Claimed by: {shift.claimedBy} ({shift.claimedRole?.toUpperCase()})</p>
                      </div>
                      {shift.convertedToTelehealth && (
                        <span className="text-[10px] font-black uppercase tracking-widest text-purple-400 bg-purple-500/10 px-2 py-1 rounded border border-purple-500/30">
                          Telehealth Pivot
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: LIVE FEED & CHAT */}
        <div className="w-full md:w-[380px] md:h-full bg-[#0A1220] border-t md:border-t-0 md:border-l border-white/5 flex flex-col shrink-0 z-20 shadow-2xl relative h-64 md:h-auto">
          <div className="p-5 border-b border-white/5 flex items-center gap-3 shrink-0 bg-black/20">
            <MessageSquare className="text-cyan-400" size={18} />
            <h2 className="font-black text-white text-sm uppercase tracking-widest">Live Feed</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
            {chats.length === 0 ? (
              <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mt-10">No recent activity</p>
            ) : (
              chats.map(chat => (
                <div key={chat.id} className="flex gap-3 fade-in">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-md ${chat.isSystem ? 'bg-black border-cyan-500/50 text-cyan-400' : 'bg-slate-800 border-white/10 text-white'}`}>
                    {chat.isSystem ? <Zap size={14} /> : <Users size={14} />}
                  </div>
                  <div>
                    <p className={`text-[10px] font-black tracking-widest uppercase mb-0.5 ${chat.isSystem ? 'text-cyan-400' : 'text-slate-500'}`}>
                      {chat.user}
                    </p>
                    <p className={`text-sm font-medium leading-snug ${chat.isSystem ? 'text-white' : 'text-slate-300'}`}>
                      {chat.text}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-white/5 bg-black/20 shrink-0">
            <div className="relative flex items-center">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage(chatInput)}
                placeholder="Send message..."
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
              />
              <button
                onClick={() => sendMessage(chatInput)}
                disabled={!chatInput.trim()}
                className="absolute right-2 p-1.5 text-slate-400 hover:text-cyan-400 disabled:opacity-50 transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* --- AI ACTION MODAL --- */}
      {aiActionState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 fade-in">
          <div className="bg-[#0A1220] border border-cyan-500/30 rounded-3xl w-full max-w-lg shadow-[0_0_40px_rgba(0,229,255,0.15)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">{aiActionState.title}</h3>
                  <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">Powered by Gemini</p>
                </div>
              </div>
              <button onClick={() => setAiActionState({ ...aiActionState, isOpen: false })} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-8">
              {aiActionState.loading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <Loader2 size={40} className="text-cyan-400 animate-spin" />
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs animate-pulse">Synthesizing Insights...</p>
                </div>
              ) : (
                <div className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6">
                  {aiActionState.shift && (
                    <div className="flex items-center gap-2 mb-4 pb-4 border-b border-slate-700/50">
                      <FileText size={16} className="text-slate-500" />
                      <span className="text-slate-300 text-sm font-medium">Context: {aiActionState.shift.clientName || 'Unknown'} • {aiActionState.shift.location}</span>
                    </div>
                  )}
                  <div className="text-white text-sm md:text-base leading-relaxed space-y-1">
                    {renderMarkdown(aiActionState.result)}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-white/10 bg-black/20 flex justify-end">
              <button
                onClick={() => setAiActionState({ ...aiActionState, isOpen: false })}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold text-sm transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
