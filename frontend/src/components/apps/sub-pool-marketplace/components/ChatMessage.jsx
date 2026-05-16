import { Zap, Users } from 'lucide-react';

export default function ChatMessage({ chat }) {
  return (
    <div className="flex gap-3 fade-in">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-md ${chat.isSystem ? 'bg-black border-cyan-500/50 text-cyan-400' : 'bg-pool-bg border-white/10 text-white'}`}>
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
  );
}
