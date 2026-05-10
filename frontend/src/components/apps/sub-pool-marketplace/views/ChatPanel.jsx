import { MessageSquare, Send } from 'lucide-react';
import ChatMessage from '../components/ChatMessage';

export default function ChatPanel({ chats, chatInput, onChatInputChange, onSendMessage, chatEndRef }) {
  return (
    <div className="w-full md:w-[380px] md:h-full bg-brand-panel border-t md:border-t-0 md:border-l border-white/5 flex flex-col shrink-0 z-20 shadow-2xl relative h-64 md:h-auto">
      <div className="p-5 border-b border-white/5 flex items-center gap-3 shrink-0 bg-black/20">
        <MessageSquare className="text-cyan-400" size={18} />
        <h2 className="font-black text-white text-sm uppercase tracking-widest">Live Feed</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
        {chats.length === 0 ? (
          <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest mt-10">No recent activity</p>
        ) : (
          chats.map(chat => (
            <ChatMessage key={chat.id} chat={chat} />
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
            onChange={(e) => onChatInputChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onSendMessage(chatInput)}
            placeholder="Send message..."
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
          />
          <button
            onClick={() => onSendMessage(chatInput)}
            disabled={!chatInput.trim()}
            className="absolute right-2 p-1.5 text-slate-400 hover:text-cyan-400 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
