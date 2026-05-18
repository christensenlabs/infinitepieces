import { useState, useCallback, useRef, useEffect } from 'react';
import {
  MessageSquare, Hash, Lock, Shield, Search, Paperclip, Send,
  AlertTriangle, CheckCircle2, Loader2, Bot, X, ChevronDown,
  Sparkles, ListTodo, Reply, LinkIcon,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { useGeminiAction } from '@/hooks/useGeminiAction';
import { useApp } from '@/context/AppContext';
import { fetchCommsUsers, fetchCommsChannels, fetchCommsMessages } from '@/api/apps';

const ICON_MAP = { Hash, Lock, Shield };

function ChannelIcon({ iconType, size = 16, className = '' }) {
  const Icon = ICON_MAP[iconType] || Hash;
  return <Icon size={size} className={className} />;
}

function RoleBadge({ role }) {
  const styles = {
    administrator: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
    admin: 'bg-amber-900/60 text-amber-300 border-amber-700/50',
    bcba: 'bg-violet-900/60 text-violet-300 border-violet-700/50',
    rbt: 'bg-sky-900/60 text-sky-300 border-sky-700/50',
    os: 'bg-slate-700/60 text-slate-300 border-slate-600/50',
    system: 'bg-slate-700/60 text-slate-300 border-slate-600/50',
  };
  const key = (role || '').toLowerCase();
  return (
    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${styles[key] || styles.system}`}>
      {role}
    </span>
  );
}

function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span className="ml-auto min-w-[20px] h-5 flex items-center justify-center rounded-full bg-cyan-500 text-[11px] font-bold text-slate-950 px-1.5">
      {count}
    </span>
  );
}

function SecurityIndicator({ isSecure }) {
  if (isSecure) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-medium">
        <Shield size={14} />
        <span>Secure Care Team</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 text-amber-400 text-xs font-medium">
      <AlertTriangle size={14} />
      <span>General — No PHI</span>
    </div>
  );
}

function MessageBubble({ msg, currentUser, onAcknowledge }) {
  if (msg.isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="border-l-2 border-slate-600 bg-slate-800/50 rounded-r px-4 py-2 text-sm text-slate-400 italic max-w-lg text-center">
          {msg.body}
        </div>
      </div>
    );
  }

  const isSelf = msg.isSelf;
  return (
    <div className={`flex gap-3 ${isSelf ? 'flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 uppercase">
        {msg.sender.slice(0, 2)}
      </div>
      <div className={`max-w-[70%] ${isSelf ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className="flex items-center gap-2">
          {!isSelf && <span className="text-sm font-semibold text-slate-200">{msg.sender}</span>}
          <RoleBadge role={msg.role} />
          <span className="text-[11px] text-slate-500">{msg.time}</span>
          {msg.isUrgent && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-900/40 border border-rose-700/50 px-1.5 py-0.5 rounded">
              <AlertTriangle size={10} /> PRIORITY
            </span>
          )}
        </div>
        <div className={`rounded-lg px-4 py-2.5 text-sm leading-relaxed ${isSelf ? 'bg-cyan-900/40 text-cyan-100 border border-cyan-800/50' : 'bg-slate-800 text-slate-200 border border-slate-700/50'}`}>
          {msg.body}
        </div>
        {msg.reqAck && !isSelf && msg.acks && !msg.acks.includes(currentUser) && (
          <button
            onClick={() => onAcknowledge(msg.id)}
            className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 mt-1 transition-colors"
          >
            <CheckCircle2 size={12} /> Acknowledge Receipt
          </button>
        )}
        {msg.acks && msg.acks.length > 0 && (
          <div className="text-[11px] text-emerald-400/80 mt-0.5">
            Acknowledged by: {msg.acks.join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

function AiPanel({ messages, onInsert, onClose }) {
  const { apiKey } = useApp();
  const { result, loading, execute, clear } = useGeminiAction(apiKey);

  const buildPrompt = useCallback((action) => {
    const threadText = (messages || [])
      .filter(m => !m.isSystem)
      .map(m => `[${m.role}] ${m.sender}: ${m.body}`)
      .join('\n');

    const prompts = {
      summarize: `Summarize this HIPAA-compliant clinical messaging thread concisely:\n\n${threadText}`,
      tasks: `Extract actionable tasks from this clinical thread. Format as a numbered list:\n\n${threadText}`,
      draft: `Draft a professional clinical reply to this thread. Be concise and HIPAA-compliant:\n\n${threadText}`,
    };
    return prompts[action];
  }, [messages]);

  const handleAction = useCallback((action) => {
    const prompt = buildPrompt(action);
    const system = 'You are a clinical communication assistant for an ABA therapy clinic. Be concise, professional, and HIPAA-compliant.';
    execute(prompt, system);
  }, [buildPrompt, execute]);

  return (
    <div className="w-80 border-l border-slate-800 bg-brand-panel flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
          <Bot size={16} className="text-cyan-400" />
          AI Copilot
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="p-4 flex flex-col gap-2">
        <button
          onClick={() => handleAction('summarize')}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 transition-colors disabled:opacity-50"
        >
          <Sparkles size={14} className="text-cyan-400" /> Summarize Thread
        </button>
        <button
          onClick={() => handleAction('tasks')}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 transition-colors disabled:opacity-50"
        >
          <ListTodo size={14} className="text-cyan-400" /> Convert to Tasks
        </button>
        <button
          onClick={() => handleAction('draft')}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 text-sm rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 transition-colors disabled:opacity-50"
        >
          <Reply size={14} className="text-cyan-400" /> Draft Reply
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 comms-scroll">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="text-cyan-400 animate-spin" />
          </div>
        )}
        {!loading && result && (
          <div className="bg-slate-800/60 border border-slate-700/50 rounded-lg p-4">
            <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{result}</p>
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => { onInsert(result); clear(); }}
                className="text-xs px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-medium transition-colors"
              >
                Insert Text
              </button>
              <button
                onClick={clear}
                className="text-xs px-3 py-1.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-300 font-medium transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InfiniteComms() {
  const { data: users, loading: usersLoading } = useApiData(fetchCommsUsers);
  const { data: channels, loading: channelsLoading } = useApiData(fetchCommsChannels);
  const { data: initialMessages, loading: msgsLoading } = useApiData(fetchCommsMessages);

  const [messages, setMessages] = useState(null);
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [currentRole, setCurrentRole] = useState('admin');
  const [composerText, setComposerText] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [reqAck, setReqAck] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const threadRef = useRef(null);

  // Seed local messages from API data (derived, not via effect)
  if (initialMessages && !messages) {
    setMessages(initialMessages);
  }

  // Set default channel once loaded (derived, not via effect)
  if (channels && channels.length > 0 && !activeChannelId) {
    setActiveChannelId(channels[0].id);
  }

  // Scroll to bottom on channel switch or new message
  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [activeChannelId, messages]);

  const loading = usersLoading || channelsLoading || msgsLoading;

  if (loading || !channels || !users || !messages) {
    return (
      <div className="h-full flex items-center justify-center bg-brand-dark">
        <Loader2 size={32} className="text-cyan-400 animate-spin" />
      </div>
    );
  }

  const currentUser = users[currentRole];
  const activeChannel = channels.find(c => c.id === activeChannelId) || channels[0];
  const channelMessages = messages[activeChannel.id] || [];

  const secureChannels = channels.filter(c => c.isSecure);
  const generalChannels = channels.filter(c => !c.isSecure);

  const filteredMessages = searchQuery
    ? channelMessages.filter(m =>
      m.body.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.sender.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    : channelMessages;

  const handleSend = () => {
    const text = composerText.trim();
    if (!text) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: currentUser.name,
      role: currentUser.role,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      body: text,
      isSelf: true,
      isUrgent,
      reqAck,
      acks: [],
    };

    setMessages(prev => ({
      ...prev,
      [activeChannel.id]: [...(prev[activeChannel.id] || []), newMsg],
    }));
    setComposerText('');
    setIsUrgent(false);
    setReqAck(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleAcknowledge = (msgId) => {
    setMessages(prev => ({
      ...prev,
      [activeChannel.id]: (prev[activeChannel.id] || []).map(m =>
        m.id === msgId
          ? { ...m, acks: [...(m.acks || []), currentUser.name] }
          : m,
      ),
    }));
  };

  const handleInsertAiText = (text) => {
    setComposerText(prev => prev ? `${prev}\n${text}` : text);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .comms-scroll::-webkit-scrollbar { width: 6px; }
        .comms-scroll::-webkit-scrollbar-track { background: transparent; }
        .comms-scroll::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.2); border-radius: 3px; }
        .comms-scroll::-webkit-scrollbar-thumb:hover { background: rgba(148,163,184,0.35); }
      `}} />

      <div className="h-full flex bg-brand-dark text-slate-100">
        {/* LEFT SIDEBAR */}
        <div className="w-64 flex-shrink-0 bg-brand-panel border-r border-slate-800 flex flex-col">
          {/* App header */}
          <div className="px-4 py-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} className="text-cyan-400" />
              <h1 className="text-base font-bold text-slate-100 tracking-tight">Infinite Comms</h1>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Secure Clinical Messaging</p>
          </div>

          {/* Channel list */}
          <div className="flex-1 overflow-y-auto comms-scroll py-2">
            {secureChannels.length > 0 && (
              <div className="mb-3">
                <div className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  Care Teams (PHI Safe)
                </div>
                {secureChannels.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => { setActiveChannelId(ch.id); setSearchQuery(''); }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      ch.id === activeChannel.id
                        ? 'bg-cyan-900/30 text-cyan-300 border-r-2 border-cyan-400'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <ChannelIcon iconType={ch.iconType} size={14} className="flex-shrink-0 opacity-60" />
                    <span className="truncate">{ch.name}</span>
                    <UnreadBadge count={ch.unread} />
                  </button>
                ))}
              </div>
            )}

            {generalChannels.length > 0 && (
              <div>
                <div className="px-4 py-1.5 text-[10px] uppercase tracking-widest font-bold text-slate-500">
                  Clinic Channels
                </div>
                {generalChannels.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => { setActiveChannelId(ch.id); setSearchQuery(''); }}
                    className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors ${
                      ch.id === activeChannel.id
                        ? 'bg-cyan-900/30 text-cyan-300 border-r-2 border-cyan-400'
                        : 'text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <ChannelIcon iconType={ch.iconType} size={14} className="flex-shrink-0 opacity-60" />
                    <span className="truncate">{ch.name}</span>
                    <UnreadBadge count={ch.unread} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User badge & role switcher */}
          <div className="border-t border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                {currentUser.init}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-200 truncate">{currentUser.name}</div>
                <div className="relative">
                  <select
                    value={currentRole}
                    onChange={(e) => setCurrentRole(e.target.value)}
                    className="w-full text-[11px] text-slate-400 bg-transparent border-none p-0 focus:ring-0 cursor-pointer appearance-none pr-4"
                  >
                    {Object.entries(users).map(([key, u]) => (
                      <option key={key} value={key} className="bg-slate-900 text-slate-200">
                        {u.role} — {u.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={10} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MAIN MESSAGE AREA */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Channel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-brand-panel">
            <div className="flex items-center gap-3">
              <ChannelIcon iconType={activeChannel.iconType} size={18} className="text-slate-400" />
              <div>
                <h2 className="text-base font-semibold text-slate-100">{activeChannel.name}</h2>
                {activeChannel.desc && (
                  <p className="text-[11px] text-slate-500">{activeChannel.desc}</p>
                )}
              </div>
              <SecurityIndicator isSecure={activeChannel.isSecure} />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="pl-8 pr-3 py-1.5 text-sm bg-slate-800/60 border border-slate-700/50 rounded text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-700/50 w-48"
                />
              </div>
              {activeChannel.isSecure && (
                <button
                  onClick={() => setShowAi(!showAi)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded font-medium transition-colors ${
                    showAi
                      ? 'bg-cyan-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/50'
                  }`}
                >
                  <Bot size={14} /> Ask Click
                </button>
              )}
            </div>
          </div>

          {/* PHI warning on non-secure channels */}
          {!activeChannel.isSecure && (
            <div className="flex items-center gap-2 px-5 py-2 bg-amber-900/20 border-b border-amber-800/30 text-amber-300 text-xs">
              <AlertTriangle size={14} />
              <span className="font-medium">PHI Warning:</span>
              <span>Do not share Protected Health Information in this channel. Use a secure Care Team channel instead.</span>
            </div>
          )}

          {/* Message thread */}
          <div ref={threadRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4 comms-scroll">
            {filteredMessages.length === 0 && (
              <div className="flex items-center justify-center h-full text-slate-500 text-sm">
                {searchQuery ? 'No messages match your search.' : 'No messages yet. Start the conversation.'}
              </div>
            )}
            {filteredMessages.map(msg => (
              <MessageBubble
                key={msg.id}
                msg={msg}
                currentUser={currentUser.name}
                onAcknowledge={handleAcknowledge}
              />
            ))}
          </div>

          {/* Composer */}
          <div className="border-t border-slate-800 bg-brand-panel px-5 py-3">
            <div className="flex items-center gap-3 mb-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-rose-500 focus:ring-rose-500/30 w-3.5 h-3.5"
                />
                <span className="text-[11px] text-slate-400 font-medium">Urgent</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={reqAck}
                  onChange={(e) => setReqAck(e.target.checked)}
                  className="rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500/30 w-3.5 h-3.5"
                />
                <span className="text-[11px] text-slate-400 font-medium">Require Acknowledgement</span>
              </label>
            </div>
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Message #${activeChannel.name}...`}
                  rows={1}
                  className="w-full resize-none rounded-lg bg-slate-800/60 border border-slate-700/50 px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-700/50 comms-scroll"
                />
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-200 transition-colors">
                <Paperclip size={18} />
              </button>
              {activeChannel.isSecure && (
                <button className="flex items-center gap-1 p-2 text-slate-400 hover:text-cyan-400 transition-colors text-xs font-medium">
                  <LinkIcon size={14} /> Link Session Data
                </button>
              )}
              <button
                onClick={handleSend}
                disabled={!composerText.trim()}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Send size={14} /> Send Secure
              </button>
            </div>
          </div>
        </div>

        {/* AI PANEL */}
        {showAi && activeChannel.isSecure && (
          <AiPanel
            messages={channelMessages}
            onInsert={handleInsertAiText}
            onClose={() => setShowAi(false)}
          />
        )}
      </div>
    </>
  );
}
