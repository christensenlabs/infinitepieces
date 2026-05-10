import { useState, useEffect, useRef, useCallback } from 'react';
import { TrendingUp } from 'lucide-react';
import { callGemini } from '@/lib/gemini';
import { renderMarkdown } from '@/lib/renderMarkdown';
import { useApiData } from '@/hooks/useApiData';
import { fetchSubPoolConfig } from '@/api/apps';

import RoleSwitcher from './components/RoleSwitcher';
import MarketView from './views/MarketView';
import ChatPanel from './views/ChatPanel';
import AiActionModal from './views/AiActionModal';

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

  const defaultBounty = config?.defaultBounty || 10;
  const availableShifts = shifts.filter(s => s.status === 'uncovered' || s.status === 'dispatched' || s.status === 'parent_cancel' || s.status === 'staff_callout');
  const claimedShifts = shifts.filter(s => s.status === 'claimed');

  return (
    <div className="h-screen bg-brand-dark flex flex-col font-sans text-slate-200 overflow-hidden selection:bg-cyan-500/30">

      <style>{`
        .fade-in { animation: fadeIn 0.3s ease-out forwards; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>

      {/* TOP NAVIGATION */}
      <header className="h-16 bg-brand-panel border-b border-white/5 flex items-center justify-between px-6 shrink-0 z-20">
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
        <RoleSwitcher activeRole={activeRole} onRoleChange={setActiveRole} />
      </header>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">

        <MarketView
          availableShifts={availableShifts}
          claimedShifts={claimedShifts}
          activeRole={activeRole}
          defaultBounty={defaultBounty}
          config={config}
          onClaim={claimShift}
          onBoost={boostBounty}
          onAIAction={handleAIAction}
          onScanMarket={scanMarket}
        />

        <ChatPanel
          chats={chats}
          chatInput={chatInput}
          onChatInputChange={setChatInput}
          onSendMessage={sendMessage}
          chatEndRef={chatEndRef}
        />

      </div>

      {/* --- AI ACTION MODAL --- */}
      <AiActionModal
        aiActionState={aiActionState}
        onClose={() => setAiActionState({ ...aiActionState, isOpen: false })}
        renderMarkdown={renderMarkdown}
      />

    </div>
  );
}
